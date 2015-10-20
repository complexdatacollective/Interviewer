/* global Konva, window, $, note, ConvexHullGrahamScan, Image, Swiper */
/* exported Sociogram */
/*jshint bitwise: false*/

module.exports = function SociogramMulti() {
	'use strict';
	// Global variables
	var stage = {}, circleLayer = {}, edgeLayer = {}, nodeLayer = {}, wedgeLayer = {}, hullLayer = {}, hullShapes = {}, uiLayer = {}, sociogramMulti = {};
	var moduleEvents = [], selectedNodes = [];
	var selectedNode = null;
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
			defaultNodeSize: 30,
			defaultNodeColor: 'white',
			defaultNodeStrokeWidth: 4,
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
		prompts: [
	        {
	            dataType: 'namegenerator', // namegenerator/Edge/select
	            prompt: 'Who has supported you emotionally? For example comforted you when you have been upset or angry.',
	            formVariables: [
	                {
	                    type:'hidden',
	                    label: 'ng',
	                    value: 'support-emotional',
	                }
	            ]
	        },
	        {
	            dataType: 'namegenerator', // namegenerator/Edge/select
	            prompt: 'Who has supported you practically? For example helped you with something you found difficult or couldn’t have done by yourself.',
	            formVariables: [
	                {
	                    type:'hidden',
	                    label: 'ng',
	                    value: 'support-practical',
	                }
	            ]
	        },
	        {
	            dataType: 'edge', // namegenerator/Edge/select
	            edgeType: 'friends',
	            prompt: 'Which of these people are friends?'
	        },
	        {
	            dataType: 'select', // namegenerator/Edge/select
	            prompt: 'Which of these people are drug users?',
	            formVariables: [
	                {
	                    type:'flip',
	                    label: 'drug_user',
	                }
	            ]
	        }
	    ],
	    criteria: { // criteria for being shown on this screen
	        includeEgo: false,
	        query: {
	        }
	    }
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

	function toPointFromObject(array) {
		var newArray = [];
		for (var i = 0; i<array.length; i++) {
			newArray.push(array[i].x);
			newArray.push(array[i].y);
		}

		return newArray;
	}

	function addNodeHandler(e) {
		sociogramMulti.addNode(e.detail);
	}

	function hullListClickHandler(e) {
		var clicked = $(e.target).closest('li');
		var selectedHull = clicked.data('hull');
		if (selectedNode.attrs.contexts.indexOf(selectedHull) !== -1 ) {
			clicked.removeClass('active');
			sociogramMulti.removePointFromHull(selectedNode, selectedHull);
		} else {
			clicked.addClass('active');
			sociogramMulti.addPointToHull(selectedNode, selectedHull);
		}
	}

	function groupButtonClickHandler() {
		sociogramMulti.addHull();
	}

	sociogramMulti.changeData = function() {
		sociogramMulti.resetNodeState();
		sociogramMulti.updateNodeState();
	};

	sociogramMulti.init = function (userSettings) {

		note.info('SociogramMulti initialising.');

		$.extend(true, settings,userSettings);
		// Add the title and heading
		$('<div class="sociogram-title"></div>').insertBefore('#'+settings.targetEl );

		$('.sociogram-title').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
        for (var i = 0; i < settings.prompts.length; i++) {
            $('.swiper-wrapper').append('<div class="swiper-slide"><h4>'+settings.prompts[i].prompt+'</h4></div>');
        }

        promptSwiper = new Swiper ('.swiper-container', {
            pagination: '.swiper-pagination',
            speed: 1000
        });

        // Update current prompt counter
        promptSwiper.on('slideChangeStart', function () {
            currentPrompt = promptSwiper.activeIndex;
            sociogramMulti.changeData();
        });

		// Initialise the konva stage
		sociogramMulti.initKinetic();

		// Draw ui compoennts
		sociogramMulti.drawUIComponents(function() {

			// Show hulls checkbox
			if (settings.modes.indexOf('Community') !== -1) {
				$('#'+settings.targetEl).append('<input class="show-contexts-checkbox" type="checkbox" name="context-checkbox-show" id="context-checkbox-show"> <label for="context-checkbox-show">Contexts shown</label>');
			}

			// Panels
			if (settings.panels.indexOf('details') !== -1) {
				$('<div class="details-panel"><div class="context-header"><h4>Details</h4></div><ul class="list-group context-list"></ul><div class="context-footer"><div class="pull-left new-group-button"><span class="fa fa-plus-circle"></span> New context</div></div></div>').appendTo('#'+settings.targetEl);
			}

			sociogramMulti.addNodeData();

			// Add the evevent listeners
			window.addEventListener('nodeAdded', addNodeHandler, false);
			window.addEventListener('edgeAdded', sociogramMulti.updateNodeState, false);
			window.addEventListener('nodeRemoved', sociogramMulti.removeNode, false);
			window.addEventListener('edgeRemoved', sociogramMulti.removeEdge, false);
			window.addEventListener('changeStageStart', sociogramMulti.destroy, false);
			$(window.document).on('change', '#context-checkbox-show', sociogramMulti.toggleHulls);
			$(window.document).on('click', '.new-group-button', groupButtonClickHandler);

			// Update initial states of all nodes and edges;
			sociogramMulti.updateNodeState();

		});
	};

	sociogramMulti.addNodeData = function() {

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
			sociogramMulti.addNode(criteriaNodes[j]);
		}

		// Layout Mode
		var layoutNodes = sociogramMulti.getKineticNodes();
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
			sociogramMulti.addHull(hullValue);
		});

		communityNodes = sociogramMulti.getKineticNodes();
		$.each(communityNodes, function(index,node) {
			$.each(node.attrs.contexts, function (hullIndex, hullValue) {
				// Difference from node mode is we check if the node hull has been defined by ego too
				// if (egoHulls.indexOf(hullValue) !== -1) {
					sociogramMulti.addPointToHull(node, hullValue);
				// }

			});
		});

	};

	sociogramMulti.toggleHulls = function(e) {
		note.info('Sociogram: toggleHulls()');

		if ((e && e.target.checked) || hullsShown === false) {
			$('label[for="context-checkbox-show"]').html('Contexts shown');
			note.debug('showing hulls');
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

	sociogramMulti.resetNodeState = function() {

		// Reset select
		var kineticNodes = sociogramMulti.getKineticNodes();
		$.each(kineticNodes, function(nodeIndex, nodeValue) {
			nodeValue.children[1].stroke(settings.options.defaultNodeColor);
		});

		nodeLayer.batchDraw();

		// Reset edges
		edgeLayer.removeChildren();
		edgeLayer.batchDraw();

	};

	sociogramMulti.updateNodeState = function() {
		/**
		* Updates visible attributes based on current prompt task
		*/

		// Edge Mode
		if (typeof settings.prompts[currentPrompt].showEdges === 'object') {

			var properties = {};
			$.each(settings.prompts[currentPrompt].showEdges, function(index, value) {
				properties[value.label] = value.value;
			});
			var edges = settings.network.getEdges(properties);
			$.each(edges, function(index, edge) {
				sociogramMulti.addEdge(edge);
			});

		}

		// Select Mode
		if (typeof settings.prompts[currentPrompt].showSelected === 'object') {

			var selectNodes = settings.network.getNodes();
			$.each(selectNodes, function(index, node) {
				console.log(node);
				var currentValue = node[settings.prompts[currentPrompt].showSelected.variable];
				if (currentValue == settings.prompts[currentPrompt].showSelected.value) {
					// this node is selected
					var currentNode = sociogramMulti.getNodeByID(node.id);
					console.log(currentNode);
					currentNode.children[1].stroke(colors.selected);
				}
			});

			nodeLayer.draw();

		}

	};

	sociogramMulti.getSelectedNodes = function() {
		return selectedNodes;
	};

	sociogramMulti.destroy = function() {
		window.removeEventListener('nodeAdded', addNodeHandler, false);
		window.removeEventListener('edgeAdded', sociogramMulti.updateNodeState, false);
		window.removeEventListener('nodeRemoved', sociogramMulti.removeNode, false);
		window.removeEventListener('edgeRemoved', sociogramMulti.removeEdge, false);
		window.removeEventListener('changeStageStart', sociogramMulti.destroy, false);
		$(window.document).off('keypress', sociogramMulti.keyPressHandler);
		$(window.document).off('change', '#context-checkbox-show', sociogramMulti.toggleHulls);

	};

	sociogramMulti.addHull = function(label) {
		note.info('sociogramMulti.addHull ['+label+']');
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

	sociogramMulti.hullExists = function(hullLabel) {
		var found = false;
		if ($('li[data-hull="'+hullLabel+'"]').length > 0) {
			found = true;
		}
		return found;
	};

    sociogramMulti.addPointToHull = function(point, hullLabel) {
		note.info('sociogramMulti.addPointToHull()');
		var properties;
		// if a hull with hullLabel doesnt exist, create one
		if (!sociogramMulti.hullExists(hullLabel)) {
			note.warn('sociogramMulti.addPointToHull(): the hull label didn\'t exist, so a new hull was created.');
			sociogramMulti.addHull(hullLabel);
		}

		note.info('sociogramMulti.addPointToHull(): Storing in ego mode');
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

	sociogramMulti.redrawHulls = function() {
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

	sociogramMulti.getHullShapes = function() {
		return hullShapes;
	};

	sociogramMulti.removePointFromHull = function(point, hullLabel) {
		note.info('sociogramMulti.removePointFromHull()');
		var properties;

		// store properties according to data destination
		if (settings.dataDestination.Community.type === 'node') {

			// If the point doesn't have the attribute, fail
			if (point.attrs[settings.dataDestination.Community.variable] === 'undefined') {
				note.error('sociogramMulti.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			}

			// If the hull isnt in the node, fail
			if (point.attrs[settings.dataDestination.Community.variable].indexOf(hullLabel) === -1) {
				note.error('sociogramMulti.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
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

		} else if (settings.dataDestination.Community.type === 'ego') {

			// If the point doesn't have the attribute, fail
			if (point.attrs[settings.dataDestination.Community.variable] === 'undefined') {
				note.error('sociogramMulti.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			}

			// If the hull isnt in the node, fail
			if (point.attrs[settings.dataDestination.Community.variable].indexOf(hullLabel) === -1) {
				note.error('sociogramMulti.removePointFromHull(): Error! The point wasn\'t attached to a hull named '+hullLabel);
				return false;
			} else {
				// Find the node we need to store the hull value in, and update it.

				// Create a dummy object so we can use the variable name set in settings.dataDestination
				properties = {};
				var egoPointHulls = point.attrs.contexts;
				egoPointHulls.remove(hullLabel);
				properties[settings.dataDestination.Community.variable] = egoPointHulls;
				point.attrs.contexts = egoPointHulls;

				// Update the node with the object
				settings.network.updateNode(point.attrs.id, properties, function() {
					note.info('Network node updated', 1);
					note.debug(properties);
				});
			}
		} else if (settings.dataDestination.Position.type === 'edge') {
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

	sociogramMulti.addNode = function(options) {

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
			radius: nodeOptions.size+(nodeOptions.strokeWidth*2.3),
			fill:settings.options.defaultEdgeColor,
			transformsEnabled: 'position',
			opacity:0
		});

		nodeShape = new Konva.Circle({
			radius: nodeOptions.size,
			fill:nodeOptions.color,
			transformsEnabled: 'position',
			strokeWidth: nodeOptions.strokeWidth,
			stroke: nodeOptions.stroke
		});

		var nodeLabel = new Konva.Text({
			text: nodeOptions.label,
			// fontSize: 20,
			fontFamily: 'Lato',
			transformsEnabled: 'position',
			fill: settings.options.defaultLabelColor,
			align: 'center',
			// offsetX: (nodeOptions.size*-1)-10, //left right
			// offsetY:(nodeOptions.size*1)-10, //up down
			fontStyle:500
		});

		note.debug('Putting node '+nodeOptions.label+' at coordinates x:'+nodeOptions.coords[0]+', y:'+nodeOptions.coords[1]);

		padText(nodeLabel,nodeShape,10);

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

				hullShapes[pointHulls[i]].setPoints(toPointFromObject(newHull.getHull()));
				hullLayer.batchDraw();

			}

			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from === dragNode || value.attrs.to === dragNode) {
					var points = [sociogramMulti.getNodeByID(value.attrs.from).getX(), sociogramMulti.getNodeByID(value.attrs.from).getY(), sociogramMulti.getNodeByID(value.attrs.to).getX(), sociogramMulti.getNodeByID(value.attrs.to).getY()];
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
					var points = [sociogramMulti.getNodeByID(value.attrs.from).getX(), sociogramMulti.getNodeByID(value.attrs.from).getY(), sociogramMulti.getNodeByID(value.attrs.to).getX(), sociogramMulti.getNodeByID(value.attrs.to).getY()];
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
			sociogramMulti.showDetailsPanel();
			selectedNode = this;
			console.log(selectedNode);
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
			// var kineticNodes = sociogramMulti.getKineticNodes();
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
			if (typeof settings.prompts[currentPrompt].showSelected === 'object') {

				// flip variable

				// Get current variable value
				var properties = {};
				var currentValue = settings.network.getNode(currentNode.attrs.id)[settings.prompts[currentPrompt].showSelected.variable];
				console.log(currentValue);
				// flip
				if (currentValue != settings.prompts[currentPrompt].showSelected.value || typeof currentValue === 'undefined') {
					properties[settings.prompts[currentPrompt].showSelected.variable] = settings.prompts[currentPrompt].showSelected.value;
					currentNode.children[1].stroke(colors.selected);
				} else {
					// remove static variables, if present
					alert('boo');
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
					if (typeof settings.prompts[currentPrompt].showEdges === 'object') {

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
								$.each(settings.prompts[currentPrompt].showEdges, function(index, value) {
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
				}, 200);
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
					var points = [sociogramMulti.getNodeByID(value.attrs.from).getX(), sociogramMulti.getNodeByID(value.attrs.from).getY(), sociogramMulti.getNodeByID(value.attrs.to).getX(), sociogramMulti.getNodeByID(value.attrs.to).getY()];
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

	sociogramMulti.addEdge = function(properties) {

		// This doesn't *usually* get called directly. Rather, it responds to an event fired by the network module.

		if(typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== settings.network.getEgo().id) {
			// We have been called by an event
			properties = properties.detail;
		} else if (typeof properties.from !== 'undefined' && typeof properties.to !== 'undefined' && properties.from !== settings.network.getEgo().id) {
			// We have been called by another sociogram method
			properties = properties;
		} else {
			return false;
		}

		// the below won't work because we are storing the coords in an edge now...
		note.debug('Sociogram is adding an edge.');
		var toObject = sociogramMulti.getNodeByID(properties.to);
	 	var fromObject = sociogramMulti.getNodeByID(properties.from);
		var points = [fromObject.attrs.coords[0], fromObject.attrs.coords[1], toObject.attrs.coords[0], toObject.attrs.coords[1]];

		var edge = new Konva.Line({
			// dashArray: [10, 10, 00, 10],
			strokeWidth: 4,
			transformsEnabled: 'position',
			hitGraphEnabled: false,
			opacity:1,
			stroke: settings.options.defaultEdgeColor,
			// opacity: 0.8,
			points: points
		});

		edge.setAttrs({
			from: properties.from,
			to: properties.to
		});

		edgeLayer.add(edge);

		setTimeout(function() {
			edgeLayer.draw();
		},0);
		nodeLayer.draw();
		note.debug('Created Edge between '+fromObject.attrs.label+' and '+toObject.attrs.label);

		return true;

	};

	sociogramMulti.removeEdge = function(properties) {

		note.debug('sociogramMulti.removeEdge() called.');
		if (!properties) {
			note.error('No properties passed to sociogramMulti.removeEdge()!');
		}

		// Test if we are being called by an event, or directly
		if (typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== settings.network.getEgo().id) {
			properties = properties.detail;
		}

		var toObject = properties.to;
	 	var fromObject = properties.from;

		// This function is failing because two nodes are matching below
		var found = false;
		$.each(sociogramMulti.getKineticEdges(), function(index, value) {
			if (value !== undefined) {
				if (value.attrs.from === fromObject && value.attrs.to === toObject || value.attrs.from === toObject && value.attrs.to === fromObject ) {
					found = true;
					edgeLayer.children[index].remove();
					edgeLayer.draw();
				}
			}

		});

		if (!found) {
			note.error('sociogramMulti.removeEdge() failed! Couldn\'t find the specified edge.');
		} else {
			return true;
		}

	};

	sociogramMulti.removeNode = function() {
	};

	// Misc functions

	sociogramMulti.clearGraph = function() {
		edgeLayer.removeChildren();
		edgeLayer.clear();
		nodeLayer.removeChildren();
		nodeLayer.clear();

	};

	sociogramMulti.getStage = function() {
		return stage;
	};

	// Main initialisation functions

	sociogramMulti.initKinetic = function () {
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
			sociogramMulti.hideDetailsPanel();
			selectedNode = null;
			$('.hull').removeClass('active'); // deselect all groups

			//deselect Nodes
			selectedNodes = [];
			$.each(sociogramMulti.getKineticNodes(), function(nodesIndex, nodesValue) {
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

	sociogramMulti.showDetailsPanel = function() {
		$('.details-panel').addClass('show');
	};

	sociogramMulti.hideDetailsPanel = function() {
		$('.details-panel').removeClass('show');
	};

	sociogramMulti.generateHull = function(points) {

        var newHull = new ConvexHullGrahamScan();

        for (var i = 0; i < points.length; i++) {
            var coords = points[i].getPosition();
            newHull.addPoint(coords.x, coords.y);
        }

		return toPointFromObject(newHull.getHull());


	};

	sociogramMulti.showNewNodeForm = function() {
			var properties = {};
			if (settings.prompts[currentPrompt].dataType === 'namegenerator') {
				// add fields from dataTarget
		        properties = {};
				$.each(settings.prompts[currentPrompt].formVariables, function(formIndex,formValue) {
					properties[formValue.label] = {
		                type:formValue.type,
		                title: formValue.label
		            };
				});

		        window.forms.nameGenForm.addTemporaryFields(properties);

		        // Add data from fields
		        properties = {};
				$.each(settings.prompts[currentPrompt].formVariables, function(formIndex,formValue) {
				properties[formValue.label] = formValue.value;
				});

		        window.forms.nameGenForm.addData(properties);
			}

			// Handle select data
			if (typeof settings.prompts[currentPrompt].showSelected === 'object') {
				// add fields from dataTarget
				properties = {};

					properties[settings.prompts[currentPrompt].showSelected.variable] = {
						type:'hidden',
						title: settings.prompts[currentPrompt].showSelected.variable
					};

				window.forms.nameGenForm.addTemporaryFields(properties);

				// Add data from fields
				properties = {};
				properties[settings.prompts[currentPrompt].showSelected.variable] = settings.prompts[currentPrompt].showSelected.value;

				window.forms.nameGenForm.addData(properties);
			}

		    window.forms.nameGenForm.show();
	};

	sociogramMulti.drawUIComponents = function (callback) {

		// Load the image
		var imageObj = new Image();
		imageObj.src = 'img/drag-text.png';
		imageObj.onload = function() {

			// New node button
			$('#'+settings.targetEl).append('<div class="new-node-button text-center"><span class="fa fa-2x fa-plus"></span></div>');
			var events = [{
				event: 'click',
				handler: sociogramMulti.showNewNodeForm,
				targetEl:  '.new-node-button'
			}, {
				event: 'click',
				handler: hullListClickHandler,
				targetEl:  window.document,
				subTarget:  '.list-group-item',
			},
			{
				event: 'submit',
				handler: function() {
					setTimeout(function() {
						sociogramMulti.updateNodeState();
					},100);
				},
				targetEl: window.document,
				subtarget: window.forms.nameGenForm.getID()
			}
		];
			window.tools.Events.register(moduleEvents, events);

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

			// var newNodeText = new Konva.Text({
			// 	text: 'Need Positioning',
			// 	align: 'center',
			// 	offset: {x:55,y:100},
			// 	fontSize: 15,
			// 	fontFamily: 'Helvetica',
			// 	fill: 'white'
			//  });



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

	sociogramMulti.getKineticNodes = function() {
		return nodeLayer.children;
	};

	sociogramMulti.getKineticEdges = function() {
		return edgeLayer.children;
	};

	sociogramMulti.getSimpleNodes = function() {
		// We need to create a simple representation of the nodes for storing.
		var simpleNodes = {};
		var nodes = sociogramMulti.getKineticNodes();
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

	sociogramMulti.getSimpleEdges = function() {
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

	sociogramMulti.getSimpleEdge = function(id) {
		var simpleEdges = sociogramMulti.getSimpleEdges();
		if (!id) { return false; }

		var simpleEdge = simpleEdges[id];
		return simpleEdge;
	};

	sociogramMulti.getEdgeLayer = function() {
		return edgeLayer;
	};

	sociogramMulti.getNodeLayer = function() {
		return nodeLayer;
	};

	sociogramMulti.getUILayer = function() {
		return uiLayer;
	};

	sociogramMulti.getHullLayer = function() {
			return hullLayer;
	};

	sociogramMulti.getNodeByID = function(id) {
		var node = {},
		nodes = sociogramMulti.getKineticNodes();

		$.each(nodes, function(index, value) {
			if (value.attrs.id === id) {
				node = value;
			}
		});

		return node;
	};

	sociogramMulti.getNodeColorByType = function(type) {
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

	return sociogramMulti;

};
