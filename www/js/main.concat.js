/* global $, window, Odometer, document, note  */
/* exported AppGenerator */
module.exports = function AppGenerator() {
    'use strict';
    //global vars
    var appGenerator = {};
    appGenerator.options = {
        nodeType:'App',
        edgeType:'App',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
    };

    var nodeBoxOpen = false;
    var editing = false;
    var newNodePanel;
    var venueCounter;

    var venueCount = window.network.getNodes({type_t0: 'App'}).length;

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                appGenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            appGenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var stageChangeHandler = function() {
        appGenerator.destroy();
    };

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getEgo().id, to: index, type:'App'})[0];

        // Set the value of editing to the node id of the current person
        editing = index;

        // Populate the form with this nodes data.
        $.each(appGenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'dropdown') {
                    $('.selectpicker').selectpicker('val', edge[value.variable]);
                } else if (value.type === 'scale') {
                    $('input:radio[name="'+value.variable+'"][value="'+edge[value.variable]+'"]').prop('checked', true).trigger('change');
                } else {
                    $('#'+value.variable).val(edge[value.variable]);
                }

                $('.delete-button').show();

                if (edge.elicited_previously === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                } else {
                    $('input#age_p_t0').prop( 'disabled', false);
                }
                appGenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        appGenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');

        e.preventDefault();

        var data = $(this).serializeArray();
        console.log(data);
          var cleanData = {};
          for (var i = 0; i < data.length; i++) {

            // To handle checkboxes, we check if the key already exists first. If it
            // does, we append new values to an array. This keeps compatibility with
            // single form fields, but might need revising.

            // Handle checkbox values
            if (data[i].value === 'on') { data[i].value = 1; }

            // This code takes the serialised output and puts it in the structured required to store within noded/edges.
            if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] !== 'object') {
              // if it isn't an object, its a string. Create an empty array and store by itself.
              cleanData[data[i].name] = [cleanData[data[i].name]];
              cleanData[data[i].name].push(data[i].value);
            } else if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] === 'object'){
              // Its already an object, so append our new item
              cleanData[data[i].name].push(data[i].value);
            } else {
              // This is for regular text fields. Simple store the key value pair.
              cleanData[data[i].name] = data[i].value;
            }

          }

         console.log(cleanData);

        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(appGenerator.options.variables, function(index,value) {

            if(value.target === 'edge') {
                if (value.private === true) {
                    newEdgeProperties[value.variable] = value.value;
                } else {
                    newEdgeProperties[value.variable] = cleanData[value.variable];
                }

            } else if (value.target === 'node') {
                if (value.private === true) {
                    newNodeProperties[value.variable] = value.value;
                } else {
                    newNodeProperties[value.variable] = cleanData[value.variable];
                }
            }
        });

        if (editing === false) {
            note.info('// We are submitting a new node');
            var newNode = window.network.addNode(newNodeProperties);

            var edgeProperties = {
                from: window.network.getEgo().id,
                to: newNode,
                type:appGenerator.options.edgeTypes[0]
            };

            window.tools.extend(edgeProperties,newEdgeProperties);
            window.network.addEdge(edgeProperties);
            appGenerator.addToList(edgeProperties);
            venueCount++;
            venueCounter.update(venueCount);

        } else {
            note.info('// We are updating a node');

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css('background-color');
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;

            var edges = window.network.getEdges({from:window.network.getEgo().id,to:nodeID,type:appGenerator.options.edgeTypes[0]});
            $.each(edges, function(index,value) {
                window.network.updateEdge(value.id,newEdgeProperties, color);
            });

            window.network.updateNode(nodeID, newNodeProperties);

            // update relationship roles

            $('div[data-index='+editing+']').html('');
            $('div[data-index='+editing+']').append('<h4>'+newEdgeProperties.app_name_t0+'</h4>');

            venueCount = window.network.getNodes({type_t0: 'App'}).length;
            venueCounter.update(venueCount);
            editing = false;

        }

        appGenerator.closeNodeBox();

    };

    appGenerator.generateTestApps = function(number) {

        if (!number) {
            note.error('You must specify the number of test apps you want to create. Cancelling!');
            return false;
        }

        var eachTime = 4000;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(appGenerator.generateApp, timer);
        }

    };

    appGenerator.generateApp = function() {
        // We must simulate every interaction to ensure that any errors are caught.
        $('.add-button').click();
        setTimeout(function() {
            $('#ngForm').submit();
        }, 3000);

        var lname = $('#fname_t0').val()+' '+$('#lname_t0').val().charAt(0);
        if ($('#lname_t0').val().length > 0 ) {
            lname +='.';
        }
        $('#nname_t0').val(lname);
        $('#age_p_t0').val(Math.floor(window.tools.randomBetween(18,90)));

        setTimeout(function() {
            $('.relationship-button').click();
        }, 500);
        setTimeout(function() {

            var roleNumber = Math.floor(window.tools.randomBetween(1,3));

            for (var j = 0; j < roleNumber; j++) {
                $($('.relationship')[Math.floor(window.tools.randomBetween(0,$('.relationship').length))]).addClass('selected');

            }

            $('.relationship-close-button').click();
        }, 2000);
    };

    appGenerator.openNodeBox = function() {
        $('.newNodeBox').height($('.newNodeBox').height());
        $('.newNodeBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    appGenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newNodeBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
    };

    appGenerator.destroy = function() {
        note.debug('Destroying appGenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', appGenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', appGenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newNodeBox').remove();

    };

    appGenerator.init = function(options) {
        window.tools.extend(appGenerator.options, options);
        // $.extend(true, appGenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-map-pin add-button"></span>');
        appGenerator.options.targetEl.append(button);
        var venueCountBox = $('<div class="alter-count-box"></div>');
        appGenerator.options.targetEl.append(venueCountBox);

        // create node box
        var newNodeBox = $('<div class="newNodeBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-map-pin"></span> Adding an App/Website</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // appGenerator.options.targetEl.append(newNodeBox);
        $('body').append(newNodeBox);
        $.each(appGenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'autocomplete':
                    formItem = $('<div class="form-group ui-widget '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'dropdown':

                    formItem = $('<div class="form-group '+value.variable+'" style="position:relative; z-index:9"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');
                    var select = $('<select class="selectpicker" name="'+value.variable+'" />');
                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<option/>').val(optionValue.value).text(optionValue.label).appendTo(select);
                    });

                    select.appendTo(formItem);

                    break;

                    case 'scale':
                    formItem = $('<div class="form-group '+value.variable+'"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');

                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<div class="btn-group big-check" data-toggle="buttons"><label class="btn"><input type="radio" name="'+value.variable+'" value="'+optionValue.value+'"><i class="fa fa-circle-o fa-3x"></i><i class="fa fa-check-circle-o fa-3x"></i> <span class="check-number">'+optionValue.label+'</span></label></div>').appendTo(formItem);
                    });

                    break;

                }

                $('.newNodeBox .form .fields').append(formItem);
                if (value.required === true) {
                    $('#'+value.variable).prop('required', true);
                }

                $('.selectpicker').selectpicker({
                    style: 'btn-info',
                    size: 4
                });

                $('#app_name_t0').autocomplete({
                    source: [
                      'Adam4Adam (A4A)',
                      'Backpage',
                      'Badoo',
                      'BarebackRT (BBRT)',
                      'BeNaughty',
                      'BGCLive (Black Gay Chat)',
                      'Blendr',
                      'BoyAhoy',
                      'Bumble',
                      'Coffee Meets Bagel (CMB)',
                      'Craigslist',
                      'Daddyhunt',
                      'Down',
                      'Facebook',
                      'Fetlife',
                      'Glide',
                      'Grindr',
                      'Growlr',
                      'GuySpy',
                      'Her',
                      'Happn',
                      'Hornet',
                      'Instagram',
                      'Interactive Male',
                      'Jack\'d',
                      'Kik',
                      'Lavendr',
                      'Manhunt.net',
                      'Match.com',
                      'MeetMe',
                      'MiuMeet',
                      'MySpace',
                      'OkCupid (OkC)',
                      'Omegle',
                      'Oovoo',
                      'PartyLine',
                      'Peach',
                      'PHHHOTO',
                      'PlentyOfFish (POF)',
                      'Pounced',
                      'Pure',
                      'Recon',
                      'Scruff',
                      'Skout',
                      'Snapchat',
                      'SoulSwipe',
                      'Surge',
                      'Tagged',
                      'Thurst',
                      'Tinder',
                      'Tingle',
                      'Tumblr',
                      'Twitter',
                      'UrbanCliq/UrbanChat',
                      'Vine',
                      'Whiplr',
                      'Yahoo',
                      'Yik Yak',
                      'YouTube',
                      'Zoosk',
                      '3ndr'
                    ]
                });

            }

        });

        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newNodeBox .form .fields').append(buttons);

        newNodePanel = $('.newNodeBox').html();

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        appGenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(appGenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(appGenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        appGenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', appGenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', appGenerator.removeFromList);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);

        // Set node count box
        var el = document.querySelector('.alter-count-box');

        venueCounter = new Odometer({
            el: el,
            value: venueCount,
            format: 'dd',
            theme: 'default'
        });

        // add existing nodes
        $.each(window.network.getEdges({type: 'App', from: window.network.getNodes({type_t0:'Ego'})[0].id, ag_t0:appGenerator.options.variables[0].value}), function(index,value) {
            appGenerator.addToList(value);
        });

        // Handle side panels
        if (appGenerator.options.panels.length > 0) {
            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (appGenerator.options.panels.indexOf('current') !== -1) {
                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>Apps you already named:</h4></div>'));
                $.each(window.network.getEdges({type: 'App', from: window.network.getEgo().id}), function(index,value) {

                    var el = $('<div class="node-list-item">'+value.app_name_t0+'</div>');
                    sideContainer.children('.current-node-list').append(el);
                });
            }

            appGenerator.options.targetEl.append(sideContainer);

        } // end if panels
    };

    appGenerator.addToList = function(properties) {
        note.debug('appGenerator.addToList');
        note.trace(properties);
        // var index = $(this).data('index');
        var card;

        card = $('<div class="card"><div class="app inner-card" data-index="'+properties.to+'"><h4>'+properties.app_name_t0+'</h4></div></div>');
        $('.nameList').append(card);

    };

    appGenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var venueCount = window.network.getNodes({type_t0: 'App'}).length;
        venueCounter.update(venueCount);

        appGenerator.closeNodeBox();
    };

    return appGenerator;
};
;/* global window,$ */
/* exported DateInterface */

module.exports = function DateInterface() {
    'use strict';

    // dateInterface globals

    var dateInterface = {};
    var edges;

    dateInterface.options = {
        targetEl: $('.container'),
        edgeType: 'Dyad',
        heading: 'Default Heading'
    };



    dateInterface.init = function(options) {
        window.tools.extend(dateInterface.options, options);
        dateInterface.options.targetEl.append('<div class="node-question-container"></div>');
        $('.node-question-container').append('<h1>'+dateInterface.options.heading+'</h1>');
        $('.node-question-container').append('<p class="lead">'+dateInterface.options.subheading+'</p>');
        dateInterface.options.targetEl.append('<div class="date-container"></div>');

        // get edges according to criteria
        edges = window.network.getEdges(dateInterface.options.criteria);
        var counter = 0;
        var row = 0;
        $.each(edges, function(index,value) {

            var dyadEdge = window.network.getEdges({type:'Dyad', from:window.network.getNodes({type_t0:'Ego'})[0].id, to:value.to})[0];

            var markup =
            '<div class="date-picker-item overlay">'+
                '<div class="row">'+
                    '<div class="col-sm-12">'+
                        '<h2>Regarding <span>'+dyadEdge.nname_t0+'</span></h2>'+
                    '</div>'+
                '</div>'+
                '<div class="row">'+
                    '<div class="col-sm-12 alert alert-danger logic-error" role="alert">'+
                        '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>'+
                        '<span class="sr-only">Error:</span> Your last sexual encounter cannot come before your first. Please correct the dates before continuing.'+
                    '</div>'+
                    '<div class="col-sm-5">'+
                        '<div class="form-group">'+
                            '<p class="lead">When was the first time you had sex?</p>'+
                            '<div class="input-group date first row'+row+'" id="datetimepicker'+counter+'">'+
                                '<input type="text" class="form-control" />'+
                                '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'+
                            '</div>'+
                            '<div class="checkbox">'+
                                '<label><input type="checkbox" name="checkbox-time" class="checkbox-time checkbox'+counter+'"> More than 6 months ago.</label>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="col-sm-5 col-sm-offset-2">'+
                        '<div class="form-group">'+
                            '<p class="lead">When was the last time you had sex?</p>'+
                            '<div class="input-group date second row'+row+'" id="datetimepicker'+(counter+1)+'">'+
                                '<input type="text" class="form-control" />'+
                                '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>';

            $(markup).appendTo('.date-container');
            var dateoptions = {format: 'MM/DD/YYYY'};

            $('#datetimepicker'+counter).datetimepicker(dateoptions);
            $('#datetimepicker'+(counter+1)).datetimepicker(dateoptions);

            $('#datetimepicker'+counter+', #datetimepicker'+(counter+1)).on('dp.change',function (e) {
                var properties = {};
                var target, first, second, incomingDate;

                var $current = $(this);

                if ($(this).hasClass('first')) {

                    if ($('.checkbox'+$current.attr('id').slice(-1)).is(':checked')) {
                        properties.sex_first_before_range = true;
                        incomingDate = null;
                    } else {
                        properties.sex_first_before_range = false;
                        incomingDate = $current.data('DateTimePicker').date().format('MM/DD/YYYY');
                    }

                    target = parseInt($current.attr('id').slice(-1))+1;
                    first = parseInt($current.attr('id').slice(-1));
                    second = parseInt($current.attr('id').slice(-1))+1;

                    if (e.date !== null ) {
                        // $('#datetimepicker'+second).data('DateTimePicker').minDate(e.date);
                    }

                    properties.sex_first_t0 = incomingDate;

                } else {

                    if ($('.checkbox'+$current.attr('id').slice(-1)).is(':checked')) {
                        properties.sex_last_before_range = true;
                        incomingDate = null;
                    } else {
                        properties.sex_last_before_range = false;
                        incomingDate = $current.data('DateTimePicker').date().format('MM/DD/YYYY');
                    }

                    target = parseInt($current.attr('id').slice(-1))-1;
                    first = parseInt($current.attr('id').slice(-1))-1;
                    second = parseInt($current.attr('id').slice(-1));

                    if (e.date !== null) {
                        // $('#datetimepicker'+first).data("DateTimePicker").maxDate(e.date);
                    }

                    properties.sex_last_t0 = incomingDate;

                }

                window.network.updateEdge(value.id, properties);

                if (window.moment($('#datetimepicker'+first).data('DateTimePicker').date()).isAfter($('#datetimepicker'+second).data('DateTimePicker').date())) {
                    $current.parent().parent().parent().children('.logic-error').fadeIn();
                    $('.arrow-next').attr('disabled','disabled');
                } else {
                    $current.parent().parent().parent().children('.logic-error').fadeOut();
                    $('.arrow-next').removeAttr('disabled');
                }

            });

            if (typeof value.sex_first_t0 !== 'undefined') {
                if (value.sex_first_t0 === null) {
                    $('.checkbox'+counter).prop('checked', true);
                    $('#datetimepicker'+counter).data('DateTimePicker').date(window.moment().subtract(6, 'months').format('MM/DD/YYYY'));
                    $('#datetimepicker'+counter).children().css({opacity:0.5});
                    $('#datetimepicker'+counter).data('DateTimePicker').disable();

                } else {
                    $('#datetimepicker'+counter).data('DateTimePicker').date(value.sex_first_t0);
                }

            }
            if (typeof value.sex_last_t0 !== 'undefined') {
                if (value.sex_last_t0 === null) {
                    $('.checkbox'+(counter+1)).prop('checked', true);
                    $('#datetimepicker'+(counter+1)).data('DateTimePicker').date(window.moment().subtract(6, 'months').format('MM/DD/YYYY'));
                    $('#datetimepicker'+(counter+1)).children().css({opacity:0.5});
                    $('#datetimepicker'+(counter+1)).data('DateTimePicker').disable();

                } else {
                    $('#datetimepicker'+(counter+1)).data('DateTimePicker').date(value.sex_last_t0);
                }

            }

            $('.checkbox'+counter+', .checkbox'+(counter+1)).change(function(e) {
                var $target = $(e.target);
                if(this.checked) {
                    $target.parent().parent().parent().children('.date').data('DateTimePicker').date(window.moment().subtract(6, 'months').format('MM/DD/YYYY'));
                    $target.parent().parent().parent().children('.date').data('DateTimePicker').disable();
                    $target.parent().parent().parent().children('.date').children().css({opacity:0.5});
                } else {
                    $target.parent().parent().parent().children('.date').data('DateTimePicker').enable();
                    $target.parent().parent().parent().children('.date').children().css({opacity:1});
                    $target.parent().parent().parent().children('.date').data('DateTimePicker').date(window.moment().format('MM/DD/YYYY'));
                }
            });


            counter=counter+2;
            row++;
        });



    };

    dateInterface.destroy = function() {
        // Used to unbind events
    };

    return dateInterface;
};
;/* exported Interview */
/* global $ */
var Interview = function Interview() {
    'use strict';
    var interview = {};
    var currentStage = 0;
    var $content = $('#content');

    interview.id = 0;
    interview.date = new Date();
    interview.stages = 2;

    interview.init = function() {
        interview.goToStage(0);
        $('.arrow-next').click(function() {
            interview.nextStage();
        });
        $('.arrow-prev').click(function() {
            interview.prevStage();
        });
    };

    interview.loadData = function(path) {
        var data = JSON.parse(path);
        $.extend(interview, data);
    };

    interview.goToStage = function(stage) {
        var newStage = stage;
        $content.transition({ opacity: '0'},700,'easeInSine').promise().done( function(){
            $content.load( 'stages/'+stage+'.html', function() {
                $content.transition({ opacity: '1'},700,'easeInSine');
            });
        });
        currentStage = newStage;
    };

    interview.nextStage = function() {
        interview.goToStage(currentStage+1);
    };

    interview.prevStage = function() {
        interview.goToStage(currentStage-1);
    };


    return interview;
};
;/* global window, require, note, nodeRequire, isNodeWebkit */
/* exported IOInterface */

var IOInterface = function IOInterface() {
    'use strict';
    var Datastore = require('nedb');
    var path = require('path');
    var db;
    var id;
    var ioInterface = {};
    var initialised = false;

    ioInterface.init = function(callback) {

        var dbLocation = path.join('database/', window.netCanvas.Modules.session.name+'.db');

        // Use the node version of nedb when in the node webkit environment.
        if(isNodeWebkit === true) {
            Datastore = nodeRequire('nedb');
            path = nodeRequire('path');
            dbLocation = path.join(nodeRequire('nw.gui').App.dataPath, window.netCanvas.Modules.session.name+'.db');
        }

        if (!callback) {
            return false;
        }
        // After init, first priority is to load previous session for this protocol.
        // Whatever happens, the result of this should call the callback function passing the session id as the only parameter
        note.info('ioInterface initialising.');
        note.debug('Using '+window.netCanvas.Modules.session.name+' as database name.');

        db = new Datastore({ filename: dbLocation, autoload: true });
        db.find({}).sort({'sessionParameters.date': 1 }).exec(function (err, docs) {
            if (err) {
                return false;
                // handle error
            }
            if (docs.length !== undefined && docs.length > 0) {
                note.debug('ioInterface finished initialising.');
                initialised = true;
                callback(docs[0]._id);

                return true;
            } else {
                var sessionDate = new Date();
                db.insert([{'sessionParameters':{'date':sessionDate}}], function (err, newDoc) {
                    if(err) {
                        note.error(err);
                        return false;
                    }

                    // Two documents were inserted in the database
                    // newDocs is an array with these documents, augmented with their _id
                    id = newDoc[0]._id;

                    initialised = true;
                    callback(newDoc[0]._id);
                    note.debug('ioInterface finished initialising.');
                    return true;
                });
            }

        });

    };

    ioInterface.getDB = function() {
        return db;
    };

    ioInterface.initialised = function() {
        if (initialised) {
            return true;
        } else {
            return false;
        }
    };

    ioInterface.save = function(sessionData, id) {
        delete window.netCanvas.Modules.session.sessionData._id;
        note.info('IOInterface saving.');
        note.debug(sessionData);

        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            note.debug('Saving complete.');
        });

    };

    ioInterface.update = function(key, sessionData,id) {
        note.debug('IOInterface being asked to update data store.');
        db.update({_id: id }, sessionData, {}, function (err) {
            if (err) {
                return false;
            }
            note.debug('Updating complete.');
        });

    };

    ioInterface.reset = function(callback) {
        // db.find with empty object returns all objects.
        db.find({}, function (err, docs) {
            if (err) {
                note.error(err);
                return false;
            }

            var resultLength = docs.length;
            for (var i = 0; i < resultLength; i++) {
                ioInterface.deleteDocument(docs[i]._id);
            }

            if (callback) { callback(); }
        });
    };

    ioInterface.deleteDocument = function(callback) {
        note.info('ioInterface deleting document.');
        db.remove({ _id: window.netCanvas.Modules.session.id }, {}, function (err) {
            if (err) {
                note.error(err);
                return false;
            }
            note.debug('Deleting complete.');
            if(callback) { callback(); }
        });
    };

    ioInterface.load = function(callback, id) {
        note.info('ioInterface loading data.');
        db.find({'_id': id}, function (err, docs) {
            if (err) {
                // handle error
                return false;
            }
            callback(docs[0]);
        });
    };

    return ioInterface;
};

