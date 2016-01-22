/* global Konva, window, $, note, ConvexHullGrahamScan, Image, Swiper */
/* exported Sociogram */
/*jshint bitwise: false*/

module.exports = function Sociogram() {
	'use strict';
	// Global variables
	var stage = {}, circleLayer = {}, edgeLayer = {}, nodeLayer = {}, wedgeLayer = {}, hullLayer = {}, hullShapes = {}, uiLayer = {}, sociogram = {};
	var moduleEvents = [], selectedNodes = [], moduleEvents = [];
	sociogram.selectedNode = null;
	var newNodeCircleTween, promptSwiper, log, longPressTimer, tapTimer;
	var nodesWithoutPositions = 0, currentPrompt = 0;
	var newNodeCircleVisible = false, hullsShown = false, taskComprehended = false, touchNotTap = false;

	// Colours
	var colors = {
		blue: '#0174DF',
		tomato: '#FF6347',
		teal: '#008080',
		hullpurple: '#9a208e',
		freesia: '#ffd600',
		hullgreen: '#6ac14c',
		cayenne: '#c40000',
		placidblue: '#83b5dd',
		violettulip: '#9B90C8',
		hemlock: '#9eccb3',
		paloma: '#aab1b0',
		sand: '#ceb48d',
		dazzlingblue: '#006bb6',
		edge: '#dd393a',
		selected: '#ffbf00',
	};

	var hullColors = ['#01a6c7','#1ECD97', '#B16EFF','#FA920D','#e85657','Gold','Pink','Saddlebrown','Teal','Silver'];

	// Default settings
	var settings = {
		network: window.netCanvas.Modules.session.getPrimaryNetwork(),
		targetEl: 'kineticCanvas',
		// consecutive single tap - edge mode
		// drag - layout mode
		// double tap - select mode
		// long press - community mode
		modes:['Position'], //edge - create edges, position - lay out, select - node attributes
	    panels: ['details'], // Mode - switch between modes, Details - long press shows node details
		options: {
			defaultNodeSize: 29,
			defaultNodeColor: 'white',
			defaultNodeStrokeWidth: 7,
			defaultLabelColor: 'black',
			defaultEdgeColor: colors.edge,
			concentricCircleColor: '#ffffff',
			concentricCircleNumber: 4,
			concentricCircleSkew: false,
			showMe: true
		},
		dataOrigin: {
			'Position': {
				type: 'node',
				variable: 'coords'
			},
			'Community' : {
				type: 'ego',
				name: 'Groups',
				egoVariable: 'contexts',
				variable: 'contexts'
			}
		},
		prompts: [],
	    criteria: { // criteria for being shown on this screen
	        includeEgo: false,
	        query: {
	        }
	    }
	};

	// Private functions

	// Adjusts the size of text so that it will always fit inside a given shape.
	function padText(text, container, amount){
		while (( text.getTextWidth() * 1.001 ) < container.width() - ( amount * 2 ) && ( text.getTextHeight() * 1.001 ) < container.height() - ( amount * 2 )) {
			text.fontSize( text.fontSize() * 1.001 );
		}

		text.y( ( (text.getTextHeight() /2) ) * -1);
		text.x( ( (text.getTextWidth() / 2) *- 1 ) );

		//
		// text.width( container.width() );
		// text.height( container.height() );

		console.log('--------------');
		console.log(text.getText());
		console.log(container.getWidth());
		console.log(container.getHeight());
		console.log(text.getTextWidth());
		console.log(text.getTextHeight());
	}

	function toPointFromObject(array) {
		var newArray = [];
		for (var i = 0; i<array.length; i++) {
			newArray.push(array[i].x);
			newArray.push(array[i].y);
		}

		return newArray;
	}

	function addNodeHandler(e) {
		sociogram.addNode(e.detail);
	}

	sociogram.hullListClickHandler = function(e) {
		console.log('sociogram: hullListClickHandler');
		var _this = this;
		var clicked = $(e.target).closest('li');
		var selectedHull = clicked.data('hull');
		console.log('selectedHull');
		console.log(selectedHull);
		console.log('selectedNode:');
		console.log(sociogram.selectedNode);
		if (sociogram.selectedNode.attrs.contexts.indexOf(selectedHull) !== -1 ) {
			clicked.removeClass('active');
			sociogram.removePointFromHull(sociogram.selectedNode, selectedHull);
		} else {
			clicked.addClass('active');
			sociogram.addPointToHull(sociogram.selectedNode, selectedHull);
		}
	};

	function groupButtonClickHandler() {
		sociogram.addHull();
	}

	sociogram.changeData = function() {
		sociogram.resetNodeState();
		sociogram.updateState();
	};

	sociogram.init = function (userSettings) {

		note.info('Sociogram initialising.');

		$.extend(true, settings,userSettings);
		// Add the title and heading
		$('<div class="sociogram-title"></div>').insertBefore('#'+settings.targetEl );

		// Creater swiper pages

		// First, check we have multiple prompts
		if (settings.prompts.length > 1) {
			$('.sociogram-title').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');

	        for (var i = 0; i < settings.prompts.length; i++) {
	            $('.swiper-wrapper').append('<div class="swiper-slide"><h4>'+settings.prompts[i].prompt+'</h4></div>');
	        }

	        promptSwiper = new Swiper ('.swiper-container', {
	            pagination: '.swiper-pagination',
				paginationClickable: true,
	            speed: 1000
	        });

	        // Update current prompt counter
	        promptSwiper.on('slideChangeEnd', function () {
	            currentPrompt = promptSwiper.activeIndex;
	            sociogram.changeData();
	        });
		} else if (settings.prompts.length === 1) {
			$('.sociogram-title').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
			$('.swiper-wrapper').append('<div class="swiper-slide"><h4>'+settings.prompts[i].prompt+'</h4></div>');
		}

		// Initialise the konva stage
		sociogram.initKinetic();

		// Draw ui compoennts
		sociogram.drawUIComponents(function() {

			// Show hulls checkbox
			if (settings.modes.indexOf('Community') !== -1) {
				$('#'+settings.targetEl).append('<input class="show-contexts-checkbox" type="checkbox" name="context-checkbox-show" id="context-checkbox-show"> <label for="context-checkbox-show">Contexts shown</label>');
			}

			// Panels
			if (settings.panels.indexOf('details') !== -1) {
				$('<div class="details-panel"><div class="context-header"><h4>Details</h4></div><ul class="list-group context-list"></ul><div class="context-footer"><div class="pull-left new-group-button"><span class="fa fa-plus-circle"></span> New context</div></div></div>').appendTo('#'+settings.targetEl);
			}

			sociogram.addNodeData();

			// Add the evevent listeners
			sociogram.bindEvents();

			// Update initial states of all nodes and edges;
			sociogram.updateState();

		});
	};

	sociogram.bindEvents = function() {
		// Events
		var event = [
			{
				event: 'changeStageStart',
				handler: sociogram.destroy,
				targetEl:  window
			},
			{
				event: 'nodeAdded',
				handler: addNodeHandler,
				targetEl:  window
			},
			{
				event: 'edgeAdded',
				handler: sociogram.updateState,
				targetEl:  window
			},
			{
				event: 'nodeRemoved',
				handler: sociogram.removeNode,
				targetEl:  window
			},
			{
				event: 'edgeRemoved',
				handler: sociogram.removeEdge,
				targetEl:  window
			},
			{
				event: 'change',
				handler: sociogram.toggleHulls,
				subTarget: '#context-checkbox-show',
				targetEl:  window.document
			},
			{
				event: 'click',
				handler: groupButtonClickHandler,
				subTarget: '.new-group-button',
				targetEl:  window.document
			},
			{
				event: 'click',
				handler: sociogram.showNewNodeForm,
				targetEl:  '.new-node-button'
			}, {
				event: 'click',
				handler: sociogram.hullListClickHandler,
				targetEl:  window.document,
				subTarget:  '.list-group-item',
			},
			{
				event: 'submit',
				handler: function() {
					setTimeout(function() {
						sociogram.updateState();
					},100);
				},
				targetEl: window.document,
				subtarget: window.forms.nameGenForm.getID()
			}
		];
		window.tools.Events.register(moduleEvents, event);

	};

	sociogram.destroy = function() {
		note.info('sociogram.destroy();');
		stage.destroy();
		window.tools.Events.unbind(moduleEvents);
	};

	sociogram.addNodeData = function() {

		var criteriaNodes;

		// get nodes according to criteria query
		// filter out ego if required
		if (settings.criteria.includeEgo !== true) {
			criteriaNodes = settings.network.getNodes(settings.criteria.query, function (results) {
				var filteredResults = [];
				$.each(results, function(index,value) {
					if (value.type !== 'Ego') {
						filteredResults.push(value);
					}
				});

				return filteredResults;
			});
		} else {
			criteriaNodes = settings.network.getNodes(settings.criteria.query);
		}

		for (var j = 0; j < criteriaNodes.length; j++) {
			sociogram.addNode(criteriaNodes[j]);
		}

		// Layout Mode
		var layoutNodes = sociogram.getKineticNodes();
		$.each(layoutNodes, function(index,node) {
			node.setPosition(node.attrs.coords);
		});

		// Community
		var communityNodes;

		// community data is coming from ego
		if (typeof window.network.getEgo().contexts === 'undefined') {
			console.warn('Ego didn\'t have the community variable you specified, so it was created as a blank array.');
			var communityProperties = {};
			communityProperties.contexts= [];
			window.network.updateNode(window.network.getEgo().id, communityProperties);
		}

		var egoHulls = window.network.getEgo().contexts;
		$.each(egoHulls, function(hullIndex, hullValue) {
			sociogram.addHull(hullValue);
		});

		communityNodes = sociogram.getKineticNodes();
		$.each(communityNodes, function(index,node) {
			$.each(node.attrs.contexts, function (hullIndex, hullValue) {
				// Difference from node mode is we check if the node hull has been defined by ego too
				// if (egoHulls.indexOf(hullValue) !== -1) {
					sociogram.addPointToHull(node, hullValue);
				// }

			});
		});

	};

	sociogram.toggleHulls = function(e) {
		note.info('Sociogram: toggleHulls()');

		if ((e && e.target.checked) || hullsShown === false) {
			$('label[for="context-checkbox-show"]').html('Contexts shown');
			new Konva.Tween({
				node: hullLayer,
				duration: 0.5,
				opacity: 1
			}).play();
			hullsShown = true;
		} else {
			$('label[for="context-checkbox-show"]').html('Contexts hidden');

			new Konva.Tween({
				node: hullLayer,
				duration: 0.5,
				opacity: 0
			}).play();

			hullsShown = false;
		}
		$('label[for="context-checkbox-show"]').addClass('show');
		setTimeout(function() {
			$('label[for="context-checkbox-show"]').removeClass('show');
		}, 2000);
		hullLayer.draw();
	};

	sociogram.resetNodeState = function() {

		// Reset select
		var kineticNodes = sociogram.getKineticNodes();
		$.each(kineticNodes, function(nodeIndex, nodeValue) {
			nodeValue.children[1].stroke(settings.options.defaultNodeColor);
		});

		nodeLayer.batchDraw();

		// Reset edges
		edgeLayer.removeChildren();
		edgeLayer.batchDraw();

	};

	sociogram.updateState = function() {
		/**
		* Updates visible attributes based on current prompt task
		*/

		// Edge Mode
		if (typeof settings.prompts[currentPrompt] !== 'undefined' && typeof settings.prompts[currentPrompt].showEdges === 'object' && typeof settings.prompts[currentPrompt].showEdges.criteria === 'object') {

			var properties = {};
			$.each(settings.prompts[currentPrompt].showEdges.criteria, function(index, value) {
				properties[value.label] = value.value;
			});
			var edges = settings.network.getEdges(properties);
			$.each(edges, function(index, edge) {
				if (typeof settings.prompts[currentPrompt].showEdges.options === "object") {
					console.log('%c edge options!','background: #222; color: #bada55');
					sociogram.addEdge(edge, settings.prompts[currentPrompt].showEdges.options);
				} else {
					sociogram.addEdge(edge);
				}

			});

		}

		// Select Mode
		if (typeof settings.prompts[currentPrompt] !== 'undefined' && typeof settings.prompts[currentPrompt].showSelected === 'object') {

			var selectNodes = settings.network.getNodes();
			$.each(selectNodes, function(index, node) {
				var currentValue = node[settings.prompts[currentPrompt].showSelected.variable];
				if (currentValue == settings.prompts[currentPrompt].showSelected.value) {
					// this node is selected
					var currentNode = sociogram.getNodeByID(node.id);
					console.log(currentNode);
					currentNode.children[1].stroke(colors.selected);
				}
			});

			nodeLayer.draw();

		}

	};

	sociogram.getSelectedNodes = function() {
		return selectedNodes;
	};

	sociogram.timeSelectedNode = function() {
		setInterval(function() {
			console.log(sociogram.selectedNode);
		}, 1000);
	};

	sociogram.addHull = function(label) {
		note.info('sociogram.addHull ['+label+']');
		// ignore groups that already exist
		label = label ? label : 'New Context '+$('li[data-hull]').length;
		if (typeof hullShapes[label] === 'undefined') {
			var thisHull = {};
			thisHull.label = label;
	        thisHull.hull = new ConvexHullGrahamScan();

			var color = hullColors[$('.list-group-item').length];

	        var hullShape = new Konva.Line({
	          points: [window.outerWidth/2, window.outerHeight/2],
	          fill: color,
	          opacity:0.5,
	          stroke: color,
	          lineJoin: 'round',
	          lineCap: 'round',
			  transformsEnabled: 'position',
			  hitGraphEnabled: false,
	          tension : 0.1,
	          strokeWidth: 80,
	          closed : true
	        });
			hullShapes[label] = hullShape;
			$('.context-list').append('<li class="list-group-item hull" data-hull="'+thisHull.label+'"><div class="context-color" style="background:'+color+'"></div> <span class="context-label">'+thisHull.label+'</span> <span class="pull-right fa fa-pencil"></span></li>');
			// $('.context-list').scrollTo('li[data-hull="'+thisHull.label+'"]', 500);
	        hullLayer.add(hullShapes[label]);
			hullLayer.opacity(0);
	        hullLayer.draw();

			// If the data origin is ego, also add the new hull to ego
			if (settings.dataOrigin.Community.type === 'ego') {
				// If ego doesn't have the variable set, create it

				var properties;
				if (typeof window.network.getEgo()[settings.dataOrigin.Community.egoVariable] === 'undefined') {
					properties = {};
					properties[settings.dataOrigin.Community.egoVariable] = [];
					window.network.updateNode(window.network.getEgo().id, properties);
				}

				// get existing data
				var egoContexts = window.network.getEgo()[settings.dataOrigin.Community.egoVariable];
				if (egoContexts.indexOf(thisHull.label) === -1) {
					// Update ego
					egoContexts.push(thisHull.label);
					window.netCanvas.Modules.session.saveData();
				}

			}

		}

    };

	sociogram.hullExists = function(hullLabel) {
		var found = false;
		if ($('li[data-hull="'+hullLabel+'"]').length > 0) {
			found = true;
		}
		return found;
	};

    sociogram.addPointToHull = function(point, hullLabel) {
		// check if hull is already present
		note.info('sociogram.addPointToHull()');
		var properties;
		// if a hull with hullLabel doesnt exist, create one
		if (!sociogram.hullExists(hullLabel)) {
			note.warn('sociogram.addPointToHull(): the hull label "'+hullLabel+'" didn\'t exist, so a new hull was created.');
			sociogram.addHull(hullLabel);
		}

		// If the point doesn't have the destination attribute, create it
		if (point.attrs.contexts === 'undefined') {
			note.warn('Node did not have the data destinateion community attribute. A blank array was created.');
			properties = {};
			properties.contexts = [];
			window.network.updateNode(point.attrs.id, properties);
		}
		// Only store if the node doesn't already have the hull present
		if (point.attrs.contexts.indexOf(hullLabel) === -1) {
			// Find the node we need to store the hull value in, and update it.

			// Create a dummy object so we can use the variable name set in settings.dataDestination
			properties = {};
			properties.contexts = point.attrs.contexts.concat([hullLabel]);
			point.attrs.contexts = point.attrs.contexts.concat([hullLabel]);

			// Update the node with the object
			settings.network.updateNode(point.attrs.id, properties, function() {
				note.debug('Network node updated', 1);
			});
		}

        // redraw all hulls begins here
        var pointHulls = point.attrs.contexts;

		// For each hull of the current point
        for (var i = 0; i < pointHulls.length; i++) {

			// Create an empty hull
            var newHull = new ConvexHullGrahamScan();

			// For each node
            for (var j = 0; j < nodeLayer.children.length; j++) {
				var thisChildHulls = nodeLayer.children[j].attrs.contexts;

				// Test if the current points current hull is in the current node's hull list

				if (thisChildHulls.indexOf(pointHulls[i]) !== -1) {
					// It is, so get the position of this node.
                    var coords = nodeLayer.children[j].getPosition();

					// Add it to the new hull
                    newHull.addPoint(coords.x, coords.y);
                }
            }

			// At the end of this loop we should have a newHull with points for all nodes

			// We need this check because on load all hull shapes might not be defined yet.
			if (typeof hullShapes[pointHulls[i]] !== 'undefined') {
				var tween = new Konva.Tween({
					node: hullShapes[pointHulls[i]],
					points: toPointFromObject(newHull.getHull()),
					duration: 0.5,
					onFinish: function(){
						tween.destroy();
					}
				}).play();

			}

			hullLayer.batchDraw();
            nodeLayer.draw();

        }

    };

	sociogram.redrawHulls = function() {
		for (var i = 0; i < hullShapes.length; i++) {
			var newHull = new ConvexHullGrahamScan();

			for (var j = 0; j < nodeLayer.children.length; j++) {
				var thisChildHulls = nodeLayer.children[j].attrs.contexts;
				if (thisChildHulls.indexOf(hullShapes[i]) !== -1) {
					var coords = nodeLayer.children[j].getPosition();
					newHull.addPoint(coords.x, coords.y);
				}
			}

			hullShapes[i].setPoints(toPointFromObject(newHull.getHull()));
			hullLayer.batchDraw();

		}

	};

	sociogram.getHullShapes = function() {
		return hullShapes;
	};

	sociogram.removePointFromHull = function(point, hullLabel) {
		note.info('sociogram.removePointFromHull()');
		var properties;

		// store properties according to data destination
		if (settings.dataOrigin.Community.type === 'node') {

			// If the point doesn't have the attribute, fail
			if (point.attrs[settings.dataDestination.Community.variable] === 'undefined') {
				note.error('sociogram.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			}

			// If the hull isnt in the node, fail
			if (point.attrs[settings.dataDestination.Community.variable].indexOf(hullLabel) === -1) {
				note.error('sociogram.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			} else {
				// Find the node we need to store the hull value in, and update it.

				// Create a dummy object so we can use the variable name set in settings.dataDestination
				properties = {};
				var nodePointHulls = point.attrs.contexts;
				nodePointHulls.remove(hullLabel);
				properties[settings.dataDestination.Community.variable] = nodePointHulls;
				point.attrs.contexts = nodePointHulls;

				// Update the node with the object
				settings.network.updateNode(point.attrs.id, properties, function() {
					note.info('Network node updated', 1);
					note.debug(properties);
				});
			}

		} else if (settings.dataOrigin.Community.type === 'ego') {

			// If the point doesn't have the attribute, fail
			if (point.attrs[settings.dataOrigin.Community.variable] === 'undefined') {
				note.error('sociogram.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			}

			// If the hull isnt in the node, fail
			if (point.attrs[settings.dataOrigin.Community.variable].indexOf(hullLabel) === -1) {
				note.error('sociogram.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			} else {
				// Find the node we need to store the hull value in, and update it.

				// Create a dummy object so we can use the variable name set in settings.dataOrigin
				properties = {};
				var egoPointHulls = point.attrs.contexts;
				egoPointHulls.remove(hullLabel);
				properties[settings.dataOrigin.Community.variable] = egoPointHulls;
				point.attrs.contexts = egoPointHulls;

				// Update the node with the object
				settings.network.updateNode(point.attrs.id, properties, function() {
					note.info('Network node updated', 1);
					note.debug(properties);
				});
			}
		} else if (settings.dataOrigin.Position.type === 'edge') {
			// not yet implemented
		}


		// redraw only the hull that the node has been removed from
		// Create an empty hull
        var newHull = new ConvexHullGrahamScan();

		// For each node
        for (var j = 0; j < nodeLayer.children.length; j++) {
			var thisChildHulls = nodeLayer.children[j].attrs.contexts;

			// Test if the current points current hull is in the current node's hull list
			if (thisChildHulls.indexOf(hullLabel) !== -1) {
				// It is, so get the position of this node.
                var coords = nodeLayer.children[j].getPosition();

				// Add it to the new hull
                newHull.addPoint(coords.x, coords.y);
            }
        }

		// At the end of this loop we should have a newHull with points for all nodes

		// We need this check because on load all hull shapes might not be defined yet.
		if (typeof hullShapes[hullLabel] !== 'undefined') {
			var tween = new Konva.Tween({
				node: hullShapes[hullLabel],
				points: toPointFromObject(newHull.getHull()),
				duration: 0.5,
				onFinish: function(){
					tween.destroy();
				}
			}).play();
		}

		hullLayer.batchDraw();
        nodeLayer.draw();


	};

	sociogram.addNode = function(options) {

		note.info('Sociogram is creating a node.');
		note.debug(options);
		// Placeholder for getting the number of nodes we have.
		var nodeShape;

		var nodeID = 0;
		while (settings.network.getNode(nodeID) !== false) {
			nodeID++;
		}

		var dragStatus = false;
		if (settings.modes.indexOf('Position') !== -1 || settings.modes.indexOf('Edge') !== -1) {
			dragStatus = true;
		}

		// Try to guess at a label if one isn't provided.
		// Is there a better way of doing this?
		if (typeof options.label === 'undefined' && typeof options.nname_t0 !== 'undefined') { // for RADAR use nickname
			options.label = options.nname_t0;
		} else if (typeof options.label === 'undefined' && typeof options.name !== 'undefined'){
			options.label = options.name;
		}

		var nodeOptions = {
			id: nodeID,
			coords: [],
			positioned: false,
			label: 'Undefined',
			type: 'Person',
			transformsEnabled: 'position',
			size: settings.options.defaultNodeSize,
			color: settings.options.defaultNodeColor,
			strokeWidth: settings.options.defaultNodeStrokeWidth,
			stroke: settings.options.defaultNodeColor,
			draggable: dragStatus,
			dragDistance: 20
		};

		nodeOptions.contexts = [];
		window.tools.extend(nodeOptions, options);

		nodeOptions.id = parseInt(nodeOptions.id, 10);
		nodeOptions.x = nodeOptions.coords[0] ? nodeOptions.coords[0] : false;
		nodeOptions.y = nodeOptions.coords[1] ? nodeOptions.coords[1] : false;

		var nodeGroup = new Konva.Group(nodeOptions);

		var selectCircle = new Konva.Circle({
			radius: nodeOptions.size+(nodeOptions.strokeWidth*1.5),
			fill:settings.options.defaultEdgeColor,
			transformsEnabled: 'position',
			opacity:0
		});

		nodeShape = new Konva.Circle({
			radius: nodeOptions.size,
			fill:nodeOptions.color,
			transformsEnabled: 'position',
			strokeWidth: nodeOptions.strokeWidth,
			stroke: nodeOptions.stroke,
			shadowColor: 'black',
			shadowBlur: 2,
			shadowOffset: {x : 0, y : 0},
			shadowOpacity: 1
		});

		// var label = nodeOptions.label.wrap(8,3);
		var nodeLabel = new Konva.Text({
			text: nodeOptions.label,
			fontSize: 13,
			fontFamily: 'Lato',
			transformsEnabled: 'position',
			fill: settings.options.defaultLabelColor,
			// width:nodeShape.getWidth(),
			// height:nodeShape.getHeight(),
			align: 'center',
			// width: (settings.options.defaultNodeSize*2),
			// height: (settings.options.defaultNodeSize*2),
			// x: -35,
			// y: -5,
			// lineHeight: (settings.options.defaultNodeSize*2),
			fontStyle:500
		});

		padText(nodeLabel,nodeShape,8);

		note.debug('Putting node '+nodeOptions.label+' at coordinates x:'+nodeOptions.coords[0]+', y:'+nodeOptions.coords[1]);

		nodeGroup.add(selectCircle);
		nodeGroup.add(nodeShape);
		nodeGroup.add(nodeLabel);

		nodeLayer.add(nodeGroup);

		setTimeout(function() {
			nodeLayer.draw();
		}, 0);

		if (!options.coords || nodeOptions.coords.length === 0) {
			nodesWithoutPositions++;
			if (!newNodeCircleVisible) {
				newNodeCircleTween.play();
				newNodeCircleVisible = true;
			}
			nodeGroup.position({
				x: 0,
				y:$(window).height()/2
			});
			new Konva.Tween({
				node: nodeGroup,
				x: 145,
				y: $(window).height()/2,
				duration:0.7,
				easing: Konva.Easings.EaseOut
			}).play();
			// settings.network.setProperties(settings.network.getNode(nodeOptions.id),{coords:[$(window).width()-150, $(window).height()-150]});
		} else {

		}

		// Node event handlers
		nodeGroup.on('dragstart', function() {

			window.wedge.anim.stop();
			window.clearTimeout(longPressTimer);
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
			if (this.attrs.positioned === false ) {
				this.attrs.positioned = true;
				nodesWithoutPositions--;
				if (nodesWithoutPositions < 1) {
					newNodeCircleTween.reverse();
					newNodeCircleVisible = false;
				}
			}

			this.moveToTop();
			nodeLayer.draw();

			var dragNode = nodeOptions.id;

			// Update the position of any connected edges and hulls
			var pointHulls = this.attrs.contexts;
			for (var i = 0; i < pointHulls.length; i++) {
				var newHull = new ConvexHullGrahamScan();

				for (var j = 0; j < nodeLayer.children.length; j++) {
					var thisChildHulls = nodeLayer.children[j].attrs.contexts;
					if (thisChildHulls.indexOf(pointHulls[i]) !== -1) {
						var coords = nodeLayer.children[j].getPosition();
						newHull.addPoint(coords.x, coords.y);
					}
				}

				console.log(hullShapes);
				console.log(pointHulls[i]);
				hullShapes[pointHulls[i]].setPoints(toPointFromObject(newHull.getHull()));
				hullLayer.batchDraw();

			}

			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from === dragNode || value.attrs.to === dragNode) {
					var points = [sociogram.getNodeByID(value.attrs.from).getX(), sociogram.getNodeByID(value.attrs.from).getY(), sociogram.getNodeByID(value.attrs.to).getX(), sociogram.getNodeByID(value.attrs.to).getY()];
					value.attrs.points = points;

				}
			});

		});

		nodeGroup.on('dragmove', function() {

			// Cancel wedge actions
			window.wedge.anim.stop();
			var tween = new Konva.Tween({
				 node: window.wedge,
				 opacity: 0,
				 duration: 0,
				 onFinish: function(){
					 tween.destroy();
				 }
			}).play();
			window.clearTimeout(longPressTimer);

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
			// Update the position of any connected edges and hulls
			var pointHulls = this.attrs.contexts;
			for (var i = 0; i < pointHulls.length; i++) {
				var newHull = new ConvexHullGrahamScan();

				for (var j = 0; j < nodeLayer.children.length; j++) {
					var thisChildHulls = nodeLayer.children[j].attrs.contexts;
					if (thisChildHulls.indexOf(pointHulls[i]) !== -1) {
						var coords = nodeLayer.children[j].getPosition();
						newHull.addPoint(coords.x, coords.y);
					}
				}

				hullShapes[pointHulls[i]].setPoints(toPointFromObject(newHull.getHull()));
				hullLayer.batchDraw();

			}

			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from === dragNode || value.attrs.to === dragNode) {
					var points = [sociogram.getNodeByID(value.attrs.from).getX(), sociogram.getNodeByID(value.attrs.from).getY(), sociogram.getNodeByID(value.attrs.to).getX(), sociogram.getNodeByID(value.attrs.to).getY()];
					value.attrs.points = points;

				}
			});
			edgeLayer.batchDraw();
		});

		nodeGroup.on('touchstart mousedown', function() {

			var currentNode = this;

			window.wedge.setAbsolutePosition(this.getAbsolutePosition());

			window.wedge.anim = new Konva.Animation(function(frame) {
				var duration = 350;
				if (frame.time >= duration) { // point of selection
					window.wedge.setAngle(360);
					currentNode.fire('longPress');
				} else {
					window.wedge.opacity(frame.time*(1/duration));
					window.wedge.setStrokeWidth(1+(frame.time*(20/duration)));
					window.wedge.setAngle(frame.time*(360/duration));
				}

			}, wedgeLayer);

			longPressTimer = setTimeout(function() {
				touchNotTap = true;
				window.wedge.anim.start();
			}, 150);

		});

		nodeGroup.on('longPress', function() {
			console.log('longpress');
			sociogram.showDetailsPanel();
			console.log('!!!setting selected node: longpress')
			sociogram.selectedNode = this;
			console.log(sociogram.selectedNode);
			var currentNode = this;
			$('.hull').removeClass('active'); // deselect all groups

			// Update side panel
			$('.context-header h4').html('Details for '+currentNode.attrs.label);
			$.each(currentNode.attrs.contexts, function(index, value) {
				$('[data-hull="'+value+'"]').addClass('active');
			});
			window.wedge.anim.stop();
			window.clearTimeout(longPressTimer);
		});

		nodeGroup.on('touchend mouseup', function() {

			window.wedge.anim.stop();
			var tween = new Konva.Tween({
				 node: window.wedge,
				 opacity: 0,
				 duration: 0.3,
				 onFinish: function(){
					 tween.destroy();
				 }
	 	 	}).play();
			window.clearTimeout(longPressTimer);
		});

		nodeGroup.on('dbltap dblclick', function() {

			selectedNodes = [];
			// var kineticNodes = sociogram.getKineticNodes();
			// $.each(kineticNodes, function(index, value) {
			// 	value.children[0].opacity(0);
			// });
			window.clearTimeout(tapTimer);

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
			window.dispatchEvent(log);

			var currentNode = this;

			// if select mode enabled
			if (typeof settings.prompts[currentPrompt] !== 'undefined' && typeof settings.prompts[currentPrompt].showSelected === 'object') {

				// flip variable

				// Get current variable value
				var properties = {};
				var currentValue = settings.network.getNode(currentNode.attrs.id)[settings.prompts[currentPrompt].showSelected.variable];
				// flip
				if (currentValue != settings.prompts[currentPrompt].showSelected.value || typeof currentValue === 'undefined') {
					properties[settings.prompts[currentPrompt].showSelected.variable] = settings.prompts[currentPrompt].showSelected.value;
					currentNode.children[1].stroke(colors.selected);
				} else {
					// remove static variables, if present
					var node = window.network.getNode(currentNode.attrs.id);
					node[settings.prompts[currentPrompt].showSelected.variable] = 0;
					currentNode.children[1].stroke(settings.options.defaultNodeColor);
				}

				settings.network.updateNode(currentNode.attrs.id, properties);

			}
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('tap click', function() {
			/**
			* Tap (or click when using a mouse) events on a node trigger one of two actions:
			*
			* (1) If a hull is currently selected, tapping a node will add it to the selected hull. Any other events
			* (for example edge creation) will be ignored.
			*
			* (2) If edge creation mode is enabled and there are no selected hulls, tapping a node will mark it as being selected for potential linking.
			* If the node is the first to be selected, nothing more will happen. If it is the second, an edge will be
			* created according to the edge destination settings.
			*/

			var currentNode = this; // Store the context

			if (!touchNotTap) { /** check we aren't in the middle of a touch */

				window.wedge.anim.stop(); // Cancel any existing touch hold animations

				if (tapTimer !== null) { window.clearTimeout(tapTimer); } // clear any previous tapTimer

				/** Conduct all tap actions inside a short timeout to give space for a double tap event to cancel it. */
				tapTimer = setTimeout(function(){
					window.clearTimeout(longPressTimer);
					if (taskComprehended === false) {
						var eventProperties = {
							stage: window.netCanvas.Modules.session.currentStage(),
							timestamp: new Date()
						};
						log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
						window.dispatchEvent(log);
						taskComprehended = true;
					}
					log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeClick', 'eventObject':currentNode.attrs.id}});
					window.dispatchEvent(log);

					/** Test if edge creation mode is enabled */
					if (typeof settings.prompts[currentPrompt] !== 'undefined' && typeof settings.prompts[currentPrompt].showEdges === 'object') {

						// Ignore two clicks on the same node
						if (selectedNodes[0] === currentNode) {
							selectedNodes[0].children[0].opacity(0);
							selectedNodes = [];
							nodeLayer.draw();
							return false;
						}

						// Push the clicked node into the selected nodes array;
						selectedNodes.push(currentNode);

						// Check the length of the selected nodes array.
						if(selectedNodes.length === 2) {
							//If it containes two nodes, create an edge

							//Reset the styling
							selectedNodes[1].children[0].opacity(0);
							selectedNodes[0].children[0].opacity(0);

							// Create an edge object

								var edgeProperties = {};
								edgeProperties = {
									from: selectedNodes[0].attrs.id,
									to: selectedNodes[1].attrs.id,
								};

								// Add the custom variables
								$.each(settings.prompts[currentPrompt].showEdges.criteria, function(index, value) {
									edgeProperties[value.label] = value.value;
								});

								// Try adding the edge. If it returns fals, it already exists, so remove it.
								console.log(edgeProperties);
								if (settings.network.addEdge(edgeProperties) === false) {
									note.debug('Sociogram removing edge.',2);
									settings.network.removeEdge(settings.network.getEdges(edgeProperties));
								} else {
									note.debug('Sociogram added edge.',2);
								}

								// Empty the selected nodes array and draw the layer.
								selectedNodes = [];

						} else { // First node selected. Simply turn the node stroke to the selected style so we can see that it has been selected.
							currentNode.children[0].opacity(1);
						}
					}
					currentNode.moveToTop();
					nodeLayer.draw();
				}, 400);
			} else {
				touchNotTap = false;
			}

		});

		nodeGroup.on('dragend', function() {

			var dragNode = nodeOptions.id;
			// Update the position of any connected edges and hulls
			var pointHulls = this.attrs.contexts;
			for (var i = 0; i < pointHulls.length; i++) {
				var newHull = new ConvexHullGrahamScan();

				for (var j = 0; j < nodeLayer.children.length; j++) {
					var thisChildHulls = nodeLayer.children[j].attrs.contexts;
					if (thisChildHulls.indexOf(pointHulls[i]) !== -1) {
						var coords = nodeLayer.children[j].getPosition();
						newHull.addPoint(coords.x, coords.y);
					}
				}

				hullShapes[pointHulls[i]].setPoints(toPointFromObject(newHull.getHull()));
				hullLayer.draw();

			}

			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from === dragNode || value.attrs.to === dragNode) {
					var points = [sociogram.getNodeByID(value.attrs.from).getX(), sociogram.getNodeByID(value.attrs.from).getY(), sociogram.getNodeByID(value.attrs.to).getX(), sociogram.getNodeByID(value.attrs.to).getY()];
					value.attrs.points = points;

				}
			});
			edgeLayer.draw();

			note.debug('Drag ended at x: '+this.attrs.x+' y: '+this.attrs.y);

			// set the context
			var from = {};
			var to = {};

			// Fetch old position from properties populated by dragstart event.
			from.x = this.attrs.oldx;
			from.y = this.attrs.oldy;

			to.x = this.attrs.x;
			to.y = this.attrs.y;

			this.attrs.coords = [this.attrs.x,this.attrs.y];

			// Add them to an event object for the logger.
			var eventObject = {
				from: from,
				to: to,
			};

			// Log the movement and save the graph state.
			log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeMove', 'eventObject':eventObject}});
			window.dispatchEvent(log);

			// store properties according to data destination
			// Find the node we need to store the coordinates on, and update it.

			// Create a dummy object so we can use the variable name set in settings.dataDestination
			var properties = {};
			properties.coords = this.attrs.coords;

			// Update the node with the object
			settings.network.updateNode(this.attrs.id, properties, function() {
				window.tools.notify('Network node updated', 1);
			});
			// remove the attributes, just incase.
			delete this.attrs.oldx;
			delete this.attrs.oldy;

		});

		return nodeGroup;
	};

	// Edge manipulation functions

	sociogram.addEdge = function(properties, options) {
		note.info('sogioram.addEdge()');

		// This doesn't *usually* get called directly. Rather, it responds to an event fired by the network module.

		var egoID = settings.network.getEgo().id;

		if(typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== egoID) {
			// We have been called by an event
			properties = properties.detail;
		} else if (typeof properties.from !== 'undefined' && typeof properties.to !== 'undefined' && properties.from !== egoID) {
			// We have been called by another sociogram method
			properties = properties;
		} else {
			return false;
		}

		// the below won't work because we are storing the coords in an edge now...
		note.debug('Sociogram is adding an edge.');
		var toObject = sociogram.getNodeByID(properties.to);
	 	var fromObject = sociogram.getNodeByID(properties.from);
		var points = [fromObject.attrs.coords[0], fromObject.attrs.coords[1], toObject.attrs.coords[0], toObject.attrs.coords[1]];

		var edgeOptions = {
			// dashArray: [10, 10, 00, 10],
			strokeWidth: 6,
			transformsEnabled: 'position',
			hitGraphEnabled: false,
			opacity:1,
			// fill: '#ff0000',
			// closed: false,
			// width:100,
			stroke: settings.options.defaultEdgeColor,
			// opacity: 0.8,
			points: points,
			shadowColor: 'black',
			shadowBlur: 0.3,
			shadowOffset: {x : 0, y : 0},
			shadowOpacity: 1
		}

		// Handle options parameter to allow overriding default values
		if (options) {
			console.log('extending with options');
			$.extend(edgeOptions, options);
			console.log(edgeOptions);
		}

		var edge = new Konva.Line(edgeOptions);

		edge.setAttrs({
			from: properties.from,
			to: properties.to
		});

		edgeLayer.add(edge);

		setTimeout(function() {
			edgeLayer.draw();
		},0);
		nodeLayer.draw();
		note.trace('Created Edge between '+fromObject.attrs.label+' and '+toObject.attrs.label);

		return true;

	};

	sociogram.removeEdge = function(properties) {

		note.debug('sociogram.removeEdge() called.');
		if (!properties) {
			note.error('No properties passed to sociogram.removeEdge()!');
		}

		// Test if we are being called by an event, or directly
		if (typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== settings.network.getEgo().id) {
			properties = properties.detail;
		}

		var toObject = properties.to;
	 	var fromObject = properties.from;

		// This function is failing because two nodes are matching below
		var found = false;
		$.each(sociogram.getKineticEdges(), function(index, value) {
			if (value !== undefined) {
				if (value.attrs.from === fromObject && value.attrs.to === toObject || value.attrs.from === toObject && value.attrs.to === fromObject ) {
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

	sociogram.getStage = function() {
		return stage;
	};

	// Main initialisation functions

	sociogram.initKinetic = function () {
		// Initialise KineticJS stage
		stage = new Konva.Stage({
			container: settings.targetEl,
			width: window.innerWidth,
			height: window.innerHeight
		});

		circleLayer = new Konva.Layer();
		hullLayer = new Konva.FastLayer();
		wedgeLayer = new Konva.FastLayer();
		nodeLayer = new Konva.Layer();
		edgeLayer = new Konva.FastLayer();

		/**
		* This hack allows us to detect clicks that happen outside of nodes, hulls, or edges.
		* We create a transparent rectangle on a special background layer which sits between the UI layer and the interaction layers.
		* We then listen to click events on this shape.
 		*/
		var backgroundLayer = new Konva.Layer();
		var backgroundRect = new Konva.Rect({
	        x: 0,
	        y: 0,
	        width: stage.width(),
	        height: stage.height(),
	        fill: 'transparent',
	      });
		backgroundLayer.add(backgroundRect);
		backgroundRect.on('tap click', function() {
			note.debug('sociogram: backgroundRect tap');
			sociogram.hideDetailsPanel();
			console.log('!!! sociogram.selectedNode set to null');
			sociogram.selectedNode = null;
			$('.hull').removeClass('active'); // deselect all groups

			//deselect Nodes
			selectedNodes = [];
			$.each(sociogram.getKineticNodes(), function(nodesIndex, nodesValue) {
				nodesValue.children[0].opacity(0);
			});

			nodeLayer.draw();

		});

		stage.add(circleLayer);
		stage.add(backgroundLayer);
		stage.add(hullLayer);
		stage.add(edgeLayer);
		stage.add(wedgeLayer);
		stage.add(nodeLayer);

		note.debug('Konva stage initialised.');

	};

	sociogram.showDetailsPanel = function() {
		$('.details-panel').addClass('show');
	};

	sociogram.hideDetailsPanel = function() {
		$('.details-panel').removeClass('show');
	};

	sociogram.generateHull = function(points) {

        var newHull = new ConvexHullGrahamScan();

        for (var i = 0; i < points.length; i++) {
            var coords = points[i].getPosition();
            newHull.addPoint(coords.x, coords.y);
        }

		return toPointFromObject(newHull.getHull());


	};

	sociogram.showNewNodeForm = function() {
		// debugger;
		window.forms.nameGenForm.removeTemporaryFields();
		// debugger;
		var properties = {};

		for (var i =0; i <= currentPrompt; i++) {
			// check if current previous prompt has a select element
			if (typeof settings.prompts[i].showSelected === 'object') {
				// add fields from dataTarget
				properties = {};

				properties[settings.prompts[i].showSelected.group] = {
					'type': 'button-checkbox',
					'inline': true,
					'title':settings.prompts[i].showSelected.group,
					'variables':[
						{label:settings.prompts[i].showSelected.shortLabel, id:settings.prompts[i].showSelected.variable},
					]
				};

				window.forms.nameGenForm.addTemporaryFields(properties);

				// Add data from fields
				properties = {};
				properties[settings.prompts[currentPrompt].showSelected.variable] = 1;

				window.forms.nameGenForm.addData(properties);
			}
		}

		window.forms.nameGenForm.show();

	};

	sociogram.getModuleEvents = function() {
		return moduleEvents;
	};

	sociogram.drawUIComponents = function (callback) {

		// Load the image
		var imageObj = new Image();
		imageObj.src = 'img/drag-text.png';
		imageObj.onload = function() {

			// New node button
			$('#'+settings.targetEl).append('<div class="new-node-button text-center"><span class="fa fa-2x fa-plus"></span></div>');

			// Draw all UI components
			var previousSkew = 0;
			var circleFills, circleLines;
			var currentColor = settings.options.concentricCircleColor;
			var totalHeight = window.innerHeight-(settings.options.defaultNodeSize); // Our sociogram area is the window height minus twice the node radius (for spacing)
			var currentOpacity = 0.1;

			//draw concentric circles
			for(var i = 0; i < settings.options.concentricCircleNumber; i++) {
				var ratio = (1-(i/settings.options.concentricCircleNumber));
				var skew = i > 0 ? (ratio * 5) * (totalHeight/70) : 0;
				var currentRadius = totalHeight/2 * ratio;
				currentRadius = settings.options.concentricCircleSkew? currentRadius + skew + previousSkew : currentRadius;
				previousSkew = skew;
				circleLines = new Konva.Circle({
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
					radius: currentRadius,
					hitGraphEnabled: false,
					stroke: 'white',
					strokeWidth: 1.5,
					opacity: 0
				});

				circleFills = new Konva.Circle({
					x: window.innerWidth / 2,
					y: (window.innerHeight / 2),
					radius: currentRadius,
					fill: currentColor,
					hitGraphEnabled: false,
					opacity: currentOpacity,
					strokeWidth: 0,
				});

				// currentColor = tinycolor.darken(currentColor, amount = 15).toHexString();
				currentOpacity = currentOpacity+((0.3-currentOpacity)/settings.options.concentricCircleNumber);
				circleLayer.add(circleFills);
				circleLayer.add(circleLines);

			}

			// Node container
			var newNodeCircle = new Konva.Circle({
				radius: 60,
				transformsEnabled: 'none',
				hitGraphEnabled: false,
				stroke: 'white',
				strokeWidth: 7
			});

			var newNodeText = new Konva.Image({
			 x: -20,
			 y: -180,
			 image: imageObj,
			 width: 200,
			 height: 105
			});

			// add the shape to the layer

			var newNodeCircleGroup = new Konva.Group({
			 x: 145,
			 opacity:0,
			 y: window.innerHeight / 2,
			});

			newNodeCircleGroup.add(newNodeText);
			newNodeCircleGroup.add(newNodeCircle);
			circleLayer.add(newNodeCircleGroup);

			newNodeCircleTween = new Konva.Tween({
			 node: newNodeCircleGroup,
			 opacity: 1,
			 duration: 1
			});


			// Draw 'me'
			if (settings.options.showMe === true) {

				var meCircle = new Konva.Circle({
					radius: 50,
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
					hitGraphEnabled: false,
					fill: '#D0D2DC',
				});

				var meText = new Konva.Text({
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
					text: 'me',
					align: 'center',
					offset: {x:28,y:22},
					fontSize: 40,
					fontFamily: 'Helvetica',
					fill: 'black'
				 });
				circleLayer.add(meCircle);
				circleLayer.add(meText);
			}

			// draw wedgex

			Konva.selectWedge = function(config) {
				this._initselectWedge(config);
			};

			Konva.selectWedge.prototype = {
				_initselectWedge: function(config) {
					Konva.Circle.call(this, config);
				},
				_sceneFunc: function(context) {
					context.beginPath();
					context.arc(0, 0, this.getRadius(), 0, Konva.getAngle(this.getAngle()), this.getClockwise());
					context.fillStrokeShape(this);
				}
			};

			Konva.Util.extend(Konva.selectWedge, Konva.Wedge);

			window.wedge = new Konva.selectWedge({
				radius: settings.options.defaultNodeSize+5,
				angle: 0,
				fill: 'transparent',
				stroke: colors.selected,
				rotation:-90,
				opacity:0,
				strokeWidth: 10,
			});

			wedgeLayer.add(window.wedge);
			window.wedge.moveToBottom();

			circleLayer.draw();

			note.debug('User interface initialised.');

			if (callback) {
				callback();
			}
		};
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

	sociogram.getNodeLayer = function() {
		return nodeLayer;
	};

	sociogram.getUILayer = function() {
		return uiLayer;
	};

	sociogram.getHullLayer = function() {
			return hullLayer;
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
		$.each(settings.nodeTypes, function(index, value) {
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
