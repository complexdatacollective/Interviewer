/* global $, window, Swiper */
/* exported ContextGenerator */
module.exports = function ContextGenerator() {
	'use strict';
	//global vars
	var taskComprehended = false;
	var moduleEvents = [];
	var contextGenerator = {};
	var promptSwiper;

	contextGenerator.options = {
		targetEl: $('.container'),
		variable: ['contexts'],
		prompts: [
			'Prompt 1',
			'Prompt 2',
			'Prompt 3',
			'Prompt 4'
		],
	};

	contextGenerator.destroy = function() {
		promptSwiper.destroy();
		window.tools.Events.unbind(moduleEvents);
	};

	contextGenerator.init = function(options) {
		window.tools.extend(contextGenerator.options, options);

		if (taskComprehended === false) {
			var eventProperties = {
				stage: window.netCanvas.Modules.session.currentStage(),
				timestamp: new Date()
			};
			var log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
			window.dispatchEvent(log);
			taskComprehended = true;
		}

		// Events
		var events = [
			{
				event: 'stageChangeStart',
				handler: contextGenerator.destroy,
				targetEl:  'window.document'
			}
		];
		window.tools.Events.register(moduleEvents, events);

		// containers
		contextGenerator.options.targetEl.append('<div class="contexthull-title-container"></div><div class="contexthull-hull-container"></div>');

		// Prompts
		$('.contexthull-title-container').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
		for (var i = 0; i < contextGenerator.options.prompts.length; i++) {
			$('.swiper-wrapper').append('<div class="swiper-slide">'+contextGenerator.options.prompts[i]+'</div>');
		}
		promptSwiper = new Swiper ('.swiper-container', {
			pagination: '.swiper-pagination',
			speed: 1000
		});

		// Ghost context
		$('.contexthull-hull-container').append('<div class="circle-responsive"><div class="circle-content">I am a Circle!</div></div>');

		// bin
		contextGenerator.options.targetEl.append('<div class="contexthull-bin-footer"><span class="contexthull-bin fa fa-4x fa-trash-o"></span></div>');
		$('.contexthull-bin').droppable({
			accept: '.circle-responsive',
			tolerance: 'touch',
			hoverClass: 'delete',
			over: function( event, ui ) {
				$(this).addClass('delete');
				$(ui.draggable).addClass('delete');
			},
			out: function( event, ui ) {
				$(this).removeClass('delete');
				$(ui.draggable).removeClass('delete');
			}
		});

		contextGenerator.addContext();

		$('.circle-responsive').draggable({
  			zIndex: 100,
			revert: true,
			revertDuration: 200,
			start: function( event, ui ) {
				$(this).addClass('smaller');
				contextGenerator.showBin();
			},
			stop: function( event, ui ) {
				$(this).removeClass('smaller');
				contextGenerator.hideBin();
			}
		});

	};

	contextGenerator.addNodeToContext = function(context) {
		$('.circle-responsive').append('<div class="node-circle-container"><div class="node-circle">JR</div></div>');
	};

	contextGenerator.showBin = function() {
		$('.contexthull-bin-footer').addClass('show');
	};

	contextGenerator.hideBin = function() {
		$('.contexthull-bin-footer').removeClass('show');
	};

	contextGenerator.addExistingContexts = function() {

	};

	contextGenerator.addContext = function() {
		$('.contexthull-hull-container').append('<div class="circle-responsive"><div class="circle-content">I am a Circle!</div></div>');
		$('.contexthull-hull-container').append('<div class="circle-responsive"><div class="circle-content">I am a Circle!</div></div>');
		$('.contexthull-hull-container').append('<div class="circle-responsive"><div class="circle-content">I am a Circle!</div></div>');

	};

	return contextGenerator;
};