module.exports = new IOInterface();
;/* global $, window */
/* exported ListSelect */
module.exports = function ListSelect() {
    'use strict';
    //global vars
    var listSelect = {};
    listSelect.options = {
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading'
    };

    var itemClickHandler = function() {
        //   console.log('item click handler');
        var properties = {};
        var nodeid = $(this).data('nodeid');
        // console.log('nodeid: '+nodeid);

        if ($(this).data('selected') === true) {
            // console.log("$(this).data('selected') === true");
            $(this).data('selected', false);
            $(this).css({'border':'2px solid #eee','background':'#eee'});

            // remove values
            $.each(listSelect.options.variables, function(index,value) {
                if (value.value === nodeid) {
                    properties[value.value] = undefined;
                }
            });
            window.network.updateNode(window.network.getNodes({type_t0:'Ego'})[0].id, properties);

        } else {
            $(this).data('selected', true);
            $(this).css({'border':'2px solid red','background':'#E8C0C0'});

            // update values

            $.each(listSelect.options.variables, function(index,value) {
                if (value.value === nodeid) {
                    properties[value.value] = 1;
                }

            });

            window.network.updateNode(window.network.getNodes({type_t0:'Ego'})[0].id, properties);

        }

    };

    var stageChangeHandler = function() {
        listSelect.destroy();
    };

    var processSubmitHandler = function() {
        window.session.nextStage();

    };

    listSelect.destroy = function() {
        // Event Listeners
        window.tools.notify('Destroying listSelect.',0);
        $(window.document).off('click', '.inner', itemClickHandler);
        $(window.document).off('click', '.continue', processSubmitHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);

    };

    listSelect.init = function(options) {
        window.tools.extend(listSelect.options, options);
        // Add header and subheader
        listSelect.options.targetEl.append('<h1 class="text-center">'+listSelect.options.heading+'</h1>');
        listSelect.options.targetEl.append('<p class="lead text-center">'+listSelect.options.subheading+'</p>');
        listSelect.options.targetEl.append('<div class="form-group list-container"></div>');

        $.each(listSelect.options.variables, function(index,value) {
            var el = $('<div class="item"><div class="inner" data-nodeid="'+value.value+'"><h3>'+value.label+'</h3></div></div>');
            var properties = {
                type_t0: 'Ego'
            };

            properties[value.value] = 1;
            if (window.network.getNodes(properties).length>0) {
                el.find('.inner').data('selected', true);
                el.find('.inner').css({'border':'2px solid red','background':'#E8C0C0'});
            }
            $('.list-container').append(el);
        });


        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        $(window.document).on('click', '.continue', processSubmitHandler);
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
;/* global $, window */
/* exported ListSelect */
module.exports = function ListSelect() {
    'use strict';
    //global vars
    var listSelect = {};
    listSelect.options = {
        targetEl: $('.container')
    };

    var itemClickHandler = function() {


        var nodeid = $(this).data('nodeid');


        $(this).find('.select-icon').toggleClass('fa-circle-o fa-check-circle-o');

        if ($(this).parent().hasClass('selected')) {
            $(this).parent().removeClass('selected');
            // uncheck boxes
            $('[data-parent='+nodeid+']').each(function(){ $(this).prop('checked', false); });

            // remove values
            window.network.removeEdge(window.network.getEdge($(this).data('edgeid')));

        } else {
            $(this).parent().addClass('selected');

            var properties = {
                from: window.network.getEgo().id,
                to: nodeid,
                type: listSelect.options.edge
            };

            properties[listSelect.options.variable.label] = [];

            var targetEdge = window.network.addEdge(properties);

            $(this).data('edgeid', targetEdge);

        }

    };

    var stageChangeHandler = function() {
        listSelect.destroy();
    };

    listSelect.destroy = function() {
        // Event Listeners
        window.tools.notify('Destroying listSelect.',0);
        $(window.document).off('click', '.inner', itemClickHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);

    };

    listSelect.init = function(options) {
        window.tools.extend(listSelect.options, options);
        // Add header and subheader
        listSelect.options.targetEl.append('<div class="question-container"><h1 class="text-center">'+listSelect.options.heading+'</h1></div>');
        listSelect.options.targetEl.append('<div class="form-group service-list-container"></div>');

        var edges = window.network.getEdges(listSelect.options.criteria);

        $.each(edges, function(index,value) {
          var node = window.network.getNode(value.to);
          var targetEdge = window.network.getEdges({type: listSelect.options.edge, from: window.network.getEgo().id, to:node.id});

          var el = $('<div class="item"><div class="inner" data-nodeid="'+node.id+'" data-toggle="collapse" data-target="#collapse-'+value.id+'" aria-expanded="false" aria-controls="collapse-'+value.id+'"><h4>'+node.name+'</h4></div></div>');

          var markup = $('<div class="collapse" id="collapse-'+value.id+'"><div class="well"><h5>Which services did you access? Click or tap all that apply</h5><div class="check"></div></div>');

            $('.service-list-container').append(el);

            if (targetEdge.length > 0) {
                el.find('.inner').data('edgeid', targetEdge[0].id);
                $('[data-nodeid="'+node.id+'"]').parent().addClass('selected');
                markup.addClass('in');
            }

            el.append(markup);

            $.each(listSelect.options.variable.options, function(optionIndex, optionValue) {
                var checked = '';
                console.log(targetEdge[0]);
                if(targetEdge.length > 0 && targetEdge[0][listSelect.options.variable.label].indexOf(optionValue) !== -1) {
                    console.log('SELECTED: '+listSelect.options.variable.label+' '+optionValue);
                    checked = 'selected';
                } else {
                    console.log('NOT SELECTED: '+listSelect.options.variable.label+' '+optionValue);
                }
                el.find('.check').append('<button class="btn btn-select btn-block '+checked+'" data-parent="'+node.id+'" name="'+listSelect.options.variable.label+'" type="button" id="check-'+index+optionIndex+'" data-value="'+optionValue+'">'+optionValue+'</button>');
            });
        });

        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        $('[name="'+listSelect.options.variable.label+'"]').click(function() {
            // if ($(this).is(':checked')) {

            console.log('clicked');

                var el = $(this).parent();
                var id = $(this).parent().parent().parent().parent().find('.inner').data('edgeid');
                $(this).toggleClass('selected');

                var properties = {};
                properties[listSelect.options.variable.label] = $(el).find('button.selected').map(function(){
                    return $(this).data('value');
                }).get();
                console.log(properties);

                window.network.updateEdge(id, properties);
            // }

        });
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
;/* global $, window */
/* exported ListSelect */
module.exports = function ListSelect() {
    'use strict';
    //global vars
    var listSelect = {};
    listSelect.options = {
        targetEl: $('.container')
    };

    var itemClickHandler = function() {

        var properties = {};
        var nodeid = $(this).data('nodeid');


        if ($(this).data('selected') === true) {
            $(this).data('selected', false);
            $(this).css({'border':'2px solid #eee','background':'#eee'});

            // remove values
            properties[listSelect.options.variable] = undefined;

        } else {
            $(this).data('selected', true);
            $(this).css({'border':'2px solid red','background':'#E8C0C0'});

            // update values

            properties[listSelect.options.variable] = 1;
        }

        window.network.updateEdge(nodeid, properties);

    };

    var stageChangeHandler = function() {
        listSelect.destroy();
    };

    listSelect.destroy = function() {
        // Event Listeners
        window.tools.notify('Destroying listSelect.',0);
        $(window.document).off('click', '.inner', itemClickHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);

    };

    listSelect.init = function(options) {
        window.tools.extend(listSelect.options, options);
        // Add header and subheader
        listSelect.options.targetEl.append('<h1 class="text-center">'+listSelect.options.heading+'</h1>');
        listSelect.options.targetEl.append('<div class="form-group venue-list-container"></div>');


        var edges = window.network.getEdges(listSelect.options.criteria).sort(function(a, b){
          var nameA=a.venue_name_t0.toLowerCase(), nameB=b.venue_name_t0.toLowerCase();
          if (nameA < nameB)  {
            return -1;
          }//sort string ascending

          if (nameA > nameB) {
            return 1;
          }

          return 0; //default return value (no sorting)
        });

        $.each(edges, function(index,value) {
            var el = $('<div class="item"><div class="inner" data-nodeid="'+value.id+'"><h4>'+value.venue_name_t0+'</h4></div></div>');

            if (value[listSelect.options.variable] === 1) {
                el.find('.inner').data('selected', true);
                el.find('.inner').css({'border':'2px solid red','background':'#E8C0C0'});
            }
            $('.venue-list-container').append(el);
        });


        // Event Listeners
        $(window.document).on('click', '.inner', itemClickHandler);
        window.addEventListener('changeStageStart', stageChangeHandler, false);


    };

    return listSelect;
};
;/* exported Logger */
/* global window, note */

var Logger = function Logger() {
    'use strict';
    var logger = {};

    // todo: add custom events so that other scripts can listen for log changes (think vis).

    logger.init = function() {
        note.info('Logger initialising.');

        window.log = window.netCanvas.Modules.session.registerData('log', true);

        // listen for log events
        window.addEventListener('log', function (e) {
            logger.addToLog(e.detail);
        }, false);

        return true;
    };

    logger.addToLog = function(e) {
        if (!e) { return false; }

        var data = {
            'eventType': e.eventType,
            'targetObject':e.eventObject,
            'eventTime': new Date()
        };

        window.netCanvas.Modules.session.addData('log', data, true);
        var eventLogged = new window.CustomEvent('eventLogged', {'detail':data});
        window.dispatchEvent(eventLogged);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return true;
    };

    logger.getLog = function() {
        return window.log;
    };

    logger.getLastEvent = function() {

    };

    return logger;
};

module.exports = new Logger();
;/* global window, nodeRequire, FastClick, document, Konva, $, L, log, note, tools, isNodeWebkit */
$(document).ready(function() {
    'use strict';

    window.$ = $;
    window.L = L;
    window.Konva = Konva;
    window.gui = {};
    window.netCanvas = {};


    window.isNode = (typeof process !== 'undefined' && typeof require !== 'undefined'); // this check doesn't work, because browserify tries to be clever.
    window.isCordova = !!window.cordova;
    window.isNodeWebkit = false;
    var moment = require('moment');
    window.moment = moment; // needed for module access.
    window.netCanvas.devMode = false;
    window.netCanvas.studyProtocol = 'radar-protocol';

    //Is this Node.js?
    if(window.isNode) {
        //If so, test for Node-Webkit
        try {
            window.isNodeWebkit = (typeof nodeRequire('nw.gui') !== 'undefined');
            window.gui = nodeRequire('nw.gui');
            window.isNodeWebkit = true;
        } catch(e) {
            window.isNodeWebkit = false;
        }
    }

    // Arguments
    // build an object (argument: value) for command line arguments independant of platform
    window.getArguments = function() {
        var args = false;
        if (window.isNodeWebkit) {
            args = window.gui.App.argv;
            var newArgs = {};
            for (var i= 0; i < args.length; i++) {
                if (args[i].indexOf('--') === 0) { // Argument begins with --
                    var currentArg = args[i].substring(2);
                    currentArg = currentArg.split('=');
                    // remove quotes around strings
                    if (currentArg[1].charAt(0) === '"' && currentArg[1].charAt(currentArg[1].length -1) === '"') {
                        currentArg[1] = currentArg[1].substr(1,currentArg[1].length -2);
                    }
                    newArgs[currentArg[0]] = currentArg[1];
                }
            }
            return newArgs;
        } else if (window.isCordova) {
            // what can we do here?
            return args;
        } else {
            // browser
            var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
            query  = window.location.search.substring(1);

            args = {};
            while ((match = search.exec(query))) {
                args[decode(match[1])] = decode(match[2]);
            }

            return args;
        }
    };

    // Initialise logging and custom notification
    window.note = log.noConflict();
    note.setLevel('warn', false);

    window.logger = require('./logger.js');

    var args = window.getArguments();

    // Enable dev mode.
    if (args && typeof args.dev !== 'undefined' && args.dev !== false && args.dev !== 0) {
        note.info('Development mode enabled.');
        window.netCanvas.devMode = true;
        if (window.isNodeWebkit) {
            window.gui.Window.get().showDevTools();
        } else {
            // no way to show dev tools on web browser
        }
        $('.refresh-button').show();
        note.setLevel('info', false);
    } else {
        $('.refresh-button').hide();
        if (window.isNodeWebkit) {
            window.gui.Window.get().enterFullscreen();
        } else {
            // no way to enter full screen automatically on web browser.
            // could show button or prompt?
        }
    }

    $('.refresh-button').on('click', function() {
        if(window.isNodeWebkit) {
            var _window = window.gui.Window.get();
            _window.reloadDev();
        } else if (window.isCordova) {
            window.location.reload();
        } else {
            window.location.reload();
        }

    });

    // Override notifications on node webkit to use native notifications
    if (isNodeWebkit === true) {
        note.error = function(msg) {
            tools.nwNotification({
                icon: 'img/error.png',
                body: msg
            });
        };

        note.warn = function(msg) {
            tools.nwNotification({
                icon: 'img/alert.png',
                body: msg
            });
        };
    }

    // print some version stuff
    if (window.isNodeWebkit) {
        var version = window.process.versions['node-webkit'];
        note.info('netCanvas '+window.gui.App.manifest.version+' running on NWJS '+version);
    } else if (window.isCordova) {
        // can we get meaningful version info on cordova? how about a get request to the package.json?
        note.info('netCanvas running on cordova '+window.cordova.version+' on '+window.cordova.platformId);
    } else {
        // anything we can do in browser? yes.
    }

    var protocolExists = function(protocol, callback) {
        var response = false;
        var availableProtocols = ['radar-protocol', 'default', 'dphil-protocol'];

        if (availableProtocols.indexOf(protocol) !== -1) {
            response = true;
        }

        callback(response);
    };

    // Require tools
    window.tools = require('./tools');

    // Interface Modules
    window.netCanvas.Modules = {};
    window.netCanvas.Modules.Network = require('./network.js');
    window.netCanvas.Modules.NameGenerator = require('./namegenerator.js');
    window.netCanvas.Modules.VenueGenerator = require('./venuegenerator.js');
    window.netCanvas.Modules.ServiceGenerator = require('./servicegenerator.js');
    window.netCanvas.Modules.AppGenerator = require('./appgenerator.js');
    window.netCanvas.Modules.DateInterface = require('./dateinterface.js');
    window.netCanvas.Modules.OrdBin = require('./ordinalbin.js');
    window.netCanvas.Modules.OrdBinVenue = require('./ordinalbin_venue.js');
    window.netCanvas.Modules.OrdBinApp = require('./ordinalbin_app.js');
    window.netCanvas.Modules.OrdBinService = require('./ordinalbin_service.js');
    window.netCanvas.Modules.IOInterface = require('./iointerface.js');
    window.netCanvas.Modules.MapPeople = require('./map_people.js');
    window.netCanvas.Modules.MapParty = require('./map_party.js');
    window.netCanvas.Modules.MapServices = require('./map_services.js');
    window.netCanvas.Modules.RoleRevisit = require('./rolerevisit.js');
    window.netCanvas.Modules.ListSelect = require('./listselect.js');
    window.netCanvas.Modules.ListSelectVenue = require('./listselect_venue.js');
    window.netCanvas.Modules.ListSelectServices = require('./listselect_services.js');
    window.netCanvas.Modules.MultiBin = require('./multibin.js');
    window.netCanvas.Modules.MultiBinVenue = require('./multibin_venue.js');
    window.netCanvas.Modules.MultiBinApp = require('./multibin_app.js');
    window.netCanvas.Modules.MultiBinService = require('./multibin_service.js');
    window.netCanvas.Modules.Sociogram = require('./sociogram.js');

    // Initialise the menu system – other modules depend on it being there.
    window.menu = require('./menu.js');

    // Initialise datastore
    window.dataStore = require('./iointerface.js');


    // Set up a new session
    window.netCanvas.Modules.session = require('./session.js');


    // study protocol
    if (args && typeof args.protocol !== 'undefined') {
        window.netCanvas.studyProtocol = args.protocol;
    }

    // to do: expand this function to validate a proposed session, not just check that it exists.
    protocolExists(window.netCanvas.studyProtocol, function(exists){
        if (!exists) {
            note.warn('WARNING: Specified study protocol was not found. Using default.');
            window.netCanvas.studyProtocol = 'default';
        }
        // Initialise session now.
        window.netCanvas.Modules.session.init(function() {
            window.netCanvas.Modules.session.loadProtocol();
        });
        window.logger.init();
        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function() {
                FastClick.attach(document.body);
            }, false);
        }

    });

});
;/* global $, window, note */
/* exported GeoInterface */

/*
Map module.
*/

module.exports = function GeoInterface() {
  'use strict';
  // map globals
  var log;
  var taskComprehended = false;
  var geoInterface = {};
  geoInterface.options = {
    network: window.network || new window.netcanvas.Module.Network(),
    targetEl: $('.map-node-container'),
    mode: 'edge',
    criteria: {
      type:'Sex',
      from: window.network.getNodes({type_t0:'Ego'})[0].id
    },
    geojson: '',
    prompt: 'Where does %alter% live?',
    variable: {

      label:'res_chicago_location_t0',
      other_values: [
        {label: 'I live outside Chicago', value: 'outside_chicago'},
        {label: 'I am currently homeless', value: 'homeless'}
      ]
    }
  };
  var leaflet;
  var edges = [];
  var currentPersonIndex = 0;
  var geojson;
  var mapNodeClicked = false;
  var colors = ['#67c2d4','#1ECD97','#B16EFF','#FA920D','#e85657','#20B0CA','#FF2592','#153AFF','#8708FF'];

  // Private functions

  function highlightFeature(e) {
    var layer = e.target;
    leaflet.fitBounds(e.target.getBounds(), {maxZoom:14});

    layer.setStyle({
      fillOpacity: 0.8,
      fillColor: colors[1]
    });

    if (!window.L.Browser.ie && !window.L.Browser.opera) {
      layer.bringToFront();
    }

    mapNodeClicked = layer.feature.properties.name;
  }

  function selectFeature(e) {
    var layer = e;
    leaflet.fitBounds(e.getBounds(), {maxZoom:14});

    layer.setStyle({
      fillOpacity: 0.8,
      fillColor: colors[1]
    });

    if (!window.L.Browser.ie && !window.L.Browser.opera) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    $('.map-node-location').html('');
    mapNodeClicked = false;
    geojson.resetStyle(e.target);
  }

  function resetAllHighlights() {
    $('.map-node-location').html('');
    mapNodeClicked = false;
    $.each(geojson._layers, function(index,value) {
      geojson.resetStyle(value);
    });
  }

  function resetPosition() {
    // leaflet.setView([41.798395426119534,-87.839671372338884], 11);
  }


  function toggleFeature(e) {
    if (taskComprehended === false) {
      var eventProperties = {
        zoomLevel: leaflet.getZoom(),
        stage: window.netCanvas.Modules.session.currentStage(),
        timestamp: new Date()
      };
      log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
      window.dispatchEvent(log);
      taskComprehended = true;
    }

    var mapEventProperties = {
      zoomLevel: leaflet.getZoom(),
      timestamp: new Date()
    };
    log = new window.CustomEvent('log', {'detail':{'eventType': 'mapMarkerPlaced', 'eventObject':mapEventProperties}});
    window.dispatchEvent(log);
    var layer = e.target;
    var properties, targetID;

    // is there a map node already selected?
    if (mapNodeClicked === false) {
      // no map node selected, so highlight this one and mark a map node as having been selected.
      highlightFeature(e);
      // updateInfoBox('You se{lected: <strong>'+layer.feature.properties.name+'</strong>. Click the "next" button to place the next person.');

      // Update edge with this info
      properties = {};
      properties[geoInterface.options.variable.value] = layer.feature.properties.name;


      if (geoInterface.options.mode === 'node') {
        targetID = geoInterface.options.network.getEgo().id;
        window.network.updateNode(targetID, properties);
      } else if (geoInterface.options.mode === 'edge') {
        targetID = edges[currentPersonIndex].id;
        window.network.updateEdge(targetID, properties);
      }

      $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+layer.feature.properties.name);
    } else {
      // Map node already selected. Have we clicked the same one again?
      if (layer.feature.properties.name === mapNodeClicked) {
        // Same map node clicked. Reset the styles and mark no node as being selected
        resetHighlight(e);
        mapNodeClicked = false;
        properties = {};
        properties[geoInterface.options.variable.value] = undefined;

        if (geoInterface.options.mode === 'node') {
          targetID = geoInterface.options.network.getEgo().id;
          window.network.updateNode(targetID, properties);
        } else if (geoInterface.options.mode === 'edge') {
          targetID = edges[currentPersonIndex].id;
          window.network.updateEdge(targetID, properties);
        }

      } else {
        resetAllHighlights();
        highlightFeature(e);
        properties = {};
        properties[geoInterface.options.variable.value] = layer.feature.properties.name;

        if (geoInterface.options.mode === 'node') {
          targetID = geoInterface.options.network.getEgo().id;
          window.network.updateNode(targetID, properties);
        } else if (geoInterface.options.mode === 'edge') {
          targetID = edges[currentPersonIndex].id;
          window.network.updateEdge(targetID, properties);
        }


        // TODO: Different node clicked. Reset the style and then mark the new one as clicked.
      }

    }

  }

  function onEachFeature(feature, layer) {
    layer.on({
      click: toggleFeature
    });

    window.addEventListener('changeStageStart', function() {
      layer.off({
        click: toggleFeature
      });
    }, false);
  }

  function highlightCurrent() {
    if (typeof edges[currentPersonIndex] !== 'undefined' && edges[currentPersonIndex][geoInterface.options.variable.value] !== undefined) {
      mapNodeClicked = edges[currentPersonIndex][geoInterface.options.variable.value];

      if (geoInterface.options.variable.other_options && geoInterface.options.variable.other_options.map(function(obj){ return obj.value; }).indexOf(edges[currentPersonIndex][geoInterface.options.variable.value]) !== -1) {
        resetPosition();
        var text = edges[currentPersonIndex][geoInterface.options.variable.value];
        $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+text);
      } else {
        $.each(geojson._layers, function(index,value) {
          if (value.feature.properties.name === edges[currentPersonIndex][geoInterface.options.variable.value]) {
            $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+edges[currentPersonIndex][geoInterface.options.variable.value]);
            selectFeature(value);
          }
        });
      }

    } else {
      resetPosition();
    }

  }

  function safePrompt() {
    var name;
    if (geoInterface.options.mode === 'node') {
      name = 'you';
    } else if (geoInterface.options.mode === 'edge') {
      name = typeof edges[currentPersonIndex] !== 'undefined' ? edges[currentPersonIndex].venue_name_t0 : 'Venue';
    }

    return geoInterface.options.prompt.replace('%alter%', name);
  }

  geoInterface.setOtherOption = function() {
    var option = $(this).data('value');
    resetAllHighlights();
    var properties = {}, targetID;
    properties[geoInterface.options.variable.value] = option;
    if (geoInterface.options.mode === 'node') {
      targetID = geoInterface.options.network.getEgo().id;
      window.network.updateNode(targetID, properties);
    } else if (geoInterface.options.mode === 'edge') {
      targetID = edges[currentPersonIndex].id;
      window.network.updateEdge(targetID, properties);
    }

    $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+option);
  };

  var stageChangeHandler = function() {
    geoInterface.destroy();
  };

  // Public methods

  geoInterface.nextPerson = function() {

    if (currentPersonIndex < edges.length-1) {
      resetAllHighlights();
      currentPersonIndex++;
      $('.current-id').html(currentPersonIndex+1);

      $('.map-node-status').html(safePrompt());

      // if variable already set, highlight it and zoom to it.
      highlightCurrent();

      geoInterface.updateNavigation();
    }


  };

  geoInterface.getLeaflet = function() {
    return leaflet;
  };

  geoInterface.previousPerson = function() {
    if (currentPersonIndex > 0) {

      resetAllHighlights();
      currentPersonIndex--;
      $('.current-id').html(currentPersonIndex+1);
      $('.map-node-status').html(safePrompt());

      // if variable already set, highlight it and zoom to it.
      highlightCurrent();
      geoInterface.updateNavigation();
    }
  };

  geoInterface.init = function(options) {
    window.tools.extend(geoInterface.options, options);

    // Initialize the map, point it at the #map element and center it on Chicago
    leaflet = window.L.map('map', {
      maxBounds: [[41.4985986599114, -88.498240224063451],[42.1070175291862,-87.070984247165939]],
      zoomControl: false
    });

    window.L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.transit/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
      subdomains: '1234',
      mapID: 'newest',
      app_id: 'FxdAZ7O0Wh568CHyJWKV',
      app_code: 'FuQ7aPiHQcR8BSnXBCCmuQ',
      base: 'base',
      minZoom: 0,
      maxZoom: 20
    }).addTo(leaflet);

            leaflet.setView([41.798395426119534,-87.839671372338884], 11);

    $.ajax({
      dataType: 'json',
      url: geoInterface.options.geojson,
      success: function(data) {
        geojson = window.L.geoJson(data, {
          onEachFeature: onEachFeature,
          style: function () {
            return {weight:1,fillOpacity:0,strokeWidth:0.2, color:colors[1]};
          }
        }).addTo(leaflet);

        // Load initial node
        edges = geoInterface.options.network.getEdges(geoInterface.options.criteria, function (results) {
          // Previously only showedhouse parties or somewhere else
          // Now, any venue that doesnt exactly match one of the autocomplete venues.


            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.venue_type_t0 === 'House Party' || value.venue_type_t0 === 'Somewhere Else' || window.netCanvas.Modules.session.protocolData.autocompleteVenues.indexOf(value.venue_name_t0) === -1) {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });


        $('.map-counter').html('<span class="current-id">1</span>/'+edges.length);

        if (edges.length > 0) {
          $('.map-node-status').html(safePrompt());
        }




        // Highlight initial value, if set
        highlightCurrent();

        geoInterface.updateNavigation();

      }
    });

    geoInterface.drawUIComponents();

    // Events
    window.addEventListener('changeStageStart', stageChangeHandler, false);
    $('.map-back').on('click', geoInterface.previousPerson);
    $('.map-forwards').on('click', geoInterface.nextPerson);
    $('.other-option').on('click', geoInterface.setOtherOption);

  };

  geoInterface.updateNavigation = function() {

    if (currentPersonIndex === 0) {
      $('.map-back').hide();
    } else {
      $('.map-back').show();
    }

    if (currentPersonIndex === edges.length-1) {
      $('.map-forwards').hide();
    } else {
      $('.map-forwards').show();
    }

    if (edges.length === 1) {
      $('.map-forwards, .map-back, .map-counter').hide();
    }
  };

  geoInterface.drawUIComponents = function() {
    note.debug('geoInterface.drawUIComponents()');
    geoInterface.options.targetEl.append('<div class="container map-node-container"><div class="row" style="width:100%"><div class="col-sm-4 text-left"><div class="map-node-navigation"><span class="btn btn-primary btn-block map-back"><span class="glyphicon glyphicon-arrow-left"></span></span></div></div><div class="col-sm-4 text-center"><p class="lead map-counter"></p></div><div class="col-sm-4 text-right"><div class="map-node-navigation"><span class="btn btn-primary btn-block map-forwards"><span class="glyphicon glyphicon-arrow-right"></span></span></div></div></div><div class="row form-group"><div class="col-sm-12 text-center"><p class="lead map-node-status"></p><p class="lead map-node-location"></p></div></div><div class="row"></div>');
    $('.map-node-status').html(safePrompt());

    if (geoInterface.options.variable.other_options && geoInterface.options.variable.other_options.length > 0) {
      $('.map-node-container').append('<div class="col-sm-12 form-group other-options"></div>');
      $.each(geoInterface.options.variable.other_options, function(otherIndex, otherValue) {
        $('.other-options').append('<button class="btn '+otherValue.btnClass+' btn-block other-option" data-value="'+otherValue.value+'">'+otherValue.label+'</button>');
      });
    }
  };

  geoInterface.destroy = function() {
    // Used to unbind events
    leaflet.remove();
    window.removeEventListener('changeStageStart', stageChangeHandler, false);
    $('.map-back').off('click', geoInterface.previousPerson);
    $('.map-forwards').off('click', geoInterface.nextPerson);
    $('.other-option').on('click', geoInterface.setOtherOption);
  };

  return geoInterface;
};
;/* global $, window, note */
/* exported GeoInterface */

/*
 Map module.
*/

module.exports = function GeoInterface() {
    'use strict';
  	// map globals
    var log;
    var taskComprehended = false;
 	var geoInterface = {};
    geoInterface.options = {
        network: window.network || new window.netcanvas.Module.Network(),
        targetEl: $('.map-node-container'),
        mode: 'edge',
        criteria: {
            type:'Sex',
            from: window.network.getNodes({type_t0:'Ego'})[0].id
        },
        geojson: '',
        prompt: 'Where does %alter% live?',
        variable: {

            label:'res_chicago_location_t0',
            other_values: [
                {label: 'I live outside Chicago', value: 'outside_chicago'},
                {label: 'I am currently homeless', value: 'homeless'}
            ]
        }
    };
 	var leaflet;
 	var edges = [];
 	var currentPersonIndex = 0;
 	var geojson;
 	var mapNodeClicked = false;
    var colors = ['#67c2d4','#1ECD97','#B16EFF','#FA920D','#e85657','#20B0CA','#FF2592','#153AFF','#8708FF'];

  	// Private functions

    function highlightFeature(e) {
        var layer = e.target;
        leaflet.fitBounds(e.target.getBounds(), {maxZoom:14});

        layer.setStyle({
            fillOpacity: 0.8,
          fillColor: colors[1]
        });

        if (!window.L.Browser.ie && !window.L.Browser.opera) {
            layer.bringToFront();
        }

        mapNodeClicked = layer.feature.properties.name;
    }

    function selectFeature(e) {
        var layer = e;
        leaflet.fitBounds(e.getBounds(), {maxZoom:14});

        layer.setStyle({
            fillOpacity: 0.8,
          fillColor: colors[1]
        });

        if (!window.L.Browser.ie && !window.L.Browser.opera) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        $('.map-node-location').html('');
        mapNodeClicked = false;
        geojson.resetStyle(e.target);
    }

    function resetAllHighlights() {
        note.debug('resetAllHighlights()');
        $('.map-node-location').html('');
        mapNodeClicked = false;
        $.each(geojson._layers, function(index,value) {
            geojson.resetStyle(value);
        });
    }

    function resetPosition() {
        note.debug('resetPosition()');
        // leaflet.setView([41.798395426119534,-87.839671372338884], 11);
    }


    function toggleFeature(e) {
        if (taskComprehended === false) {
            var eventProperties = {
                zoomLevel: leaflet.getZoom(),
                stage: window.netCanvas.Modules.session.currentStage(),
                timestamp: new Date()
            };
            log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
            window.dispatchEvent(log);
            taskComprehended = true;
        }

        var mapEventProperties = {
            zoomLevel: leaflet.getZoom(),
            timestamp: new Date()
        };
        log = new window.CustomEvent('log', {'detail':{'eventType': 'mapMarkerPlaced', 'eventObject':mapEventProperties}});
        window.dispatchEvent(log);
        var layer = e.target;
        var properties, targetID;

        // remove HIV service nodes  and edges if present.
       var serviceNodes = window.network.getNodes({type_t0: 'HIVService'});

       $.each(serviceNodes, function(index, value) {
           console.log('removing');
           window.network.removeNode(value.id);
       });

       var serviceEdges = window.network.getEdges({type: 'HIVService'});
       window.network.removeEdges(serviceEdges);

        // is there a map node already selected?
        if (mapNodeClicked === false) {
            // no map node selected, so highlight this one and mark a map node as having been selected.
            highlightFeature(e);
            // updateInfoBox('You se{lected: <strong>'+layer.feature.properties.name+'</strong>. Click the "next" button to place the next person.');

            // Update edge with this info
            properties = {};
            properties[geoInterface.options.variable.value] = layer.feature.properties.name;


            if (geoInterface.options.mode === 'node') {
                targetID = geoInterface.options.network.getEgo().id;
                window.network.updateNode(targetID, properties);
            } else if (geoInterface.options.mode === 'edge') {
                targetID = edges[currentPersonIndex].id;
                window.network.updateEdge(targetID, properties);
            }

            $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+layer.feature.properties.name);
        } else {
            // Map node already selected. Have we clicked the same one again?
            if (layer.feature.properties.name === mapNodeClicked) {
                // Same map node clicked. Reset the styles and mark no node as being selected
                resetHighlight(e);
                mapNodeClicked = false;
                properties = {};
                properties[geoInterface.options.variable.value] = undefined;

                if (geoInterface.options.mode === 'node') {
                    targetID = geoInterface.options.network.getEgo().id;
                    window.network.updateNode(targetID, properties);
                } else if (geoInterface.options.mode === 'edge') {
                    targetID = edges[currentPersonIndex].id;
                    window.network.updateEdge(targetID, properties);
                }

            } else {
                resetAllHighlights();
                highlightFeature(e);
                properties = {};
                properties[geoInterface.options.variable.value] = layer.feature.properties.name;

                if (geoInterface.options.mode === 'node') {
                    targetID = geoInterface.options.network.getEgo().id;
                    window.network.updateNode(targetID, properties);
                } else if (geoInterface.options.mode === 'edge') {
                    targetID = edges[currentPersonIndex].id;
                    window.network.updateEdge(targetID, properties);
                }


                // TODO: Different node clicked. Reset the style and then mark the new one as clicked.
            }

        }

    }

    function onEachFeature(feature, layer) {
        layer.on({
            click: toggleFeature
        });

        window.addEventListener('changeStageStart', function() {
            layer.off({
                click: toggleFeature
            });
        }, false);
    }

  	function highlightCurrent() {
      if (typeof edges[currentPersonIndex] !== 'undefined' && edges[currentPersonIndex][geoInterface.options.variable.value] !== undefined) {
        mapNodeClicked = edges[currentPersonIndex][geoInterface.options.variable.value];

        if (geoInterface.options.variable.other_options && geoInterface.options.variable.other_options.map(function(obj){ return obj.value; }).indexOf(edges[currentPersonIndex][geoInterface.options.variable.value]) !== -1) {
          resetPosition();
          var text = edges[currentPersonIndex][geoInterface.options.variable.value];
          $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+text);
        } else {
          $.each(geojson._layers, function(index,value) {
            if (value.feature.properties.name === edges[currentPersonIndex][geoInterface.options.variable.value]) {
              $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+edges[currentPersonIndex][geoInterface.options.variable.value]);
              selectFeature(value);
            }
          });
        }

  		} else {
  			resetPosition();
  		}

  	}

    function safePrompt() {
        var name;

        if (geoInterface.options.mode === 'node') {
            name = 'you';
        } else if (geoInterface.options.mode === 'edge') {
            name = typeof edges[currentPersonIndex] !== 'undefined' ? edges[currentPersonIndex].nname_t0 : 'Person';
        }

        return geoInterface.options.prompt.replace('%alter%', name);
    }

    geoInterface.setOtherOption = function() {
        // remove HIV service nodes  and edges if present.
       var serviceNodes = window.network.getNodes({type_t0: 'HIVService'});

       $.each(serviceNodes, function(index, value) {
           console.log('removing');
           window.network.removeNode(value.id);
       });

       var serviceEdges = window.network.getEdges({type: 'HIVService'});
       window.network.removeEdges(serviceEdges);
       
        var option = $(this).data('value');
        resetAllHighlights();
        var properties = {}, targetID;
        properties[geoInterface.options.variable.value] = option;
        if (geoInterface.options.mode === 'node') {
            targetID = geoInterface.options.network.getEgo().id;
            window.network.updateNode(targetID, properties);
        } else if (geoInterface.options.mode === 'edge') {
            targetID = edges[currentPersonIndex].id;
            window.network.updateEdge(targetID, properties);
        }

        $('.map-node-location').html('<strong>Currently marked as:</strong> <br>'+option);
    };

    var stageChangeHandler = function() {
        geoInterface.destroy();
    };

  	geoInterface.nextPerson = function() {
        note.debug('geoInterface.setLevel()');
  		if (currentPersonIndex < edges.length-1) {
  			resetAllHighlights();
	  		currentPersonIndex++;
	        $('.current-id').html(currentPersonIndex+1);

	        $('.map-node-status').html(safePrompt());

  			// if variable already set, highlight it and zoom to it.
  			highlightCurrent();

            geoInterface.updateNavigation();
  		}


  	};

    geoInterface.getLeaflet = function() {
        return leaflet;
    };

  	geoInterface.previousPerson = function() {
	  	if (currentPersonIndex > 0) {

	  		resetAllHighlights();
	  		currentPersonIndex--;
	        $('.current-id').html(currentPersonIndex+1);
	        $('.map-node-status').html(safePrompt());

  			// if variable already set, highlight it and zoom to it.
  			highlightCurrent();
            geoInterface.updateNavigation();
	    }
  	};

  	geoInterface.init = function(options) {
        window.tools.extend(geoInterface.options, options);

  		// Initialize the map, point it at the #map element and center it on Chicago
        leaflet = window.L.map('map', {
            maxBounds: [[41.4985986599114, -88.498240224063451],[42.1070175291862,-87.070984247165939]],
            zoomControl: false
        });

        window.L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.transit/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
            subdomains: '1234',
            mapID: 'newest',
            app_id: 'FxdAZ7O0Wh568CHyJWKV',
            app_code: 'FuQ7aPiHQcR8BSnXBCCmuQ',
            base: 'base',
            minZoom: 0,
            maxZoom: 20
        }).addTo(leaflet);

        leaflet.setView([41.798395426119534,-87.839671372338884], 11);

        $.ajax({
          	dataType: 'json',
          	url: geoInterface.options.geojson,
          	success: function(data) {
            	geojson = window.L.geoJson(data, {
                	onEachFeature: onEachFeature,
                	style: function () {
                  		return {weight:1,fillOpacity:0,strokeWidth:0.2, color:colors[1]};
                	}
            	}).addTo(leaflet);

		        // Load initial node
                if (geoInterface.options.mode === 'edge') {
                    edges = geoInterface.options.network.getEdges(geoInterface.options.criteria);
                } else if (geoInterface.options.mode === 'node') {
                    edges = geoInterface.options.network.getNodes(geoInterface.options.criteria);
                }

		        $('.map-counter').html('<span class="current-id">1</span>/'+edges.length);

                if (edges.length > 0) {
                    $('.map-node-status').html(safePrompt());
                }

            	// Highlight initial value, if set
            	highlightCurrent();

                geoInterface.updateNavigation();

          	}
        });

        geoInterface.drawUIComponents();

        // Events
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $('.map-back').on('click', geoInterface.previousPerson);
        $('.map-forwards').on('click', geoInterface.nextPerson);
        $('.other-option').on('click', geoInterface.setOtherOption);

  	};

    geoInterface.updateNavigation = function() {

        if (currentPersonIndex === 0) {
            $('.map-back').hide();
        } else {
            $('.map-back').show();
        }

        if (currentPersonIndex === edges.length-1) {
            $('.map-forwards').hide();
        } else {
            $('.map-forwards').show();
        }

        if (edges.length === 1) {
            $('.map-forwards, .map-back, .map-counter').hide();
        }
    };

    geoInterface.drawUIComponents = function() {
        note.debug('geoInterface.drawUIComponents()');
        geoInterface.options.targetEl.append('<div class="container map-node-container"><div class="row" style="width:100%"><div class="col-sm-4 text-left"><div class="map-node-navigation"><span class="btn btn-primary btn-block map-back"><span class="glyphicon glyphicon-arrow-left"></span></span></div></div><div class="col-sm-4 text-center"><p class="lead map-counter"></p></div><div class="col-sm-4 text-right"><div class="map-node-navigation"><span class="btn btn-primary btn-block map-forwards"><span class="glyphicon glyphicon-arrow-right"></span></span></div></div></div><div class="row form-group"><div class="col-sm-12 text-center"><p class="lead map-node-status"></p><p class="lead map-node-location"></p></div></div><div class="row"></div>');
        $('.map-node-status').html(safePrompt());

        if (geoInterface.options.variable.other_options && geoInterface.options.variable.other_options.length > 0) {
            $('.map-node-container').append('<div class="col-sm-12 form-group other-options"></div>');
            $.each(geoInterface.options.variable.other_options, function(otherIndex, otherValue) {
                $('.other-options').append('<button class="btn '+otherValue.btnClass+' btn-block other-option" data-value="'+otherValue.value+'">'+otherValue.label+'</button>');
            });
        }
    };

  	geoInterface.destroy = function() {
    	// Used to unbind events
        leaflet.remove();
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
    	$('.map-back').off('click', geoInterface.previousPerson);
        $('.map-forwards').off('click', geoInterface.nextPerson);
        $('.other-option').on('click', geoInterface.setOtherOption);
  	};

  	return geoInterface;
};
;/* global $, window, note, omnivore */
/* exported VenueInterface */

/*
 Map module.
*/

