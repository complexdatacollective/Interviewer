/* global $, window */
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
