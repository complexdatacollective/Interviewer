/* global moment, extend, network */
/* exported DateInterface */

var DateInterface = function DateInterface(options) {

  // dateInterface globals

  	var dateInterface = {};
  	var edges;

	dateInterface.options = {
		targetEl: $('.container'),
		edgeType: 'Dyad',
		heading: "Default Heading"
	};

	extend(dateInterface.options, options);

  dateInterface.init = function() {

    dateInterface.options.targetEl.append('<h1>'+dateInterface.options.heading+'</h1>');
    dateInterface.options.targetEl.append('<p class="lead">'+dateInterface.options.subheading+'</p>');
    dateInterface.options.targetEl.append('<div class="date-container"></div>');

  	// get edges according to criteria
  	edges = network.getEdges(dateInterface.options.criteria);
  	console.log(edges);
  	var counter = 0;
    var row = 0;
  	$.each(edges, function(index,value) {

  		var dyadEdge = network.getEdges({type:'Dyad', from:network.getNodes({type_t0:'Ego'})[0].id, to:value.to})[0];

		var markup = '<div class="date-picker-item overlay">'+
			'<div class="row">'+
				'<div class="col-sm-12">'+
					'<h2>Regarding <span>'+dyadEdge.nname_t0+'</span></h2>'+
				'</div>'+
			'</div>'+
			'<div class="row">'+
                '<div class="alert alert-danger logic-error" role="alert">'+
                    '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>'+
                    '<span class="sr-only">Error:</span> Your last sexual encounter cannot come before your first. Please correct the dates before continuing.'+
                '</div>'+
		        '<div class="col-sm-5">'+
		        	'<div class="form-group">'+
		        	'<p class="lead">When was the first time you had sex?</p>'+
		                '<div class="input-group date first row'+row+'" id="datetimepicker'+counter+'">'+
		                    '<input type="text" class="form-control" readonly />'+
		                    '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'+
		                '</div>'+
		            '</div>'+
		        '</div>'+
		        '<div class="col-sm-5 col-sm-offset-2">'+
		        	'<div class="form-group">'+
		        	'<p class="lead">When was the last time you had sex?</p>'+
		                '<div class="input-group date second row'+row+'" id="datetimepicker'+(counter+1)+'">'+
		                    '<input type="text" class="form-control" readonly />'+
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

        $(".row"+row).on("dp.change",function (e) {
            console.log('change');
            var properties = {};
            var target, first, second;

            var $current = $(this);

            if ($(this).hasClass('first')) {

                target = parseInt($current.attr('id').slice(-1))+1;
                first = parseInt($current.attr('id').slice(-1));
                second = parseInt($current.attr('id').slice(-1))+1;
                $('#datetimepicker'+target).data("DateTimePicker").minDate(e.date);
                properties = {
                    sex_first_t0: $current.data("DateTimePicker").date().format("MM/DD/YYYY")
                };

            } else {
                target = parseInt($current.attr('id').slice(-1))-1;
                first = parseInt($current.attr('id').slice(-1))-1;
                second = parseInt($current.attr('id').slice(-1));
                $('#datetimepicker'+target).data("DateTimePicker").minDate(e.date);
                properties = {
                    sex_last_t0: $current.data("DateTimePicker").date().format("MM/DD/YYYY")
                };
            }

            if (moment($('#datetimepicker'+first).data("DateTimePicker").date()).isAfter($('#datetimepicker'+second).data("DateTimePicker").date())) {
                $current.parent().parent().parent().children('.logic-error').fadeIn();
                $('.arrow-next').attr('disabled','disabled');
            } else {
                $current.parent().parent().parent().children('.logic-error').fadeOut();
                $('.arrow-next').removeAttr('disabled');
            }

            network.updateEdge(value.id, properties);
        });

        if (typeof value.sex_first_t0 !== 'undefined') {
            console.log('first:');
            console.log(value.sex_first_t0);
            $('#datetimepicker'+counter).data("DateTimePicker").date(value.sex_first_t0);
        }
        if (typeof value.sex_last_t0 !== 'undefined') {
            console.log('last:');
            console.log(value.sex_last_t0);
            $('#datetimepicker'+(counter+1)).data("DateTimePicker").date(value.sex_last_t0);
        }

		counter=counter+2;
        row++;
  	});


  };

  dateInterface.destroy = function() {
    // Used to unbind events
  };

 	dateInterface.init();

  return dateInterface;
};