module.exports = function VenueInterface() {
    'use strict';
  	// map globals
    var centroid, filterCircle;
 	  var venueInterface = {};
    var RADIUS = 1609;
    venueInterface.options = {
        targetEl: $('#map'),
        network: window.network || new window.netcanvas.Module.Network(),
        points: window.protocolPath+'data/hiv-services.csv',
        geojson: window.protocolPath+'data/census2010.json',
        prompt: 'These are the sexual health service providers within 1 mile of where you live. Please tap on all of the ones you\'ve used in the last 6 months.',
        dataDestination: {
            node: {
                type_t0: 'Venue',
                venue_name: '%venuename%'
            },
            edge: {
                type: 'HIVservice',
                from: window.network.getEgo().id,
                to: '%destinationNode%'
            }
        },
        egoLocation: 'res_chicago_location_t0'
    };
 	var leaflet;
 	var geojson;
    var colors = ['#67c2d4','#1ECD97','#B16EFF','#FA920D','#e85657','#20B0CA','#FF2592','#153AFF','#8708FF'];
    var moduleEvents = [];

  	// Private functions

    var stageChangeHandler = function() {
        venueInterface.destroy();
    };

  	// Public methods

    venueInterface.getLeaflet = function() {
        return leaflet;
    };

  	venueInterface.init = function(options) {
        $('#content').addClass('stageHidden');
        window.tools.extend(venueInterface.options, options);

        window.L.Icon.Default.imagePath = 'img/';

        // Provide your access token
        window.L.mapbox.accessToken = 'pk.eyJ1IjoianRocmlsbHkiLCJhIjoiY2lnYjFvMnBmMWpxbnRmbHl2dXp2ZDBnbiJ9.YnZpoiaXloVbxhHobhtbvQ';


        // Hack for multiple popups
        window.L.Map = window.L.Map.extend({
            openPopup: function(popup) {
                //        this.closePopup();  // just comment this
                this._popup = popup;

                return this.addLayer(popup).fire('popupopen', {
                    popup: this._popup
                });
            },
            closePopup: function() {
                return false;
            }
        }); /***  end of hack ***/

  		// Initialize the map, point it at the #map element and center it on Chicago
        leaflet = window.L.map('map', {
            maxBounds: [[41.4985986599114, -88.498240224063451],[42.1070175291862,-87.070984247165939]],
            zoomControl: false,
            minZoom: 0,
            maxZoom: 20
        });

        window.L.tileLayer('http://{s}.{base}.maps.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.transit/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
            subdomains: '1234',
            mapID: 'newest',
            app_id: 'FxdAZ7O0Wh568CHyJWKV',
            app_code: 'FuQ7aPiHQcR8BSnXBCCmuQ',
            base: 'base',
            minZoom: 0,
            maxZoom: 20
        }).addTo(leaflet);

        leaflet.setView([41.798395426119534,-87.839671372338884], 11);

        venueInterface.drawUIComponents();
        $.ajax({
            dataType: 'json',
            url: venueInterface.options.geojson,
            success: function(data) {
                var egoLocation = venueInterface.options.network.getEgo()[venueInterface.options.egoLocation];
                note.debug('egoLocation: '+egoLocation);
                geojson = window.L.geoJson(data, {
                    onEachFeature: function(feature, layer) {
                        // Load initial node

                        if (feature.properties.name === egoLocation) {
                            centroid = layer.getBounds().getCenter();

                            filterCircle = window.L.circle(window.L.latLng(centroid), RADIUS, {
                                opacity: 1,
                                weight: 1,
                                fillOpacity: 0.2
                            }).addTo(leaflet);
                            leaflet.fitBounds(filterCircle.getBounds());
                            venueInterface.doTheRest();

                        }
                    },
                    style: function () {
                        return {weight:1,fillOpacity:0,strokeWidth:0.2, color:colors[1]};
                    }
                });

            }
        });

        // Events
        var event = [
            {
                event: 'changeStageStart',
                handler: stageChangeHandler,
                targetEl:  window
            },
            {
                event: 'click',
                handler: venueInterface.clickPopup,
                targetEl:  window.document,
                subTarget: '.leaflet-popup-content-wrapper'
            }
        ];
        window.tools.Events.register(moduleEvents, event);

  	};

    venueInterface.selectMarker = function(name) {
        $('.leaflet-popup').removeClass('top');
        var feature = $('body').find('[data-feature="' + name + '"]');
        $(feature).parent().parent().parent().toggleClass('selected top');
    };

    venueInterface.clickPopup = function(e,clicked) {
      // if clicked is present we have clicked a marker rather than its popup.
      if(!clicked) {
          //clicked popup
        clicked = $(this).find('.service-popup').data('feature');
      }
      venueInterface.selectMarker(clicked);

      // Toggle visited property of HIVService edge

      // First, get the HIVService node, so we can get its ID
      var serviceNodeID = window.network.getNodes({name: clicked})[0].id;


      var properties = {
        from: window.network.getEgo().id,
        to: serviceNodeID,
        type:'HIVService'
      };


      // Get the HIVService edge
      var serviceEdge = window.network.getEdges(properties)[0];

      serviceEdge.visited = !serviceEdge.visited;

      // Incase the participant goes back to this screen and changes the value after answering questions on the following screen.
      serviceEdge.reason_not_visited = undefined;
      serviceEdge.provider_awareness = undefined;

      var id = serviceEdge.id;

      window.network.updateEdge(id,serviceEdge);

    };

    venueInterface.doTheRest = function() {
        note.debug('venueInterface.doTheRest()');
        console.log(venueInterface.options.points);
        var points = omnivore.csv(venueInterface.options.points, null, window.L.mapbox.featureLayer()).addTo(leaflet).on('error', function(error) {
            console.log(error);
        });

        leaflet.on('layeradd', function(e) {
            note.debug('leaflet -> layeradd');
            note.debug(e);
            if (e.layer.feature) {
                var popup = window.L.popup({closeButton:false}).setContent('<div class="service-popup" data-feature="'+e.layer.feature.properties['Abbreviated Name']+'">'+e.layer.feature.properties['Abbreviated Name']+'</div>');
                e.layer.bindPopup(popup).openPopup();
                e.layer.on('click', function(event) {
                    console.log(e.layer);
                  venueInterface.clickPopup(event, e.layer.feature.properties['Abbreviated Name']);
                });
            }
        });

        points.setFilter(function(feature) {
          // var popup = window.L.popup().setContent('<div class="service-popup" data-feature="'+feature.properties['Abbreviated Name']+'">'+feature.properties['Abbreviated Name']+'</div>');
          // layer.bindPopup(popup).openPopup();
          // // layer.feature.properties
          var filterCoords = filterCircle.getLatLng();
          var thisFeatureCords = window.L.latLng(feature.geometry.coordinates[1],feature.geometry.coordinates[0]);
          var distance = filterCoords.distanceTo(thisFeatureCords);
          return distance < RADIUS;
        }).on('ready', function() { // huge bullshittery. Event driven IO and no callback.
          // the layer has been fully loaded now, and you can
          // call .getTileJSON and investigate its properties
          console.log('READY');
          var nodeCount = 0;
          this.eachLayer(function(l) {
              console.log('each layer');
              nodeCount++;
            // Store the filtered points as nodes of type HIVservice

            // First, check if the proposed node already exists
            // TODO: This requires that if ego location changes, all nodes of type HIVService are deleted.

            var nodeProperties = {
              type_t0: 'HIVService',
              name: l.feature.properties['Abbreviated Name']
            };

            var serviceNodeID = null;

            if (window.network.getNodes(nodeProperties).length === 0) {
              serviceNodeID = window.network.addNode(nodeProperties);
              note.debug('created HIVService node for '+nodeProperties.name);
            } else {
              serviceNodeID = window.network.getNodes(nodeProperties)[0].id;
            }

            // Now check if we also need to create an edge
            var edgeProperties = {
              from: window.network.getEgo().id,
              to: serviceNodeID,
              type:'HIVService'
            };

            if (window.network.getEdges(edgeProperties).length === 0) {
                edgeProperties.visited = false;
                window.network.addEdge(edgeProperties);
            } else {
                // The edge already exists, so we need to check the value of 'visited' to see if it should be selected.
                var edge = window.network.getEdges(edgeProperties)[0];
                var visited = edge.visited;
                if(visited) {
                    venueInterface.selectMarker(l.feature.properties['Abbreviated Name']);
                }
            }



          });

          // if we didnt pick up any nodes, skip this stage
          if (nodeCount < 1) {
              console.log('No service providers close to ego. Skipping stage.');
              window.netCanvas.Modules.session.nextStage();
          } else {
              // else, show the map
             $('#content').removeClass('stageHidden');
          }

        });


    };

    venueInterface.drawUIComponents = function() {
        note.debug('venueInterface.drawUIComponents()');
        venueInterface.options.targetEl.append('<div class="container map-node-container"><div class="row form-group"><div class="col-sm-12 text-center"><h4 class="prompt" style="color:white"></h4></div></div>');
        $('.prompt').html(venueInterface.options.prompt);
    };

  	venueInterface.destroy = function() {
    	// Used to unbind events
        window.tools.Events.unbind(moduleEvents);

        leaflet.remove();
  	};

  	return venueInterface;
};
;/* global $, window, note, List */
/* exported Menu */
var Menu = function Menu(options) {
    'use strict';
    // TODO: Check if a menu exists before adding it. If it does, return false. Unique id = menu name.
    // TODO: Give menus ascending classes.

    var menu = {};
    var menus = [];
    var isAnimating = false;

    var contentClickHandler = function() {
        menu.closeMenu();
    };

    menu.options = {
      onBeforeOpen : function() {
        $('.black').hide();
        $('.arrow-next').transition({marginRight:-550},1000);
        $('.arrow-prev').transition({marginLeft:-550},1000);
        $('.content').addClass('pushed');
        $('.pushed').on('click', contentClickHandler);
      },
      onAfterOpen : function() {
        return false;
      },
      onBeforeClose : function() {
        $('.content').removeClass('pushed');
        $('.pushed').off('click', contentClickHandler);
      },
      onAfterClose : function() {
        $('body').css({'background-color':''});
        $('.arrow-next').transition({marginRight:0},1000);
        $('.arrow-prev').transition({marginLeft:0},1000);
      }
    };

    menu.getMenus = function() {
        return menus;
    };

    menu.closeMenu = function(targetMenu) {
        if(!targetMenu) {
            //close all menus
            $.each(menus, function(index) {
                if(menus[index].open === true) {
                    menus[index].closeBtn.trigger('click');
                }
            });
        } else {
            targetMenu.closeBtn.trigger('click');
        }

    };

    menu.toggle = function(targetMenu) {
        var targetMenuObj = $('.'+targetMenu.name+'-menu');

        if (isAnimating === true) {
            return false;
        } else {
            isAnimating = true;
            if(targetMenu.open === true) {
                menu.options.onBeforeClose();
                targetMenu.filterMenu.search();
                targetMenu.menu.find('input').val('');
                targetMenuObj.removeClass('open');
                targetMenu.open = false;
                setTimeout(menu.options.onAfterClose, 1000);
                isAnimating = false;
            } else {
                menu.options.onBeforeOpen();
                var options = {
                    valueNames: ['name', 'order']
                };

                targetMenu.filterMenu = new List(targetMenu.name, options);
                var col = window.tools.modifyColor($('.'+targetMenu.name+'-menu').css('background-color'),-0.2);
                $('body').css({'background-color':col});
                targetMenuObj.addClass('open');
                targetMenu.open = true;
                setTimeout(menu.options.onAfterOpen, 500);
                isAnimating = false;
            }

        }

    };

    menu.addMenu = function(name, icon) {
        var newMenu = {};
        newMenu.name = name;
        newMenu.open = false;
        newMenu.button = $('<span class="fa fa-2x fa-'+icon+' menu-btn '+name+'"></span>');
        // newMenu.button.addClass(icon);
        $('.menu-container').append(newMenu.button);
        $(newMenu.button).addClass('shown');

        var menuClass = name+'-menu';
        newMenu.menu = $('<div class="menu '+menuClass+'"><div class="menu-content content-'+name+'" id="'+name+'"><h2>'+name+'</h2> <div class="input-group margin-bottom-sm"><span class="input-group-addon"><i class="fa fa-search"></i></span><input class="form-control menu-filter search" type="text" placeholder="Filter"></div><ul class="list"></ul></div></div>');
        newMenu.closeBtn = $('<span class="icon icon-close"><i class="fa fa-times fa-2x"></i></span>');
        $(newMenu.menu).append(newMenu.closeBtn);
        $('.menu-container').append(newMenu.menu);

        newMenu.button.on( 'click', function() {
            $('.menu-btn').removeClass('shown');
            menu.toggle(newMenu);
        });

        newMenu.closeBtn.on( 'click', function() {
            $('.menu-btn').addClass('shown');
            menu.toggle(newMenu);
        });

        menus.push(newMenu);

        return newMenu;

    };

    menu.removeMenu = function(targetMenu) {
        $(targetMenu.button).remove();
        $(targetMenu.items).remove();
    };

    menu.addItem = function(targetMenu,item,icon,callback) {
        console.log('adding '+item);
        var listIcon = 'fa-file-text';
        if (icon) {
            listIcon = icon;
        }
        var menuItem = $('<li><span class="fa '+listIcon+' menu-icon"></span><span class="order" style="display:none;">'+(targetMenu.menu.find('ul').children().length+1)+'</span> <span class="name">'+item+'</span></li>');
        targetMenu.menu.find('ul').append(menuItem);
        menuItem.on('click', function() {
            console.log('yo');
            menu.closeMenu(targetMenu);
            setTimeout(function() {
                callback();
            },500);
        });

    };

    menu.init = function() {
        note.info('Menu initialising.');

        window.tools.extend(menu.options,options);
    };

    menu.init();

    return menu;

};

