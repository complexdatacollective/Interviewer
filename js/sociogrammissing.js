/* global Konva, window, $, note, Swiper */
/* exported Sociogram */
/*jshint bitwise: false*/

module.exports = function SociogramMissing() {
	'use strict';
	// Global variables
	var stage = {}, circleLayer = {}, edgeLayer = {}, nodeLayer = {}, uiLayer = {}, sociogramMissing = {};
	var moduleEvents = [], selectedNodes = [];
	var selectedNode = null;
	var newNodeCircleTween, promptSwiper, log, tapTimer;
	var nodesWithoutPositions = 0, currentPrompt = 0;
	var taskComprehended  = false;
	var missingMap = {};
	var variableOrder = [
		'support_emotional',
		'support_practical',
		'support_failed',
		'advice_given',
		'advice_sought',
		'advice_refused',
		'advice_negative',
		'info_given',
		'info_refused',
		'technologically_mediated'
	];

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

	// Default settings
	var settings = {
		network: window.netCanvas.Modules.session.getPrimaryNetwork(),
		options: {
			defaultNodeSize: 33,
			defaultNodeColor: 'white',
			defaultNodeStrokeWidth: 4,
			defaultLabelColor: 'black',
			defaultEdgeColor: colors.edge,
			concentricCircleColor: '#ffffff',
			concentricCircleNumber: 1,
			concentricCircleSkew: false,
			showMe: false
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

	sociogramMissing.changeData = function() {
		sociogramMissing.resetNodeState();
		sociogramMissing.updateNodeState();
	};

	sociogramMissing.generateMissingMap = function() {



		var nodes = netCanvas.Modules.session.getPrimaryNetwork().getNodes({}, function (results) {
            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.type !== 'Ego') {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });

		// missing map = {
		// 	advice_given: [21,5,4]
		// }

		$.each(variableOrder, function(index, value) {
			missingMap[value] = [];
			// console.log(missingMap);
		});

		$.each(nodes, function(nodeIndex, nodeValue) {
			var nodeNg = nodeValue.namegenerator;
			var ngIndex = variableOrder.indexOf(nodeNg);
			missingMap[nodeNg] = missingMap.nodeNg || [];

			Object.keys(missingMap).forEach(function(missingKey) {
				if (variableOrder.indexOf(missingKey) < ngIndex) {
					missingMap[missingKey] = missingMap[missingKey] || [];
					missingMap[missingKey].push(nodeValue.id);
				}
			});

		});

		return missingMap;

	};

	sociogramMissing.init = function (userSettings) {

		note.info('SociogramMissing initialising.');

		$.extend(true, settings,userSettings);
		// Add the title and heading
		$('<div class="sociogram-title"></div>').insertBefore('#'+settings.targetEl );

		$('.sociogram-title').append('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
		var missingMap = sociogramMissing.generateMissingMap();
        for (var i = 0; i < settings.prompts.length; i++) {
			if (missingMap[settings.prompts[i].variable].length > 0) {
				$('.swiper-wrapper').append('<div class="swiper-slide"><h5>'+settings.prompts[i].prompt+'</h5></div>');
			} else {
				note.info('Skipping prompt '+i+' because no missing nodes.');
			}

        }

        promptSwiper = new Swiper ('.swiper-container', {
            pagination: '.swiper-pagination',
			paginationClickable: true,
            speed: 1000
        });

        // Update current prompt counter
        promptSwiper.on('slideChangeEnd', function () {
            currentPrompt = promptSwiper.activeIndex;
            sociogramMissing.changeData();
        });

		// Initialise the konva stage
		sociogramMissing.initKinetic();

		// Draw ui compoennts
		sociogramMissing.drawUIComponents(function() {

			sociogramMissing.addNodeData();

			// Add the evevent listeners
			sociogramMissing.bindEvents();

			// Update initial states of all nodes and edges;
			sociogramMissing.updateNodeState();

		});
	};

	sociogramMissing.bindEvents = function() {
		// Events
		var event = [
			{
				event: 'changeStageStart',
				handler: sociogramMissing.destroy,
				targetEl:  window
			},
			{
				event: 'edgeAdded',
				handler: sociogramMissing.updateNodeState,
				targetEl:  window
			},
			{
				event: 'nodeRemoved',
				handler: sociogramMissing.removeNode,
				targetEl:  window
			},
			{
				event: 'edgeRemoved',
				handler: sociogramMissing.removeEdge,
				targetEl:  window
			}
		];
		window.tools.Events.register(moduleEvents, event);

	};

	sociogramMissing.addNodeData = function() {
		note.info('sociogramMissing.addNodeData()');
		note.debug('sociogramMissing.addNodeData() Getting criteriaNodes...');
		var criteriaNodes = settings.network.getNodes({}, function (results) {
			var filteredResults = [];
			$.each(results, function(index,value) {
				if (value.type !== 'Ego') {
					filteredResults.push(value);
				}
			});

			return filteredResults;
		});

		note.debug('sociogramMissing.addNodeData() adding criteriaNodes...');
		for (var j = 0; j < criteriaNodes.length; j++) {
			sociogramMissing.addNode(criteriaNodes[j]);
		}

		// Layout Mode
		var layoutNodes = sociogramMissing.getKineticNodes();
		$.each(layoutNodes, function(index,node) {
			node.setPosition(node.attrs.coords);
		});

	};

	sociogramMissing.resetNodeState = function() {

		// Reset nodes
		var kineticNodes = sociogramMissing.getKineticNodes();
		$.each(kineticNodes, function(nodeIndex, nodeValue) {
			nodeValue.children[1].stroke(settings.options.defaultNodeColor);
			nodeValue.children[1].opacity(1);
			nodeValue.children[2].opacity(1);
		});

		nodeLayer.batchDraw();

		// Reset edges
		edgeLayer.removeChildren();
		edgeLayer.batchDraw();

	};

	sociogramMissing.nodeAlreadyAsked = function(id) {
		// console.log('nodeAlreadyAsked '+id);
		var node = netCanvas.Modules.session.getPrimaryNetwork().getNode(id);
		// console.log(node.label);
		var nodeNg = node.namegenerator;
		// console.log(nodeNg);
		// console.log(settings.prompts[currentPrompt].variable);
		// console.log(variableOrder.indexOf(nodeNg));
		// console.log(variableOrder.indexOf(settings.prompts[currentPrompt].variable));
		if (variableOrder.indexOf(nodeNg) < variableOrder.indexOf(settings.prompts[currentPrompt].variable)) {
			// console.log('returning true.');
			// console.log('-----');
			return true;
		} else {
			// console.log('returning false');
			// console.log('-----');
			return false;
		}

	};

	sociogramMissing.updateNodeState = function() {
		/**
		* Updates visible attributes based on current prompt
		*/

		var selectNodes = window.netCanvas.Modules.session.getPrimaryNetwork().getNodes({}, function (results) {
            var filteredResults = [];
            $.each(results, function(index,value) {
                if (value.type !== 'Ego') {
                    filteredResults.push(value);
                }
            });

            return filteredResults;
        });

		$.each(selectNodes, function(index, node) {
			var currentValue = node[settings.prompts[currentPrompt].variable];
			var currentNode = sociogramMissing.getNodeByID(node.id);
			if (currentValue) {
				// this node is selected
				currentNode.children[1].stroke(colors.selected);
			}

			if (sociogramMissing.nodeAlreadyAsked(node.id)) {
				currentNode.children[1].opacity(0);
				currentNode.children[2].opacity(0);
			}
		});

		nodeLayer.draw();


	};

	sociogramMissing.getSelectedNodes = function() {
		return selectedNodes;
	};

	sociogramMissing.destroy = function() {
		note.debug('Destroying sociogramMissing.');
		stage.destroy();
		window.tools.Events.unbind(moduleEvents);
	};

	sociogramMissing.addNode = function(options) {

		note.info('Sociogram is creating a node.');
		note.debug(options);
		// Placeholder for getting the number of nodes we have.
		var nodeShape;

		var nodeID = 0;
		while (settings.network.getNode(nodeID) !== false) {
			nodeID++;
		}

		var dragStatus = false;

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

		nodeGroup.on('tap click', function() {

			selectedNodes = [];
			// var kineticNodes = sociogramMissing.getKineticNodes();
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
			// flip variable

			// Get current variable value
			var properties = {};
			var currentValue = settings.network.getNode(currentNode.attrs.id)[settings.prompts[currentPrompt].variable];
			// flip
			if (!currentValue || typeof currentValue === 'undefined') {
				properties[settings.prompts[currentPrompt].variable] = 'true';
				currentNode.children[1].stroke(colors.selected);
			} else {
				// remove static variables, if present
				var node = netCanvas.Modules.session.getPrimaryNetwork().getNode(currentNode.attrs.id);
				node[settings.prompts[currentPrompt].variable] = 0;
				currentNode.children[1].stroke(settings.options.defaultNodeColor);
			}

			settings.network.updateNode(currentNode.attrs.id, properties);

			this.moveToTop();
			nodeLayer.draw();
		});

		return nodeGroup;
	};

	// Edge manipulation functions

	sociogramMissing.addEdge = function(properties) {

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
		var toObject = sociogramMissing.getNodeByID(properties.to);
	 	var fromObject = sociogramMissing.getNodeByID(properties.from);
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

	sociogramMissing.removeEdge = function(properties) {

		note.debug('sociogramMissing.removeEdge() called.');
		if (!properties) {
			note.error('No properties passed to sociogramMissing.removeEdge()!');
		}

		// Test if we are being called by an event, or directly
		if (typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== settings.network.getEgo().id) {
			properties = properties.detail;
		}

		var toObject = properties.to;
	 	var fromObject = properties.from;

		// This function is failing because two nodes are matching below
		var found = false;
		$.each(sociogramMissing.getKineticEdges(), function(index, value) {
			if (value !== undefined) {
				if (value.attrs.from === fromObject && value.attrs.to === toObject || value.attrs.from === toObject && value.attrs.to === fromObject ) {
					found = true;
					edgeLayer.children[index].remove();
					edgeLayer.draw();
				}
			}

		});

		if (!found) {
			note.error('sociogramMissing.removeEdge() failed! Couldn\'t find the specified edge.');
		} else {
			return true;
		}

	};

	sociogramMissing.removeNode = function() {
	};

	// Misc functions

	sociogramMissing.clearGraph = function() {
		edgeLayer.removeChildren();
		edgeLayer.clear();
		nodeLayer.removeChildren();
		nodeLayer.clear();

	};

	sociogramMissing.getStage = function() {
		return stage;
	};

	// Main initialisation functions

	sociogramMissing.initKinetic = function () {
		// Initialise KineticJS stage
		stage = new Konva.Stage({
			container: settings.targetEl,
			width: window.innerWidth,
			height: window.innerHeight
		});

		circleLayer = new Konva.Layer();
		nodeLayer = new Konva.Layer();
		edgeLayer = new Konva.FastLayer();

		/**
		* This hack allows us to detect clicks that happen outside of nodes, hulls, or edges.
		* We create a transparent rectangle on a special background layer which sits between the UI layer and the interaction layers.
		* We then listen to click events on this shape.
 		*/
		stage.add(circleLayer);
		stage.add(edgeLayer);
		stage.add(nodeLayer);

		note.debug('Konva stage initialised.');

	};

	sociogramMissing.drawUIComponents = function (callback) {

		// Draw all UI components
		var previousSkew = 0;
		var circleFills, circleLines;
		var currentColor = settings.options.concentricCircleColor;
		var totalHeight = window.innerHeight-(settings.options.defaultNodeSize); // Our sociogram area is the window height minus twice the node radius (for spacing)
		var currentOpacity = 0.1;

		//draw concentric circles
		for(var i = 0; i < settings.options.concentricCircleNumber; i++) {
			var ratio = (1-(i/settings.options.concentricCircleNumber));
			var skew = i > 0 ? (ratio * 5) * (totalHeight/50) : 0;
			var currentRadius = totalHeight/2 * ratio;
			currentRadius = settings.options.concentricCircleSkew? currentRadius + skew + previousSkew : currentRadius;
			if (i === settings.options.concentricCircleNumber-1 && settings.options.concentricCircleColor > 1) {
				currentRadius += 50;
			}
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

		// add the shape to the layer

		var newNodeCircleGroup = new Konva.Group({
		 x: 145,
		 opacity:0,
		 y: window.innerHeight / 2,
		});

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

		circleLayer.draw();

		note.debug('User interface initialised.');

		if (callback) {
			callback();
		}
	};

	// Get & set functions

	sociogramMissing.getKineticNodes = function() {
		return nodeLayer.children;
	};

	sociogramMissing.getKineticEdges = function() {
		return edgeLayer.children;
	};

	sociogramMissing.getSimpleNodes = function() {
		// We need to create a simple representation of the nodes for storing.
		var simpleNodes = {};
		var nodes = sociogramMissing.getKineticNodes();
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

	sociogramMissing.getSimpleEdges = function() {
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

	sociogramMissing.getSimpleEdge = function(id) {
		var simpleEdges = sociogramMissing.getSimpleEdges();
		if (!id) { return false; }

		var simpleEdge = simpleEdges[id];
		return simpleEdge;
	};

	sociogramMissing.getEdgeLayer = function() {
		return edgeLayer;
	};

	sociogramMissing.getNodeLayer = function() {
		return nodeLayer;
	};

	sociogramMissing.getUILayer = function() {
		return uiLayer;
	};

	sociogramMissing.getNodeByID = function(id) {
		var node = {},
		nodes = sociogramMissing.getKineticNodes();

		$.each(nodes, function(index, value) {
			if (value.attrs.id === id) {
				node = value;
			}
		});

		return node;
	};

	sociogramMissing.getNodeColorByType = function(type) {
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

	return sociogramMissing;

};
