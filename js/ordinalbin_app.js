/* global $, window */
/* exported OrdinalBin */
module.exports = function OrdinalBin() {
    'use strict';
    //global vars
    var ordinalBin = {};
    var taskComprehended = false;
    var log;
    ordinalBin.options = {
        targetEl: $('.container'),
        edgeType: 'App',
        criteria: {},
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
    var followup;

    var stageChangeHandler = function() {
        ordinalBin.destroy();
    };

    var followupHandler = function() {
        var followupVal = $(this).data('value');
        var nodeid = followup;
        var criteria = {
            to:nodeid
        };

        window.tools.extend(criteria, ordinalBin.options.criteria);
        var edge = window.network.getEdges(criteria)[0];

        var followupProperties = {};

        followupProperties[ordinalBin.options.followup.variable] = followupVal;

        window.tools.extend(edge, followupProperties);
        window.network.updateEdge(edge.id, edge);
        $('.followup').hide();
    };

    ordinalBin.destroy = function() {
        // Event Listeners
        window.tools.notify('Destroying ordinalBin.',0);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).off('click', '.followup-option', followupHandler);

    };

    ordinalBin.init = function(options) {

        window.tools.extend(ordinalBin.options, options);

        ordinalBin.options.targetEl.append('<div class="node-question-container"></div>');

        // Add header and subheader
        $('.node-question-container').append('<h1>'+ordinalBin.options.heading+'</h1>');
        $('.node-question-container').append('<p class="lead">'+ordinalBin.options.subheading+'</p>');

        // Add node bucket
        $('.node-question-container').append('<div class="node-bucket"></div>');
        if(typeof ordinalBin.options.followup !== 'undefined') {
            $('.node-question-container').append('<div class="followup"><h2>'+ordinalBin.options.followup.prompt+'</h2></div>');
            $.each(ordinalBin.options.followup.values, function(index,value) {
                $('.followup').append('<span class="btn btn-primary btn-block followup-option" data-value="'+value.value+'">'+value.label+'</span>');
            });
        }

        // bin container
        ordinalBin.options.targetEl.append('<div class="ord-bin-container"></div>');

        // Calculate number of bins required
        var binNumber = ordinalBin.options.variable.values.length;

        // One of these for each bin. One bin for each variable value.
        $.each(ordinalBin.options.variable.values, function(index, value){

            var newBin = $('<div class="ord-node-bin size-'+binNumber+' d'+index+'" data-index="'+index+'"><h1>'+value.label+'</h1><div class="ord-active-node-list"></div></div>');
            newBin.data('index', index);
            $('.ord-bin-container').append(newBin);
            $('.d'+index).droppable({ accept: '.draggable',
                drop: function(event, ui) {
                    var dropped = ui.draggable;
                    var droppedOn = $(this);

                    if (ordinalBin.options.variable.values[index].value>0) {
                        $('.followup').show();
                        followup = $(dropped).data('node-id');
                    }
                    dropped.css({position:'inherit'});
                    droppedOn.children('.ord-active-node-list').append(dropped);

                    $(dropped).appendTo(droppedOn.children('.ord-active-node-list'));
                    var properties = {};
                    properties[ordinalBin.options.variable.label] = ordinalBin.options.variable.values[index].value;
                    // Followup question

                    // Add the attribute
                    var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:ordinalBin.options.edgeType})[0].id;
                    window.network.updateEdge(edgeID,properties);

                    $.each($('.ord-node-bin'), function(oindex) {
                        var length = $('.d'+oindex).children('.ord-active-node-list').children().length;
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

                    setTimeout(function(){
                        el.transition({background:el.data('oldBg')}, 200, 'ease');
                        // el.transition({ scale:1}, 200, 'ease');
                    }, 0);

                    ordinalBin.makeDraggable();
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

        // get all edges
        var edges = window.network.getEdges(ordinalBin.options.criteria);

        // Add edges to bucket or to bins if they already have variable value.
        $.each(edges, function(index,value) {
            var dyadEdge;
            if (ordinalBin.options.criteria.type !== 'App') {
                dyadEdge = window.network.getEdges({from: value.from, to:value.to, type:'App'})[0];
            }

            if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== '') {
                index = 'error';
                $.each(ordinalBin.options.variable.values, function(vindex, vvalue) {
                    if (value[ordinalBin.options.variable.label] === vvalue.value) {
                        index = vindex;
                    }
                });

                if (ordinalBin.options.criteria.type !== 'App') {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.app_name_t0+'</div>');
                } else {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.app_name_t0+'</div>');
                }
            } else {
                if (ordinalBin.options.criteria.type !== 'App') {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.app_name_t0+'</div>');
                } else {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.app_name_t0+'</div>');
                }

            }

        });
        ordinalBin.makeDraggable();

        // Event Listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('click', '.followup-option', followupHandler);
    };

    ordinalBin.makeDraggable = function() {
        $('.draggable').draggable({
            cursor: 'pointer',
            revert: 'invalid',
            appendTo: 'body',
            scroll: false,
            helper: 'clone',
            start: function() {

                // if ($(this).css('top') !== 'auto' && $(this).css('top') !== '0px') {

                //     $(this).css({position:'absolute'});
                // } else {

                //     $(this).css({position:'relative'});
                // }

                $(this).parent().css('overflow','inherit');
                if (taskComprehended === false) {
                    var eventProperties = {
                        stage: window.netCanvas.Modules.session.currentStage(),
                        timestamp: new Date()
                    };
                    log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
                    window.dispatchEvent(log);
                    taskComprehended = true;
                }

                // $('.ord-node-bin').css({overflow:'hidden'});
            },
            stop: function() {
                $(this).css({position:'inerit'});
                $('.ord-node-bin').css({overflowY:'scroll'});
            }
        });
    };

return ordinalBin;

};