module.exports = new Menu();
;/* global $, window */
/* exported MultiBin */
module.exports = function MultiBin() {
	'use strict';
	//global vars
	var log;
	var taskComprehended = false;
	var animating = false;
	var open = false;
	var multiBin = {}, followup;
	multiBin.options = {
		targetEl: $('.container'),
		edgeType: 'Dyad',
		variable: {
			label:'multibin_variable',
			values: [
				'Variable 1',
			]
		},
		criteria: {},
		filter: undefined,
		heading: 'Default Heading',
		subheading: 'Default Subheading.'
	};

	var stageChangeHandler = function() {
		multiBin.destroy();
	};

	var followupHandler = function(e) {
		e.preventDefault();
		// Handle the followup data

		// First, retrieve the relevant values

		var nodeid = followup;

		// Next, get the edge we will be storing on
		var criteria = {
			to:nodeid
		};

		window.tools.extend(criteria, multiBin.options.criteria);
		var edge = window.network.getEdges(criteria)[0];

		// Create an empty object for storing the new properties in
		var followupProperties = {};

		// Assign a new property according to the variable name(s)
		$.each(multiBin.options.followup.questions, function(index) {
			var followupVal = $('#'+multiBin.options.followup.questions[index].variable).val();
			followupProperties[multiBin.options.followup.questions[index].variable] = followupVal;
		});

		// Update the edge
		window.tools.extend(edge, followupProperties);
		window.network.updateEdge(edge.id, edge);

		// Clean up
		$.each(multiBin.options.followup.questions, function(index) {
			$('#'+multiBin.options.followup.questions[index].variable).val('');
		});

		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var followupCancelHandler = function() {

		// Clean up
		$('#'+multiBin.options.followup.variable).val('');
		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var backgroundClickHandler = function(e) {
		e.stopPropagation();
		if(open === true) {
			if ($('.node-bin-active').length > 0) {
					animating = true;
					setTimeout(function() {
						$('.node-bin-container').children().css({opacity:1});
						$('.node-question-container').fadeIn();
					}, 300);

					var current = $('.node-bin-active');
					$(current).removeClass('node-bin-active');
					$(current).addClass('node-bin-static');
					$(current).children('h1, p').show();
					$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false, start: function(){
						if (taskComprehended === false) {
							var eventProperties = {
								stage: window.netCanvas.Modules.session.currentStage(),
								timestamp: new Date()
							};
							log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
							window.dispatchEvent(log);
							taskComprehended = true;
						}
					}});

					setTimeout(function() {
						open = false;
						animating = false;
					}, 500);

			}
		} else {
		}


	};


	var nodeClickHandler = function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		var el = $(this);
		var id = $(this).parent().parent().data('index');

		// has the node been clicked while in the bucket or while in a bin?
		if ($(this).parent().hasClass('active-node-list')) {
			// it has been clicked while in a bin.
			var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:el.data('node-id'), type:multiBin.options.edgeType})[0].id;
			var properties = {};
			// make the values null when a node has been taken out of a bin
			properties[multiBin.options.variable.label] = '';

			// dont forget followups
			if(typeof multiBin.options.followup !== 'undefined') {
				$.each(multiBin.options.followup.questions, function(index, value) {
					properties[value.variable] = undefined;
				});
			}
			window.network.updateEdge(edgeID,properties);

			$(this).css({'top':0, 'left' :0});
			$(this).appendTo('.node-bucket');
			$(this).css('display', '');
			var noun = 'people';
			if ($('.c'+id).children('.active-node-list').children().length === 1) {
				noun = 'person';
			}
			if ($('.c'+id).children('.active-node-list').children().length === 0) {
				$('.c'+id).children('p').html('(Empty)');
			} else {
				$('.c'+id).children('p').html($('.c'+id).children('.active-node-list').children().length+' '+noun+'.');
			}


		}

	};

	var nodeBinClickHandler = function() {
		if (open === false) {

				if(!$(this).hasClass('node-bin-active')) {
					animating = true;
					open = true;
					$('.node-bin-container').children().not(this).css({opacity:0});
					$('.node-question-container').hide();
					var position = $(this).offset();
					var nodeBinDetails = $(this);
					nodeBinDetails.children('.active-node-list').children('.node-bucket-item').removeClass('shown');
					setTimeout(function() {
						nodeBinDetails.offset(position);
						nodeBinDetails.addClass('node-bin-active');

						nodeBinDetails.removeClass('node-bin-static');
						nodeBinDetails.children('h1, p').hide();

						// $('.content').append(nodeBinDetails);

						nodeBinDetails.addClass('node-bin-active');
						setTimeout(function(){
							var timer = 0;
							$.each(nodeBinDetails.children('.active-node-list').children(), function(index,value) {
								timer = timer + (index*10);
								setTimeout(function(){
									$(value).on('click', nodeClickHandler);
									$(value).addClass('shown');
								},timer);
							});
						},300);
						open = true;
					}, 500);

					setTimeout(function() {
						animating = false;
					}, 500);

				}
		} else {
		}

	};

	multiBin.destroy = function() {
		// Event Listeners
		window.tools.notify('Destroying multiBin.',0);
		window.removeEventListener('changeStageStart', stageChangeHandler, false);
		$('.node-bin-static').off('click', nodeBinClickHandler);
		$('.node-bucket-item').off('click', nodeClickHandler);
		$('.content').off('click', backgroundClickHandler);
		$('.followup-submit').off('click', followupHandler);
		$('.followup-cancel').off('click', followupCancelHandler);
		$('.followup').remove();

	};

	multiBin.init = function(options) {
		window.tools.extend(multiBin.options, options);

		multiBin.options.targetEl.append('<div class="node-question-container"></div>');

		// Add header and subheader
		$('.node-question-container').append('<h1>'+multiBin.options.heading+'</h1>');

		// Add node bucket
		$('.node-question-container').append('<div class="node-bucket"></div>');

		// Create the followup dialog, if it exists
		if(typeof multiBin.options.followup !== 'undefined') {
			$('body').append('<div class="followup overlay"><form class="followup-form"></form></div>');

			if(typeof multiBin.options.followup.linked !== 'undefined' && multiBin.options.followup.linked === true) {
				var first = true;

				$.each(multiBin.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');

					if (first) {
						$('#'+value.variable).change(function() {
							if ($('#'+multiBin.options.followup.questions[(index+1)].variable).val() > $('#'+value.variable).val()) {
								$('#'+multiBin.options.followup.questions[(index+1)].variable).val($('#'+value.variable).val());
							}
							$('#'+multiBin.options.followup.questions[(index+1)].variable).attr('max', $('#'+value.variable).val());

						});
					}


					first = !first;
				});
			} else {
				$.each(multiBin.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');
				});
			}

			$('.followup').children('form').append('<div class="row form-group"><button type="submit" class="btn btn-primary btn-block followup-submit">Continue</button></div>');

			// Add cancel button if required
			if (typeof multiBin.options.followup.cancel !== 'undefined') {
				$('.overlay').children().last('.form-group').append('<div class="row form-group"><button class="btn btn-warning btn-block followup-cancel">'+multiBin.options.followup.cancel+'</button></div>');
			}

		}

		// bin container
        multiBin.options.targetEl.append('<div class="node-bin-container"></div>');


		var containerWidth = $('.node-bin-container').outerWidth();
		var containerHeight = $('.node-bin-container').outerHeight();
		var number = multiBin.options.variable.values.length;
		var rowThresh = number > 4 ? Math.floor(number*0.66) : 4;
		var itemSize = 0;
		var rows = Math.ceil(number/rowThresh);

		if (containerWidth >= containerHeight) {
			itemSize = number >= rowThresh ? containerWidth/rowThresh : containerWidth/number;

			while(itemSize > (containerHeight/rows)) {
				itemSize = itemSize*0.99;
			}

		} else {
			itemSize = number >= rowThresh ? containerHeight/rowThresh : containerHeight/number;

			while(itemSize > containerWidth) {
				itemSize = itemSize*0.99;
			}
		}

		// get all edges
		var edges = window.network.getEdges(multiBin.options.criteria, multiBin.options.filter);
		// var newLine = false;
		// One of these for each bin. One bin for each variable value.
		$.each(multiBin.options.variable.values, function(index, value){

			// if (index+1>number && newLine === false) {
			// 	multiBin.options.targetEl.append('<br>');
			// 	newLine = true;
			// }
			var newBin = $('<div class="node-bin node-bin-static c'+index+'" data-index="'+index+'"><h1>'+value+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
			newBin.data('index', index);
			$('.node-bin-container').append(newBin);
			$('.c'+index).droppable({ accept: '.draggable',
			drop: function(event, ui) {
				$(this).removeClass('yellow');
				var dropped = ui.draggable;
				var droppedOn = $(this);
                $(dropped).css({'top':0, 'left' :0});
				// Check if the node has been dropped into a bin that triggers the followup
				if(typeof multiBin.options.followup !== 'undefined' && multiBin.options.followup.trigger.indexOf(multiBin.options.variable.values[index]) >=0 ) {
					$('.followup').show();
					$('.black-overlay').show();
					$('#'+multiBin.options.followup.questions[0].variable).focus();
					followup = $(dropped).data('node-id');
				} else if (typeof multiBin.options.followup !== 'undefined') {
					// Here we need to remove any previously set value for the followup variable, if it exists.
					var nodeid = $(dropped).data('node-id');

					// Next, get the edge we will be storing on
					var criteria = {
						to:nodeid
					};

					window.tools.extend(criteria, multiBin.options.criteria);
					var edge = window.network.getEdges(criteria)[0];

					// Create an empty object for storing the new properties in
					var followupProperties = {};

					// Assign a new property according to the variable name(s)
					$.each(multiBin.options.followup.questions, function(index) {
						followupProperties[multiBin.options.followup.questions[index].variable] = undefined;
					});

					// Update the edge
					window.tools.extend(edge, followupProperties);
					window.network.updateEdge(edge.id, edge);

					// Clean up
					$.each(multiBin.options.followup.questions, function(index) {
						$('#'+multiBin.options.followup.questions[index].variable).val('');
					});

				}

				$(dropped).appendTo(droppedOn.children('.active-node-list'));
				var properties = {};
				properties[multiBin.options.variable.label] = multiBin.options.variable.values[index];
				// Add the attribute
				var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:multiBin.options.edgeType})[0].id;
				window.network.updateEdge(edgeID,properties);

				var noun = 'people';
				if ($('.c'+index+' .active-node-list').children().length === 1) {
					noun = 'person';
				}
				$('.c'+index+' p').html($('.c'+index+' .active-node-list').children().length+' '+noun+'.');

				var el = $('.c'+index);
				// var origBg = el.css('background-color');
				setTimeout(function() {
					el.addClass('dropped');
				},0);

				setTimeout(function(){
					el.removeClass('dropped');
					el.removeClass('yellow');
				}, 1000);
			},
			over: function() {
				$(this).addClass('yellow');

			},
			out: function() {
				$(this).removeClass('yellow');
			}
		});

	});

	// $('.node-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
	$('.node-bin').css({width:itemSize,height:itemSize});
	// $('.node-bin').css({width:itemSize,height:itemSize});

	// $('.node-bin h1').css({marginTop: itemSize/3});

	$.each($('.node-bin'), function(index, value) {
		var oldPos = $(value).offset();
		$(value).data('oldPos', oldPos);
		$(value).css(oldPos);

	});

	$('.node-bin').css({position:'absolute'});

	// Add edges to bucket or to bins if they already have variable value.
	$.each(edges, function(index,value) {

		// We need the dyad edge so we know the nname for other types of edges
		var dyadEdge = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, type:'Dyad', to:value.to})[0];
		if (value[multiBin.options.variable.label] !== undefined && value[multiBin.options.variable.label] !== '') {
			index = multiBin.options.variable.values.indexOf(value[multiBin.options.variable.label]);
			$('.c'+index).children('.active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.nname_t0+'</div>');
			var noun = 'people';
			if ($('.c'+index).children('.active-node-list').children().length === 1) {
				noun = 'person';
			}
			if ($('.c'+index).children('.active-node-list').children().length === 0) {
				$('.c'+index).children('p').html('(Empty)');
			} else {
				$('.c'+index).children('p').html($('.c'+index).children('.active-node-list').children().length+' '+noun+'.');
			}
		} else {
			$('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.nname_t0+'</div>');
		}

	});
	$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false , start: function(){
		if (taskComprehended === false) {
			var eventProperties = {
				stage: window.netCanvas.Modules.session.currentStage(),
				timestamp: new Date()
			};
			log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
			window.dispatchEvent(log);
			taskComprehended = true;
		}
	}});

	// Event Listeners
	window.addEventListener('changeStageStart', stageChangeHandler, false);
	$('.node-bin-static').on('click', nodeBinClickHandler);
	$('.content').on('click', backgroundClickHandler);
	$('.followup-form').on('submit', followupHandler);
	$('.followup-cancel').on('click', followupCancelHandler);

};
return multiBin;
};
;/* global $, window */
/* exported MultiBinApp */
module.exports = function MultiBinApp() {
	'use strict';
	//global vars
	var log;
	var taskComprehended = false;
	var animating = false;
	var open = false;
	var multiBinApp = {}, followup;
	multiBinApp.options = {
		targetEl: $('.container'),
		edgeType: 'Venue',
		variable: {
			label:'multibin_variable',
			values: [
				'Variable 1',
			]
		},
		criteria: {},
		filter: undefined,
		heading: 'Default Heading',
		subheading: 'Default Subheading.'
	};

	var stageChangeHandler = function() {
		multiBinApp.destroy();
	};

	var followupHandler = function(e) {
		e.preventDefault();
		// Handle the followup data

		// First, retrieve the relevant values

		var nodeid = followup;

		// Next, get the edge we will be storing on
		var criteria = {
			to:nodeid
		};

		window.tools.extend(criteria, multiBinApp.options.criteria);
		var edge = window.network.getEdges(criteria)[0];

		// Create an empty object for storing the new properties in
		var followupProperties = {};

		// Assign a new property according to the variable name(s)
		$.each(multiBinApp.options.followup.questions, function(index) {
			var followupVal = $('#'+multiBinApp.options.followup.questions[index].variable).val();
			followupProperties[multiBinApp.options.followup.questions[index].variable] = followupVal;
		});

		// Update the edge
		window.tools.extend(edge, followupProperties);
		window.network.updateEdge(edge.id, edge);

		// Clean up
		$.each(multiBinApp.options.followup.questions, function(index) {
			$('#'+multiBinApp.options.followup.questions[index].variable).val('');
		});

		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var followupCancelHandler = function() {

		// Clean up
		$('#'+multiBinApp.options.followup.variable).val('');
		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var backgroundClickHandler = function(e) {
		e.stopPropagation();
		if(open === true) {
			if ($('.node-bin-active').length > 0) {
					animating = true;
					setTimeout(function() {
						$('.node-bin-container').children().css({opacity:1});
						$('.node-question-container').fadeIn();
					}, 300);

					var current = $('.node-bin-active');
					$(current).removeClass('node-bin-active');
					$(current).addClass('node-bin-static');
					$(current).children('h1, p').show();
					$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false, start: function(){
						if (taskComprehended === false) {
							var eventProperties = {
								stage: window.netCanvas.Modules.session.currentStage(),
								timestamp: new Date()
							};
							log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
							window.dispatchEvent(log);
							taskComprehended = true;
						}
					}});

					setTimeout(function() {
						open = false;
						animating = false;
					}, 500);

			}
		} else {
		}


	};


	var nodeClickHandler = function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		var el = $(this);
		var id = $(this).parent().parent().data('index');

		// has the node been clicked while in the bucket or while in a bin?
		if ($(this).parent().hasClass('active-node-list')) {
			// it has been clicked while in a bin.
			var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:el.data('node-id'), type:multiBinApp.options.edgeType})[0].id;
			var properties = {};
			// make the values null when a node has been taken out of a bin
			properties[multiBinApp.options.variable.label] = '';

			// dont forget followups
			if(typeof multiBinApp.options.followup !== 'undefined') {
				$.each(multiBinApp.options.followup.questions, function(index, value) {
					properties[value.variable] = undefined;
				});
			}
			window.network.updateEdge(edgeID,properties);

			$(this).css({'top':0, 'left' :0});
			$(this).appendTo('.node-bucket');
			$(this).css('display', '');
			var noun = 'people';
			if ($('.c'+id).children('.active-node-list').children().length === 1) {
				noun = 'person';
			}
			if ($('.c'+id).children('.active-node-list').children().length === 0) {
				$('.c'+id).children('p').html('(Empty)');
			} else {
				$('.c'+id).children('p').html($('.c'+id).children('.active-node-list').children().length+' '+noun+'.');
			}


		}

	};

	var nodeBinClickHandler = function() {
		if (open === false) {

				if(!$(this).hasClass('node-bin-active')) {
					animating = true;
					open = true;
					$('.node-bin-container').children().not(this).css({opacity:0});
					$('.node-question-container').hide();
					var position = $(this).offset();
					var nodeBinDetails = $(this);
					nodeBinDetails.children('.active-node-list').children('.node-bucket-item').removeClass('shown');
					setTimeout(function() {
						nodeBinDetails.offset(position);
						nodeBinDetails.addClass('node-bin-active');

						nodeBinDetails.removeClass('node-bin-static');
						nodeBinDetails.children('h1, p').hide();

						// $('.content').append(nodeBinDetails);

						nodeBinDetails.addClass('node-bin-active');
						setTimeout(function(){
							var timer = 0;
							$.each(nodeBinDetails.children('.active-node-list').children(), function(index,value) {
								timer = timer + (index*10);
								setTimeout(function(){
									$(value).on('click', nodeClickHandler);
									$(value).addClass('shown');
								},timer);
							});
						},300);
						open = true;
					}, 500);

					setTimeout(function() {
						animating = false;
					}, 500);

				}
		} else {
		}

	};

	multiBinApp.destroy = function() {
		// Event Listeners
		window.tools.notify('Destroying multiBinApp.',0);
		window.removeEventListener('changeStageStart', stageChangeHandler, false);
		$('.node-bin-static').off('click', nodeBinClickHandler);
		$('.node-bucket-item').off('click', nodeClickHandler);
		$('.content').off('click', backgroundClickHandler);
		$('.followup-submit').off('click', followupHandler);
		$('.followup-cancel').off('click', followupCancelHandler);
		$('.followup').remove();

	};

	multiBinApp.init = function(options) {
		window.tools.extend(multiBinApp.options, options);

		multiBinApp.options.targetEl.append('<div class="node-question-container"></div>');

		// Add header and subheader
		$('.node-question-container').append('<h1>'+multiBinApp.options.heading+'</h1>');

		// Add node bucket
		$('.node-question-container').append('<div class="node-bucket"></div>');

		// Create the followup dialog, if it exists
		if(typeof multiBinApp.options.followup !== 'undefined') {
			$('body').append('<div class="followup overlay"><form class="followup-form"></form></div>');

			if(typeof multiBinApp.options.followup.linked !== 'undefined' && multiBinApp.options.followup.linked === true) {
				var first = true;

				$.each(multiBinApp.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');

					first = !first;
				});
			} else {
				$.each(multiBinApp.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');
				});
			}

			$('.followup').children('form').append('<div class="row form-group"><button type="submit" class="btn btn-primary btn-block followup-submit">Continue</button></div>');

			// Add cancel button if required
			if (typeof multiBinApp.options.followup.cancel !== 'undefined') {
				$('.overlay').children().last('.form-group').append('<div class="row form-group"><button class="btn btn-warning btn-block followup-cancel">'+multiBinApp.options.followup.cancel+'</button></div>');
			}

		}

		// bin container
        multiBinApp.options.targetEl.append('<div class="node-bin-container"></div>');


		var containerWidth = $('.node-bin-container').outerWidth();
		var containerHeight = $('.node-bin-container').outerHeight();
		var number = multiBinApp.options.variable.values.length;
		var rowThresh = number > 4 ? Math.floor(number*0.66) : 4;
		var itemSize = 0;
		var rows = Math.ceil(number/rowThresh);

		if (containerWidth >= containerHeight) {
			itemSize = number >= rowThresh ? containerWidth/rowThresh : containerWidth/number;

			while(itemSize > (containerHeight/rows)) {
				itemSize = itemSize*0.99;
			}

		} else {
			itemSize = number >= rowThresh ? containerHeight/rowThresh : containerHeight/number;

			while(itemSize > containerWidth) {
				itemSize = itemSize*0.99;
			}
		}

		// get all edges
		var edges = window.network.getEdges(multiBinApp.options.criteria, multiBinApp.options.filter);
		// var newLine = false;
		// One of these for each bin. One bin for each variable value.
		$.each(multiBinApp.options.variable.values, function(index, value){

			// if (index+1>number && newLine === false) {
			// 	multiBinApp.options.targetEl.append('<br>');
			// 	newLine = true;
			// }
			var newBin = $('<div class="node-bin node-bin-static c'+index+'" data-index="'+index+'"><h1>'+value+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
			newBin.data('index', index);
			$('.node-bin-container').append(newBin);
			$('.c'+index).droppable({ accept: '.draggable',
			drop: function(event, ui) {
				$(this).removeClass('yellow');
				var dropped = ui.draggable;
				var droppedOn = $(this);
                $(dropped).css({'top':0, 'left' :0});
				// Check if the node has been dropped into a bin that triggers the followup
				if(typeof multiBinApp.options.followup !== 'undefined' && multiBinApp.options.followup.trigger.indexOf(multiBinApp.options.variable.values[index]) >=0 ) {
					$('.followup').show();
					$('.black-overlay').show();
					$('#'+multiBinApp.options.followup.questions[0].variable).focus();
					followup = $(dropped).data('node-id');
				} else if (typeof multiBinApp.options.followup !== 'undefined') {
					// Here we need to remove any previously set value for the followup variable, if it exists.
					var nodeid = $(dropped).data('node-id');

					// Next, get the edge we will be storing on
					var criteria = {
						to:nodeid
					};

					window.tools.extend(criteria, multiBinApp.options.criteria);
					var edge = window.network.getEdges(criteria)[0];

					// Create an empty object for storing the new properties in
					var followupProperties = {};

					// Assign a new property according to the variable name(s)
					$.each(multiBinApp.options.followup.questions, function(index) {
						followupProperties[multiBinApp.options.followup.questions[index].variable] = undefined;
					});

					// Update the edge
					window.tools.extend(edge, followupProperties);
					window.network.updateEdge(edge.id, edge);

					// Clean up
					$.each(multiBinApp.options.followup.questions, function(index) {
						$('#'+multiBinApp.options.followup.questions[index].variable).val('');
					});

				}

				$(dropped).appendTo(droppedOn.children('.active-node-list'));
				var properties = {};
				properties[multiBinApp.options.variable.label] = multiBinApp.options.variable.values[index];
				// Add the attribute
				var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:multiBinApp.options.edgeType})[0].id;
				window.network.updateEdge(edgeID,properties);

				var noun = 'people';
				if ($('.c'+index+' .active-node-list').children().length === 1) {
					noun = 'person';
				}
				$('.c'+index+' p').html($('.c'+index+' .active-node-list').children().length+' '+noun+'.');

				var el = $('.c'+index);
				// var origBg = el.css('background-color');
				setTimeout(function() {
					el.addClass('dropped');
				},0);

				setTimeout(function(){
					el.removeClass('dropped');
					el.removeClass('yellow');
				}, 1000);
			},
			over: function() {
				$(this).addClass('yellow');

			},
			out: function() {
				$(this).removeClass('yellow');
			}
		});

	});

	// $('.node-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
	$('.node-bin').css({width:itemSize,height:itemSize});
	// $('.node-bin').css({width:itemSize,height:itemSize});

	// $('.node-bin h1').css({marginTop: itemSize/3});

	$.each($('.node-bin'), function(index, value) {
		var oldPos = $(value).offset();
		$(value).data('oldPos', oldPos);
		$(value).css(oldPos);

	});

	$('.node-bin').css({position:'absolute'});

	// Add edges to bucket or to bins if they already have variable value.
	$.each(edges, function(index,value) {

		// We need the dyad edge so we know the nname for other types of edges
		var dyadEdge = window.network.getEdges({from:window.network.getEgo().id, type:multiBinApp.options.edgeType, to:value.to})[0];
		if (value[multiBinApp.options.variable.label] !== undefined && value[multiBinApp.options.variable.label] !== '') {
			index = multiBinApp.options.variable.values.indexOf(value[multiBinApp.options.variable.label]);
			$('.c'+index).children('.active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.app_name_t0+'</div>');
			var noun = 'people';
			if ($('.c'+index).children('.active-node-list').children().length === 1) {
				noun = 'person';
			}
			if ($('.c'+index).children('.active-node-list').children().length === 0) {
				$('.c'+index).children('p').html('(Empty)');
			} else {
				$('.c'+index).children('p').html($('.c'+index).children('.active-node-list').children().length+' '+noun+'.');
			}
		} else {
			$('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.app_name_t0+'</div>');
		}

	});
	$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false , start: function(){
		if (taskComprehended === false) {
			var eventProperties = {
				stage: window.netCanvas.Modules.session.currentStage(),
				timestamp: new Date()
			};
			log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
			window.dispatchEvent(log);
			taskComprehended = true;
		}
	}});

	// Event Listeners
	window.addEventListener('changeStageStart', stageChangeHandler, false);
	$('.node-bin-static').on('click', nodeBinClickHandler);
	$('.content').on('click', backgroundClickHandler);
	$('.followup-form').on('submit', followupHandler);
	$('.followup-cancel').on('click', followupCancelHandler);

};
return multiBinApp;
};
;/* global $, window */
/* exported MultiBinService */
module.exports = function MultiBinService() {
	'use strict';
	//global vars
	var log;
	var taskComprehended = false;
	var animating = false;
	var open = false;
	var multiBinService = {}, followup;
	multiBinService.options = {
		targetEl: $('.container'),
		edgeType: 'Venue',
		variable: {
			label:'multibin_variable',
			values: [
				'Variable 1',
			]
		},
		criteria: {},
		filter: undefined,
		heading: 'Default Heading',
		subheading: 'Default Subheading.'
	};

	var stageChangeHandler = function() {
		multiBinService.destroy();
	};

	var followupHandler = function(e) {
		e.preventDefault();
		// Handle the followup data

		// First, retrieve the relevant values

		var nodeid = followup;

		// Next, get the edge we will be storing on
		var criteria = {
			to:nodeid
		};

		window.tools.extend(criteria, multiBinService.options.criteria);
		var edge = window.network.getEdges(criteria)[0];

		// Create an empty object for storing the new properties in
		var followupProperties = {};

		// Assign a new property according to the variable name(s)
		$.each(multiBinService.options.followup.questions, function(index) {
			var followupVal = $('#'+multiBinService.options.followup.questions[index].variable).val();
			followupProperties[multiBinService.options.followup.questions[index].variable] = followupVal;
		});

		// Update the edge
		window.tools.extend(edge, followupProperties);
		window.network.updateEdge(edge.id, edge);

		// Clean up
		$.each(multiBinService.options.followup.questions, function(index) {
			$('#'+multiBinService.options.followup.questions[index].variable).val('');
		});

		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var followupCancelHandler = function() {

		// Clean up
		$('#'+multiBinService.options.followup.variable).val('');
		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var backgroundClickHandler = function(e) {
		e.stopPropagation();
		if(open === true) {
			if ($('.node-bin-active').length > 0) {
					animating = true;
					setTimeout(function() {
						$('.node-bin-container').children().css({opacity:1});
						$('.node-question-container').fadeIn();
					}, 300);

					var current = $('.node-bin-active');
					$(current).removeClass('node-bin-active');
					$(current).addClass('node-bin-static');
					$(current).children('h1, p').show();
					$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false, start: function(){
						if (taskComprehended === false) {
							var eventProperties = {
								stage: window.netCanvas.Modules.session.currentStage(),
								timestamp: new Date()
							};
							log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
							window.dispatchEvent(log);
							taskComprehended = true;
						}
					}});

					setTimeout(function() {
						open = false;
						animating = false;
					}, 500);

			}
		} else {
		}


	};


	var nodeClickHandler = function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		var el = $(this);
		var id = $(this).parent().parent().data('index');

		// has the node been clicked while in the bucket or while in a bin?
		if ($(this).parent().hasClass('active-node-list')) {
			// it has been clicked while in a bin.
			var edgeID = window.network.getEdges({from:window.network.getEgo().id,to:el.data('node-id'), type:multiBinService.options.edgeType})[0].id;
			var properties = {};
			// make the values null when a node has been taken out of a bin
			properties[multiBinService.options.variable.label] = '';

			// dont forget followups
			if(typeof multiBinService.options.followup !== 'undefined') {
				$.each(multiBinService.options.followup.questions, function(index, value) {
					properties[value.variable] = undefined;
				});
			}
			window.network.updateEdge(edgeID,properties);

			$(this).css({'top':0, 'left' :0});
			$(this).appendTo('.node-bucket');
			$(this).css('display', '');
			var noun = 'providers';
			if ($('.c'+id).children('.active-node-list').children().length === 1) {
				noun = 'provider';
			}
			if ($('.c'+id).children('.active-node-list').children().length === 0) {
				$('.c'+id).children('p').html('(Empty)');
			} else {
				$('.c'+id).children('p').html($('.c'+id).children('.active-node-list').children().length+' '+noun+'.');
			}


		}

	};

	var nodeBinClickHandler = function() {
		if (open === false) {

				if(!$(this).hasClass('node-bin-active')) {
					animating = true;
					open = true;
					$('.node-bin-container').children().not(this).css({opacity:0});
					$('.node-question-container').hide();
					var position = $(this).offset();
					var nodeBinDetails = $(this);
					nodeBinDetails.children('.active-node-list').children('.node-bucket-item').removeClass('shown');
					setTimeout(function() {
						nodeBinDetails.offset(position);
						nodeBinDetails.addClass('node-bin-active');

						nodeBinDetails.removeClass('node-bin-static');
						nodeBinDetails.children('h1, p').hide();

						// $('.content').append(nodeBinDetails);

						nodeBinDetails.addClass('node-bin-active');
						setTimeout(function(){
							var timer = 0;
							$.each(nodeBinDetails.children('.active-node-list').children(), function(index,value) {
								timer = timer + (index*10);
								setTimeout(function(){
									$(value).on('click', nodeClickHandler);
									$(value).addClass('shown');
								},timer);
							});
						},300);
						open = true;
					}, 500);

					setTimeout(function() {
						animating = false;
					}, 500);

				}
		} else {
		}

	};

	multiBinService.destroy = function() {
		// Event Listeners
		window.tools.notify('Destroying multiBinService.',0);
		window.removeEventListener('changeStageStart', stageChangeHandler, false);
		$('.node-bin-static').off('click', nodeBinClickHandler);
		$('.node-bucket-item').off('click', nodeClickHandler);
		$('.content').off('click', backgroundClickHandler);
		$('.followup-submit').off('click', followupHandler);
		$('.followup-cancel').off('click', followupCancelHandler);
		$('.followup').remove();

	};

	multiBinService.init = function(options) {
		window.tools.extend(multiBinService.options, options);

		multiBinService.options.targetEl.append('<div class="node-question-container"></div>');

		// Add header and subheader
		$('.node-question-container').append('<h1>'+multiBinService.options.heading+'</h1>');

		// Add node bucket
		$('.node-question-container').append('<div class="node-bucket"></div>');

		// Create the followup dialog, if it exists
		if(typeof multiBinService.options.followup !== 'undefined') {
			$('body').append('<div class="followup overlay"><form class="followup-form"></form></div>');

			if(typeof multiBinService.options.followup.linked !== 'undefined' && multiBinService.options.followup.linked === true) {

				$.each(multiBinService.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');
				});
			} else {
				$.each(multiBinService.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');
				});
			}

			$('.followup').children('form').append('<div class="row form-group"><button type="submit" class="btn btn-primary btn-block followup-submit">Continue</button></div>');

			// Add cancel button if required
			if (typeof multiBinService.options.followup.cancel !== 'undefined') {
				$('.overlay').children().last('.form-group').append('<div class="row form-group"><button class="btn btn-warning btn-block followup-cancel">'+multiBinService.options.followup.cancel+'</button></div>');
			}

		}

		// bin container
        multiBinService.options.targetEl.append('<div class="node-bin-container"></div>');


		var containerWidth = $('.node-bin-container').outerWidth();
		var containerHeight = $('.node-bin-container').outerHeight();
		var number = multiBinService.options.variable.values.length;
		var rowThresh = number > 4 ? Math.floor(number*0.66) : 4;
		var itemSize = 0;
		var rows = Math.ceil(number/rowThresh);

		if (containerWidth >= containerHeight) {
			itemSize = number >= rowThresh ? containerWidth/rowThresh : containerWidth/number;

			while(itemSize > (containerHeight/rows)) {
				itemSize = itemSize*0.99;
			}

		} else {
			itemSize = number >= rowThresh ? containerHeight/rowThresh : containerHeight/number;

			while(itemSize > containerWidth) {
				itemSize = itemSize*0.99;
			}
		}

		// get all edges
		var edges = window.network.getEdges(multiBinService.options.criteria, multiBinService.options.filter);
		// var newLine = false;
		// One of these for each bin. One bin for each variable value.
		$.each(multiBinService.options.variable.values, function(index, value){

			// if (index+1>number && newLine === false) {
			// 	multiBinService.options.targetEl.append('<br>');
			// 	newLine = true;
			// }
			var newBin = $('<div class="node-bin node-bin-static c'+index+'" data-index="'+index+'"><h1>'+value+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
			newBin.data('index', index);
			$('.node-bin-container').append(newBin);
			$('.c'+index).droppable({ accept: '.draggable',
			drop: function(event, ui) {
				$(this).removeClass('yellow');
				var dropped = ui.draggable;
				var droppedOn = $(this);
                $(dropped).css({'top':0, 'left' :0});
				// Check if the node has been dropped into a bin that triggers the followup
				if(typeof multiBinService.options.followup !== 'undefined' && multiBinService.options.followup.trigger.indexOf(multiBinService.options.variable.values[index]) >=0 ) {
					$('.followup').show();
					$('.black-overlay').show();
					$('#'+multiBinService.options.followup.questions[0].variable).focus();
					followup = $(dropped).data('node-id');
				} else if (typeof multiBinService.options.followup !== 'undefined') {
					// Here we need to remove any previously set value for the followup variable, if it exists.
					var nodeid = $(dropped).data('node-id');

					// Next, get the edge we will be storing on
					var criteria = {
						to:nodeid
					};

					window.tools.extend(criteria, multiBinService.options.criteria);
					var edge = window.network.getEdges(criteria)[0];

					// Create an empty object for storing the new properties in
					var followupProperties = {};

					// Assign a new property according to the variable name(s)
					$.each(multiBinService.options.followup.questions, function(index) {
						followupProperties[multiBinService.options.followup.questions[index].variable] = undefined;
					});

					// Update the edge
					window.tools.extend(edge, followupProperties);
					window.network.updateEdge(edge.id, edge);

					// Clean up
					$.each(multiBinService.options.followup.questions, function(index) {
						$('#'+multiBinService.options.followup.questions[index].variable).val('');
					});

				}

				$(dropped).appendTo(droppedOn.children('.active-node-list'));
				var properties = {};
				properties[multiBinService.options.variable.label] = multiBinService.options.variable.values[index];
				// Add the attribute
				var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:multiBinService.options.edgeType})[0].id;
				window.network.updateEdge(edgeID,properties);

				var noun = 'providers';
				if ($('.c'+index+' .active-node-list').children().length === 1) {
					noun = 'provider';
				}
				$('.c'+index+' p').html($('.c'+index+' .active-node-list').children().length+' '+noun+'.');

				var el = $('.c'+index);
				// var origBg = el.css('background-color');
				setTimeout(function() {
					el.addClass('dropped');
				},0);

				setTimeout(function(){
					el.removeClass('dropped');
					el.removeClass('yellow');
				}, 1000);
			},
			over: function() {
				$(this).addClass('yellow');

			},
			out: function() {
				$(this).removeClass('yellow');
			}
		});

	});

	// $('.node-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
	$('.node-bin').css({width:itemSize,height:itemSize});
	// $('.node-bin').css({width:itemSize,height:itemSize});

	// $('.node-bin h1').css({marginTop: itemSize/3});

	$.each($('.node-bin'), function(index, value) {
		var oldPos = $(value).offset();
		$(value).data('oldPos', oldPos);
		$(value).css(oldPos);

	});

	$('.node-bin').css({position:'absolute'});

	// Add edges to bucket or to bins if they already have variable value.
	$.each(edges, function(index,value) {

		// We need the dyad edge so we know the nname for other types of edges
		// var dyadEdge = window.network.getEdges({from:window.network.getEgo().id, type:multiBinService.options.edgeType, to:value.to})[0];
		var node = window.network.getNode(value.to);
		if (value[multiBinService.options.variable.label] !== undefined && value[multiBinService.options.variable.label] !== '') {
			index = multiBinService.options.variable.values.indexOf(value[multiBinService.options.variable.label]);
			$('.c'+index).children('.active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+node.name+'</div>');
			var noun = 'providers';
			if ($('.c'+index).children('.active-node-list').children().length === 1) {
				noun = 'provider';
			}
			if ($('.c'+index).children('.active-node-list').children().length === 0) {
				$('.c'+index).children('p').html('(Empty)');
			} else {
				$('.c'+index).children('p').html($('.c'+index).children('.active-node-list').children().length+' '+noun+'.');
			}
		} else {
			$('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+node.name+'</div>');
		}

	});
	$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false , start: function(){
		if (taskComprehended === false) {
			var eventProperties = {
				stage: window.netCanvas.Modules.session.currentStage(),
				timestamp: new Date()
			};
			log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
			window.dispatchEvent(log);
			taskComprehended = true;
		}
	}});

	// Event Listeners
	window.addEventListener('changeStageStart', stageChangeHandler, false);
	$('.node-bin-static').on('click', nodeBinClickHandler);
	$('.content').on('click', backgroundClickHandler);
	$('.followup-form').on('submit', followupHandler);
	$('.followup-cancel').on('click', followupCancelHandler);

};
return multiBinService;
};
;/* global $, window */
/* exported MultiBinVenue */
module.exports = function MultiBinVenue() {
	'use strict';
	//global vars
	var log;
	var taskComprehended = false;
	var animating = false;
	var open = false;
	var multiBinVenue = {}, followup;
	multiBinVenue.options = {
		targetEl: $('.container'),
		edgeType: 'Venue',
		variable: {
			label:'multibin_variable',
			values: [
				'Variable 1',
			]
		},
		criteria: {},
		filter: undefined,
		heading: 'Default Heading',
		subheading: 'Default Subheading.'
	};

	var stageChangeHandler = function() {
		multiBinVenue.destroy();
	};

	var followupHandler = function(e) {
		e.preventDefault();
		// Handle the followup data

		// First, retrieve the relevant values

		var nodeid = followup;

		// Next, get the edge we will be storing on
		var criteria = {
			to:nodeid
		};

		window.tools.extend(criteria, multiBinVenue.options.criteria);
		var edge = window.network.getEdges(criteria)[0];

		// Create an empty object for storing the new properties in
		var followupProperties = {};

		// Assign a new property according to the variable name(s)
		$.each(multiBinVenue.options.followup.questions, function(index) {
			var followupVal = $('#'+multiBinVenue.options.followup.questions[index].variable).val();
			followupProperties[multiBinVenue.options.followup.questions[index].variable] = followupVal;
		});

		// Update the edge
		window.tools.extend(edge, followupProperties);
		window.network.updateEdge(edge.id, edge);

		// Clean up
		$.each(multiBinVenue.options.followup.questions, function(index) {
			$('#'+multiBinVenue.options.followup.questions[index].variable).val('');
		});

		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var followupCancelHandler = function() {

		// Clean up
		$('#'+multiBinVenue.options.followup.variable).val('');
		$('.followup').hide();
		$('.black-overlay').hide();
	};

	var backgroundClickHandler = function(e) {
		e.stopPropagation();
		if(open === true) {
			if ($('.node-bin-active').length > 0) {
					animating = true;
					setTimeout(function() {
						$('.node-bin-container').children().css({opacity:1});
						$('.node-question-container').fadeIn();
					}, 300);

					var current = $('.node-bin-active');
					$(current).removeClass('node-bin-active');
					$(current).addClass('node-bin-static');
					$(current).children('h1, p').show();
					$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false, start: function(){
						if (taskComprehended === false) {
							var eventProperties = {
								stage: window.netCanvas.Modules.session.currentStage(),
								timestamp: new Date()
							};
							log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
							window.dispatchEvent(log);
							taskComprehended = true;
						}
					}});

					setTimeout(function() {
						open = false;
						animating = false;
					}, 500);

			}
		} else {
		}


	};


	var nodeClickHandler = function(e) {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		var el = $(this);
		var id = $(this).parent().parent().data('index');

		// has the node been clicked while in the bucket or while in a bin?
		if ($(this).parent().hasClass('active-node-list')) {
			// it has been clicked while in a bin.
			var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:el.data('node-id'), type:multiBinVenue.options.edgeType})[0].id;
			var properties = {};
			// make the values null when a node has been taken out of a bin
			properties[multiBinVenue.options.variable.label] = '';

			// dont forget followups
			if(typeof multiBinVenue.options.followup !== 'undefined') {
				$.each(multiBinVenue.options.followup.questions, function(index, value) {
					properties[value.variable] = undefined;
				});
			}
			window.network.updateEdge(edgeID,properties);

			$(this).css({'top':0, 'left' :0});
			$(this).appendTo('.node-bucket');
			$(this).css('display', '');
			var noun = 'places';
			if ($('.c'+id).children('.active-node-list').children().length === 1) {
				noun = 'place';
			}
			if ($('.c'+id).children('.active-node-list').children().length === 0) {
				$('.c'+id).children('p').html('(Empty)');
			} else {
				$('.c'+id).children('p').html($('.c'+id).children('.active-node-list').children().length+' '+noun+'.');
			}


		}

	};

	var nodeBinClickHandler = function() {
		if (open === false) {

				if(!$(this).hasClass('node-bin-active')) {
					animating = true;
					open = true;
					$('.node-bin-container').children().not(this).css({opacity:0});
					$('.node-question-container').hide();
					var position = $(this).offset();
					var nodeBinDetails = $(this);
					nodeBinDetails.children('.active-node-list').children('.node-bucket-item').removeClass('shown');
					setTimeout(function() {
						nodeBinDetails.offset(position);
						nodeBinDetails.addClass('node-bin-active');

						nodeBinDetails.removeClass('node-bin-static');
						nodeBinDetails.children('h1, p').hide();

						// $('.content').append(nodeBinDetails);

						nodeBinDetails.addClass('node-bin-active');
						setTimeout(function(){
							var timer = 0;
							$.each(nodeBinDetails.children('.active-node-list').children(), function(index,value) {
								timer = timer + (index*10);
								setTimeout(function(){
									$(value).on('click', nodeClickHandler);
									$(value).addClass('shown');
								},timer);
							});
						},300);
						open = true;
					}, 500);

					setTimeout(function() {
						animating = false;
					}, 500);

				}
		} else {
		}

	};

	multiBinVenue.destroy = function() {
		// Event Listeners
		window.tools.notify('Destroying multiBinVenue.',0);
		window.removeEventListener('changeStageStart', stageChangeHandler, false);
		$('.node-bin-static').off('click', nodeBinClickHandler);
		$('.node-bucket-item').off('click', nodeClickHandler);
		$('.content').off('click', backgroundClickHandler);
		$('.followup-submit').off('click', followupHandler);
		$('.followup-cancel').off('click', followupCancelHandler);
		$('.followup').remove();

	};

	multiBinVenue.init = function(options) {
		window.tools.extend(multiBinVenue.options, options);

		multiBinVenue.options.targetEl.append('<div class="node-question-container"></div>');

		// Add header and subheader
		$('.node-question-container').append('<h1>'+multiBinVenue.options.heading+'</h1>');

		// Add node bucket
		$('.node-question-container').append('<div class="node-bucket"></div>');

		// Create the followup dialog, if it exists
		if(typeof multiBinVenue.options.followup !== 'undefined') {
			$('body').append('<div class="followup overlay"><form class="followup-form"></form></div>');

			if(typeof multiBinVenue.options.followup.linked !== 'undefined' && multiBinVenue.options.followup.linked === true) {
				var first = true;

				$.each(multiBinVenue.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');

					if (first) {
						$('#'+value.variable).change(function() {
							if ($('#'+multiBinVenue.options.followup.questions[(index+1)].variable).val() > $('#'+value.variable).val()) {
								$('#'+multiBinVenue.options.followup.questions[(index+1)].variable).val($('#'+value.variable).val());
							}
							$('#'+multiBinVenue.options.followup.questions[(index+1)].variable).attr('max', $('#'+value.variable).val());

						});
					}


					first = !first;
				});
			} else {
				$.each(multiBinVenue.options.followup.questions, function(index, value) {
					$('.followup').children('form').append('<h2>'+value.prompt+'</h2><div class="row form-group"><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="followup" required></div>');
				});
			}

			$('.followup').children('form').append('<div class="row form-group"><button type="submit" class="btn btn-primary btn-block followup-submit">Continue</button></div>');

			// Add cancel button if required
			if (typeof multiBinVenue.options.followup.cancel !== 'undefined') {
				$('.overlay').children().last('.form-group').append('<div class="row form-group"><button class="btn btn-warning btn-block followup-cancel">'+multiBinVenue.options.followup.cancel+'</button></div>');
			}

		}

		// bin container
        multiBinVenue.options.targetEl.append('<div class="node-bin-container"></div>');


		var containerWidth = $('.node-bin-container').outerWidth();
		var containerHeight = $('.node-bin-container').outerHeight();
		var number = multiBinVenue.options.variable.values.length;
		var rowThresh = number > 4 ? Math.floor(number*0.66) : 4;
		var itemSize = 0;
		var rows = Math.ceil(number/rowThresh);

		if (containerWidth >= containerHeight) {
			itemSize = number >= rowThresh ? containerWidth/rowThresh : containerWidth/number;

			while(itemSize > (containerHeight/rows)) {
				itemSize = itemSize*0.99;
			}

		} else {
			itemSize = number >= rowThresh ? containerHeight/rowThresh : containerHeight/number;

			while(itemSize > containerWidth) {
				itemSize = itemSize*0.99;
			}
		}

		// get all edges
		var edges = window.network.getEdges(multiBinVenue.options.criteria, multiBinVenue.options.filter);
		// var newLine = false;
		// One of these for each bin. One bin for each variable value.
		$.each(multiBinVenue.options.variable.values, function(index, value){

			// if (index+1>number && newLine === false) {
			// 	multiBinVenue.options.targetEl.append('<br>');
			// 	newLine = true;
			// }
			var newBin = $('<div class="node-bin node-bin-static c'+index+'" data-index="'+index+'"><h1>'+value+'</h1><p class="lead">(Empty)</p><div class="active-node-list"></div></div>');
			newBin.data('index', index);
			$('.node-bin-container').append(newBin);
			$('.c'+index).droppable({ accept: '.draggable',
			drop: function(event, ui) {
				$(this).removeClass('yellow');
				var dropped = ui.draggable;
				var droppedOn = $(this);
                $(dropped).css({'top':0, 'left' :0});
				// Check if the node has been dropped into a bin that triggers the followup
				if(typeof multiBinVenue.options.followup !== 'undefined' && multiBinVenue.options.followup.trigger.indexOf(multiBinVenue.options.variable.values[index]) >=0 ) {
					$('.followup').show();
					$('.black-overlay').show();
					$('#'+multiBinVenue.options.followup.questions[0].variable).focus();
					followup = $(dropped).data('node-id');
				} else if (typeof multiBinVenue.options.followup !== 'undefined') {
					// Here we need to remove any previously set value for the followup variable, if it exists.
					var nodeid = $(dropped).data('node-id');

					// Next, get the edge we will be storing on
					var criteria = {
						to:nodeid
					};

					window.tools.extend(criteria, multiBinVenue.options.criteria);
					var edge = window.network.getEdges(criteria)[0];

					// Create an empty object for storing the new properties in
					var followupProperties = {};

					// Assign a new property according to the variable name(s)
					$.each(multiBinVenue.options.followup.questions, function(index) {
						followupProperties[multiBinVenue.options.followup.questions[index].variable] = undefined;
					});

					// Update the edge
					window.tools.extend(edge, followupProperties);
					window.network.updateEdge(edge.id, edge);

					// Clean up
					$.each(multiBinVenue.options.followup.questions, function(index) {
						$('#'+multiBinVenue.options.followup.questions[index].variable).val('');
					});

				}

				$(dropped).appendTo(droppedOn.children('.active-node-list'));
				var properties = {};
				properties[multiBinVenue.options.variable.label] = multiBinVenue.options.variable.values[index];
				// Add the attribute
				var edgeID = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:$(dropped).data('node-id'), type:multiBinVenue.options.edgeType})[0].id;
				window.network.updateEdge(edgeID,properties);

				var noun = 'places';
				if ($('.c'+index+' .active-node-list').children().length === 1) {
					noun = 'place';
				}
				$('.c'+index+' p').html($('.c'+index+' .active-node-list').children().length+' '+noun+'.');

				var el = $('.c'+index);
				// var origBg = el.css('background-color');
				setTimeout(function() {
					el.addClass('dropped');
				},0);

				setTimeout(function(){
					el.removeClass('dropped');
					el.removeClass('yellow');
				}, 1000);
			},
			over: function() {
				$(this).addClass('yellow');

			},
			out: function() {
				$(this).removeClass('yellow');
			}
		});

	});

	// $('.node-bin').css({width:itemSize*0.60-20,height:itemSize*0.60-20});
	$('.node-bin').css({width:itemSize,height:itemSize});
	// $('.node-bin').css({width:itemSize,height:itemSize});

	// $('.node-bin h1').css({marginTop: itemSize/3});

	$.each($('.node-bin'), function(index, value) {
		var oldPos = $(value).offset();
		$(value).data('oldPos', oldPos);
		$(value).css(oldPos);

	});

	$('.node-bin').css({position:'absolute'});

	// Add edges to bucket or to bins if they already have variable value.
	$.each(edges, function(index,value) {

		// We need the dyad edge so we know the nname for other types of edges
		var dyadEdge = window.network.getEdges({from:window.network.getEgo().id, type:multiBinVenue.options.edgeType, to:value.to})[0];
		if (value[multiBinVenue.options.variable.label] !== undefined && value[multiBinVenue.options.variable.label] !== '') {
			index = multiBinVenue.options.variable.values.indexOf(value[multiBinVenue.options.variable.label]);
			$('.c'+index).children('.active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.venue_name_t0+'</div>');
			var noun = 'places';
			if ($('.c'+index).children('.active-node-list').children().length === 1) {
				noun = 'place';
			}
			if ($('.c'+index).children('.active-node-list').children().length === 0) {
				$('.c'+index).children('p').html('(Empty)');
			} else {
				$('.c'+index).children('p').html($('.c'+index).children('.active-node-list').children().length+' '+noun+'.');
			}
		} else {
			$('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.venue_name_t0+'</div>');
		}

	});
	$('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false , start: function(){
		if (taskComprehended === false) {
			var eventProperties = {
				stage: window.netCanvas.Modules.session.currentStage(),
				timestamp: new Date()
			};
			log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
			window.dispatchEvent(log);
			taskComprehended = true;
		}
	}});

	// Event Listeners
	window.addEventListener('changeStageStart', stageChangeHandler, false);
	$('.node-bin-static').on('click', nodeBinClickHandler);
	$('.content').on('click', backgroundClickHandler);
	$('.followup-form').on('submit', followupHandler);
	$('.followup-cancel').on('click', followupCancelHandler);

};
return multiBinVenue;
};
;/* global $, window, Odometer, document, note  */
/* exported Namegenerator */
module.exports = function Namegenerator() {
    'use strict';
    //global vars
    var namegenerator = {};
    namegenerator.options = {
        nodeType:'Alter',
        edgeType:'Dyad',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
        roles: {
            'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
            'Family / Relative': ['Parent / Guardian','Brother / Sister','Grandparent','Other Family','Chosen Family'],
            'Romantic / Sexual Partner': ['Boyfriend / Girlfriend','Ex-Boyfriend / Ex-Girlfriend','Booty Call / Fuck Buddy / Hook Up','One Night Stand','Other type of Partner'],
            'Acquaintance / Associate': ['Coworker / Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
            'Other Support / Source of Advice': ['Teacher / Professor','Counselor / Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
            'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
            'Other': ['Other relationship']
        }
    };

    var nodeBoxOpen = false;
    var editing = false;
    var relationshipPanel;
    var newNodePanel;
    var newNodePanelContent;
    var alterCounter;

    var alterCount = window.network.getNodes({type_t0: 'Alter'}).length;

    var namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                namegenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            namegenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var roleClickHandler = function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');

        } else {
            $(this).addClass('selected');
        }

    };

    var inputKeypressHandler = function(e) {
        if (nodeBoxOpen === true) {
            if (e.keyCode !== 13) {
                if($('#fname_t0').val().length > 0 && $('#fname_t0').val().length > 0) {

                    var lname = $('#fname_t0').val()+' '+$('#lname_t0').val().charAt(0);
                    if ($('#lname_t0').val().length > 0 ) {
                        lname +='.';
                    }

                    var updateName = function() {
                        $('#nname_t0').val(lname);
                    };

                    setTimeout(updateName,0);

                }
            }
        }

    };

    var stageChangeHandler = function() {
        namegenerator.destroy();
    };

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Don't do anything if this is a 'ghost' card (a placeholder created as a visual indicator while a previous network node is being dragged)
        if ($(this).hasClass('ghost')) {
            return false;
        }

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: index, type:'Dyad'})[0];

        // Set the value of editing to the node id of the current person
        editing = index;

        // Update role count
        var roleCount = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('.relationship-button').html(roleCount+' roles selected.');

        // Make the relevant relationships selected on the relationships panel, even though it isnt visible yet
        var roleEdges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'});
        $.each(roleEdges, function(index, value) {
            $(relationshipPanel).children('.relationship-types-container').children('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected');
        });

        // Populate the form with this nodes data.
        $.each(namegenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'relationship') {
                    $('select[name="'+value.variable+'"]').val(edge[value.variable]);
                }else {
                    $('#'+value.variable).val(edge[value.variable]);
                }
                $('.delete-button').show();

                if (edge.elicited_previously === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                } else {
                    $('input#age_p_t0').prop( 'disabled', false);
                }
                namegenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        namegenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');
        note.trace(e);

        e.preventDefault();

        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(namegenerator.options.variables, function(index,value) {

            if(value.target === 'edge') {
                if (value.private === true) {
                    newEdgeProperties[value.variable] =  value.value;
                } else {
                    if(value.type === 'relationship' || value.type === 'subrelationship') {
                        newEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                    } else {
                        newEdgeProperties[value.variable] =  $('#'+value.variable).val();
                    }
                }

            } else if (value.target === 'node') {
                if (value.private === true) {
                    newNodeProperties[value.variable] =  value.value;
                } else {
                    if(value.type === 'relationship' || value.type === 'subrelationship') {
                        newNodeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                    } else {
                        newNodeProperties[value.variable] =  $('#'+value.variable).val();
                    }

                }
            }
        });

        var nodeProperties = {};
        var edgeProperties = {};

        if (editing === false) {
            note.info('// We are submitting a new node');
            window.tools.extend(nodeProperties, newNodeProperties);
            var newNode = window.network.addNode(nodeProperties);
            var id;

            console.log('iterating edgetypes');
            $.each(namegenerator.options.edgeTypes, function(index,value) {
                console.log(value);
                var currentEdgeProperties = {};
                var currentEdge = value;
                $.each(namegenerator.options.variables, function(index, value) {
                    if (value.target === 'edge' && value.edge === currentEdge) {
                        if (value.private === true) {
                            currentEdgeProperties[value.variable] =  value.value;
                        } else {
                            if(value.type === 'relationship' || value.type === 'subrelationship') {
                                currentEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                            } else {
                                currentEdgeProperties[value.variable] =  $('#'+value.variable).val();
                            }
                        }
                    }
                });
                edgeProperties = {
                    from: window.network.getNodes({type_t0:'Ego'})[0].id,
                    to: newNode,
                    type:currentEdge
                };

                window.tools.extend(edgeProperties,currentEdgeProperties);
                id = window.network.addEdge(edgeProperties);
            });

            note.info('// Add role edges');

            note.info('// Iterate through selected items and create a new role edge for each.');
            $.each($(relationshipPanel).find('.relationship.selected'), function() {
                edgeProperties = {
                    type: 'Role',
                    from:window.network.getNodes({type_t0:'Ego'})[0].id,
                    to: newNode,
                    reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                    reltype_sub_t0: $(this).data('sub-relationship')
                };
                window.network.addEdge(edgeProperties);
            });

            note.info('// Main edge');
            var edge = window.network.getEdges({to:newNode, type:'Dyad'})[0];
            namegenerator.addToList(edge);
            alterCount++;
            alterCounter.update(alterCount);

        } else {
            note.info('// We are updating a node');

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css('background-color');
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;
            $.each(namegenerator.options.edgeTypes, function(index,value) {
                var currentEdge = value;
                var currentEdgeProperties = {};
                $.each(namegenerator.options.variables, function(index, value) {
                    if (value.target === 'edge' && value.edge === currentEdge) {
                        if (value.private === true) {
                            currentEdgeProperties[value.variable] =  value.value;
                        } else {
                            if(value.type === 'relationship' || value.type === 'subrelationship') {
                                currentEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                            } else {
                                currentEdgeProperties[value.variable] =  $('#'+value.variable).val();
                            }
                        }
                    }
                });

                var edges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id,to:editing,type:value});
                $.each(edges, function(index,value) {
                    window.network.updateEdge(value.id,currentEdgeProperties, color);
                });
            });

            window.network.updateNode(nodeID, newNodeProperties);
            var properties = window.tools.extend(newEdgeProperties,newNodeProperties);

            // update relationship roles

            // Remove existing edges
            window.network.removeEdges(window.network.getEdges({type:'Role', from: window.network.getNodes({type_t0:'Ego'})[0].id, to: editing}));

            $.each($(relationshipPanel).find('.relationship.selected'), function() {
                edgeProperties = {
                    type: 'Role',
                    from:window.network.getNodes({type_t0:'Ego'})[0].id,
                    to: editing,
                    reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                    reltype_sub_t0: $(this).data('sub-relationship')
                };
                window.network.addEdge(edgeProperties);
            });

            $('div[data-index='+editing+']').html('');
            $('div[data-index='+editing+']').append('<h4>'+properties.nname_t0+'</h4>');
            var list = $('<ul></ul>');

            $.each(namegenerator.options.variables, function(index, value) {
                if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                    list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
                }

            });

            $('div[data-index='+editing+']').append(list);
            alterCount = window.network.getNodes({type_t0: 'Alter'}).length;
            alterCounter.update(alterCount);
            editing = false;

        } // end if editing


        namegenerator.closeNodeBox();


    };

    namegenerator.generateTestAlters = function(number) {

        if (!number) {
            note.error('You must specify the number of test alters you want to create. Cancelling!');
            return false;
        }

        var eachTime = 4000;

        for (var i = 0; i < number; i++) {
            var timer = eachTime*i;
            setTimeout(namegenerator.generateAlter, timer);
        }

    };

    namegenerator.generateAlter = function() {
        // We must simulate every interaction to ensure that any errors are caught.
        $('.add-button').click();
        setTimeout(function() {
            $('#ngForm').submit();
        }, 3000);

        $('#fname_t0').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);
        $('#lname_t0').val(namesList[Math.floor(window.tools.randomBetween(0,namesList.length))]);
        var lname = $('#fname_t0').val()+' '+$('#lname_t0').val().charAt(0);
        if ($('#lname_t0').val().length > 0 ) {
            lname +='.';
        }
        $('#nname_t0').val(lname);
        $('#age_p_t0').val(Math.floor(window.tools.randomBetween(18,90)));

        setTimeout(function() {
            $('.relationship-button').click();
        }, 500);
        setTimeout(function() {

            var roleNumber = Math.floor(window.tools.randomBetween(1,3));

            for (var j = 0; j < roleNumber; j++) {
                $($('.relationship')[Math.floor(window.tools.randomBetween(0,$('.relationship').length))]).addClass('selected');

            }

            $('.relationship-close-button').click();
        }, 2000);
    };

    namegenerator.openNodeBox = function() {
        $('.newNodeBox').height($('.newNodeBox').height());
        $('.newNodeBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    namegenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newNodeBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
        $('.relationship-button').html('Set Relationship Roles');
        $(relationshipPanel).find('.relationship').removeClass('selected');
    };

    namegenerator.destroy = function() {
        note.debug('Destroying namegenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('keyup', '#fname_t0, #lname_t0', inputKeypressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', namegenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', namegenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        $(window.document).off('click', '.relationship', roleClickHandler);
        $(window.document).off('click', '.relationship-button', namegenerator.toggleRelationshipBox);
        $(window.document).off('click', '.relationship-close-button', namegenerator.toggleRelationshipBox);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newNodeBox').remove();
        $('.relationship-types-container').remove();


    };

    namegenerator.init = function(options) {
        window.tools.extend(namegenerator.options, options);
        // $.extend(true, namegenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-user-plus add-button"></span>');
        namegenerator.options.targetEl.append(button);
        var alterCountBox = $('<div class="alter-count-box"></div>');
        namegenerator.options.targetEl.append(alterCountBox);

        // create node box
        var newNodeBox = $('<div class="newNodeBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-user-plus"></span> Adding a Person</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // namegenerator.options.targetEl.append(newNodeBox);
        $('body').append(newNodeBox);
        $.each(namegenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'number':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'relationship':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'">');

                    break;

                    case 'subrelationship':
                    formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'">');
                    break;

                }
                $('.newNodeBox .form .fields').append(formItem);
                if (value.required === true) {
                    if (value.type === 'relationship') {
                        $('select[name="'+value.variable+'"]').prop('required', true);
                    } else {
                        $('#'+value.variable).prop('required', true);
                    }

                }

            }

        });

        $('.newNodeBox .form .fields').append('<div class="form-group"><div class=""><button type="button" class="btn btn-primary btn-block relationship-button">Set Relationship Roles</div></div></div>');
        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newNodeBox .form .fields').append(buttons);

        newNodePanel = $('.newNodeBox').html();

        // relationship types
        relationshipPanel = $('<div class="relationship-content"><div class="relationship-close-button">Back <span class="fa fa-2x fa-sign-in"></span></div><div class="col-sm-12 relationship-header"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-connectdevelop"></span> Adding Relationships</h2></div><div class="relationship-types-container"></div></div>');
        var counter = 0;
        $.each(namegenerator.options.roles, function(index) {
            $(relationshipPanel).find('.relationship-types-container').append('<div class="relationship-type rel-'+counter+' c'+counter+'" data-main-relationship="'+counter+'"><h1>'+index+'</h1></div>');
            $.each(namegenerator.options.roles[index], function(relIndex, relValue) {
                $(relationshipPanel).find('.rel-'+counter).append('<div class="relationship" data-sub-relationship="'+relValue+'">'+relValue+'</div>');
            });
            counter++;
        });

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        namegenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(namegenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(namegenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        namegenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', namegenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', namegenerator.removeFromList);
        $(window.document).on('keyup', '#fname_t0, #lname_t0', inputKeypressHandler);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);
        $(window.document).on('click', '.relationship', roleClickHandler);
        $(window.document).on('click', '.relationship-button', namegenerator.toggleRelationshipBox);
        $(window.document).on('click', '.relationship-close-button', namegenerator.toggleRelationshipBox);

        // Set node count box
        var el = document.querySelector('.alter-count-box');

        alterCounter = new Odometer({
          el: el,
          value: alterCount,
          format: 'dd',
          theme: 'default'
        });

        // add existing nodes
        $.each(window.network.getEdges({type: 'Dyad', from: window.network.getNodes({type_t0:'Ego'})[0].id, ng_t0:namegenerator.options.variables[5].value}), function(index,value) {
            namegenerator.addToList(value);
        });

        // Handle side panels
        if (namegenerator.options.panels.length > 0) {

            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (namegenerator.options.panels.indexOf('current') !== -1) {

                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>People you already listed:</h4></div>'));
                $.each(window.network.getEdges({type: 'Dyad', from: window.network.getNodes({type_t0:'Ego'})[0].id}), function(index,value) {

                    var el = $('<div class="node-list-item">'+value.nname_t0+'</div>');
                    sideContainer.children('.current-node-list').append(el);
                });
            }

            // Previous side panel shows previous network alters
            if (namegenerator.options.panels.indexOf('previous') !== -1) {
                // add custom node list for previous network

                //first chck if there is a previous network
                if (typeof window.netCanvas.Modules.session.sessionData.previousNetwork !== 'undefined') {
                    if (typeof window.previousNetwork === 'undefined') {
                        window.previousNetwork = new window.netCanvas.Modules.Network();
                        window.previousNetwork.loadNetwork(window.netCanvas.Modules.session.sessionData.previousNetwork);
                    }
                    // Check there is more than one node
                    if (window.previousNetwork.getNodes().length > 1) {
                        // Add the previous node list
                        sideContainer.append($('<div class="previous-node-list node-lists"><h4>People you listed in other visits:</h4></div>'));
                        $.each(window.previousNetwork.getEdges({type: 'Dyad', from: window.previousNetwork.getEgo().id}), function(index,value) {

                            var el = $('<div class="node-bucket-item draggable" data-id="'+value.to+'">'+value.nname_t0+'</div>');
                            sideContainer.children('.previous-node-list').append(el);
                        });

                    }

                } // end if previous network is undefined
            } // end previous panel

            if (sideContainer.children().length > 0) {
                // move node list to one side
                sideContainer.insertBefore('.nameList');
                $('.nameList').addClass('alt');
                // Make nodes draggable
                $('.draggable').draggable({ cursor: 'pointer', revert: 'invalid', disabled: false ,
                    start: function(){
                        $(this).parent().css('overflow','visible');
                    },
                    stop: function() {
                        $('.previous-node-list').css('overflow','scroll');
                        $('.current-node-list').css('overflow','scroll');
                    }
                });

                $('.node-container').droppable({ accept: '.draggable',
                    drop: function(event, ui) {
                        // remove the ghost card
                        $('.previous-node-list').css('overflow','scroll');
                        $('.current-node-list').css('overflow','scroll');
                        $('.card.ghost').remove();

                        // get the data we need
                        var dropped = ui.draggable;
                        var droppedNode = dropped.data('id');
                        var dyadEdge = window.previousNetwork.getEdges({type: 'Dyad', from: window.previousNetwork.getEgo().id, to: droppedNode})[0];

                        // update name generator property of dyad edge

                        // get the current name generator's label
                        var ngStep;
                        $.each(namegenerator.options.variables, function(index, value) {
                            if (value.label === 'ng_t0') { ngStep = value.value; }
                        });

                        dyadEdge.ng_t0 = ngStep;

                        // Add the dropped node to the list, creating a card for it
                        namegenerator.addToList(dyadEdge);

                        // create a node and edge in the current network
                        var oldNode = window.previousNetwork.getNode(droppedNode);
                        dyadEdge.elicited_previously = true;
                        window.network.addNode(oldNode, false, true);  // (properties, ego, force);
                        window.network.addEdge(dyadEdge);

                        console.log('Adding other custom edges for this interface.');
                        $.each(namegenerator.options.edgeTypes, function(edgeTypeIndex,edgeType) {
                            if (edgeType !== 'Dyad') {
                                var currentEdgeProperties = {};
                                $.each(namegenerator.options.variables, function(index, value) {
                                    if (value.target === 'edge' && value.edge === edgeType) {
                                        if (value.private === true) {
                                            currentEdgeProperties[value.variable] =  value.value;
                                        } else {
                                            if(value.type === 'relationship' || value.type === 'subrelationship') {
                                                currentEdgeProperties[value.variable] =  $('select[name="'+value.variable+'"]').val();
                                            } else {
                                                currentEdgeProperties[value.variable] =  $('#'+value.variable).val();
                                            }
                                        }
                                    }
                                });
                                var edgeProperties = {
                                    from: window.network.getEgo().id,
                                    to: droppedNode,
                                    type:edgeType
                                };

                                window.tools.extend(edgeProperties,currentEdgeProperties);
                                window.network.addEdge(edgeProperties);
                            }

                        });


                        $('.inner-card').last().click();

                        setTimeout(function() {
                            $('.relationship-button').click();
                        }, 300);
                        // Remove from previous network
                        window.previousNetwork.removeNode(oldNode.id);

                        window.netCanvas.Modules.session.addData('previousNetwork', {nodes: window.previousNetwork.getNodes(), edges: window.previousNetwork.getEdges()});
                        $(dropped).remove();
                        //hide the ghost card
                        $('.card.ghost').removeClass('show');
                    },
                    over: function() {
                        $('.node-container').scrollTop($('.node-container')[0].scrollHeight);
                        $('.node-container').append('<div class="card ghost"><div class="inner-card ghost"><i class="fa fa-5x fa-plus-circle"></i>Add</div></div>');
                        setTimeout(function() {
                            $('.card.ghost').addClass('show');
                        }, 100);

                    },
                    out: function() {
                        $('.card.ghost').removeClass('show');
                        setTimeout(function() {
                            $('.card.ghost').remove();
                        }, 300);

                    }
                });
            }

            // halve the panel height if we have two
            if ($('.side-container').children().length > 1) {
                $('.node-lists').addClass('double');
            }

        } // end if panels
    };

    namegenerator.toggleRelationshipBox = function() {
        if ($('.newNodeBox').hasClass('relationships')) {
            // relationship box is open, so close it
            var roleCount = $('.relationship.selected').length;
            var plural = 'roles';

            if (roleCount === 1) {
                plural = 'role';
            }

            // fade out

            $('.newNodeBox').addClass('content-hidden');

            setTimeout(function() {
                $('.newNodeBox').removeClass('relationships');
                $('.newNodeBox').html(newNodePanel);
                setTimeout(function() {

                });
                var wasDisabled = false;
                if ($('input#age_p_t0').is(':disabled')) {
                    $('input#age_p_t0').prop( 'disabled', false);
                    wasDisabled = true;
                }
                $('#ngForm').deserialize(newNodePanelContent);

                if (wasDisabled === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                }

                if(editing) {
                    $('.relationship-button').html(roleCount+' '+plural+' selected.');
                } else {
                    if (roleCount > 0) {
                        $('.relationship-button').html(roleCount+' '+plural+' selected.');
                    } else {
                        $('.relationship-button').html('Set Relationship Roles');
                    }
                }

            }, 300);
            setTimeout(function() {
                $('.newNodeBox').removeClass('content-hidden');
            }, 500);

        } else {
            // relationship box is closed, so open it
            var wasDisabled = false;
            if ($('input#age_p_t0').is(':disabled')) {
                wasDisabled = true;
                $('input#age_p_t0').prop( 'disabled', false);
            }
            newNodePanelContent = $('#ngForm').serialize();

            if (wasDisabled === true) {
                $('input#age_p_t0').prop( 'disabled', true);
            }
            newNodePanel = $('.newNodeBox').html();
            $('.newNodeBox').addClass('content-hidden');

            setTimeout(function() {
                $('.newNodeBox').addClass('relationships');
                $('.newNodeBox').html(relationshipPanel);

            }, 300);

            setTimeout(function(){
                $('.newNodeBox').removeClass('content-hidden');
            }, 700);

        }
    };

    namegenerator.addToList = function(properties) {
        // var index = $(this).data('index');
        var card;

        card = $('<div class="card"><div class="inner-card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div></div>');
        var list = $('<ul></ul>');
        $.each(namegenerator.options.variables, function(index, value) {
            if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== '') {
                list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');
            }

        });
        card.children('.inner-card').append(list);
        $('.nameList').append(card);

    };

    namegenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var alterCount = window.network.getNodes({type_t0: 'Alter'}).length;
        alterCounter.update(alterCount);

        namegenerator.closeNodeBox();
    };

    return namegenerator;
};
;/* exported Network, Node, Edge */
/* global $, window,note, tools */

