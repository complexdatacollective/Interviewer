/* global $, window, Swiper */
/* exported ContextGenerator */
module.exports = function ContextGenerator() {
	'use strict';
	//global vars
	var taskComprehended = false;
	var moduleEvents = [];
	var contexts = [];
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
		$('.new-context-form').remove();
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
		var event = [
			{
				event: 'stageChangeStart',
				handler: contextGenerator.destroy,
				targetEl:  'window.document'
			}
		];
		window.tools.Events.register(moduleEvents, event);

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
			},
			drop: function( event, ui ) {
				contextGenerator.removeContext($(ui.draggable).data('context'));
			}
		});

		// New context buttons
		contextGenerator.options.targetEl.append('<div class="new-context-button text-center"><span class="fa fa-3x fa-plus"></span></div>');

		event = [
			{
				event: 'click',
				handler: contextGenerator.showNewContextForm,
				targetEl:  '.new-context-button'
			}
		];
		window.tools.Events.register(moduleEvents, event);

		// New context form
		$('body').append('<div class="new-context-form"></div>');
		var form = new window.netCanvas.Modules.FormBuilder();
		form.build($('.new-context-form'), {
			title: 'Create a New Context',
			fields: {
				name: {
					type: 'string',
					placeholder: 'Name of Context',
					required: true,

				}
			},
			options: {
				onSubmit: function(data) {
					if (contexts.indexOf(data.name) === -1) {
						contextGenerator.addContext(data.name);
						form.reset();
						contextGenerator.hideNewContextForm();
					} else {
						form.showError('Error: the name you have chosen is already in use.');
					}
				},
				onLoad: function() {

				},
				buttons: {
					submit: {
						label: 'Create',
						id: 'submit-btn',
						type: 'submit',
						class: 'btn-primary'
					},
					cancel: {
						label: 'Cancel',
						id: 'cancel-btn',
						type: 'button',
						class: 'btn-default',
						action: function() {
							contextGenerator.hideNewContextForm();
						}
					}
				}
			}
		});

		// Add existing data, if present
		contextGenerator.addExistingContexts();

	};

	contextGenerator.addNodeToContext = function(node) {
		$('.circle-responsive').append('<div class="node-circle-container"><div class="node-circle">'+node.name+'</div></div>');
	};

	contextGenerator.showBin = function() {
		$('.contexthull-bin-footer').addClass('show');
	};

	contextGenerator.hideBin = function() {
		$('.contexthull-bin-footer').removeClass('show');
	};

	contextGenerator.showNewContextForm = function() {
		$('.new-context-form, .black-overlay').addClass('show');
		setTimeout(function() {
			$('#name').focus();
		}, 500);
	};

	contextGenerator.hideNewContextForm = function() {
		$('.new-context-form, .black-overlay').removeClass('show');
	};

	contextGenerator.addExistingContexts = function() {
		// This module recieves one or more arrays of strings indicating the contexts that already exists.

		// First, we create a super array of all unique items across all variable arrays.
		var tempArray = [];
		var ego = window.network.getEgo();
		var toCheck = contextGenerator.options.variable;
		for (var i = 0; i < toCheck.length; i++) {
			// Check for this variable in Ego
			if (typeof ego[toCheck[i]] !== 'undefined' && typeof ego[toCheck[i]] === 'object' && typeof ego[toCheck[i]].length !== 'undefined') {
				// the target is an array, so we can copy it to our tempArray
				tempArray = tempArray.concat(ego[toCheck[i]]);
			} else {
				console.warn('Your variable "'+toCheck[i]+'" was either undefined or not an array when it was read from the Ego node.');
			}
		}
		tempArray.toUnique();
		for (var j = 0; j < tempArray.length; j++) {
			contextGenerator.addContext(tempArray[j]);
		}
	};

	contextGenerator.makeDraggable = function() {
		$('.circle-responsive').draggable({
			zIndex: 100,
			revert: true,
			revertDuration: 200,
			start: function() {
				$(this).addClass('smaller');
				contextGenerator.showBin();
			},
			stop: function() {
				$(this).removeClass('smaller');
				contextGenerator.hideBin();
			}
		});
	};

	contextGenerator.addContext = function(name) {
		if (!name) {
			throw new Error('No name provided for new context.');
		}
		contexts.push(name);
		$('.contexthull-hull-container').append('<div class="circle-responsive" data-context="'+name+'"><div class="circle-content">'+name+'</div></div>');
		contextGenerator.makeDraggable();

	};

	contextGenerator.removeContext = function(name) {
		if (!name) {
			throw new Error('No name provided to contextGenerator.deleteContext().');
		}

		if (contexts.remove(name) !== 0) {
			$('div[data-context="'+name+'"]').remove();
			return true;
		} else {
			console.warn('contextGenerator.deleteContext() couldn\'t find a context with name '+name+'. Nothing was deleted.');
			return false;
		}

	};

	return contextGenerator;
};
