/* global window,$ */
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