/*

Previously I had been storing Nodes and Edges within the KineticJS framework
Nodes were stored as Kinetic Groups (text and a shape), and edges stored as Kinetic Lines.

This approach worked fine when the scope of the interaction was limited to
KineticJS, but needs revision when nodes much be created, edited, and managed
from different interfaces.

This module should implement 'networky' methods, and a querying syntax for
selecting nodes or edges by their various properties, and interating over them.

*/

module.exports = function Network() {
    'use strict';
    var network = {
      nodes: [],
      edges: []
    };

    network.addNode = function(properties, ego, force) {

        var reserved_ids;

        if (!force) { force = false; }

        // Check if we are adding an ego
        if (!ego) { ego = false;}

        // if we are adding an ego create an empty reserved_ids array for later, it not use Ego's.
        if (ego) {
            // fetch in use IDs from Ego
            reserved_ids = [];
        } else {
            reserved_ids = network.getEgo().reserved_ids;
        }


        // Check if an ID has been passed, and then check if the ID is already in use. Cancel if it is.
        if (typeof properties.id !== 'undefined' && this.getNode(properties.id) !== false) {
            note.error('Node already exists with id '+properties.id+'. Cancelling!');
            return false;
        }

        // To prevent confusion in longitudinal studies, once an ID has been allocated, it is always reserved.
        // This reserved list is stored with the ego.
        if (!force) {
            if (reserved_ids.indexOf(properties.id) !== -1) {
                note.error('Node id '+properties.id+' is already in use with this ego. Cancelling!');
                return false;
            }
        }

        // Locate the next free node ID
        // should this be wrapped in a conditional to check if properties.id has been provided? probably.
        var newNodeID = 0;
        while (network.getNode(newNodeID) !== false || reserved_ids.indexOf(newNodeID) !== -1) {
            newNodeID++;
        }
        var nodeProperties = {
            id: newNodeID
        };
        window.tools.extend(nodeProperties, properties);

        network.nodes.push(nodeProperties);
        reserved_ids.push(newNodeID);

        var log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeCreate', 'eventObject':nodeProperties}});
        window.dispatchEvent(log);
        var nodeAddedEvent = new window.CustomEvent('nodeAdded',{'detail':nodeProperties});
        window.dispatchEvent(nodeAddedEvent);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        return nodeProperties.id;
    };

    network.loadNetwork = function(data, overwrite) {
        if (!data || !data.nodes || !data.edges) {
            note.error('Error loading network. Data format incorrect.');
            return false;
        } else {
            if (!overwrite) {
                overwrite = false;
            }

            if (overwrite) {
                network.nodes = data.nodes;
                network.dges = data.edges;
            } else {
                network.nodes = network.nodes.concat(data.nodes);
                network.edges = network.edges.concat(data.edges);
            }

            return true;
        }
    };

    network.createEgo = function(properties) {
        if (network.egoExists() === false) {
            var egoProperties = {
                id:0,
                type_t0: 'Ego',
                reserved_ids: [0]
            };
            window.tools.extend(egoProperties, properties);
            network.addNode(egoProperties, true);
        } else {
            return false;
        }
    };

    network.deduplicate = function() {
        var newNodes = [];
        var ids = [];
        $.each(network.nodes, function(index, value) {
            if (ids.indexOf(value.id) === -1) {
                ids.push(value.id);
                newNodes.push(value);
            } else {
                console.log('rejected');
            }
        });

        network.nodes = newNodes;

        var newEdges = [];
        ids = [];
        $.each(network.edges, function(index, value) {
            if (ids.indexOf(value.id) === -1) {
                ids.push(value.id);
                newEdges.push(value);
            } else {
                console.log('rejected');
            }
        });

        network.edges = newEdges;
        window.netCanvas.Modules.session.saveData();
    };

    network.getEgo = function() {
        note.debug('network.getEgo() called.');
        if (network.getNodes({type_t0:'Ego'}).length !== 0) {
            return network.getNodes({type_t0:'Ego'})[0];
        } else {
            return false;
        }
    };

    network.egoExists = function() {
        if (network.getEgo() !== false) {
            return true;
        } else {
            return false;
        }
    };

    network.edgeExists = function(edge) {
        note.debug('network.edgeExists() called.');
        if (typeof edge === 'undefined') {
            note.error('ERROR: No edge passed to network.edgeExists().');
            return false;
        }
        // old way of checking if an edge existed checked for values of to, from, and type. We needed those to not have to be unique.
        // New way: check if all properties are the same.

        var reversed = {}, temp;
        reversed = $.extend(true,{}, edge); // Creates a copy not a reference
        temp = reversed.to; // Switch the order (do the reversing)
        reversed.to = reversed.from;
        reversed.from = temp;

        var straightExists = (network.getEdges(edge).length > 0) ? true : false;
        var reverseExists = (network.getEdges(reversed).length > 0) ? true : false;


        if (straightExists === true || reverseExists === true) { // Test if an edge matches either the proposed edge or the reversed edge.
            return true;
        } else {
            return false;
        }
    };

    network.addEdge = function(properties) {
        note.debug('network.addEdge() called.');
        // todo: make nickname unique, and provide callback so that interface can respond if a non-unique nname is used.

        if (typeof properties.from === 'undefined' || typeof properties.to === 'undefined') {
            note.error('Error while executing network.addEdge(). "To" and "From" must BOTH be defined.');
            return false;
        }

        if (properties.id !== 'undefined' && network.getEdge(properties.id) !== false) {
            note.warn('An edge with this id already exists! I\'m generating a new one for you.');
            var newEdgeID = 0;
            while (network.getEdge(newEdgeID) !== false) {
                newEdgeID++;
            }

            properties.id = newEdgeID;
        }

        var position = 0;
        while(network.getEdge(position) !== false) {
            position++;
        }

        // Required variables (id and type) generated here. These are overwritten as long as the values have been provided.
        var edgeProperties = {
            id: position,
            type: 'Default'
        };

        window.tools.extend(edgeProperties, properties);

        if(network.edgeExists(edgeProperties) === false) {

            network.edges.push(edgeProperties);
            var log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeCreate', 'eventObject':edgeProperties}});
            window.dispatchEvent(log);
            var edgeAddedEvent = new window.CustomEvent('edgeAdded',{'detail':edgeProperties});
            window.dispatchEvent(edgeAddedEvent);
            var unsavedChanges = new window.Event('unsavedChanges');
            window.dispatchEvent(unsavedChanges);

            return edgeProperties.id;
        } else {
            note.warn('Warning: Proposed edge already exists. Cancelling.');
            return false;
        }

    };

    network.removeEdges = function(edges) {
        note.debug('network.removeEdges() called.');
        network.removeEdge(edges);
    };

    network.removeEdge = function(edge) {
        note.debug('network.removeEdge() called.');
        if (!edge) {
            return false;
        }
        var log;
        var edgeRemovedEvent;

        if (typeof edge === 'object' && typeof edge.length !== 'undefined') {
            // we've got an array of object edges
            for (var i = 0; i < edge.length; i++) {
                // localEdges.remove(edge[i]);
                window.tools.removeFromObject(edge[i], network.edges);
                log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeRemove', 'eventObject':edge[i]}});
                edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{'detail':edge[i]});
                window.dispatchEvent(log);
                window.dispatchEvent(edgeRemovedEvent);
            }
        } else {
            // we've got a single edge, which is an object {}
            window.tools.removeFromObject(edge, network.edges);
            log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeRemove', 'eventObject':edge}});
            edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{'detail':edge});
            window.dispatchEvent(log);
            window.dispatchEvent(edgeRemovedEvent);
        }

        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return true;
    };

    network.removeNode = function(id, preserveEdges) {
        note.debug('network.removeNode() called.');
        if (!preserveEdges) { preserveEdges = false; }

        // Unless second parameter is present, also delete this nodes edges
        if (!preserveEdges) {
          network.removeEdge(network.getNodeEdges(id));
        } else {
            note.info('NOTICE: preserving node edges after deletion.');
        }

        var nodeRemovedEvent, log;

        for (var i = 0; i<network.nodes.length; i++) {
            if (network.nodes[i].id === id) {
                log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeRemove', 'eventObject':network.nodes[i]}});
                window.dispatchEvent(log);
                nodeRemovedEvent = new window.CustomEvent('nodeRemoved',{'detail':network.nodes[i]});
                window.dispatchEvent(nodeRemovedEvent);
                window.tools.removeFromObject(network.nodes[i],network.nodes);
                return true;
            }
        }
        return false;
    };

    network.updateEdge = function(id, properties, callback) {
        note.debug('network.updateEdge() called.');
        if(network.getEdge(id) === false || properties === undefined) {
            note.debug('network.updateEdge(): returning false. Either the edge ID was not found, or no properties were supplied to update.');
            note.trace('id: '+id);
            note.trace('Properties:');
            note.trace(properties);
            return false;
        }
        var edge = network.getEdge(id);
        var edgeUpdateEvent, log;

        window.tools.extend(edge, properties);
        edgeUpdateEvent = new window.CustomEvent('edgeUpdatedEvent',{'detail':edge});
        window.dispatchEvent(edgeUpdateEvent);
        log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeUpdate', 'eventObject':edge}});
        window.dispatchEvent(log);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        if(callback) {
            callback();
            return true;
        }

    };

    network.updateNode = function(id, properties, callback) {
        note.debug('network.updateNode() called.');
        if(this.getNode(id) === false || properties === undefined) {
            note.warn('network.updateNode() failed. No such node.');
            return false;
        }
        var node = this.getNode(id);
        var nodeUpdateEvent, log;

        window.tools.extend(node, properties);
        nodeUpdateEvent = new window.CustomEvent('nodeUpdatedEvent',{'detail':node});
        window.dispatchEvent(nodeUpdateEvent);
        log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeUpdate', 'eventObject':node}});
        window.dispatchEvent(log);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        if(callback) {
            callback();
        }

    };

    network.getNode = function(id) {
        if (id === undefined) { return false; }
        for (var i = 0;i<network.nodes.length; i++) {
            if (network.nodes[i].id === id) {return network.nodes[i]; }
        }
        return false;

    };

    network.getEdge = function(id) {
        if (id === undefined) { return false; }
        for (var i = 0;i<network.edges.length; i++) {
            if (network.edges[i].id === id) {return network.edges[i]; }
        }
        return false;
    };

    network.filterObject = function(targetArray,criteria) {
        // Return false if no criteria provided
        if (!criteria) { return false; }
        // Get network.nodes using .filter(). Function is called for each of network.nodes.Nodes.
        var result = targetArray.filter(function(el){
            var match = true;

            for (var criteriaKey in criteria) {
                if (el[criteriaKey] !== undefined) {
                    // current criteria exists in object.
                    if (el[criteriaKey] !== criteria[criteriaKey]) {
                        match = false;
                    }
                } else {
                    match = false;
                }
            }

            if (match === true) {
                return el;
            }

        });

        // reverse to and from to check for those matches.
        if (typeof criteria.from !== 'undefined' && typeof criteria.to !== 'undefined') {

            var reversed = {}, temp;
            reversed = $.extend(true,{}, criteria);
            temp = reversed.to;
            reversed.to = reversed.from;
            reversed.from = temp;

            var result2 = targetArray.filter(function(el){
                var match = true;

                for (var criteriaKey in reversed) {
                    if (el[criteriaKey] !== undefined) {
                        // current criteria exists in object.
                        if (el[criteriaKey] !== reversed[criteriaKey]) {
                            match = false;
                        }
                    } else {
                        match = false;
                    }
                }

                if (match === true) {
                    return el;
                }

            });

            result = result.concat(result2);
        }


        return result;
    };

    network.getNodes = function(criteria, filter) {
        var results;
        if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
            results = network.filterObject(network.nodes,criteria);
        } else {
            results = network.nodes;
        }

        if (filter) {
            results = filter(results);
        }

        return results;
    };

    network.getEdges = function(criteria, filter) {
        var results;
        if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
            results = network.filterObject(network.edges,criteria);
        } else {
            results = network.edges;
        }

        if (filter) {
            results = filter(results);
        }

        return results;
    };

    network.getNodeInboundEdges = function(nodeID) {
        return network.getEdges({to:nodeID});
    };

    network.getNodeOutboundEdges = function(nodeID) {
        return network.getEdges({from:nodeID});
    };

    network.getNodeEdges = function(nodeID) {
        if (network.getNode(nodeID) === false) {
            return false;
        }
        var inbound = network.getNodeInboundEdges(nodeID);
        var outbound = network.getNodeOutboundEdges(nodeID);
        var concat = inbound.concat(outbound);
        return concat;
    };

    network.setProperties = function(object, properties) {

        if (typeof object === 'undefined') { return false; }

        if (typeof object === 'object' && object.length>0) {
            // Multiple objects!
            for (var i = 0; i < object.length; i++) {
                $.extend(object[i], properties);
            }
        } else {
            // Just one object.
            $.extend(object, properties);
        }

    };

    network.returnAllNodes = function() {
        return network.nodes;
    };

    network.returnAllEdges = function() {
        return network.edges;
    };

    network.clearGraph = function() {
        network.edges = [];
        network.nodes = [];
    };

    network.createRandomGraph = function(nodeCount,edgeProbability) {
        nodeCount = nodeCount || 10;
        edgeProbability = edgeProbability || 0.4;
        note.info('Creating random graph...');
        for (var i=0;i<nodeCount;i++) {
            var current = i+1;
            window.tools.notify('Adding node '+current+' of '+nodeCount,2);
            // Use random coordinates
            var nodeOptions = {
                coords: [Math.round(tools.randomBetween(100,window.innerWidth-100)),Math.round(tools.randomBetween(100,window.innerHeight-100))]
            };
            network.addNode(nodeOptions);
        }

        note.debug('Adding network.edges.');
        $.each(network.nodes, function (index) {
            if (tools.randomBetween(0, 1) < edgeProbability) {
                var randomFriend = Math.round(tools.randomBetween(0,network.nodes.length-1));
                network.addEdge({from:network.nodes[index].id,to:network.nodes[randomFriend].id});

            }
        });
    };

    return network;

};
;/* global $, window */
/* exported OrdinalBin */
module.exports = function OrdinalBin() {
    'use strict';
    //global vars
    var ordinalBin = {};
    var taskComprehended = false;
    var log;
    ordinalBin.options = {
        targetEl: $('.container'),
        edgeType: 'Dyad',
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
                    console.log('dropped');
                    var dropped = ui.draggable;
                    var droppedOn = $(this);

                    if (ordinalBin.options.variable.values[index].value>0) {
                        $('.followup').show();
                        followup = $(dropped).data('node-id');
                    }
                    console.log(droppedOn.children('.ord-active-node-list'));
                    console.log(dropped);
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
            if (ordinalBin.options.criteria.type !== 'Dyad') {
                dyadEdge = window.network.getEdges({from: value.from, to:value.to, type:'Dyad'})[0];
            }

            if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== '') {
                index = 'error';
                $.each(ordinalBin.options.variable.values, function(vindex, vvalue) {
                    if (value[ordinalBin.options.variable.label] === vvalue.value) {
                        index = vindex;
                    }
                });

                if (ordinalBin.options.criteria.type !== 'Dyad') {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.nname_t0+'</div>');
                } else {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
                }
            } else {
                if (ordinalBin.options.criteria.type !== 'Dyad') {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.nname_t0+'</div>');
                } else {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.nname_t0+'</div>');
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
                // console.log($(this).css('top'));
                // if ($(this).css('top') !== 'auto' && $(this).css('top') !== '0px') {
                //     console.log('has class');
                //     $(this).css({position:'absolute'});
                // } else {
                //     console.log('not');
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
;/* global $, window */
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
;/* global $, window */
/* exported OrdinalBin */
module.exports = function OrdinalBin() {
    'use strict';
    //global vars
    var ordinalBin = {};
    var taskComprehended = false;
    var log;
    ordinalBin.options = {
        targetEl: $('.container'),
        edgeType: 'Venue',
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
            var dyadEdge = window.network.getNode(value.to);

            if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== '') {
                index = 'error';
                $.each(ordinalBin.options.variable.values, function(vindex, vvalue) {
                    if (value[ordinalBin.options.variable.label] === vvalue.value) {
                        index = vindex;
                    }
                });

                if (ordinalBin.options.criteria.type !== 'Venue') {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.name+'</div>');
                } else {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.name+'</div>');
                }
            } else {
                if (ordinalBin.options.criteria.type !== 'Venue') {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.name+'</div>');
                } else {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.name+'</div>');
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
;/* global $, window */
/* exported OrdinalBin */
module.exports = function OrdinalBin() {
    'use strict';
    //global vars
    var ordinalBin = {};
    var taskComprehended = false;
    var log;
    ordinalBin.options = {
        targetEl: $('.container'),
        edgeType: 'Venue',
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
            if (ordinalBin.options.criteria.type !== 'Venue') {
                dyadEdge = window.network.getEdges({from: value.from, to:value.to, type:'Venue'})[0];
            }

            if (value[ordinalBin.options.variable.label] !== undefined && value[ordinalBin.options.variable.label] !== '') {
                index = 'error';
                $.each(ordinalBin.options.variable.values, function(vindex, vvalue) {
                    if (value[ordinalBin.options.variable.label] === vvalue.value) {
                        index = vindex;
                    }
                });

                if (ordinalBin.options.criteria.type !== 'Venue') {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.venue_name_t0+'</div>');
                } else {
                    $('.d'+index).children('.ord-active-node-list').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.venue_name_t0+'</div>');
                }
            } else {
                if (ordinalBin.options.criteria.type !== 'Venue') {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+dyadEdge.venue_name_t0+'</div>');
                } else {
                    $('.node-bucket').append('<div class="node-bucket-item draggable" data-node-id="'+value.to+'">'+value.venue_name_t0+'</div>');
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
;/*
 RequireJS 2.1.18 Copyright (c) 2010-2015, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var requirejs,require,define;
(function(ba){function G(b){return"[object Function]"===K.call(b)}function H(b){return"[object Array]"===K.call(b)}function v(b,c){if(b){var d;for(d=0;d<b.length&&(!b[d]||!c(b[d],d,b));d+=1);}}function T(b,c){if(b){var d;for(d=b.length-1;-1<d&&(!b[d]||!c(b[d],d,b));d-=1);}}function t(b,c){return fa.call(b,c)}function m(b,c){return t(b,c)&&b[c]}function B(b,c){for(var d in b)if(t(b,d)&&c(b[d],d))break}function U(b,c,d,e){c&&B(c,function(c,g){if(d||!t(b,g))e&&"object"===typeof c&&c&&!H(c)&&!G(c)&&!(c instanceof
RegExp)?(b[g]||(b[g]={}),U(b[g],c,d,e)):b[g]=c});return b}function u(b,c){return function(){return c.apply(b,arguments)}}function ca(b){throw b;}function da(b){if(!b)return b;var c=ba;v(b.split("."),function(b){c=c[b]});return c}function C(b,c,d,e){c=Error(c+"\nhttp://requirejs.org/docs/errors.html#"+b);c.requireType=b;c.requireModules=e;d&&(c.originalError=d);return c}function ga(b){function c(a,k,b){var f,l,c,d,e,g,i,p,k=k&&k.split("/"),h=j.map,n=h&&h["*"];if(a){a=a.split("/");l=a.length-1;j.nodeIdCompat&&
Q.test(a[l])&&(a[l]=a[l].replace(Q,""));"."===a[0].charAt(0)&&k&&(l=k.slice(0,k.length-1),a=l.concat(a));l=a;for(c=0;c<l.length;c++)if(d=l[c],"."===d)l.splice(c,1),c-=1;else if(".."===d&&!(0===c||1===c&&".."===l[2]||".."===l[c-1])&&0<c)l.splice(c-1,2),c-=2;a=a.join("/")}if(b&&h&&(k||n)){l=a.split("/");c=l.length;a:for(;0<c;c-=1){e=l.slice(0,c).join("/");if(k)for(d=k.length;0<d;d-=1)if(b=m(h,k.slice(0,d).join("/")))if(b=m(b,e)){f=b;g=c;break a}!i&&(n&&m(n,e))&&(i=m(n,e),p=c)}!f&&i&&(f=i,g=p);f&&(l.splice(0,
g,f),a=l.join("/"))}return(f=m(j.pkgs,a))?f:a}function d(a){z&&v(document.getElementsByTagName("script"),function(k){if(k.getAttribute("data-requiremodule")===a&&k.getAttribute("data-requirecontext")===i.contextName)return k.parentNode.removeChild(k),!0})}function e(a){var k=m(j.paths,a);if(k&&H(k)&&1<k.length)return k.shift(),i.require.undef(a),i.makeRequire(null,{skipMap:!0})([a]),!0}function n(a){var k,c=a?a.indexOf("!"):-1;-1<c&&(k=a.substring(0,c),a=a.substring(c+1,a.length));return[k,a]}function p(a,
k,b,f){var l,d,e=null,g=k?k.name:null,j=a,p=!0,h="";a||(p=!1,a="_@r"+(K+=1));a=n(a);e=a[0];a=a[1];e&&(e=c(e,g,f),d=m(r,e));a&&(e?h=d&&d.normalize?d.normalize(a,function(a){return c(a,g,f)}):-1===a.indexOf("!")?c(a,g,f):a:(h=c(a,g,f),a=n(h),e=a[0],h=a[1],b=!0,l=i.nameToUrl(h)));b=e&&!d&&!b?"_unnormalized"+(O+=1):"";return{prefix:e,name:h,parentMap:k,unnormalized:!!b,url:l,originalName:j,isDefine:p,id:(e?e+"!"+h:h)+b}}function s(a){var k=a.id,b=m(h,k);b||(b=h[k]=new i.Module(a));return b}function q(a,
k,b){var f=a.id,c=m(h,f);if(t(r,f)&&(!c||c.defineEmitComplete))"defined"===k&&b(r[f]);else if(c=s(a),c.error&&"error"===k)b(c.error);else c.on(k,b)}function w(a,b){var c=a.requireModules,f=!1;if(b)b(a);else if(v(c,function(b){if(b=m(h,b))b.error=a,b.events.error&&(f=!0,b.emit("error",a))}),!f)g.onError(a)}function x(){R.length&&(ha.apply(A,[A.length,0].concat(R)),R=[])}function y(a){delete h[a];delete V[a]}function F(a,b,c){var f=a.map.id;a.error?a.emit("error",a.error):(b[f]=!0,v(a.depMaps,function(f,
d){var e=f.id,g=m(h,e);g&&(!a.depMatched[d]&&!c[e])&&(m(b,e)?(a.defineDep(d,r[e]),a.check()):F(g,b,c))}),c[f]=!0)}function D(){var a,b,c=(a=1E3*j.waitSeconds)&&i.startTime+a<(new Date).getTime(),f=[],l=[],g=!1,h=!0;if(!W){W=!0;B(V,function(a){var i=a.map,j=i.id;if(a.enabled&&(i.isDefine||l.push(a),!a.error))if(!a.inited&&c)e(j)?g=b=!0:(f.push(j),d(j));else if(!a.inited&&(a.fetched&&i.isDefine)&&(g=!0,!i.prefix))return h=!1});if(c&&f.length)return a=C("timeout","Load timeout for modules: "+f,null,
f),a.contextName=i.contextName,w(a);h&&v(l,function(a){F(a,{},{})});if((!c||b)&&g)if((z||ea)&&!X)X=setTimeout(function(){X=0;D()},50);W=!1}}function E(a){t(r,a[0])||s(p(a[0],null,!0)).init(a[1],a[2])}function I(a){var a=a.currentTarget||a.srcElement,b=i.onScriptLoad;a.detachEvent&&!Y?a.detachEvent("onreadystatechange",b):a.removeEventListener("load",b,!1);b=i.onScriptError;(!a.detachEvent||Y)&&a.removeEventListener("error",b,!1);return{node:a,id:a&&a.getAttribute("data-requiremodule")}}function J(){var a;
for(x();A.length;){a=A.shift();if(null===a[0])return w(C("mismatch","Mismatched anonymous define() module: "+a[a.length-1]));E(a)}}var W,Z,i,L,X,j={waitSeconds:7,baseUrl:"./",paths:{},bundles:{},pkgs:{},shim:{},config:{}},h={},V={},$={},A=[],r={},S={},aa={},K=1,O=1;L={require:function(a){return a.require?a.require:a.require=i.makeRequire(a.map)},exports:function(a){a.usingExports=!0;if(a.map.isDefine)return a.exports?r[a.map.id]=a.exports:a.exports=r[a.map.id]={}},module:function(a){return a.module?
a.module:a.module={id:a.map.id,uri:a.map.url,config:function(){return m(j.config,a.map.id)||{}},exports:a.exports||(a.exports={})}}};Z=function(a){this.events=m($,a.id)||{};this.map=a;this.shim=m(j.shim,a.id);this.depExports=[];this.depMaps=[];this.depMatched=[];this.pluginMaps={};this.depCount=0};Z.prototype={init:function(a,b,c,f){f=f||{};if(!this.inited){this.factory=b;if(c)this.on("error",c);else this.events.error&&(c=u(this,function(a){this.emit("error",a)}));this.depMaps=a&&a.slice(0);this.errback=
c;this.inited=!0;this.ignore=f.ignore;f.enabled||this.enabled?this.enable():this.check()}},defineDep:function(a,b){this.depMatched[a]||(this.depMatched[a]=!0,this.depCount-=1,this.depExports[a]=b)},fetch:function(){if(!this.fetched){this.fetched=!0;i.startTime=(new Date).getTime();var a=this.map;if(this.shim)i.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],u(this,function(){return a.prefix?this.callPlugin():this.load()}));else return a.prefix?this.callPlugin():this.load()}},load:function(){var a=
this.map.url;S[a]||(S[a]=!0,i.load(this.map.id,a))},check:function(){if(this.enabled&&!this.enabling){var a,b,c=this.map.id;b=this.depExports;var f=this.exports,l=this.factory;if(this.inited)if(this.error)this.emit("error",this.error);else{if(!this.defining){this.defining=!0;if(1>this.depCount&&!this.defined){if(G(l)){if(this.events.error&&this.map.isDefine||g.onError!==ca)try{f=i.execCb(c,l,b,f)}catch(d){a=d}else f=i.execCb(c,l,b,f);this.map.isDefine&&void 0===f&&((b=this.module)?f=b.exports:this.usingExports&&
(f=this.exports));if(a)return a.requireMap=this.map,a.requireModules=this.map.isDefine?[this.map.id]:null,a.requireType=this.map.isDefine?"define":"require",w(this.error=a)}else f=l;this.exports=f;if(this.map.isDefine&&!this.ignore&&(r[c]=f,g.onResourceLoad))g.onResourceLoad(i,this.map,this.depMaps);y(c);this.defined=!0}this.defining=!1;this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}else this.fetch()}},callPlugin:function(){var a=
this.map,b=a.id,d=p(a.prefix);this.depMaps.push(d);q(d,"defined",u(this,function(f){var l,d;d=m(aa,this.map.id);var e=this.map.name,P=this.map.parentMap?this.map.parentMap.name:null,n=i.makeRequire(a.parentMap,{enableBuildCallback:!0});if(this.map.unnormalized){if(f.normalize&&(e=f.normalize(e,function(a){return c(a,P,!0)})||""),f=p(a.prefix+"!"+e,this.map.parentMap),q(f,"defined",u(this,function(a){this.init([],function(){return a},null,{enabled:!0,ignore:!0})})),d=m(h,f.id)){this.depMaps.push(f);
if(this.events.error)d.on("error",u(this,function(a){this.emit("error",a)}));d.enable()}}else d?(this.map.url=i.nameToUrl(d),this.load()):(l=u(this,function(a){this.init([],function(){return a},null,{enabled:!0})}),l.error=u(this,function(a){this.inited=!0;this.error=a;a.requireModules=[b];B(h,function(a){0===a.map.id.indexOf(b+"_unnormalized")&&y(a.map.id)});w(a)}),l.fromText=u(this,function(f,c){var d=a.name,e=p(d),P=M;c&&(f=c);P&&(M=!1);s(e);t(j.config,b)&&(j.config[d]=j.config[b]);try{g.exec(f)}catch(h){return w(C("fromtexteval",
"fromText eval for "+b+" failed: "+h,h,[b]))}P&&(M=!0);this.depMaps.push(e);i.completeLoad(d);n([d],l)}),f.load(a.name,n,l,j))}));i.enable(d,this);this.pluginMaps[d.id]=d},enable:function(){V[this.map.id]=this;this.enabling=this.enabled=!0;v(this.depMaps,u(this,function(a,b){var c,f;if("string"===typeof a){a=p(a,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap);this.depMaps[b]=a;if(c=m(L,a.id)){this.depExports[b]=c(this);return}this.depCount+=1;q(a,"defined",u(this,function(a){this.undefed||
(this.defineDep(b,a),this.check())}));this.errback?q(a,"error",u(this,this.errback)):this.events.error&&q(a,"error",u(this,function(a){this.emit("error",a)}))}c=a.id;f=h[c];!t(L,c)&&(f&&!f.enabled)&&i.enable(a,this)}));B(this.pluginMaps,u(this,function(a){var b=m(h,a.id);b&&!b.enabled&&i.enable(a,this)}));this.enabling=!1;this.check()},on:function(a,b){var c=this.events[a];c||(c=this.events[a]=[]);c.push(b)},emit:function(a,b){v(this.events[a],function(a){a(b)});"error"===a&&delete this.events[a]}};
i={config:j,contextName:b,registry:h,defined:r,urlFetched:S,defQueue:A,Module:Z,makeModuleMap:p,nextTick:g.nextTick,onError:w,configure:function(a){a.baseUrl&&"/"!==a.baseUrl.charAt(a.baseUrl.length-1)&&(a.baseUrl+="/");var b=j.shim,c={paths:!0,bundles:!0,config:!0,map:!0};B(a,function(a,b){c[b]?(j[b]||(j[b]={}),U(j[b],a,!0,!0)):j[b]=a});a.bundles&&B(a.bundles,function(a,b){v(a,function(a){a!==b&&(aa[a]=b)})});a.shim&&(B(a.shim,function(a,c){H(a)&&(a={deps:a});if((a.exports||a.init)&&!a.exportsFn)a.exportsFn=
i.makeShimExports(a);b[c]=a}),j.shim=b);a.packages&&v(a.packages,function(a){var b,a="string"===typeof a?{name:a}:a;b=a.name;a.location&&(j.paths[b]=a.location);j.pkgs[b]=a.name+"/"+(a.main||"main").replace(ia,"").replace(Q,"")});B(h,function(a,b){!a.inited&&!a.map.unnormalized&&(a.map=p(b,null,!0))});if(a.deps||a.callback)i.require(a.deps||[],a.callback)},makeShimExports:function(a){return function(){var b;a.init&&(b=a.init.apply(ba,arguments));return b||a.exports&&da(a.exports)}},makeRequire:function(a,
e){function j(c,d,m){var n,q;e.enableBuildCallback&&(d&&G(d))&&(d.__requireJsBuild=!0);if("string"===typeof c){if(G(d))return w(C("requireargs","Invalid require call"),m);if(a&&t(L,c))return L[c](h[a.id]);if(g.get)return g.get(i,c,a,j);n=p(c,a,!1,!0);n=n.id;return!t(r,n)?w(C("notloaded",'Module name "'+n+'" has not been loaded yet for context: '+b+(a?"":". Use require([])"))):r[n]}J();i.nextTick(function(){J();q=s(p(null,a));q.skipMap=e.skipMap;q.init(c,d,m,{enabled:!0});D()});return j}e=e||{};U(j,
{isBrowser:z,toUrl:function(b){var d,e=b.lastIndexOf("."),k=b.split("/")[0];if(-1!==e&&(!("."===k||".."===k)||1<e))d=b.substring(e,b.length),b=b.substring(0,e);return i.nameToUrl(c(b,a&&a.id,!0),d,!0)},defined:function(b){return t(r,p(b,a,!1,!0).id)},specified:function(b){b=p(b,a,!1,!0).id;return t(r,b)||t(h,b)}});a||(j.undef=function(b){x();var c=p(b,a,!0),e=m(h,b);e.undefed=!0;d(b);delete r[b];delete S[c.url];delete $[b];T(A,function(a,c){a[0]===b&&A.splice(c,1)});e&&(e.events.defined&&($[b]=e.events),
y(b))});return j},enable:function(a){m(h,a.id)&&s(a).enable()},completeLoad:function(a){var b,c,d=m(j.shim,a)||{},g=d.exports;for(x();A.length;){c=A.shift();if(null===c[0]){c[0]=a;if(b)break;b=!0}else c[0]===a&&(b=!0);E(c)}c=m(h,a);if(!b&&!t(r,a)&&c&&!c.inited){if(j.enforceDefine&&(!g||!da(g)))return e(a)?void 0:w(C("nodefine","No define call for "+a,null,[a]));E([a,d.deps||[],d.exportsFn])}D()},nameToUrl:function(a,b,c){var d,e,h;(d=m(j.pkgs,a))&&(a=d);if(d=m(aa,a))return i.nameToUrl(d,b,c);if(g.jsExtRegExp.test(a))d=
a+(b||"");else{d=j.paths;a=a.split("/");for(e=a.length;0<e;e-=1)if(h=a.slice(0,e).join("/"),h=m(d,h)){H(h)&&(h=h[0]);a.splice(0,e,h);break}d=a.join("/");d+=b||(/^data\:|\?/.test(d)||c?"":".js");d=("/"===d.charAt(0)||d.match(/^[\w\+\.\-]+:/)?"":j.baseUrl)+d}return j.urlArgs?d+((-1===d.indexOf("?")?"?":"&")+j.urlArgs):d},load:function(a,b){g.load(i,a,b)},execCb:function(a,b,c,d){return b.apply(d,c)},onScriptLoad:function(a){if("load"===a.type||ja.test((a.currentTarget||a.srcElement).readyState))N=null,
a=I(a),i.completeLoad(a.id)},onScriptError:function(a){var b=I(a);if(!e(b.id))return w(C("scripterror","Script error for: "+b.id,a,[b.id]))}};i.require=i.makeRequire();return i}var g,x,y,D,I,E,N,J,s,O,ka=/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,la=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,Q=/\.js$/,ia=/^\.\//;x=Object.prototype;var K=x.toString,fa=x.hasOwnProperty,ha=Array.prototype.splice,z=!!("undefined"!==typeof window&&"undefined"!==typeof navigator&&window.document),ea=!z&&"undefined"!==
typeof importScripts,ja=z&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,Y="undefined"!==typeof opera&&"[object Opera]"===opera.toString(),F={},q={},R=[],M=!1;if("undefined"===typeof define){if("undefined"!==typeof requirejs){if(G(requirejs))return;q=requirejs;requirejs=void 0}"undefined"!==typeof require&&!G(require)&&(q=require,require=void 0);g=requirejs=function(b,c,d,e){var n,p="_";!H(b)&&"string"!==typeof b&&(n=b,H(c)?(b=c,c=d,d=e):b=[]);n&&n.context&&(p=n.context);
(e=m(F,p))||(e=F[p]=g.s.newContext(p));n&&e.configure(n);return e.require(b,c,d)};g.config=function(b){return g(b)};g.nextTick="undefined"!==typeof setTimeout?function(b){setTimeout(b,4)}:function(b){b()};require||(require=g);g.version="2.1.18";g.jsExtRegExp=/^\/|:|\?|\.js$/;g.isBrowser=z;x=g.s={contexts:F,newContext:ga};g({});v(["toUrl","undef","defined","specified"],function(b){g[b]=function(){var c=F._;return c.require[b].apply(c,arguments)}});if(z&&(y=x.head=document.getElementsByTagName("head")[0],
D=document.getElementsByTagName("base")[0]))y=x.head=D.parentNode;g.onError=ca;g.createNode=function(b){var c=b.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script");c.type=b.scriptType||"text/javascript";c.charset="utf-8";c.async=!0;return c};g.load=function(b,c,d){var e=b&&b.config||{};if(z)return e=g.createNode(e,c,d),e.setAttribute("data-requirecontext",b.contextName),e.setAttribute("data-requiremodule",c),e.attachEvent&&!(e.attachEvent.toString&&
0>e.attachEvent.toString().indexOf("[native code"))&&!Y?(M=!0,e.attachEvent("onreadystatechange",b.onScriptLoad)):(e.addEventListener("load",b.onScriptLoad,!1),e.addEventListener("error",b.onScriptError,!1)),e.src=d,J=e,D?y.insertBefore(e,D):y.appendChild(e),J=null,e;if(ea)try{importScripts(d),b.completeLoad(c)}catch(m){b.onError(C("importscripts","importScripts failed for "+c+" at "+d,m,[c]))}};z&&!q.skipDataMain&&T(document.getElementsByTagName("script"),function(b){y||(y=b.parentNode);if(I=b.getAttribute("data-main"))return s=
I,q.baseUrl||(E=s.split("/"),s=E.pop(),O=E.length?E.join("/")+"/":"./",q.baseUrl=O),s=s.replace(Q,""),g.jsExtRegExp.test(s)&&(s=I),q.deps=q.deps?q.deps.concat(s):[s],!0});define=function(b,c,d){var e,g;"string"!==typeof b&&(d=c,c=b,b=null);H(c)||(d=c,c=null);!c&&G(d)&&(c=[],d.length&&(d.toString().replace(ka,"").replace(la,function(b,d){c.push(d)}),c=(1===d.length?["require"]:["require","exports","module"]).concat(c)));if(M){if(!(e=J))N&&"interactive"===N.readyState||T(document.getElementsByTagName("script"),
function(b){if("interactive"===b.readyState)return N=b}),e=N;e&&(b||(b=e.getAttribute("data-requiremodule")),g=F[e.getAttribute("data-requirecontext")])}(g?g.defQueue:R).push([b,c,d])};define.amd={jQuery:!0};g.exec=function(b){return eval(b)};g(q)}})(this);
;/* global $, window */
/* exported RoleRevisit */
var RoleRevisit = function RoleRevisit() {
    'use strict';
    //global vars
    var roleRevisit = {};
    roleRevisit.options = {
        nodeType:'Alter',
        edgeType:'Dyad',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading'
    };

    var nodeBoxOpen = false;
    var editing = false;

    var roles = {
        'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
        'Family / Relative': ['Parent / Guardian','Brother / Sister','Grandparent','Other Family','Chosen Family'],
        'Romantic / Sexual Partner': ['Boyfriend / Girlfriend','Ex-Boyfriend / Ex-Girlfriend','Booty Call / Fuck Buddy / Hook Up','One Night Stand','Other type of Partner'],
        'Acquaintance / Associate': ['Coworker / Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
        'Other Support / Source of Advice': ['Teacher / Professor','Counselor / Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
        'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
        'Other': ['Other relationship']
    };

    var roleClickHandler = function() {

        if ($(this).data('selected') === true) {
            $(this).data('selected', false);
            $(this).removeClass('selected');

        } else {
            $(this).data('selected', true);
            $(this).addClass('selected');
        }

    };

    var stageChangeHandler = function() {
        roleRevisit.destroy();
    };

    var cardClickHandler = function() {
        // console.log('card click');
        // console.log(e);

        var index = $(this).data('index');
        // console.log(index);
        // Set the value of editing to the node id of the current person
        editing = index;

        // Update role count
        var roleCount = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('div[data-index="'+index+'"]').children().children('.role-count').html(roleCount+' roles selected.');

        // Mark the existing roles as selected
        var roleEdges = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'});
        $.each(roleEdges, function(index, value) {
             $('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected').data('selected', true);
        });

        // Once the box is opened, delete all the Role edges. Simpler than adding removal logic.
        window.network.removeEdges(window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}));
        roleRevisit.openNodeBox();

    };

    var submitFormHandler = function() {
        var el = $('div[data-index='+editing+']');
        el.stop().transition({background:'#1ECD97'}, 400, 'ease');
        $.each($('.relationship.selected'), function() {
             var edgeProperties = {
                type: 'Role',
                from:window.network.getNodes({type_t0:'Ego'})[0].id,
                to: editing,
                reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
                reltype_sub_t0: $(this).data('sub-relationship')
              };
            window.network.addEdge(edgeProperties);
        });

        // Deselect all relationships
        $('.relationship').removeClass('selected');
        var roleCount = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
        $('div[data-index="'+editing+'"]').children().children('.role-count').html(roleCount+' roles selected.');
        roleRevisit.closeNodeBox();
    };

    roleRevisit.openNodeBox = function() {
        $('.content').addClass('blurry');
        $('.relationship-types-container').addClass('open');
        nodeBoxOpen = true;
    };

    roleRevisit.closeNodeBox = function() {
        $('.content').removeClass('blurry');
        // $('.newNodeBox').transition({scale:0.1,opacity:0},500);
        $('.relationship-types-container').removeClass('open');
        setTimeout(function() {

        });
        nodeBoxOpen = false;
    };

	roleRevisit.addToList = function(properties) {
		// var index = $(this).data('index');
		var card;

		card = $('<div class="card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div>');
		var list = $('<ul></ul>');

        list.append('<li class="'+properties.fname_t0+'"><strong>First Name</strong>: '+properties.fname_t0+'</li>');
        list.append('<li class="'+properties.lname_t0+'"><strong>Last Name</strong>: '+properties.lname_t0+'</li>');

        var roles = window.network.getEdges({from:window.network.getNodes({type_t0:'Ego'})[0].id, to: properties.to, type:'Role'});
        var roleString = '';
        $.each(roles, function(index, value) {
            roleString += ' '+value.reltype_sub_t0+',';
        });

        // cut off the last comma
        roleString = roleString.substring(0, roleString.length - 1);

        list.append('<li><strong>Roles</strong>: '+roleString+'</li>');

		card.append(list);

		$('.nameList').append(card);

	};

    roleRevisit.destroy = function() {
        window.tools.notify('Destroying roleRevisit.',0);
        // Event listeners
        $(window.document).off('click', '.card', cardClickHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.relationship-types-container').remove();
        $(window.document).off('click', '.relationship', roleClickHandler);
        $(window.document).off('click', '.relationship-close-button', roleRevisit.toggleRelationshipBox);
    };

    roleRevisit.init = function(options) {
        window.tools.extend(roleRevisit.options, options);
        // create elements
        var title = $('<h1 class="text-center"></h1>').html(roleRevisit.options.heading);
        roleRevisit.options.targetEl.append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(roleRevisit.options.subheading);
        roleRevisit.options.targetEl.append(subtitle);


        // relationship types
        var roleBox = $('<div class="relationship-types-container"><button class="btn btn-primary relationship-close-button">Close</button></div>');
        $('body').append(roleBox);
        var counter = 0;
        $.each(roles, function(index) {
            $('.relationship-types-container').append('<div class="relationship-type rel-'+counter+' c'+counter+'" data-main-relationship="'+counter+'"><h1>'+index+'</h1></div>');
            $.each(roles[index], function(relIndex, relValue) {
                $('.rel-'+counter).append('<div class="relationship" data-sub-relationship="'+relValue+'">'+relValue+'</div>');
            });
            counter++;
        });

        var nodeContainer = $('<div class="node-container"></div>');
        roleRevisit.options.targetEl.append(nodeContainer);

        // create namelist container
        var nameList = $('<div class="table nameList"></div>');
        $('.node-container').append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('click', '.card', cardClickHandler);
        $(window.document).on('click', '.relationship', roleClickHandler);
        $(window.document).on('click', '.relationship-close-button', submitFormHandler);

        // Set node count box
    };

    return roleRevisit;
};

module.exports = new RoleRevisit();
;/* global $, window, Odometer, document, note  */
/* exported ServiceGenerator */
module.exports = function ServiceGenerator() {
    'use strict';
    //global vars
    var serviceGenerator = {};
    serviceGenerator.options = {
        nodeType:'HIVService',
        edgeType:'HIVService',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
    };

    var nodeBoxOpen = false;
    var editing = false;
    var newNodePanel;
    var venueCounter;

    var venueCount = window.network.getEdges({type: 'HIVService', visited: true}).length;

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                serviceGenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            serviceGenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var stageChangeHandler = function() {
        serviceGenerator.destroy();
    };

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getEgo().id, to: index, type:'HIVService'})[0];
        var node = window.network.getNode(edge.to);

        // Set the value of editing to the node id of the current person
        editing = index;

        // Populate the form with this nodes data.
        $.each(serviceGenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'dropdown') {
                    $('.selectpicker').selectpicker('val', edge[value.variable]);
                } else if (value.type === 'scale') {
                    $('input:radio[name="'+value.variable+'"][value="'+edge[value.variable]+'"]').prop('checked', true).trigger('change');
                } else {
                    if (value.target === 'node') {
                        $('#'+value.variable).val(node[value.variable]);
                    } else {
                        $('#'+value.variable).val(edge[value.variable]);
                    }

                }

                $('.delete-button').show();

                if (edge.elicited_previously === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                } else {
                    $('input#age_p_t0').prop( 'disabled', false);
                }
                serviceGenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        serviceGenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');

        e.preventDefault();

        var data = $(this).serializeArray();
          var cleanData = {};
          for (var i = 0; i < data.length; i++) {

            // To handle checkboxes, we check if the key already exists first. If it
            // does, we append new values to an array. This keeps compatibility with
            // single form fields, but might need revising.

            // Handle checkbox values
            if (data[i].value === 'on') { data[i].value = 1; }

            // This code takes the serialised output and puts it in the structured required to store within noded/edges.
            if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] !== 'object') {
              // if it isn't an object, its a string. Create an empty array and store by itself.
              cleanData[data[i].name] = [cleanData[data[i].name]];
              cleanData[data[i].name].push(data[i].value);
            } else if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] === 'object'){
              // Its already an object, so append our new item
              cleanData[data[i].name].push(data[i].value);
            } else {
              // This is for regular text fields. Simple store the key value pair.
              cleanData[data[i].name] = data[i].value;
            }

          }


        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(serviceGenerator.options.variables, function(index,value) {

            if(value.target === 'edge') {
                if (value.private === true) {
                    newEdgeProperties[value.variable] = value.value;
                } else {
                    newEdgeProperties[value.variable] = cleanData[value.variable];
                }

            } else if (value.target === 'node') {
                if (value.private === true) {
                    newNodeProperties[value.variable] = value.value;
                } else {
                    newNodeProperties[value.variable] = cleanData[value.variable];
                }
            }
        });

        if (editing === false) {
            note.info('// We are submitting a new node');
            var newNode = window.network.addNode(newNodeProperties);

            var edgeProperties = {
                from: window.network.getEgo().id,
                to: newNode,
                type:serviceGenerator.options.edgeTypes[0]
            };

            window.tools.extend(edgeProperties,newEdgeProperties);
            window.network.addEdge(edgeProperties);
            serviceGenerator.addToList(edgeProperties);
            venueCount++;
            venueCounter.update(venueCount);

        } else {
            note.info('// We are updating a node');

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css('background-color');
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;

            var edges = window.network.getEdges({from:window.network.getEgo().id,to:nodeID,type:serviceGenerator.options.edgeTypes[0]});
            $.each(edges, function(index,value) {
                window.network.updateEdge(value.id,newEdgeProperties, color);
            });

            window.network.updateNode(nodeID, newNodeProperties);

            // update relationship roles

            $('div[data-index='+editing+']').html('');
            var node = window.network.getNode(nodeID);
            $('div[data-index='+editing+']').append('<h4>'+node.name+'</h4>');

            venueCount = window.network.getEdges({type: 'HIVService', visited: true}).length;
            venueCounter.update(venueCount);
            editing = false;

        }

        serviceGenerator.closeNodeBox();

    };

    serviceGenerator.openNodeBox = function() {
        $('.newVenueBox').height($('.newVenueBox').height());
        $('.newVenueBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    serviceGenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newVenueBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
    };

    serviceGenerator.destroy = function() {
        note.debug('Destroying serviceGenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', serviceGenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', serviceGenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newVenueBox').remove();

    };

    serviceGenerator.init = function(options) {
        window.tools.extend(serviceGenerator.options, options);
        // $.extend(true, serviceGenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-map-pin add-button"></span>');
        serviceGenerator.options.targetEl.append(button);
        var venueCountBox = $('<div class="alter-count-box"></div>');
        serviceGenerator.options.targetEl.append(venueCountBox);

        // create node box
        var newVenueBox = $('<div class="newVenueBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-map-pin"></span> Adding a Service Provider</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // serviceGenerator.options.targetEl.append(newVenueBox);
        $('body').append(newVenueBox);
        $.each(serviceGenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'autocomplete':
                    formItem = $('<div class="form-group ui-widget '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'dropdown':

                    formItem = $('<div class="form-group '+value.variable+'" style="position:relative; z-index:9"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');
                    var select = $('<select class="selectpicker" name="'+value.variable+'" />');
                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<option/>').val(optionValue.value).text(optionValue.label).appendTo(select);
                    });

                    select.appendTo(formItem);

                    break;

                    case 'scale':
                    formItem = $('<div class="form-group '+value.variable+'"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');

                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<div class="btn-group big-check" data-toggle="buttons"><label class="btn"><input type="radio" name="'+value.variable+'" value="'+optionValue.value+'"><i class="fa fa-circle-o fa-3x"></i><i class="fa fa-check-circle-o fa-3x"></i> <span class="check-number">'+optionValue.label+'</span></label></div>').appendTo(formItem);
                    });

                    break;

                }

                $('.newVenueBox .form .fields').append(formItem);
                if (value.required === true) {
                    $('#'+value.variable).prop('required', true);
                }

                $('.selectpicker').selectpicker({
                    style: 'btn-info',
                    size: 4
                });

                $('#name').autocomplete({
                    /*jshint -W109 */
                    source: [
                        "About My Health",
                        "Access - Anixter",
                        "Access - Ashland Family Health Center",
                        "Access - Auburn-Gresham Family Health Center",
                        "Access - Booker Family Health Center",
                        "Access - Brandon Family Health Center",
                        "Access - Cabrini Family Health Center",
                        "Access - Centro Medico San Rafael",
                        "Access - Centro Medico",
                        "Access - Doctors Medical Center",
                        "Access - Evanston-Rogers Park Family Health Center",
                        "Access - Gary Comer Youth Center",
                        "Access - Grand Boulevard",
                        "Access - Humboldt Park Family Health Center",
                        "Access - Illinois Eye Institute",
                        "Access - Kedzie Family Health Center",
                        "Access - La Villita",
                        "Access - Madison Family Health Center",
                        "Access - Perspectives Charter School - Calumet",
                        "Access - Pilsen Family Health Center",
                        "Access - Plaza Family Health Center",
                        "Access - Saint Francis",
                        "Access - Sinai",
                        "Access - Southwest Family Health Center",
                        "Access - Warren Family",
                        "Access - Westside Family Health Center",
                        "Advocate Bethany Hospital",
                        "Advocate Illinois Masonic Medical Center",
                        "Advocate Trinity Hospital",
                        "Advocate-Sykes Health Center",
                        "AIDS Foundation of Chicago",
                        "Alexian Brothers Housing and Health Alliance Bonaventure House",
                        "Alivio Medical Center - John Spry Community School",
                        "Alivio Medical Center - Jose Clemente Orozco Academy",
                        "Alivio Medical Center - Little Village Lawndale High School Campus",
                        "Alivio Medical Center - Morgan",
                        "Alivio Medical Center - Western",
                        "Alternatives, Inc.",
                        "American Indian Health Service",
                        "Asian Health Coalition",
                        "Asian Human Services Family Health Center",
                        "Asian Human Services",
                        "Austin Health Center",
                        "Austin People's Action Center",
                        "Austin STI Clinic (CDPH)",
                        "Beloved Community Family Wellness Center",
                        "Broadway Youth Center (BYC)",
                        "Brothers Health Collective - 59th St.",
                        "Brothers Health Collective - 63rd St.",
                        "Brothers Health Collective - Archer Ave.",
                        "CALOR - Anixter Center",
                        "Caritas Central Intake",
                        "Center on Halsted (COH)",
                        "Cermak Health Services",
                        "Chicago Black Gay Men's Caucus (CBGMC)",
                        "Chicago Family Health Center - Chicago Lawn",
                        "Chicago Family Health Center - East Side",
                        "Chicago Family Health Center - Pullman",
                        "Chicago Family Health Center - Roseland",
                        "Chicago Family Health Center - South Chicago",
                        "Chicago House and Social Services Agency",
                        "Chicago Lakeshore Hospital",
                        "Chicago Read Mental Health Center",
                        "Chicago Recovery Alliance",
                        "Chicago Womens AIDS Project - North Office",
                        "Chicago Womens AIDS Project - South Office",
                        "Chicago Women's Health Center (CWHC)",
                        "Childrens Place Association",
                        "Christian Community Health Center",
                        "Circle Family Healthcare Network - Parkside",
                        "Circle Family Healthcare Network - Division",
                        "Columbia College Film Row Cinema Building",
                        "Columbia College Health Center",
                        "Community Supportive Living Systems",
                        "CommunityHealth - Englewood",
                        "CommunityHealth - West Town",
                        "Cook County - Children’s Advocacy Center",
                        "Cook County - Englewood Health Center",
                        "Cook County - Fantus Health Center",
                        "Cook County - John Sengstacke Health Center",
                        "Cook County - Logan Square Health Center",
                        "Cook County - Near South Health Center",
                        "Cottage View Health Center",
                        "DePaul University Office of Health Promotion and Wellness",
                        "Dr. Jorge Prieto Family Health Center",
                        "El Rincon Community Clinic - Rafael Paloma Rios Center",
                        "Englewood HIV/STI Clinic (CDPH)",
                        "Erie - Division Street Health Center",
                        "Erie - Foster Avenue Health Center",
                        "Erie - Helping Hands Health Center",
                        "Erie - Humbolt Park Health Center",
                        "Erie - Johnson School",
                        "Erie - L Ward",
                        "Erie - Teen Health Center",
                        "Erie - West Town Health Center",
                        "Esperanza Health Center - California",
                        "Esperanza Health Center - Little Village",
                        "Esperanza Health Center - Marquette",
                        "FOLA Community Action Services",
                        "Franciscan Outreach Association",
                        "Friend Family Health Center - Ashland",
                        "Friend Family Health Center - Beethoven",
                        "Friend Family Health Center - Cottage Grove",
                        "Friend Family Health Center - Pulaski",
                        "Friend Family Health Center - Western",
                        "Gift House",
                        "Harold Washington College Wellness Center",
                        "Harry S Truman College Wellness Center",
                        "Hartgrove Hospital",
                        "Haymarket Center",
                        "Heartland - Health Care for the Homeless",
                        "Heartland - Human Care Services",
                        "Heartland - Vital Bridges Center on Chronic Care",
                        "Heartland Health Center - Hibbard Elementary School",
                        "Heartland Health Center - Lincoln Square",
                        "Heartland Health Center - Rogers Park",
                        "Heartland Health Center - Senn High School",
                        "Heartland Health Center - Wilson",
                        "Heartland Health Outreach - Refugee Health",
                        "Holy Cross Hospital",
                        "Howard Area Community Center",
                        "Howard Brown - 63rd Street",
                        "Howard Brown - Broadway",
                        "Howard Brown - Clark",
                        "Howard Brown - Halsted (Aris Health)",
                        "Howard Brown - Sheridan",
                        "IIT Wellness Center - Downtown Campus",
                        "IIT Wellness Center - Main Campus",
                        "IMAN Health Clinic",
                        "Interfaith House",
                        "Jackson Park Hospital",
                        "Jesse Brown Medical Center",
                        "Kennedy-King College Wellness Center",
                        "Kindred Hospital - Chicago Central",
                        "Kindred Hospital - Chicago Lakeshore",
                        "Kindred Hospital - Chicago North",
                        "Komed Holman Health Center",
                        "La Rabida Children's Hospital",
                        "Lakeview STI Clinic (CDPH)",
                        "Lawndale Christian Health Center - Archer Avenue",
                        "Lawndale Christian Health Center - Farragut Academy",
                        "Lawndale Christian Health Center - Homan Square",
                        "Lawndale Christian Health Center - Ogden Campus",
                        "Le Penseur Youth and Family Services",
                        "Loretto Hospital",
                        "Loyola Wellness Center Lakeshore Campus",
                        "Loyola Wellness Center Water Tower Campus",
                        "Lurie Center for Gender, Sexuality, & HIV Prevention",
                        "Lurie Pediatric and Adolescent HIV Program",
                        "Making A Daily Effort (MADE)",
                        "Malcolm X College Wellness Center",
                        "Mercy Hospital and Medical Center",
                        "Methodist Hospital of Chicago",
                        "Midwest Asian Health Association",
                        "Moody Bible Institute Health Service",
                        "Mount Sinai Hospital & Medical Center",
                        "Near North - Denny Community Health Center",
                        "Near North - Kostner Health Center",
                        "Near North - Louise Landau Health Center",
                        "Night Ministry",
                        "North Park University Health Services Office",
                        "Northeastern Illinois University Student Health Services (NEIU)",
                        "Northstar Medical Center",
                        "Northwestern Memorial Hospital",
                        "Northwestern University - Feinberg School of Medicine",
                        "Norwegian American Hospital",
                        "Olive-Harvey College Wellness Center",
                        "Our Lady of Resurrection Medical Center",
                        "PCC Austin Family Health Center",
                        "PCC Salud Family Health Center",
                        "PCC West Town Family Health Center",
                        "People Organizing Progress (POP) at The Village",
                        "Phoenix Medical Associates",
                        "Pilsen Wellness Center",
                        "Planned Parenthood - Austin",
                        "Planned Parenthood - Englewood",
                        "Planned Parenthood - Loop",
                        "Planned Parenthood - Near North",
                        "Planned Parenthood - Rogers Park",
                        "Planned Parenthood - Roseland",
                        "Planned Parenthood - Wicker Park",
                        "Port Ministries Free Clinic",
                        "PRCC - Generation L/L-Act Prevention Program",
                        "PRCC - Integrated PASEO - Garfield Center",
                        "PRCC - Integrated PASEO - UIC",
                        "PRCC - Vida/SIDA",
                        "PRCC - Women for PASEO",
                        "PrimeCare Ames",
                        "PrimeCare Fullerton",
                        "PrimeCare Northwest",
                        "PrimeCare Portage Park",
                        "PrimeCare West Town",
                        "Project Vida - 26th St.",
                        "Project Vida - Kedvale Ave.",
                        "Prologue",
                        "Provident Hospital of Cook County",
                        "Reavis School-Based Health Center",
                        "Rehabilitation Institute of Chicago",
                        "Resurrection Medical Center",
                        "Richard J. Daley College Wellness Center",
                        "Roseland Community Hospital",
                        "Roseland STI Clinic (CDPH)",
                        "Rush University Medical Center",
                        "Ruth M Rothstein CORE Center",
                        "Sacred Heart Hospital",
                        "Saint Xavier University Health Center (SXU)",
                        "School of the Art Institute of Chicago Health Services (SAIC)",
                        "Schwab Rehabilitation Hospital",
                        "Shriners Hospital for Children",
                        "South Shore Hospital HIV/AIDS Clinic",
                        "South Shore Hospital",
                        "South Side Help Center",
                        "Southeast Side Community Health Center (Aunt Martha's)",
                        "St. Anthony Hospital",
                        "St. Bernard Hospital",
                        "St. Joseph Hospital",
                        "St. Mary and Elizabeth Medical Center",
                        "Stroger Hospital",
                        "Swedish Covenant Hospital",
                        "Taskforce Prevention & Community Services",
                        "TCA Health, Inc",
                        "Test Positive Aware Network (TPAN)",
                        "Thorek Hospital and Medical Center",
                        "TransLife Center (TLC)",
                        "UIC COIP/UCCN - New Age Services (NAS)",
                        "UIC COIP/UCCN - Northside",
                        "UIC COIP/UCCN - Northwestside",
                        "UIC COIP/UCCN - Southeastside",
                        "UIC COIP/UCCN - Southside",
                        "UIC COIP/UCCN - Westside",
                        "UIC Family Medicine Center at University Village",
                        "UIC Mile Square Health Center - Back of the Yards",
                        "UIC Mile Square Health Center - Main Location",
                        "UIC Mile Square Health Center - North Clinic",
                        "UIC Mile Square Health Center - South Clinic - New City",
                        "UIC Mile Square Health Center - South Shore",
                        "Universal Family Connection",
                        "University of Chicago - Medical Center",
                        "University of Chicago Care2Prevent (C2P) - Hospital Location",
                        "University of Chicago Care2Prevent (C2P) - Youth Center",
                        "University of Chicago Center for HIV Elimination (CCHE)",
                        "University of Chicago Office of LGBTQ Student Life",
                        "University of Chicago Student Health Service",
                        "University of Illinois at Chicago (UIC) - College of Medicine",
                        "University of Illinois at Chicago (UIC) - Outpatient Care Center",
                        "University of Illinois at Chicago Student Wellness Center (UIC)",
                        "University of Illinois Hospital (U of I)",
                        "Uptown Community Health Center",
                        "Uptown HIV Clinic (CDPH)",
                        "Weiss Memorial Hospital",
                        "West Town STI Clinic (CDPH)",
                        "Wilbur Wright College Wellness Center",
                        "Winfield Moody Health Center",
                        "Woodlawn Health Center"
                    ]
                    /*jshint +W109 */
                });

            }

        });

        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newVenueBox .form .fields').append(buttons);

        newNodePanel = $('.newVenueBox').html();

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        serviceGenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(serviceGenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(serviceGenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        serviceGenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', serviceGenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', serviceGenerator.removeFromList);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);

        // Set node count box
        var el = document.querySelector('.alter-count-box');

        venueCounter = new Odometer({
            el: el,
            value: venueCount,
            format: 'dd',
            theme: 'default'
        });

        // add existing nodes
        var edges = window.network.getEdges({type: 'HIVService', from: window.network.getEgo().id, sg_t0:serviceGenerator.options.variables[0].value});
        $.each(edges, function(index,value) {

            serviceGenerator.addToList(value);
        });

        // Handle side panels
        if (serviceGenerator.options.panels.length > 0) {
            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (serviceGenerator.options.panels.indexOf('current') !== -1) {
                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>Service providers you already mentioned visiting:</h4></div>'));
                $('.nameList').addClass('alt');
                $.each(window.network.getEdges({type: 'HIVService', from: window.network.getEgo().id, visited: true}), function(index,value) {
                    if (!value.sg_t0) {
                        var node = window.network.getNode(value.to);
                        var el = $('<div class="node-list-item">'+node.name+'</div>');
                        sideContainer.children('.current-node-list').append(el);
                    }
                });
            }

            serviceGenerator.options.targetEl.append(sideContainer);

        } // end if panels
    };

    serviceGenerator.addToList = function(properties) {
        note.debug('serviceGenerator.addToList');
        note.trace(properties);
        // var index = $(this).data('index');
        var card;
        var node = window.network.getNode(properties.to);
        card = $('<div class="card"><div class="inner-card" data-index="'+properties.to+'"><h4>'+node.name+'</h4></div></div>');
        $('.nameList').append(card);

    };

    serviceGenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var venueCount = window.network.getEdges({type: 'HIVService', visited: true}).length;
        venueCounter.update(venueCount);

        serviceGenerator.closeNodeBox();
    };

    return serviceGenerator;
};
;/* global document, window, $, protocol, nodeRequire, note */
/* exported Session, eventLog */
var Session = function Session() {
    'use strict';
    //window vars
    var session = {};
    var currentStage = 0;
    var content = $('#content');
    var key = 'N3"u6tH@2wH9UM205niU=45J7y<(3=OC{2<:Lb+KqD2HG9!f6{VVL#&2/Mt+lV3';
    session.id = 0;
    var navigationDisabled = false;
    var allowedStages = [0]; //We can always go back to the intro screen;
    session.sessionData = {};
    var lastSaveTime, saveTimer;

    function saveFile(path) {
        if (window.isNodeWebkit) {
            var data = JSON.stringify(session.sessionData, undefined, 2);
            var fs = nodeRequire('fs');
            fs.writeFile(path, data);
        } else {
            note.warn('saveFile() is not yet implemented on this platform!');
        }

    }

    function clickDownloadInput() {
        $('#save').prop('nwsaveas', session.returnSessionID()+'_'+Math.floor(Date.now() / 1000)+'.json');
        var event = window.document.createEvent('MouseEvents');
        event.initMouseEvent('click');
        window.document.getElementById('save').dispatchEvent(event);
    }

    // custom events
    session.options = {
        fnBeforeStageChange : function(oldStage, newStage) {
            var eventProperties = {
                stage: currentStage,
                timestamp: new Date()
            };
            var log = new window.CustomEvent('log', {'detail':{'eventType': 'stageCompleted', 'eventObject':eventProperties}});
            window.dispatchEvent(log);

            var changeStageStartEvent = new window.CustomEvent('changeStageStart', {'detail':{oldStage: oldStage, newStage: newStage}});
            window.dispatchEvent(changeStageStartEvent);

        },
        fnAfterStageChange : function(oldStage, newStage) {
            session.sessionData.sessionParameters.stage = newStage;
            var changeStageEndEvent = new window.CustomEvent('changeStageEnd', {'detail':{oldStage: oldStage, newStage: newStage}});
            window.dispatchEvent(changeStageEndEvent);
            if ((currentStage+1) === session.stages.length) {
                $('.arrow-next').hide();
            } else if (currentStage === 0) {
                $('.arrow-prev').hide();
            } else {
                $('.arrow-next').show();
                $('.arrow-prev').show();
            }
        }
    };

    session.loadProtocol = function() {

        // Require the session protocol file.
        // var studyPath = path.normalize('../protocols/'+window.studyProtocol+'/protocol.js');
        $.getScript( 'protocols/'+window.netCanvas.studyProtocol+'/protocol.js', function() {
            window.protocolPath = 'protocols/'+window.netCanvas.studyProtocol+'/';
            // protocol.js files declare a protocol variable, which is what we use here.
            // It is implicitly loaded as part of the getScript callback
            var study = protocol;

            session.parameters = session.registerData('sessionParameters');
            session.updateSessionData({sessionParameters:study.sessionParameters});
            // copy the stages
            session.stages = study.stages;
            session.protocolData = study.data;

            // insert the stylesheet
            $('head').append('<link rel="stylesheet" href="protocols/'+window.netCanvas.studyProtocol+'/css/style.css" type="text/css" />');

            // copy the skip functions
            session.skipFunctions = study.skipFunctions;

            // set the study name (used for database name)
            if (study.sessionParameters.name) {
                session.name = study.sessionParameters.name;
            } else {
                note.error('Study protocol must have key "name" under sessionParameters.');
            }


            // Check for an in-progress session
            window.dataStore.init(function(sessionid) {
                session.id = sessionid;
                window.dataStore.load(function(data) {

                    session.updateSessionData(data, function() {
                        // Only load the network into the model if there is a network to load
                        if(session.sessionData.nodes && session.sessionData.edges) {
                            window.network.loadNetwork({nodes:session.sessionData.nodes,edges:session.sessionData.edges});
                        }

                        if (typeof session.sessionData.sessionParameters.stage !== 'undefined') {
                            session.goToStage(session.sessionData.sessionParameters.stage);
                        } else {
                            session.goToStage(0);
                        }
                    });
                }, session.id);
            });

            // Initialise the menu system – other modules depend on it being there.
            var stagesMenu = window.menu.addMenu('Stages', 'bars');
            $.each(session.stages, function(index,value) {
                var icon = null;
                if (value.icon) {
                    icon = value.icon;
                }
                window.menu.addItem(stagesMenu, value.label, icon, function() {setTimeout(function() {session.goToStage(index);}, 500); });
            });
        }).fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ', ' + error;
            note.error('Error fetching protocol!');
            note.trace(err);
        });

    };

    session.nextHandler = function() {
        session.nextStage();
    };

    session.previousHandler = function() {
        var visitNumber = window.network.getEgo().visit_number;
        if (currentStage === 2 && visitNumber > 1) {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_DANGER,
                // size: BootstrapDialog.SIZE_LARGE,
                title: '',
                message: '<h3>WARNING!</h3> <p>Going backwards from this step will take you to the initial screen. Changing the RADAR ID or visit number on this screen may require you to reset the session, thereby deleting all current data.</p><h4>Continue?</h4>',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(dialogItself){
                        session.prevStage();
                        dialogItself.close();
                    }
                }, {
                    label: 'Cancel',
                    cssClass: 'btn-modal-danger',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        } else {
            session.prevStage();
        }

    };

    session.init = function(callback) {
        note.debug('Session initialising.');
        window.test = setInterval(function(){
            note.debug('checking for data duplication bug...');
            if (window.network.getNodes({id:0}).length > 1) {
                clearInterval(window.test);
                window.BootstrapDialog.show({
                    type: window.BootstrapDialog.TYPE_DANGER,
                    // size: BootstrapDialog.SIZE_LARGE,
                    title: '',
                    message: '<h3>Data Duplication Bug Encountered</h3> <p><strong>IMPORTANT:</strong> You have encountered a known issue with netCanvas whereby interview data has been accidentally duplicated. </p><p><strong>Please note down now exactly what was happening before you saw this message</strong>, and pass this information on at the next team meeting.</p><p>When you are finished, click "Repair Data" to continue with the interview.',
                    buttons: [{
                        label: 'Repair Data',
                        cssClass: 'btn-modal-success',
                        action: function(){
                            window.network.deduplicate();
                            if(window.isNodeWebkit) {
                                var _window = window.gui.Window.get();
                                _window.reloadDev();
                            } else if (window.isCordova) {
                                window.location.reload();
                            } else {
                                window.location.reload();
                            }
                        }
                    }]
                });
            }
        }, 2000);

        // Navigation arrows.
        $('.arrow-next').on('click', window.netCanvas.Modules.session.nextHandler);

        $('.arrow-prev').on('click', window.netCanvas.Modules.session.previousHandler);

        //bind to the custom state change event to handle spinner interactions
        window.addEventListener('changeStageStart', function () {
            $('.loader').transition({opacity:1});
        }, false);

        window.addEventListener('changeStageEnd', function () {
            $('.loader').transition({opacity:0});
        }, false);

        window.document.getElementById('save').addEventListener('change', function () {
            saveFile(this.value);
        });

        // Build a new network
        window.network = new window.netCanvas.Modules.Network();

        window.addEventListener('unsavedChanges', function () {
            session.saveManager();
        }, false);

        var sessionMenu = window.menu.addMenu('Session','cogs');
        window.menu.addItem(sessionMenu, 'Reset Session', 'fa-undo', function() {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_DANGER,
                // size: BootstrapDialog.SIZE_LARGE,
                title: '',
                message: '<h3>Are you sure you want to reset the session?</h3> <p><strong>IMPORTANT:</strong> This will delete all data.',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(){
                        window.dataStore.deleteDocument(session.reset);
                    }
                }, {
                    label: 'Cancel',
                    cssClass: 'btn-modal-danger',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        });

        window.menu.addItem(sessionMenu, 'Download Data', 'fa-download', function() { clickDownloadInput(); });

        window.menu.addItem(sessionMenu, 'Purge Database', 'fa-trash', function() {
            window.BootstrapDialog.show({
                type: window.BootstrapDialog.TYPE_DANGER,
                // size: BootstrapDialog.SIZE_LARGE,
                title: '',
                message: '<h3>Are you sure you want to purge the database?</h3><p><strong>IMPORTANT:</strong> This will delete all data.',
                buttons: [{
                    label: 'Continue',
                    cssClass: 'btn-modal-success',
                    action: function(){
                        window.dataStore.reset(session.reset);
                    }
                }, {
                    label: ' Cancel',
                    cssClass: 'btn-modal-danger',
                    action: function(dialogItself){
                        dialogItself.close();
                    }
                }]
            });
        });

        window.menu.addItem(sessionMenu, 'Quit Network Canvas', 'fa-sign-out', function() { window.close(); });

        if(callback) {
            callback();
        }

    };

    session.getPrimaryNetwork = function() {
        return window.network;
    };

    session.downloadData = function() {
        var filename = session.returnSessionID()+'.json';
        var text = JSON.stringify(session.sessionData, undefined, 2); // indentation level = 2;
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);
        pom.click();
    };

    session.reset = function() {
        note.info('Resetting session.');
        session.id = 0;
        session.currentStage = 0;
        window.netCanvas.Modules.session.enableNavigation();

        if (window.isNodeWebkit) {
            var _window = window.gui.Window.get();
            _window.reloadDev();
        } else {
            window.location.reload();
        }

    };

    session.getSaltedKey = function() {
        return key += session.sessionData.sessionParameters.interviewerID;
    };

    session.encryptSessionData = function(data) {
        if (window.isNodeWebkit) {
            // safe to use node modules.
            var fs = nodeRequire('fs');
            var gui = nodeRequire('nw.gui');
            var saltedKey = session.getSaltedKey();
            var text = JSON.stringify(data, undefined, 2); // indentation level = 2;
            var CryptoJS = require('crypto-js');
            var encrypted = CryptoJS.AES.encrypt(text, saltedKey);
            var path = nodeRequire('path');
            var fileName = Math.floor(Date.now() / 1000).toString();
            var location = path.join(gui.App.dataPath, fileName+'.netCanvas');
            fs.writeFile(location, encrypted, 'utf8', function (err) {
            if (err) {
                throw err;
            }
                return true;
            });
        } else {
            note.warn('session.saveEncryptedData() can only be run from within node webkit.');
            return false;
        }

    };

    session.disableNavigation = function() {
        note.info('disableNavigation');
        navigationDisabled = true;
        // $('.arrow-prev, .arrow-prev').hide();
        $('.arrow-next, .arrow-prev').attr('disabled','disabled');
    };

    session.enableNavigation = function() {
        note.info('enableNavigation');
        navigationDisabled = false;
        $('.arrow-next, .arrow-prev').removeAttr('disabled');
    };

    session.saveManager = function() {
        note.trace('session.saveManager()');
        clearTimeout(saveTimer);
        saveTimer = setTimeout(session.saveData, 3000);
    };

    session.updateSessionData = function(data, callback) {
        note.debug('Updating user data.');
        note.debug('Using the following to update:');
        note.debug(data);


        // Here, we used to simply use our extend method on session.sessionData with the new data.
        // This failed for arrays.
        // Switched to $.extend and added 'deep' as first function parameter for this reason.
        $.extend(true, session.sessionData, data);

        var newDataLoaded = new window.Event('newDataLoaded');
        window.dispatchEvent(newDataLoaded);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        if (callback) {
            callback();
        }
    };

    session.returnSessionID = function() {
        return session.id;
    };

    session.saveData = function() {
        session.sessionData.nodes = window.network.getNodes();
        session.sessionData.edges = window.network.getEdges();

        // handle previous network
        if (typeof window.previousNetwork !== 'undefined') {
            session.sessionData.previousNetwork.nodes = window.previousNetwork.getNodes();
            session.sessionData.previousNetwork.edges = window.previousNetwork.getEdges();
        }

        if(!window.dataStore.initialised()) {
            var unsavedChanges = new window.Event('unsavedChanges');
            window.dispatchEvent(unsavedChanges);
        } else {
            window.dataStore.save(session.sessionData, session.returnSessionID());
        }

        lastSaveTime = new Date();
    };

    session.goToStage = function(stage) {
        if (typeof stage === 'undefined' || typeof session.stages[stage] === 'undefined') {
            return false;
        }

        // Disabled Navigation
        if (allowedStages.indexOf(stage) === -1 && navigationDisabled === true) {
            note.warn('Session navigation is disabled until you complete the current step.');
            return false;
        }

        // If we have got this far, make sure that the navigation is enabled again
        if (session.navigationDisabled === true) { session.enableNavigation(); }

        // Skip logic

        // is there a skip function for this stage?
        if (session.stages[stage].skip) {

            //evaluate skip function
            var outcome = session.stages[stage].skip();

            // if true, skip the stage
            if (outcome === true) {
                if (stage > currentStage) {
                    session.goToStage(stage+1);
                    return false;
                } else {
                    session.goToStage(stage-1);
                    return false;
                }
            }
        }

        note.info('Session is moving to stage '+stage);

        // Crate stage visible event
        var eventProperties = {
            stage: stage,
            timestamp: new Date()
        };
        var log = new window.CustomEvent('log', {'detail':{'eventType': 'stageVisible', 'eventObject':eventProperties}});
        window.dispatchEvent(log);

        // Fire before stage change event
        session.options.fnBeforeStageChange(currentStage,stage);

        // Transition the content
        var newStage = stage;
        var stagePath ='./protocols/'+window.netCanvas.studyProtocol+'/stages/'+session.stages[stage].page;
        content.addClass('stageHidden');
        setTimeout(function(){
            content.load(stagePath, function() {
                setTimeout(function() {
                    content.removeClass('stageHidden');
                }, 200);

            });
        }, 200);

        var oldStage = currentStage;
        currentStage = newStage;
        session.options.fnAfterStageChange(oldStage, currentStage);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
    };

    session.nextStage = function() {
        session.goToStage(currentStage+1);
    };

    session.prevStage = function() {
        session.goToStage(currentStage-1);
    };

    session.registerData = function(dataKey, isArray) {
        note.info('A script requested a data store be registered with the key "'+dataKey+'".');
        if (typeof session.sessionData[dataKey] === 'undefined') { // Create it if it doesn't exist.
            note.debug('Key named "'+dataKey+'" was not already registered. Creating.');
            if (isArray) {
                session.sessionData[dataKey] = [];
            } else {
                session.sessionData[dataKey] = {};
            }
        } else {
            note.debug('A data store with this key already existed.');
        }
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return session.sessionData[dataKey];
    };

    session.unRegisterData = function(dataKey) {
        if (session.sessionData[dataKey] === undefined) {
            note.error('session.unRegisterData(): the dataKey specified was not found.');
            return false;
        }

        note.debug('session.unRegisterData(): deleting '+dataKey+' from sessionData.');
        delete session.sessionData[dataKey];
        return true;
    };

    session.addData = function(dataKey, newData, append) {
        /*
        This function should let any module add data to the session model. The session model
        (window data variable) is essentially a key/value store.
        */

        // Check if we are appending or overwriting
        if (!append) { append = false; }

        if (append === true) { // this is an array
            session.sessionData[dataKey].push(newData);
        } else {
            window.tools.extend(session.sessionData[dataKey], newData);
        }

        // Notify
        note.debug('Adding data to key "'+dataKey+'".');
        note.debug(newData);

        // Emit an event to trigger data store synchronisation.
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        return session.sessionData[dataKey];

    };

    session.currentStage = function() {
        return currentStage;
    };

    session.returnData = function(dataKey) {
        if (!dataKey) {
            return session.sessionData;
        } else if (typeof session.sessionData[dataKey] !== 'undefined') {
            return session.sessionData[dataKey];
        } else {
            return session.sessionData;
        }
    };

    return session;
};

