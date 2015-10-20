/* global $, window, Swiper, note*/
/* exported ContextGenerator */
module.exports = function ContextGenerator() {
	'use strict';
	//global vars
	var moduleEvents = [];
	var contexts = [];
	var contextGenerator = {};
	var promptSwiper;
	var dragging = false;
	var currentPrompt = 0;
	var mergeContextForm;
	var temporaryFields = {
		contexts: {
			title: 'contexts',
			type: 'hidden'
		}
	};

	contextGenerator.options = {
		targetEl: $('.container'),
		egoData: 'contexts',
		nodeDestination: 'contexts',
		createNodes: true,
		prompts: [
			'Prompt 1',
			'Prompt 2',
			'Prompt 3',
			'Prompt 4'
		],
	};

	contextGenerator.destroy = function() {
		note.info('Context generator destroyed.');

		window.forms.nameGenForm.removeFields(temporaryFields);

		promptSwiper.destroy();
		$('.new-context-form').remove();
		$('.merge-context-form').remove();
		window.tools.Events.unbind(moduleEvents);
	};

	contextGenerator.nodeAdded = function(e) {
		contextGenerator.addNodeToContext(e.originalEvent.detail);
	};

	contextGenerator.init = function(options) {
		note.info('Context generator initialised.');

		// Add temporary fields to newNodeForm
		window.forms.nameGenForm.addFields(temporaryFields);

		window.tools.extend(contextGenerator.options, options);
		// Events
		var event = [{
			event: 'changeStageStart',
			handler: contextGenerator.destroy,
			targetEl:  window
		},
		{
			event: 'nodeAdded',
			handler: contextGenerator.nodeAdded,
			targetEl:  window
		}];
		window.tools.Events.register(moduleEvents, event);

		// containers
		contextGenerator.options.targetEl.append('<div class="contexthull-title-container"></div><div class="contexthull-hull-container"></div>');

		// Prompts
		$('.contexthull-title-container').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
		for (var i = 0; i < contextGenerator.options.prompts.length; i++) {
			$('.swiper-wrapper').append('<div class="swiper-slide"><h2>'+contextGenerator.options.prompts[i]+'</h2></div>');
		}
		promptSwiper = new Swiper ('.swiper-container', {
			pagination: '.swiper-pagination',
			speed: 1000
		});

		// Update current prompt counter
		promptSwiper.on('slideChangeEnd', function () {
    		currentPrompt = promptSwiper.activeIndex;
		});

		// bin
		contextGenerator.options.targetEl.append('<div class="contexthull-bin-footer"><span class="contexthull-bin fa fa-4x fa-trash-o"></span></div>');
		$('.contexthull-bin').droppable({
			// accept: '.circle-responsive',
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
				if ($(ui.draggable).hasClass('circle-responsive')) {
					contextGenerator.removeContext($(ui.draggable).data('context'));
				} else {
					contextGenerator.removeNode($(ui.draggable).data('id'));
				}

			}
		});

		// New context buttons
		contextGenerator.options.targetEl.append('<div class="new-context-button text-center"><span class="fa fa-2x fa-pencil"></span></div>');

		// New context form
		$('body').append('<div class="new-context-form"></div>');
		var newContextForm = new window.netCanvas.Modules.FormBuilder('newContextForm');
		newContextForm.build($('.new-context-form'), {
			title: 'Create a New Context',
			fields: {
				name: {
					type: 'text',
					placeholder: 'Name of Context',
					required: true,

				}
			},
			options: {
				onSubmit: function(data) {
					if (contexts.indexOf(data.name) === -1) {
						// Update ego
						var properties = {};
						properties[contextGenerator.options.nodeDestination] = contexts;
						window.network.updateNode(window.network.getEgo().id, properties);
						contextGenerator.addContext(data.name);
						newContextForm.reset();
						newContextForm.hide();
					} else {
						newContextForm.showError('Error: the name you have chosen is already in use.');
					}
				},
				buttons: {
					submit: {
						label: 'Create',
						id: 'context-submit-btn',
						type: 'submit',
						class: 'btn-primary'
					},
					cancel: {
						label: 'Cancel',
						id: 'context-cancel-btn',
						type: 'button',
						class: 'btn-default',
						action: function() {
							newContextForm.reset();
							newContextForm.hide();
						}
					}
				}
			}
		});

		event = [{
			event: 'click',
			handler: window.forms.newContextForm.show,
			targetEl:  '.new-context-button'
		}];
		window.tools.Events.register(moduleEvents, event);

		$('body').append('<div class="merge-context-form"></div>');
		mergeContextForm = new window.netCanvas.Modules.FormBuilder('mergeContextForm');
		mergeContextForm.build($('.merge-context-form'), {
			title: 'What should the merged context be called?',
			fields: {
				merged_name: {
					type: 'text',
					placeholder: 'Name of Context',
					required: true,

				},
				source: {
					'type':'hidden',
					'title':'source',
					'name': 'source',
				},
				target: {
					'type':'hidden',
					'title':'target',
					'name': 'target',
				}
			},
			options: {
				onSubmit: function(data) {
					contextGenerator.mergeContexts(data.source, data.target, data.merged_name);
					window.forms.mergeContextForm.reset();
					window.forms.mergeContextForm.hide();
				},
				buttons: {
					submit: {
						label: 'Create',
						id: 'merge-submit-btn',
						type: 'submit',
						class: 'btn-primary'
					},
					cancel: {
						label: 'Cancel',
						id: 'merge-cancel-btn',
						type: 'button',
						class: 'btn-default',
						action: function() {
							mergeContextForm.reset();
							window.forms.mergeContextForm.hide();
						}
					}
				}
			}
		});

		// Add existing data, if present
		if (typeof window.network.getEgo()[contextGenerator.options.egoData] === 'undefined') {
			note.warn('Ego didn\'t have the community variable you specified, so it was created as a blank array.');
			var properties = {};
			properties[contextGenerator.options.egoData] = [];
			window.network.updateNode(window.network.getEgo().id, properties);
		} else {
			contextGenerator.addExistingContexts();
		}

	};

	contextGenerator.addNodeToContext = function(node) {
		note.info('contextGenerator.addNodeToContext():'+node.first_name);
		// fix the context variable as an array.
		if (typeof node.contexts !== 'object') {
			var contextArray = [];
			contextArray.push(node.contexts);
			var updateNode = window.network.getNode(node.id);
			updateNode.contexts = contextArray;
			window.netCanvas.Modules.session.saveData();
		}

		note.debug('contextGenerator: adding node to context');
		note.debug(node);
		$('[data-context="'+node[contextGenerator.options.nodeDestination]+'"]').append('<div class="node-circle-container"><div class="node-circle" data-id="'+node.id+'">'+node.label+'</div></div>');
		contextGenerator.makeNodesDraggable();
	};

	contextGenerator.showBin = function() {
		$('.contexthull-bin-footer').addClass('show');
	};

	contextGenerator.hideBin = function() {
		$('.contexthull-bin-footer').removeClass('show');
	};

	contextGenerator.addExistingContexts = function() {
		note.info('contextGenerator.addExistingContexts()');
		// First, we create a super array of all unique items across all variable arrays.
		var egoData = window.network.getEgo()[contextGenerator.options.egoData];

		$.each(egoData, function(index, value) {
			contextGenerator.addContext(value);
		});

		// Add any nodes to the contexts (filter to ignore ego)
		var nodes = window.network.getNodes({}, function (results) {
			var filteredResults = [];
			$.each(results, function(index,value) {
				if (value.type !== 'Ego') {
					filteredResults.push(value);
				}
			});

			return filteredResults;
		});

		$.each(nodes, function(nodeIndex, nodeValue) {
			// only deal with nodes that have a single context. is this right?
			if (typeof nodeValue[contextGenerator.options.nodeDestination] !== 'undefined' && nodeValue[contextGenerator.options.nodeDestination].length === 1) {
				// Check if the context exists
				if (contexts.indexOf(nodeValue[contextGenerator.options.nodeDestination][0] !== -1)) {
					contextGenerator.addNodeToContext(nodeValue);
				} else {
					note.warn('A node was found with a context that didn\'t exist!');
				}
 			} else {
				note.debug('Ignored a node with multiple contexts.');
			}

		});

	};

	contextGenerator.makeDraggable = function() {
		$('.circle-responsive').draggable({
			// zIndex: 100,
			revert: true,
			refreshPositions: true,
			revertDuration: 200,
			stack: '.circle-responsive',
			scroll: false,
			start: function() {
				dragging = true;
				contextGenerator.showBin();
				$(this).addClass('smaller');

			},
			stop: function() {
				setTimeout(function(){dragging = false;}, 100);
				$(this).removeClass('smaller');
				contextGenerator.hideBin();
			}
		});

		$('.circle-responsive').droppable({
			// accept: '.circle-responsive',
			// tolerance: 'fit',
			hoverClass: 'merge',
			over: function(event, ui) {
				// $(this).addClass('merge');
				$(ui.draggable).addClass('merge');
			},
			out: function( event, ui ) {

				$(ui.draggable).removeClass('merge');
			},
			drop: function( event, ui ) {
				setTimeout(function(){dragging = false;}, 100);
				if ($(ui.draggable).hasClass('circle-responsive')) {
					$(this).removeClass('merge');
					$(ui.draggable).removeClass('merge');
					var props = {
						merged_name: $(ui.draggable).data('context')+'/'+$(this).data('context'),
						source: $(ui.draggable).data('context'),
						target: $(this).data('context')
					};
					console.log(props);
					window.forms.mergeContextForm.addData(props);
					window.forms.mergeContextForm.show();
					window.forms.nameGenForm.hide();

				} else if ($(ui.draggable).hasClass('node-circle')) {
					$(this).removeClass('merge');
					$(ui.draggable).removeClass('merge');
					// check if we are dropping back where we started, and cancel if so.
					if ($(this).data('context') !== $(ui.draggable).parent().parent().data('context')) {
						contextGenerator.moveNode($(ui.draggable).data('id'), $(this).data('context'));
					}

				} else {
					$(this).removeClass('merge');
					$(ui.draggable).removeClass('merge');
					// contextGenerator.removeNode($(ui.draggable).data('id'));
				}

			}
		});
	};

	contextGenerator.makeNodesDraggable = function() {
		$('.node-circle').draggable({
			stack: '.circle-responsive',
			revert: true,
			revertDuration: 200,
			refreshPositions: true,
			scroll: false,
			start: function() {
				$(this).addClass('border');
				contextGenerator.showBin();
			},
			stop: function() {
				$(this).removeClass('border');
				contextGenerator.hideBin();
			}
		});

	};

	contextGenerator.mergeContexts = function (source, target, newName) {
		if (!source || !target || !newName) {
			note.error('ContextGenerator: mergeContexts() needs better parameters!');
			return false;
		}

		note.warning('I\'m not clever enough to check for nodes not visible that are already in both contexts...but I soon will be.');

		// Create a new context with the combined name.
		contextGenerator.addContext(newName);

		// Move nodes from the source and target to the new context
		var sourceNodes = contextGenerator.getContextNodes(source);
		var targetNodes = contextGenerator.getContextNodes(target);
		$.each(sourceNodes, function(index, value) {
			contextGenerator.moveNode(value, newName);
		});
		$.each(targetNodes, function(index, value) {
			contextGenerator.moveNode(value, newName);
		});

		// Remove previous contexts
		contextGenerator.removeContext(source);
		contextGenerator.removeContext(target);

	};

	contextGenerator.addContext = function(name) {
		if (!name) {
			note.error('No name provided for new context.');
			throw new Error('No name provided for new context.');
		}
		contexts.push(name);

		// use lowest available color
		var color = 1;
		while ($('.circle-responsive[data-index='+color+']').length > 0) {
			color++;
		}
		$('.contexthull-hull-container').append('<div class="circle-responsive" data-index="'+color+'" data-context="'+name+'"><div class="circle-content">'+name+'</div></div>');
		contextGenerator.makeDraggable();
		if (contextGenerator.options.createNodes === true) {
			var event = [{
				event: 'click',
				handler: contextGenerator.showNewNodeForm,
				targetEl:  '[data-context="'+name+'"]'
			}];
			window.tools.Events.register(moduleEvents, event);
		}

	};

	contextGenerator.showNewNodeForm = function() {
		if (!dragging) {
			var target = $(this).data('context');
			window.forms.nameGenForm.addData({contexts: target});
			window.forms.nameGenForm.show();
		}
	};

	contextGenerator.removeContext = function(name) {
		if (!name) {
			note.error('No name provided to contextGenerator.deleteContext().');
			throw new Error('No name provided to contextGenerator.deleteContext().');
		}

		if (contexts.remove(name) !== 0) {
			var properties = {};
			properties[contextGenerator.options.egoData] = contexts;
			window.network.updateNode(window.network.getEgo().id, properties);

			// Remove nodes
			var childNodes = $('div[data-context="'+name+'"]').children('.node-circle-container');
			$.each(childNodes, function(nodeIndex, nodeValue) {
				var thisId = $(nodeValue).children('.node-circle');
				contextGenerator.removeNode($(thisId).data('id'));
			});
			$('div[data-context="'+name+'"]').remove();
			return true;
		} else {
			note.warn('contextGenerator.deleteContext() couldn\'t find a context with name '+name+'. Nothing was deleted.');
			return false;
		}

	};

	contextGenerator.getContextNodes = function(name) {
		if (!name) {
			note.error('No name provided to contextGenerator.getContextNodes().');
		}

		var nodes = [];
		// Remove nodes
		var childNodes = $('div[data-context="'+name+'"]').children('.node-circle-container');
		$.each(childNodes, function(nodeIndex, nodeValue) {
			var thisId = $(nodeValue).children('.node-circle');
			nodes.push($(thisId).data('id'));
		});

		return nodes;

	};

	contextGenerator.removeNode = function(id) {
		if (!id) {
			note.error('No id provided to contextGenerator.deleteNode().');
			throw new Error('No id provided to contextGenerator.deleteNode().');
		}

		if (window.network.removeNode(id)) {
			$('div[data-id="'+id+'"]').remove();
			note.info('Deleted node with id '+id);
			return true;
		} else {
			note.warn('contextGenerator.removeNode() tried to remove node with ID '+id+', but failed.');
			return false;
		}
	};

	contextGenerator.moveNode = function(node, targetContext) {

		var properties = {};
		properties[contextGenerator.options.nodeDestination] = [];
		properties[contextGenerator.options.nodeDestination].push(targetContext);
		window.network.updateNode(node, properties, function() {
			var target = $('div[data-context="'+targetContext+'"]');
			var element = $('div[data-id="'+node+'"]').parent();
			$(element).appendTo(target);
			return true;
		});
	};

	return contextGenerator;
};
