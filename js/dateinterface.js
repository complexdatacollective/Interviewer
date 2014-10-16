/* global extend, network */
/* exported DateInterface */


/*



*/

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

  	// get edges according to criteria
  	edges = network.getEdges(dateInterface.options.criteria);
  	console.log(edges);
  	var counter = 0;
  	$.each(edges, function(index,value) {
  		var dyadEdge = network.getEdges({type:'Dyad', from:network.getNodes({type_t0:'Ego'})[0].id, to:value.to})[0];

		var markup = '<div class="canvas-followup overlay">'+
			'<div class="row">'+
				'<div class="col-sm-12">'+
					'<h2>Regarding <span>'+dyadEdge.nname_t0+'</span></h2>'+
				'</div>'+
			'</div>'+
			'<div class="row">'+
		        '<div class="col-sm-6">'+
		        	'<div class="form-group">'+
		        	'<p class="lead">When was the first time you had sex?</p>'+
		                '<div class="input-group date" id="datetimepicker'+counter+'">'+
		                    '<input type="text" class="form-control" />'+
		                    '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'+
		                '</div>'+
		            '</div>'+
		        '</div>'+
		        '<div class="col-sm-6">'+
		        	'<div class="form-group">'+
		        	'<p class="lead">When was the last time you had sex?</p>'+
		                '<div class="input-group date" id="datetimepicker'+counter+1 +'">'+
		                    '<input type="text" class="form-control" />'+
		                    '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>'+
		                '</div>'+
		            '</div>'+
		        '</div>'+
		    '</div>'+						    
		'</div>';

		$(markup).appendTo('.container');
		var dateoptions = {pickTime: false};
  		$('#datetimepicker'+counter).datetimepicker(dateoptions);
  		$('#datetimepicker'+counter+1).datetimepicker(dateoptions);
		counter=counter+2;



  	});


  };

  dateInterface.destroy = function() {
    // Used to unbind events
  };

 	dateInterface.init();

  return dateInterface;
};