module.exports = new Session();
;/* global Konva, window, $, note */
/* exported Sociogram */
/*jshint bitwise: false*/

// Can be replaced with npm module once v0.9.5 reaches upstream.
module.exports = function Sociogram() {
	'use strict';
	// Global variables
	var stage, circleLayer, edgeLayer, nodeLayer, uiLayer, sociogram = {};
	var selectedNodes = [];
	var log;
	var menuOpen = false;
	var cancelKeyBindings = false;
	var taskComprehended = false;

	// Colours
	var colors = {
		blue: '#0174DF',
		placidblue: '#83b5dd',
		violettulip: '#9B90C8',
		hemlock: '#9eccb3',
		paloma: '#aab1b0',
		freesia: '#ffd600',
		cayenne: '#c40000',
		celosiaorange: '#f47d44',
		sand: '#ceb48d',
		dazzlingblue: '#006bb6',
		edge: '#e85657',
		selected: 'gold',
	};

	// Default sociogram.settings
	sociogram.settings = {
		network: window.netCanvas.Modules.session.getPrimaryNetwork(),
		defaultNodeSize: 35,
		defaultNodeColor: colors.blue,
		defaultEdgeColor: colors.edge,
		concentricCircleColor: '#ffffff',
		concentricCircleNumber: 4,
		criteria: {},
		filter: null,
		nodeTypes: [
			{'name':'Person','color':colors.blue},
			{'name':'OnlinePerson','color':colors.hemlock},
			{'name':'Organisation','color':colors.cayenne},
			{'name':'Professional','color':colors.violettulip}
		]
	};

	// Private functions

	// Adjusts the size of text so that it will always fit inside a given shape.
	function padText(text, container, amount){
		while ((text.width() * 1.1)<container.width()-(amount*2)) {
			text.fontSize(text.fontSize() * 1.1);
			text.y((container.height() - text.height())/2);
		}
		text.setX( container.getX() - text.getWidth()/2 );
		text.setY( (container.getY() - text.getHeight()/1.8) );
	}

	sociogram.init = function (userSettings) {
		note.info('Sociogram initialising.');
		window.tools.extend(sociogram.settings,userSettings);

		$('<div class="sociogram-title"><h4>'+sociogram.settings.heading+'</h4><p>'+sociogram.settings.subheading+'</p></div>').insertBefore( '#kineticCanvas' );

		sociogram.initKinetic();

		window.addEventListener('nodeAdded', sociogram.addNode, false);
		window.addEventListener('edgeAdded', sociogram.addEdge, false);
		window.addEventListener('nodeRemoved', sociogram.removeNode, false);
		window.addEventListener('edgeRemoved', sociogram.removeEdge, false);
		window.addEventListener('changeStageStart', sociogram.destroy, false);

		// Are there existing nodes? Display them.

		// Get all nodes that match the criteria
		var criteriaEdges = sociogram.settings.network.getEdges(sociogram.settings.criteria, sociogram.settings.filter);

		// Sort these into reverse order
		criteriaEdges.reverse();

		// Iterate over them
		for (var i = 0; i < criteriaEdges.length; i++) {
			var dyadEdge = sociogram.settings.network.getEdges({from:criteriaEdges[i].from, to:criteriaEdges[i].to, type:'Dyad'})[0];
			var newNode = sociogram.addNode(dyadEdge);

			// If we are in select mode, set the initial state
			if (sociogram.settings.mode === 'Select') {
				// test if we are flipping a variable or assigning an edge
				if (sociogram.settings.variable) {
					//we are flipping a variable
					var properties = {
						from: sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id,
						to: criteriaEdges[i].to,
					};

					properties[sociogram.settings.variable] = 1;

					if (sociogram.settings.network.getEdges(properties).length > 0) {
						newNode.children[0].stroke(colors.selected);
						nodeLayer.draw();
					}
				} else {
					// we are assigning an edge
					// set initial state of node according to if an edge exists
					if (sociogram.settings.network.getEdges({from: sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id, to: criteriaEdges[i].to, type: sociogram.settings.edgeType}).length > 0) {
						newNode.children[0].stroke(colors.selected);
						nodeLayer.draw();
					}

				}
			}
		}

		setTimeout(function() { // seems to be needed in Chrome Canary. Why!?
			sociogram.drawUIComponents();
		}, 0);

		// Are there existing edges? Display them
		var edges, edgeProperties;
		if (sociogram.settings.mode === 'Edge') {

			// Set the criteria based on edge type
			edgeProperties =  {
				type: sociogram.settings.edgeType
			};

			// Filter to remove edges involving ego, unless this is edge select mode.
			edges = sociogram.settings.network.getEdges(edgeProperties, function (results) {
				var filteredResults = [];
				$.each(results, function(index,value) {
					if (value.from !== sociogram.settings.network.getEgo().id && value.to !== sociogram.settings.network.getEgo().id) {
						filteredResults.push(value);
					}
				});

				return filteredResults;
			});

			$.each(edges, function(index,value) {
				sociogram.addEdge(value);
			});

		} else if (sociogram.settings.mode === 'Select' || sociogram.settings.mode === 'Update') {
			// Select mode

			// Show the social window.network
			// Filter to remove edges involving ego, unless this is edge select mode.
			edgeProperties = {};

			if (sociogram.settings.showEdge) {
				edgeProperties =  {
					type: sociogram.settings.showEdge
				};
			} else {
				edgeProperties =  {
					type: 'Dyad'
				};
			}
			edges = sociogram.settings.network.getEdges(edgeProperties, function (results) {
				var filteredResults = [];
				$.each(results, function(index,value) {
					if (value.from !== sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id && value.to !== sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id) {
						filteredResults.push(value);
					}
				});

				return filteredResults;
			});

			$.each(edges, function(index,value) {
				sociogram.addEdge(value);
			});

		} else if (sociogram.settings.mode === 'Position') {
			// Don't show any edges.
		}
	};

	sociogram.getSelectedNodes = function() {
		return selectedNodes;
	};

	sociogram.keyPressHandler = function(e) {
		if (!cancelKeyBindings) {

			if (!menuOpen) {
				//open the menu
				$('.new-node-form').addClass('node-form-open');
				$('.content').addClass('blurry'); //blur content background
				menuOpen = true;
				$('.name-box').focus();
			}

			// Prevent accidental backspace navigation
			if (e.which === 8 && !$(e.target).is('input, textarea, div')) {
				e.preventDefault();
			}

		}
	};

	sociogram.destroy = function() {

		// menu.removeMenu(canvasMenu); // remove the window.network menu when we navigate away from the page.
		$('.new-node-form').remove(); // Remove the new node form

		window.removeEventListener('nodeAdded', sociogram.addNode, false);
		window.removeEventListener('edgeAdded', sociogram.addEdge, false);
		window.removeEventListener('nodeRemoved', sociogram.removeNode, false);
		window.removeEventListener('edgeRemoved', sociogram.removeEdge, false);
		window.removeEventListener('changeStageStart', sociogram.destroy, false);
		$(window.document).off('keypress', sociogram.keyPressHandler);

	};

	// Node manipulation functions

	sociogram.resetPositions = function() {
		var dyadEdges = sociogram.settings.network.getEdges({type:'Dyad'});

		$.each(dyadEdges, function(index) {
			sociogram.settings.network.updateEdge(dyadEdges[index].id, {coords: []});
		});
	};

	sociogram.addNode = function(options) {
		note.debug('Sociogram is creating a node.');
		// options = options.details;

		// Placeholder for getting the number of nodes we have.
		var nodeShape;

		var nodeID = 0;
		while (sociogram.settings.network.getNode(nodeID) !== false) {
			nodeID++;
		}

		var dragStatus = false;
		if (sociogram.settings.mode === 'Position' || sociogram.settings.mode === 'Edge') {
			dragStatus = true;
		}
		options.label = options.nname_t0;
		var nodeOptions = {
			coords: [$(window).width()+50,100],
			id: nodeID,
			label: 'Undefined',
			size: sociogram.settings.defaultNodeSize,
			color: 'rgb(0,0,0)',
			strokeWidth: 4,
			draggable: dragStatus,
			dragDistance: 20
		};

		window.tools.extend(nodeOptions, options);

		nodeOptions.id = parseInt(nodeOptions.id, 10);

		nodeOptions.type = 'Person'; // We don't need different node shapes for RADAR
		nodeOptions.x = nodeOptions.coords[0];
		nodeOptions.y = nodeOptions.coords[1];



		var nodeGroup = new Konva.Group(nodeOptions);

		switch (nodeOptions.type) {
			case 'Person':
			nodeShape = new Konva.Circle({
				radius: nodeOptions.size,
				fill:nodeOptions.color,
				stroke: 'white',
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

			case 'Organisation':
			nodeShape = new Konva.Rect({
				width: nodeOptions.size*2,
				height: nodeOptions.size*2,
				fill:nodeOptions.color,
				stroke: sociogram.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth,
				// offset: {x: nodeOptions.size, y: nodeOptions.size}
			});
			break;

			case 'OnlinePerson':
			nodeShape = new Konva.RegularPolygon({
				sides: 3,
				fill:nodeOptions.color,
				radius: nodeOptions.size*1.2, // How should I calculate the correct multiplier for a triangle?
				stroke: sociogram.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

			case 'Professional':
			nodeShape = new Konva.Star({
				numPoints: 6,
				fill:nodeOptions.color,
				innerRadius: nodeOptions.size-(nodeOptions.size/3),
				outerRadius: nodeOptions.size+(nodeOptions.size/3),
				stroke: sociogram.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

		}

		var nodeLabel = new Konva.Text({
			text: nodeOptions.label,
			// fontSize: 20,
			fontFamily: 'Lato',
			fill: 'white',
			align: 'center',
			// offsetX: (nodeOptions.size*-1)-10, //left right
			// offsetY:(nodeOptions.size*1)-10, //up down
			fontStyle:500

		});

		note.debug('Putting node '+nodeOptions.label+' at coordinates x:'+nodeOptions.coords[0]+', y:'+nodeOptions.coords[1]);

		// Node event handlers
		nodeGroup.on('dragstart', function() {
			if (taskComprehended === false) {
				var eventProperties = {
					stage: window.netCanvas.Modules.session.currentStage(),
					timestamp: new Date()
				};
				log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
				window.dispatchEvent(log);
				taskComprehended = true;
			}


			note.debug('dragstart');

			// Add the current position to the node attributes, so we know where it came from when we stop dragging.
			this.attrs.oldx = this.attrs.x;
			this.attrs.oldy = this.attrs.y;
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragmove', function() {
			if (taskComprehended === false) {
				var eventProperties = {
					stage: window.netCanvas.Modules.session.currentStage(),
					timestamp: new Date()
				};
				log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
				window.dispatchEvent(log);
				taskComprehended = true;
			}

			note.debug('Dragmove');
			var dragNode = nodeOptions.id;
			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from.id === dragNode || value.attrs.to.id === dragNode) {
					var points = [sociogram.getNodeByID(value.attrs.from.id).getX(), sociogram.getNodeByID(value.attrs.from.id).getY(), sociogram.getNodeByID(value.attrs.to.id).getX(), sociogram.getNodeByID(value.attrs.to.id).getY()];
					value.attrs.points = points;

				}
			});
			edgeLayer.draw();

		});

		nodeGroup.on('tap click', function() {
			if (taskComprehended === false) {
				var eventProperties = {
					stage: window.netCanvas.Modules.session.currentStage(),
					timestamp: new Date()
				};
				log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
				window.dispatchEvent(log);
				taskComprehended = true;
			}
			log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeClick', 'eventObject':this.attrs.id}});
			var currentNode = this;

			window.dispatchEvent(log);
			if (sociogram.settings.mode === 'Select') {
				var edge;

				// Check if we are flipping a binary variable on the Dyad edge or setting an edge
				if (sociogram.settings.variable) {
					// We are flipping a variable

					var properties = {};
					var currentValue = sociogram.settings.network.getEdge(currentNode.attrs.id)[sociogram.settings.variable];
					if (currentValue === 0 || typeof currentValue === 'undefined') {
						properties[sociogram.settings.variable] = 1;
						currentNode.children[0].stroke(colors.selected);
					} else {
						properties[sociogram.settings.variable] = 0;
						currentNode.children[0].stroke('white');
					}

					sociogram.settings.network.setProperties(sociogram.settings.network.getEdge(currentNode.attrs.id), properties);


				} else {
					// We are setting an edge
					// Test if there is an existing edge.
					if (sociogram.settings.network.getEdges({type: sociogram.settings.edgeType,from:sociogram.settings.network.getEgo().id, to: this.attrs.to}).length > 0) {
						// if there is, remove it
						this.children[0].stroke('white');
						sociogram.settings.network.removeEdge(sociogram.settings.network.getEdges({type: sociogram.settings.edgeType,from:sociogram.settings.network.getEgo().id, to: this.attrs.to})[0]);
					} else {
						// else add it
						edge = {
							from:sociogram.settings.network.getEgo().id,
							to: this.attrs.to,
							type: sociogram.settings.edgeType,
						};

						if (typeof sociogram.settings.variables !== 'undefined') {
							$.each(sociogram.settings.variables, function(index, value) {
								edge[value.label] = value.value;
							});
						}

						this.children[0].stroke(colors.selected);
						sociogram.settings.network.addEdge(edge);
					}
				}


			} else if (sociogram.settings.mode === 'Update') {
				if (selectedNodes.indexOf(currentNode) === -1) {
					selectedNodes.push(currentNode.attrs.id);
					currentNode.children[0].stroke(colors.selected);
				} else {
					selectedNodes.remove(currentNode.attrs.id);
					currentNode.children[0].stroke('white');
				}

			} else if (sociogram.settings.mode === 'Edge') {
				// If this makes a couple, link them.
				if (selectedNodes[0] === this) {
					// Ignore two clicks on the same node
					return false;
				}
				selectedNodes.push(this);
				if(selectedNodes.length === 2) {
					selectedNodes[1].children[0].stroke('white');
					selectedNodes[0].children[0].stroke('white');
					var edgeProperties = {
						from: selectedNodes[0].attrs.to,
						to: selectedNodes[1].attrs.to,
						type: sociogram.settings.edgeType
					};

					edgeProperties[sociogram.settings.variables[0]] = 'perceived';


					if (sociogram.settings.network.edgeExists(edgeProperties) === true) {
						note.debug('Sociogram removing edge.');
						sociogram.settings.network.removeEdge(sociogram.settings.network.getEdges(edgeProperties));
					} else {
						if (sociogram.settings.network.addEdge(edgeProperties) === false) {
							note.error('Error! Edge creation failed.');
							throw new Error('Error! Edge creation failed.');
						} else {
							note.debug('Edge created by consecutive tap.');
						}

					}
					selectedNodes = [];
					nodeLayer.draw();
				} else {
					// If not, simply turn the node stroke to the selected style so we can see that it has been selected.
					this.children[0].stroke(colors.selected);
					// selectedNodes.push(this);
					// this.children[0].strokeWidth(4);
					nodeLayer.draw();
				}
			}
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragend', function() {
			note.debug('dragend');

			// set the context
			var from = {};
			var to = {};

			// Fetch old position from properties populated by dragstart event.
			from.x = this.attrs.oldx;
			from.y = this.attrs.oldy;

			to.x = this.attrs.x;
			to.y = this.attrs.y;

			// Add them to an event object for the logger.
			var eventObject = {
				nodeTarget: this.attrs.id,
				from: from,
				to: to,
			};

			var currentNode = this;

			// Log the movement and save the graph state.
			log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeMove', 'eventObject':eventObject}});
			window.dispatchEvent(log);

			sociogram.settings.network.setProperties(sociogram.settings.network.getEdge(currentNode.attrs.id), {coords: [currentNode.attrs.x,currentNode.attrs.y]});

			// remove the attributes, just incase.
			delete this.attrs.oldx;
			delete this.attrs.oldy;

		});

		padText(nodeLabel,nodeShape,10);

		nodeGroup.add(nodeShape);
		nodeGroup.add(nodeLabel);

		nodeLayer.add(nodeGroup);
		setTimeout(function() {
			nodeLayer.draw();
		}, 0);


		if (!options.coords || options.coords.length === 0) {
			var tween = new Konva.Tween({
				node: nodeGroup,
				x: $(window).width()-150,
				y: 100,
				duration:0.7,
				easing: Konva.Easings.EaseOut
			});
			tween.play();
			sociogram.settings.network.setProperties(sociogram.settings.network.getNode(nodeOptions.id),{coords:[$(window).width()-150, 100]});
		}

		return nodeGroup;
	};

	// Edge manipulation functions

	sociogram.addEdge = function(properties) {
		if(typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined') {
			properties = properties.detail;
		}

		note.debug('Sociogram is adding an edge.');


		// Get all nodes that match the criteria
		var criteriaEdges = sociogram.settings.network.getEdges(sociogram.settings.criteria, sociogram.settings.filter);
		var criteriaDyadEdge = [];
		// Iterate over them
		for (var i = 0; i < criteriaEdges.length; i++) {
			criteriaDyadEdge.push(sociogram.settings.network.getEdges({from:window.network.getEgo().id, to:criteriaEdges[i].to, type:'Dyad'})[0]);
		}

		// Get the dyad edges of the from and to IDs so we can get the coordinates.
		var toObject = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.to, type:'Dyad'})[0];
		var fromObject = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.from, type:'Dyad'})[0];

		// Test if the proposed edge if between two nodes that are included in our interface criteria
		if (criteriaDyadEdge.indexOf(toObject) === -1 || criteriaDyadEdge.indexOf(fromObject) === -1) {
			note.debug('Cancelled adding edge between two nodes, because one or both were not visible.');
			return false;
		}

		var points = [fromObject.coords[0], fromObject.coords[1], toObject.coords[0], toObject.coords[1]];
		var edge = new Konva.Line({
			// dashArray: [10, 10, 00, 10],
			strokeWidth: 4,
			opacity:1,
			stroke: sociogram.settings.defaultEdgeColor,
			// opacity: 0.8,
			from: fromObject,
			to: toObject,
			points: points
		});

		edgeLayer.add(edge);

		setTimeout(function() {
			edgeLayer.draw();
		},0);
		nodeLayer.draw();
		note.debug('Created Edge between '+fromObject.label+' and '+toObject.label);

		return true;

	};

	sociogram.removeEdge = function(properties) {
		note.debug('sociogram.removeEdge() called.');
		if (!properties) {
			note.error('No properties passed to sociogram.removeEdge()!');
		}

		// Test if we are being called by an event, or directly
		if (typeof properties.detail !== 'undefined') {
			properties = properties.detail;
		}

		var toNode = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.to, type:'Dyad'})[0];
		var fromNode = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.from, type:'Dyad'})[0];

		// This function is failing because two nodes are matching below
		var found = false;
		$.each(sociogram.getKineticEdges(), function(index, value) {
			if (value !== undefined) {
				if (value.attrs.from === fromNode && value.attrs.to === toNode || value.attrs.from === toNode && value.attrs.to === fromNode ) {
					found = true;
					edgeLayer.children[index].remove();
					edgeLayer.draw();
				}
			}

		});

		if (!found) {
			note.error('sociogram.removeEdge() failed! Couldn\'t find the specified edge.');
		} else {
			return true;
		}

	};

	sociogram.removeNode = function() {
	};

	// Misc functions

	sociogram.clearGraph = function() {
		edgeLayer.removeChildren();
		edgeLayer.clear();
		nodeLayer.removeChildren();
		nodeLayer.clear();

	};

	// Main initialisation functions

	sociogram.initKinetic = function () {
		// Initialise KineticJS stage
		stage = new Konva.Stage({
			container: 'kineticCanvas',
			width: window.innerWidth,
			height: window.innerHeight
		});

		circleLayer = new Konva.Layer();
		nodeLayer = new Konva.Layer();
		edgeLayer = new Konva.Layer();
		uiLayer = new Konva.Layer();

		stage.add(circleLayer);
		stage.add(edgeLayer);
		stage.add(nodeLayer);
		stage.add(uiLayer);
		note.debug('Konva stage initialised.');
	};

	sociogram.drawUIComponents = function () {

		// Draw all UI components
		var circleFills, circleLines;
		var currentColor = sociogram.settings.concentricCircleColor ;
		var totalHeight = window.innerHeight-(sociogram.settings.defaultNodeSize); // Our sociogram area is the window height minus twice the node radius (for spacing)
		var currentOpacity = 0.1;

		//draw concentric circles
		for(var i = 0; i < sociogram.settings.concentricCircleNumber; i++) {
			var ratio = 1-(i/sociogram.settings.concentricCircleNumber);
			var currentRadius = (totalHeight/2 * ratio);

			circleLines = new Konva.Circle({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				radius: currentRadius,
				stroke: 'white',
				strokeWidth: 1.5,
				opacity: 0
			});

			circleFills = new Konva.Circle({
				x: window.innerWidth / 2,
				y: (window.innerHeight / 2),
				radius: currentRadius,
				fill: currentColor,
				opacity: currentOpacity,
				strokeWidth: 0,
			});

			// currentColor = tinycolor.darken(currentColor, amount = 15).toHexString();
			currentOpacity = currentOpacity+((0.3-currentOpacity)/sociogram.settings.concentricCircleNumber);
			circleLayer.add(circleFills);
			circleLayer.add(circleLines);

		}

		circleLayer.draw();
		uiLayer.draw();

		// sociogram.initNewNodeForm();
		note.debug('User interface initialised.');
	};

	// New Node Form

	sociogram.initNewNodeForm = function() {
		var form = $('<div class="new-node-form"></div>');
		var innerForm = $('<div class="new-node-inner"></div>');
		form.append(innerForm);
		innerForm.append('<h1>Add a new contact</h1>');
		innerForm.append('<p>Some text accompanying the node creation box.</p>');
		// TODO: Use a innerForm generation class here.
		// For now, just an input box.
		innerForm.append('<input type="text" class="form-control name-box"></input>');

		$('.content').after(form); // add after the content container.


		// Key bindings
		$(window.document).on('keypress', sociogram.keyPressHandler);

	};



	// Get & set functions

	sociogram.getKineticNodes = function() {
		return nodeLayer.children;
	};

	sociogram.getKineticEdges = function() {
		return edgeLayer.children;
	};

	sociogram.getSimpleNodes = function() {
		// We need to create a simple representation of the nodes for storing.
		var simpleNodes = {};
		var nodes = sociogram.getKineticNodes();
		$.each(nodes, function (index, value) {
			simpleNodes[value.attrs.id] = {};
			simpleNodes[value.attrs.id].x = value.attrs.x;
			simpleNodes[value.attrs.id].y = value.attrs.y;
			simpleNodes[value.attrs.id].name = value.attrs.name;
			simpleNodes[value.attrs.id].type = value.attrs.type;
			simpleNodes[value.attrs.id].size = value.attrs.size;
			simpleNodes[value.attrs.id].color = value.attrs.color;
		});
		return simpleNodes;
	};

	sociogram.getSimpleEdges = function() {
		var simpleEdges = {},
		edgeCounter = 0;

		$.each(edgeLayer.children, function(index, value) {
			simpleEdges[edgeCounter] = {};
			simpleEdges[edgeCounter].from = value.attrs.from.attrs.id;
			simpleEdges[edgeCounter].to = value.attrs.to.attrs.id;
			edgeCounter++;
		});

		return simpleEdges;
	};

	sociogram.getSimpleEdge = function(id) {
		var simpleEdges = sociogram.getSimpleEdges();
		if (!id) { return false; }

		var simpleEdge = simpleEdges[id];
		return simpleEdge;
	};

	sociogram.getEdgeLayer = function() {
		return edgeLayer;
	};

	sociogram.getNodeByID = function(id) {
		var node = {},
		nodes = sociogram.getKineticNodes();

		$.each(nodes, function(index, value) {
			if (value.attrs.id === id) {
				node = value;
			}
		});

		return node;
	};

	sociogram.getNodeColorByType = function(type) {
		var returnVal = null;
		$.each(sociogram.settings.nodeTypes, function(index, value) {
			if (value.name === type) {returnVal = value.color;}
		});

		if (returnVal) {
			return returnVal;
		} else {
			return false;
		}
	};

	return sociogram;

};
;/*jshint unused:false*/
/*global Set, window, $, localStorage, Storage, debugLevel, deepEquals, Notification, alert, note */
/*jshint bitwise: false*/
'use strict';
// Storage prototypes

