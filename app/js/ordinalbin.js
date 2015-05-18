/* global $, window */
/* exported OrdinalBin */
var OrdinalBin = function OrdinalBin() {
    'use strict';
    //global vars
    var ordinalBin = {};
    var taskComprehended = false;
    var log;
    ordinalBin.options = {
        targetEl: $('.container'),
        edgeType: 'Dyad',
        criteria: {from:global.network.getNodes({type_t0:'Ego'})[0].id},
        variable: {
            label:'gender_p_t0',
            values: [
                'Female',
                'Male',
                'Transgender',
                'Don\'t Know',
                'Won\'t Answer'
            ]
        },
        heading: 'Default Heading',
        subheading: 'Default Subheading.'
    };
    var itemW,itemH, followup;

    var stageChangeHandler = function() {
        ordinalBin.destroy();
    };

    var followupHandler = function() {
        var followupVal = $(this).data('value');
        var nodeid = followup;
        var criteria = {
            to:nodeid
        };

        global.tools.extend(criteria, ordinalBin.options.criteria);
        var edge = global.network.getEdges(criteria)[0];

        var followupProperties = {};

        followupProperties[ordinalBin.options.followup.variable] = followupVal;

        global.tools.extend(edge, followupProperties);
        global.network.updateEdge(edge.id, edge);
        $('.followup').hide();
    };

    ordinalBin.destroy = function() {
        // Event Listeners
        global.tools.notify('Destroying ordinalBin.',0);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).off('click', '.followup-option', followupHandler);

    };

    ordinalBin.init = function(options) {

        global.tools.extend(ordinalBin.options, options);
        // Add header and subheader
        ordinalBin.options.targetEl.append('<h1>'+ordinalBin.options.heading+'</h1>');
        ordinalBin.options.targetEl.append('<p class="lead">'+ordinalBin.options.subheading+'</p>');

        // Add node bucket
        ordinalBin.options.targetEl.append('<div class="node-bucket"></div>');
        if(typeof ordinalBin.options.followup !== 'undefined') {
            ordinalBin.options.targetEl.append('<div class="followup"><h2>'+ordinalBin.options.followup.prompt+'</h2></div>');
            $.each(ordinalBin.options.followup.values, function(index,value) {
                $('.followup').append('<span class="btn btn-primary btn-block followup-option" data-value="'+value.value+'">'+value.label+'</span>');
            });
        }

        var number = ordinalBin.options.variable.values.length;
        itemW = ($('.container').outerWidth()/number)-20;
        itemH = $('.container').outerHeight()-270;

        // One of these for each bin. One bin for each variable value.
        $.each(ordinalBin.options.variable.values, function(index, value){

            var newBin = $('<div class="ord-node-bin node-bin-static d'+index+'" data-index="'+index+'"><h1>'+value.label+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
            newBin.data('index', index);
            ordinalBin.options.targetEl.append(newBin);
            $('.d'+index).droppable({ accept: '.draggable',
                drop: function(event, ui) {

                    var dropped = ui.draggable;
                    var droppedOn = $(this);
                    if (ordinalBin.options.variable.values[index].value>0) {
                        $('.followup').show();
                        followup = $(dropped).data('node-id');
                    }

                    $(dropped).appendTo(droppedOn.children('.active-node-list'));
                    $(dropped).css({position: '',top:'',left:''});
                    var properties = {};
                    properties[ordinalBin.options.variable.label] = ordinalBin.options.variable.values[index].value;
                    // Followup question

                    // Add the attribute
                    var edgeID = global.network.getEdges({from:global.network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:ordinalBin.options.edgeType})[0].id;
                    global.network.updateEdge(edgeID,properties);

                    $.each($('.ord-node-bin'), function(oindex) {
                        var length = $('.d'+oindex).children('.active-node-list').children().length;
                        if (length > 0) {
                            var noun = 'people';
                            if (length === 1) {
                                noun = 'person';
                            }

                            $('.d'+oindex+' p').html(length+' '+noun+'.');
                        } else {
                            $('.d'+oindex+' p').html('(Empty)');
                        }

                    });

                    var el = $('.d'+index);
                    // var origBg = el.css('background-color');
                    // el.transition({scale:1.2}, 200, 'ease');
                    setTimeout(function(){
                        el.transition({background:el.data('oldBg')}, 200, 'ease');
                        // el.transition({ scale:1}, 200, 'ease');
                    }, 0);

                    $('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false, scroll: 'true', refreshPositions: true,
                        start: function() {
                            if (taskComprehended === false) {
                                var eventProperties = {
                                    stage: global.session.currentStage(),
                                    timestamp: new Date()
                                };
                                log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
                                window.dispatchEvent(log);
                                taskComprehended = true;
                            }
                            // $('.ord-node-bin').css({overflow:'hidden'});
                        },
                        stop: function() {
                            // $('.ord-node-bin').css({overflow:'scroll'});
                        }
                    });
                },
                over: function() {
                    $(this).data('oldBg', $(this).css('background-color'));
                    $(this).stop().transition({background:'rgba(255, 193, 0, 1.0)'}, 400, 'ease');

                },
                out: function() {
                    $(this).stop().transition({background:$(this).data('oldBg')}, 500, 'ease');
                }
            });

        });

        // $('.dode-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
        $('.ord-node-bin').css({width:itemW,height:itemH});

        // get all edges
        var edges = global.network.getEdges(ordinalBin.options.criteria);

        // Add edges to bucket or to bins if they already have variable value.
        $.each(edges, function(index,value) {
            var dyadEdge;
            if (ordinalBin.options.criteria.type !== 'Dyad') {
                dyadEdge = global.network.getEdges({from: value.from, to:value.to, type:'Dyad'})[0];
            }

            if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== '') {
                // index = ordinalBin.options.variable.values.indexOf(value[ordinalBin.options.variable.label]);
                index = 'error';
                $.each(ordinalBin.options.variable.values, function(vindex, vvalue) {
                    if (value[ordinalBin.options.variable.label] === vvalue.value) {
                        index = vindex;
                    }
                });

                if (ordinalBin.options.criteria.type !== 'Dyad') {
                    $('.d'+index).children('.active-node-list').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+dyadEdge.nname_t0+'</div>');
                } else {
                    $('.d'+index).children('.active-node-list').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
                }

                var noun = 'people';
                var length = $('.d'+index).children('.active-node-list').children().length;
                if (length === 1) {
                    noun = 'person';
                }
                if (length === 0) {
                    $('.d'+index).children('p').html('(Empty)');
                } else {
                    $('.d'+index).children('p').html(length+' '+noun+'.');
                }
            } else {
                if (ordinalBin.options.criteria.type !== 'Dyad') {
                    $('.node-bucket').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+dyadEdge.nname_t0+'</div>');
                } else {
                    $('.node-bucket').append('<div class="node-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
                }

            }

        });
        $('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false, scroll: 'true', refreshPositions: true,
            start: function() {
                if (taskComprehended === false) {
                    var eventProperties = {
                        stage: global.session.currentStage(),
                        timestamp: new Date()
                    };
                    log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
                    window.dispatchEvent(log);
                    taskComprehended = true;
                }

                // $('.ord-node-bin').css({overflow:'hidden'});
            },
            stop: function() {
                // $('.ord-node-bin').css({overflow:'scroll'});
            }
        });

        // Event Listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('click', '.followup-option', followupHandler);
    };

return ordinalBin;

};

module.exports = new OrdinalBin();