window.Storage.prototype.showUsage = function() {

    var total = 0;
    for(var x in localStorage) {
      var amount = (localStorage[x].length * 2) / 1024 / 1024;
      total += amount;
      console.log( x + ' = ' + amount.toFixed(2) + ' MB');
    }
    console.log( 'Total: ' + total.toFixed(2) + ' MB');
};


window.Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
};

window.Storage.prototype.getObject = function(key) {
    if (this.getItem(key) === null) {
        return false;
    } else {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    }
};

// Array prototypes

Object.defineProperty(Array.prototype, 'remove', {
    enumerable: false,
    value: function (item) {
        var removeCounter = 0;

        for (var index = 0; index < this.length; index++) {
            if (this[index] === item) {
                this.splice(index, 1);
                removeCounter++;
                index--;
            }
        }
        return removeCounter;
    }
});

exports.arrayDifference = function(a1, a2) {
  var a2Set = new Set(a2);
  return a1.filter(function(x) { return !a2Set.has(x); });
};

exports.removeFromObject = function(item, object) {
    var removeCounter = 0;

    for (var index = 0; index < object.length; index++) {
        if (object[index] === item) {
            object.splice(index, 1);
            removeCounter++;
            index--;
        }
    }
    return removeCounter;
};

// helper functions

exports.nwNotification = function(options) {
    var notification = new Notification('Network Canvas:',options);
    notification.onclick = function () {
        // alert('Notification Clicked');
    };

    notification.onshow = function () {
        // play sound on show
        // myAud=document.getElementById("audio1");
        // myAud.play();

        // auto close after 1 second
        // setTimeout(function() {
        //     notification.close();
        // }, 1000);
    };
};

exports.deepEquals = function(a, x) {
    var p;
    for (p in a) {
        if (typeof(x[p]) === 'undefined') {
            return false;
        }
    }

    for (p in a) {
        if (a[p]) {

            switch (typeof(a[p])) {
                case 'object':
                    if (a[p].sort) {
                        a[p].sort();
                        x[p].sort();
                    }
                    if (!deepEquals(a[p], x[p])) {
                        return false;
                    }
                    break;
                case 'function':
                    if (typeof(x[p]) === 'undefined' || a[p].toString() !== x[p].toString()) {
                        return false;
                    }
                    break;
                default:
                    if (a[p] !== x[p]) {
                        return false;
                    }
            }
        } else {
            if (x[p]) {
                return false;
            }

        }
    }
    for (p in x) {
        if (typeof(a[p]) === 'undefined') {
            return false;
        }
    }

    return true;
};

exports.isInNestedObject = function(targetArray, objectKey, objectKeyValue) {
    // This function is for checking for keys in arrays of objects.
    for (var i = 0; i<targetArray.length; i++){
        for (var prop in targetArray[i]){
            if (prop === objectKey && targetArray[i][prop] === objectKeyValue) { return true; }
        }
    }

    return false;
};

exports.getValueFromNestedObject = function(targetArray, objectKey) {
    // This function is for checking for keys in arrays of objects.
    for (var i = 0; i<targetArray.length; i++){
        for (var prop in targetArray[i]){
            if (prop === objectKey) { return targetArray[i][prop]; }
        }
    }

    return false;
};


exports.extend = function( a, b ) {
    for( var key in b ) {
        if( b.hasOwnProperty( key ) ) {
            a[key] = b[key];
        }
    }
    return a;
};

exports.notify = function(text, level){
    level = level || 0;
    // if (level >= window.debugLevel) {
        console.log(text);
    // }
};

exports.randomBetween = function(min,max) {
    return Math.random() * (max - min) + min;
};

//
exports.Events = {
    register: function(eventsArray, eventsList) {
        for (var i = 0; i < eventsList.length; i++) {
            eventsArray.push(eventsList[i]);

			if (eventsList[i].targetEl && eventsList[i].handler && eventsList[i].event) {
				if (typeof eventsList[i].subTarget !== 'undefined') {
					// console.log('$('+eventsList[i].targetEl+').on('+eventsList[i].event+', '+eventsList[i].subTarget+', '+eventsList[i].handler+')');
	                $(eventsList[i].targetEl).on(eventsList[i].event, eventsList[i].subTarget, eventsList[i].handler);
	            } else {
	                $(eventsList[i].targetEl).on(eventsList[i].event, eventsList[i].handler);
	            }
			} else {
				note.warn('An event was misspecified, and has been ignored.');
				note.debug(eventsList[i]);
			}

        }

    },
    unbind: function(eventsArray) {
        for (var i = 0; i < eventsArray.length; i++) {
            if (typeof eventsArray[i].subTarget !== 'undefined') {
                $(eventsArray[i].targetEl).off(eventsArray[i].event, eventsArray[i].subTarget, eventsArray[i].handler);
            } else {
                $(eventsArray[i].targetEl).off(eventsArray[i].event, eventsArray[i].handler);
            }
        }
    }
};

exports.hex = function (x){
    return ('0' + parseInt(x).toString(16)).slice(-2);
};

$.cssHooks.backgroundColor = {
    get: function(elem) {
        var bg;
        if (elem.currentStyle) {
            bg = elem.currentStyle.backgroundColor;
        } else if (window.getComputedStyle) {
            bg = window.document.defaultView.getComputedStyle(elem,null).getPropertyValue('background-color');
        }

        if (bg.search('rgb') === -1) {
            return bg;
        } else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return '#' + window.tools.hex(bg[1]) + window.tools.hex(bg[2]) + window.tools.hex(bg[3]);
        }
    }
};

exports.modifyColor = function(hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ('00'+c).substr(c.length);
    }

    return rgb;

};
;/* global $, window, Odometer, document, note  */
/* exported VenueGenerator */
module.exports = function VenueGenerator() {
    'use strict';
    //global vars
    var venueGenerator = {};
    venueGenerator.options = {
        nodeType:'Venue',
        edgeType:'Venue',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
    };

    var nodeBoxOpen = false;
    var editing = false;
    var newNodePanel;
    var venueCounter;

    var venueCount = window.network.getNodes({type_t0: 'Venue'}).length;

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                venueGenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            venueGenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var stageChangeHandler = function() {
        venueGenerator.destroy();
    };

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getEgo().id, to: index, type:'Venue'})[0];

        // Set the value of editing to the node id of the current person
        editing = index;

        // Populate the form with this nodes data.
        $.each(venueGenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'dropdown') {
                    $('.selectpicker').selectpicker('val', edge[value.variable]);
                } else if (value.type === 'scale') {
                    $('input:radio[name="'+value.variable+'"][value="'+edge[value.variable]+'"]').prop('checked', true).trigger('change');
                } else {
                    $('#'+value.variable).val(edge[value.variable]);
                }

                $('.delete-button').show();

                if (edge.elicited_previously === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                } else {
                    $('input#age_p_t0').prop( 'disabled', false);
                }
                venueGenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        venueGenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');

        e.preventDefault();

        var data = $(this).serializeArray();
          var cleanData = {};
          for (var i = 0; i < data.length; i++) {

            // To handle checkboxes, we check if the key already exists first. If it
            // does, we append new values to an array. This keeps compatibility with
            // single form fields, but might need revising.

            // Handle checkbox values
            if (data[i].value === 'on') { data[i].value = 1; }

            // This code takes the serialised output and puts it in the structured required to store within noded/edges.
            if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] !== 'object') {
              // if it isn't an object, its a string. Create an empty array and store by itself.
              cleanData[data[i].name] = [cleanData[data[i].name]];
              cleanData[data[i].name].push(data[i].value);
            } else if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] === 'object'){
              // Its already an object, so append our new item
              cleanData[data[i].name].push(data[i].value);
            } else {
              // This is for regular text fields. Simple store the key value pair.
              cleanData[data[i].name] = data[i].value;
            }

          }


        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(venueGenerator.options.variables, function(index,value) {

            if(value.target === 'edge') {
                if (value.private === true) {
                    newEdgeProperties[value.variable] = value.value;
                } else {
                    newEdgeProperties[value.variable] = cleanData[value.variable];
                }

            } else if (value.target === 'node') {
                if (value.private === true) {
                    newNodeProperties[value.variable] = value.value;
                } else {
                    newNodeProperties[value.variable] = cleanData[value.variable];
                }
            }
        });

        if (editing === false) {
            note.info('// We are submitting a new node');
            var newNode = window.network.addNode(newNodeProperties);

            var edgeProperties = {
                from: window.network.getEgo().id,
                to: newNode,
                type:venueGenerator.options.edgeTypes[0]
            };

            window.tools.extend(edgeProperties,newEdgeProperties);
            window.network.addEdge(edgeProperties);
            venueGenerator.addToList(edgeProperties);
            venueCount++;
            venueCounter.update(venueCount);

        } else {
            note.info('// We are updating a node');

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css('background-color');
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;

            var edges = window.network.getEdges({from:window.network.getEgo().id,to:nodeID,type:venueGenerator.options.edgeTypes[0]});
            $.each(edges, function(index,value) {
                window.network.updateEdge(value.id,newEdgeProperties, color);
            });

            window.network.updateNode(nodeID, newNodeProperties);

            // update relationship roles

            $('div[data-index='+editing+']').html('');
            $('div[data-index='+editing+']').append('<h4>'+newEdgeProperties.venue_name_t0+'</h4>');

            venueCount = window.network.getNodes({type_t0: 'Venue'}).length;
            venueCounter.update(venueCount);
            editing = false;

        }

        venueGenerator.closeNodeBox();

    };

    venueGenerator.openNodeBox = function() {
        $('.newVenueBox').height($('.newVenueBox').height());
        $('.newVenueBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    venueGenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newVenueBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
    };

    venueGenerator.destroy = function() {
        note.debug('Destroying venueGenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', venueGenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', venueGenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newVenueBox').remove();

    };

    venueGenerator.init = function(options) {
        window.tools.extend(venueGenerator.options, options);
        // $.extend(true, venueGenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-map-pin add-button"></span>');
        venueGenerator.options.targetEl.append(button);
        var venueCountBox = $('<div class="alter-count-box"></div>');
        venueGenerator.options.targetEl.append(venueCountBox);

        // create node box
        var newVenueBox = $('<div class="newVenueBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-map-pin"></span> Adding a Place</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // venueGenerator.options.targetEl.append(newVenueBox);
        $('body').append(newVenueBox);
        $.each(venueGenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'autocomplete':
                    formItem = $('<div class="form-group ui-widget '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'dropdown':

                    formItem = $('<div class="form-group '+value.variable+'" style="position:relative; z-index:9"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');
                    var select = $('<select class="selectpicker" name="'+value.variable+'" />');
                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<option/>').val(optionValue.value).text(optionValue.label).appendTo(select);
                    });

                    select.appendTo(formItem);

                    break;

                    case 'scale':
                    formItem = $('<div class="form-group '+value.variable+'"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');

                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<div class="btn-group big-check" data-toggle="buttons"><label class="btn"><input type="radio" name="'+value.variable+'" value="'+optionValue.value+'"><i class="fa fa-circle-o fa-3x"></i><i class="fa fa-check-circle-o fa-3x"></i> <span class="check-number">'+optionValue.label+'</span></label></div>').appendTo(formItem);
                    });

                    break;

                }

                $('.newVenueBox .form .fields').append(formItem);
                if (value.required === true) {
                    $('#'+value.variable).prop('required', true);
                }

                $('.selectpicker').selectpicker({
                    style: 'btn-info',
                    size: 4
                });

                $('#venue_name_t0').autocomplete({
                    source: window.netCanvas.Modules.session.protocolData.autocompleteVenues
                });

            }

        });

        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newVenueBox .form .fields').append(buttons);

        newNodePanel = $('.newVenueBox').html();

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        venueGenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(venueGenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(venueGenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        venueGenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', venueGenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', venueGenerator.removeFromList);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);

        // Set node count box
        var el = document.querySelector('.alter-count-box');

        venueCounter = new Odometer({
            el: el,
            value: venueCount,
            format: 'dd',
            theme: 'default'
        });

        // add existing nodes
        var edges = window.network.getEdges({type: 'Venue', from: window.network.getEgo().id, vg_t0:venueGenerator.options.variables[0].value});
        $.each(edges, function(index,value) {

            venueGenerator.addToList(value);
        });

        // Handle side panels
        if (venueGenerator.options.panels.length > 0) {
            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (venueGenerator.options.panels.indexOf('current') !== -1) {
                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>Places you already named:</h4></div>'));
                $('.nameList').addClass('alt');
                $.each(window.network.getEdges({type: 'Venue', from: window.network.getEgo().id}), function(index,value) {

                    var el = $('<div class="node-list-item">'+value.venue_name_t0+'</div>');
                    sideContainer.children('.current-node-list').append(el);
                });
            }

            venueGenerator.options.targetEl.append(sideContainer);

        } // end if panels
    };

    venueGenerator.addToList = function(properties) {
        note.debug('venueGenerator.addToList');
        note.trace(properties);
        // var index = $(this).data('index');
        var card;

        card = $('<div class="card"><div class="venue inner-card" data-index="'+properties.to+'"><h4>'+properties.venue_name_t0+'</h4></div></div>');
        $('.nameList').append(card);

    };

    venueGenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var venueCount = window.network.getNodes({type_t0: 'Venue'}).length;
        venueCounter.update(venueCount);

        venueGenerator.closeNodeBox();
    };

    return venueGenerator;
};
