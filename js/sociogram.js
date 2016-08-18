/* global Konva, window, $, note */
/* exported Sociogram */
/*jshint bitwise: false*/

// Can be replaced with npm module once v0.9.5 reaches upstream.
module.exports = function Sociogram() {
	'use strict';
	// Global variables
	var stage, circleLayer, edgeLayer, nodeLayer, uiLayer, sociogram = {};
	var selectedNodes = [];
	var log;
	var menuOpen = false;
	var cancelKeyBindings = false;
	var taskComprehended = false;

	// Colours
	var colors = {
		blue: '#0174DF',
		placidblue: '#83b5dd',
		violettulip: '#9B90C8',
		hemlock: '#9eccb3',
		paloma: '#aab1b0',
		freesia: '#ffd600',
		cayenne: '#c40000',
		celosiaorange: '#f47d44',
		sand: '#ceb48d',
		dazzlingblue: '#006bb6',
		edge: '#e85657',
		selected: 'gold',
	};

	// Default sociogram.settings
	sociogram.settings = {
		network: window.netCanvas.Modules.session.getPrimaryNetwork(),
		defaultNodeSize: 35,
		defaultNodeColor: colors.blue,
		defaultEdgeColor: colors.edge,
		concentricCircleColor: '#ffffff',
		concentricCircleNumber: 4,
		criteria: {},
		filter: null,
		nodeTypes: [
			{'name':'Person','color':colors.blue},
			{'name':'OnlinePerson','color':colors.hemlock},
			{'name':'Organisation','color':colors.cayenne},
			{'name':'Professional','color':colors.violettulip}
		]
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

	sociogram.init = function (userSettings) {
		note.info('Sociogram initialising.');
		window.tools.extend(sociogram.settings,userSettings);

		$('<div class="sociogram-title"><h4>'+sociogram.settings.heading+'</h4><p>'+sociogram.settings.subheading+'</p></div>').insertBefore( '#kineticCanvas' );

		sociogram.initKinetic();

		window.addEventListener('nodeAdded', sociogram.addNode, false);
		window.addEventListener('edgeAdded', sociogram.addEdge, false);
		window.addEventListener('nodeRemoved', sociogram.removeNode, false);
		window.addEventListener('edgeRemoved', sociogram.removeEdge, false);
		window.addEventListener('changeStageStart', sociogram.destroy, false);

		// Are there existing nodes? Display them.

		// Get all nodes that match the criteria
		var criteriaEdges = sociogram.settings.network.getEdges(sociogram.settings.criteria, sociogram.settings.filter);

		// Sort these into reverse order
		criteriaEdges.reverse();

		// Iterate over them
		for (var i = 0; i < criteriaEdges.length; i++) {
			var dyadEdge = sociogram.settings.network.getEdges({from:criteriaEdges[i].from, to:criteriaEdges[i].to, type:'Dyad'})[0];
			var newNode = sociogram.addNode(dyadEdge);

			// If we are in select mode, set the initial state
			if (sociogram.settings.mode === 'Select') {
				// test if we are flipping a variable or assigning an edge
				if (sociogram.settings.variable) {
					//we are flipping a variable
					var properties = {
						from: sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id,
						to: criteriaEdges[i].to,
					};

					properties[sociogram.settings.variable] = 1;

					if (sociogram.settings.network.getEdges(properties).length > 0) {
						newNode.children[0].stroke(colors.selected);
						nodeLayer.draw();
					}
				} else {
					// we are assigning an edge
					// set initial state of node according to if an edge exists
					if (sociogram.settings.network.getEdges({from: sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id, to: criteriaEdges[i].to, type: sociogram.settings.edgeType}).length > 0) {
						newNode.children[0].stroke(colors.selected);
						nodeLayer.draw();
					}

				}
			}
		}

		setTimeout(function() { // seems to be needed in Chrome Canary. Why!?
			sociogram.drawUIComponents();
		}, 0);

		// Are there existing edges? Display them
		var edges, edgeProperties;
		if (sociogram.settings.mode === 'Edge') {

			// Set the criteria based on edge type
			edgeProperties =  {
				type: sociogram.settings.edgeType
			};

			// Filter to remove edges involving ego, unless this is edge select mode.
			edges = sociogram.settings.network.getEdges(edgeProperties, function (results) {
				var filteredResults = [];
				$.each(results, function(index,value) {
					if (value.from !== sociogram.settings.network.getEgo().id && value.to !== sociogram.settings.network.getEgo().id) {
						filteredResults.push(value);
					}
				});

				return filteredResults;
			});

			$.each(edges, function(index,value) {
				sociogram.addEdge(value);
			});

		} else if (sociogram.settings.mode === 'Select' || sociogram.settings.mode === 'Update') {
			// Select mode

			// Show the social window.network
			// Filter to remove edges involving ego, unless this is edge select mode.
			edgeProperties = {};

			if (sociogram.settings.showEdge) {
				edgeProperties =  {
					type: sociogram.settings.showEdge
				};
			} else {
				edgeProperties =  {
					type: 'Dyad'
				};
			}
			edges = sociogram.settings.network.getEdges(edgeProperties, function (results) {
				var filteredResults = [];
				$.each(results, function(index,value) {
					if (value.from !== sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id && value.to !== sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id) {
						filteredResults.push(value);
					}
				});

				return filteredResults;
			});

			$.each(edges, function(index,value) {
				sociogram.addEdge(value);
			});

		} else if (sociogram.settings.mode === 'Position') {
			// Don't show any edges.
		}
	};

	sociogram.getSelectedNodes = function() {
		return selectedNodes;
	};

	sociogram.keyPressHandler = function(e) {
		if (!cancelKeyBindings) {

			if (!menuOpen) {
				//open the menu
				$('.new-node-form').addClass('node-form-open');
				$('.content').addClass('blurry'); //blur content background
				menuOpen = true;
				$('.name-box').focus();
			}

			// Prevent accidental backspace navigation
			if (e.which === 8 && !$(e.target).is('input, textarea, div')) {
				e.preventDefault();
			}

		}
	};

	sociogram.destroy = function() {

		// menu.removeMenu(canvasMenu); // remove the window.network menu when we navigate away from the page.
		$('.new-node-form').remove(); // Remove the new node form

		window.removeEventListener('nodeAdded', sociogram.addNode, false);
		window.removeEventListener('edgeAdded', sociogram.addEdge, false);
		window.removeEventListener('nodeRemoved', sociogram.removeNode, false);
		window.removeEventListener('edgeRemoved', sociogram.removeEdge, false);
		window.removeEventListener('changeStageStart', sociogram.destroy, false);
		$(window.document).off('keypress', sociogram.keyPressHandler);

	};

	// Node manipulation functions

	sociogram.resetPositions = function() {
		var dyadEdges = sociogram.settings.network.getEdges({type:'Dyad'});

		$.each(dyadEdges, function(index) {
			sociogram.settings.network.updateEdge(dyadEdges[index].id, {coords: []});
		});
	};

	sociogram.addNode = function(options) {
		note.debug('Sociogram is creating a node.');
		// options = options.details;

		// Placeholder for getting the number of nodes we have.
		var nodeShape;

		var nodeID = 0;
		while (sociogram.settings.network.getNode(nodeID) !== false) {
			nodeID++;
		}

		var dragStatus = false;
		if (sociogram.settings.mode === 'Position' || sociogram.settings.mode === 'Edge') {
			dragStatus = true;
		}
		options.label = options.nname_t0;
		var nodeOptions = {
			coords: [$(window).width()+50,100],
			id: nodeID,
			label: 'Undefined',
			size: sociogram.settings.defaultNodeSize,
			color: 'rgb(0,0,0)',
			strokeWidth: 4,
			draggable: dragStatus,
			dragDistance: 20
		};

		window.tools.extend(nodeOptions, options);

		nodeOptions.id = parseInt(nodeOptions.id, 10);

		nodeOptions.type = 'Person'; // We don't need different node shapes for RADAR
		nodeOptions.x = nodeOptions.coords[0];
		nodeOptions.y = nodeOptions.coords[1];



		var nodeGroup = new Konva.Group(nodeOptions);

		switch (nodeOptions.type) {
			case 'Person':
			nodeShape = new Konva.Circle({
				radius: nodeOptions.size,
				fill:nodeOptions.color,
				stroke: 'white',
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

			case 'Organisation':
			nodeShape = new Konva.Rect({
				width: nodeOptions.size*2,
				height: nodeOptions.size*2,
				fill:nodeOptions.color,
				stroke: sociogram.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth,
				// offset: {x: nodeOptions.size, y: nodeOptions.size}
			});
			break;

			case 'OnlinePerson':
			nodeShape = new Konva.RegularPolygon({
				sides: 3,
				fill:nodeOptions.color,
				radius: nodeOptions.size*1.2, // How should I calculate the correct multiplier for a triangle?
				stroke: sociogram.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

			case 'Professional':
			nodeShape = new Konva.Star({
				numPoints: 6,
				fill:nodeOptions.color,
				innerRadius: nodeOptions.size-(nodeOptions.size/3),
				outerRadius: nodeOptions.size+(nodeOptions.size/3),
				stroke: sociogram.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

		}

		var nodeLabel = new Konva.Text({
			text: nodeOptions.label,
			// fontSize: 20,
			fontFamily: 'Lato',
			fill: 'white',
			align: 'center',
			// offsetX: (nodeOptions.size*-1)-10, //left right
			// offsetY:(nodeOptions.size*1)-10, //up down
			fontStyle:500

		});

		note.debug('Putting node '+nodeOptions.label+' at coordinates x:'+nodeOptions.coords[0]+', y:'+nodeOptions.coords[1]);

		// Node event handlers
		nodeGroup.on('dragstart', function() {
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
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragmove', function() {
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
			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from.id === dragNode || value.attrs.to.id === dragNode) {
					var points = [sociogram.getNodeByID(value.attrs.from.id).getX(), sociogram.getNodeByID(value.attrs.from.id).getY(), sociogram.getNodeByID(value.attrs.to.id).getX(), sociogram.getNodeByID(value.attrs.to.id).getY()];
					value.attrs.points = points;

				}
			});
			edgeLayer.draw();

		});

		nodeGroup.on('tap click', function() {
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
			var currentNode = this;

			window.dispatchEvent(log);
			if (sociogram.settings.mode === 'Select') {
				var edge;

				// Check if we are flipping a binary variable on the Dyad edge or setting an edge
				if (sociogram.settings.variable) {
					// We are flipping a variable

					var properties = {};
					var currentValue = sociogram.settings.network.getEdge(currentNode.attrs.id)[sociogram.settings.variable];
					if (currentValue === 0 || typeof currentValue === 'undefined') {
						properties[sociogram.settings.variable] = 1;
						currentNode.children[0].stroke(colors.selected);
					} else {
						properties[sociogram.settings.variable] = 0;
						currentNode.children[0].stroke('white');
					}

					sociogram.settings.network.setProperties(sociogram.settings.network.getEdge(currentNode.attrs.id), properties);


				} else {
					// We are setting an edge
					// Test if there is an existing edge.
					if (sociogram.settings.network.getEdges({type: sociogram.settings.edgeType,from:sociogram.settings.network.getEgo().id, to: this.attrs.to}).length > 0) {
						// if there is, remove it
						this.children[0].stroke('white');
						sociogram.settings.network.removeEdge(sociogram.settings.network.getEdges({type: sociogram.settings.edgeType,from:sociogram.settings.network.getEgo().id, to: this.attrs.to})[0]);
					} else {
						// else add it
						edge = {
							from:sociogram.settings.network.getEgo().id,
							to: this.attrs.to,
							type: sociogram.settings.edgeType,
						};

						if (typeof sociogram.settings.variables !== 'undefined') {
							$.each(sociogram.settings.variables, function(index, value) {
								edge[value.label] = value.value;
							});
						}

						this.children[0].stroke(colors.selected);
						sociogram.settings.network.addEdge(edge);
					}
				}


			} else if (sociogram.settings.mode === 'Update') {
				if (selectedNodes.indexOf(currentNode) === -1) {
					selectedNodes.push(currentNode.attrs.id);
					currentNode.children[0].stroke(colors.selected);
				} else {
					selectedNodes.remove(currentNode.attrs.id);
					currentNode.children[0].stroke('white');
				}

			} else if (sociogram.settings.mode === 'Edge') {
				// If this makes a couple, link them.
				if (selectedNodes[0] === this) {
					// Ignore two clicks on the same node
					return false;
				}
				selectedNodes.push(this);
				if(selectedNodes.length === 2) {
					selectedNodes[1].children[0].stroke('white');
					selectedNodes[0].children[0].stroke('white');
					var edgeProperties = {
						from: selectedNodes[0].attrs.to,
						to: selectedNodes[1].attrs.to,
						type: sociogram.settings.edgeType
					};

					edgeProperties[sociogram.settings.variables[0]] = 'perceived';


					if (sociogram.settings.network.edgeExists(edgeProperties) === true) {
						note.debug('Sociogram removing edge.');
						sociogram.settings.network.removeEdge(sociogram.settings.network.getEdges(edgeProperties));
					} else {
						if (sociogram.settings.network.addEdge(edgeProperties) === false) {
							note.error('Error! Edge creation failed.');
							throw new Error('Error! Edge creation failed.');
						} else {
							note.debug('Edge created by consecutive tap.');
						}

					}
					selectedNodes = [];
					nodeLayer.draw();
				} else {
					// If not, simply turn the node stroke to the selected style so we can see that it has been selected.
					this.children[0].stroke(colors.selected);
					// selectedNodes.push(this);
					// this.children[0].strokeWidth(4);
					nodeLayer.draw();
				}
			}
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragend', function() {
			note.debug('dragend');

			// set the context
			var from = {};
			var to = {};

			// Fetch old position from properties populated by dragstart event.
			from.x = this.attrs.oldx;
			from.y = this.attrs.oldy;

			to.x = this.attrs.x;
			to.y = this.attrs.y;

			// Add them to an event object for the logger.
			var eventObject = {
				nodeTarget: this.attrs.id,
				from: from,
				to: to,
			};

			var currentNode = this;

			// Log the movement and save the graph state.
			log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeMove', 'eventObject':eventObject}});
			window.dispatchEvent(log);

			sociogram.settings.network.setProperties(sociogram.settings.network.getEdge(currentNode.attrs.id), {coords: [currentNode.attrs.x,currentNode.attrs.y]});

			// remove the attributes, just incase.
			delete this.attrs.oldx;
			delete this.attrs.oldy;

		});

		padText(nodeLabel,nodeShape,10);

		nodeGroup.add(nodeShape);
		nodeGroup.add(nodeLabel);

		nodeLayer.add(nodeGroup);
		setTimeout(function() {
			nodeLayer.draw();
		}, 0);


		if (!options.coords || options.coords.length === 0) {
			var tween = new Konva.Tween({
				node: nodeGroup,
				x: $(window).width()-150,
				y: 100,
				duration:0.7,
				easing: Konva.Easings.EaseOut
			});
			tween.play();
			sociogram.settings.network.setProperties(sociogram.settings.network.getNode(nodeOptions.id),{coords:[$(window).width()-150, 100]});
		}

		return nodeGroup;
	};

	// Edge manipulation functions

	sociogram.addEdge = function(properties) {
		if(typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined') {
			properties = properties.detail;
		}

		note.debug('Sociogram is adding an edge.');


		// Get all nodes that match the criteria
		var criteriaEdges = sociogram.settings.network.getEdges(sociogram.settings.criteria, sociogram.settings.filter);
		var criteriaDyadEdge = [];
		// Iterate over them
		for (var i = 0; i < criteriaEdges.length; i++) {
			criteriaDyadEdge.push(sociogram.settings.network.getEdges({from:window.network.getEgo().id, to:criteriaEdges[i].to, type:'Dyad'})[0]);
		}

		// Get the dyad edges of the from and to IDs so we can get the coordinates.
		var toObject = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.to, type:'Dyad'})[0];
		var fromObject = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.from, type:'Dyad'})[0];

		// Test if the proposed edge if between two nodes that are included in our interface criteria
		if (criteriaDyadEdge.indexOf(toObject) === -1 || criteriaDyadEdge.indexOf(fromObject) === -1) {
			note.debug('Cancelled adding edge between two nodes, because one or both were not visible.');
			return false;
		}

		var points = [fromObject.coords[0], fromObject.coords[1], toObject.coords[0], toObject.coords[1]];
		var edge = new Konva.Line({
			// dashArray: [10, 10, 00, 10],
			strokeWidth: 4,
			opacity:1,
			stroke: sociogram.settings.defaultEdgeColor,
			// opacity: 0.8,
			from: fromObject,
			to: toObject,
			points: points
		});

		edgeLayer.add(edge);

		setTimeout(function() {
			edgeLayer.draw();
		},0);
		nodeLayer.draw();
		note.debug('Created Edge between '+fromObject.label+' and '+toObject.label);

		return true;

	};

	sociogram.removeEdge = function(properties) {
		note.debug('sociogram.removeEdge() called.');
		if (!properties) {
			note.error('No properties passed to sociogram.removeEdge()!');
		}

		// Test if we are being called by an event, or directly
		if (typeof properties.detail !== 'undefined') {
			properties = properties.detail;
		}

		var toNode = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.to, type:'Dyad'})[0];
		var fromNode = sociogram.settings.network.getEdges({from:sociogram.settings.network.getEgo().id, to: properties.from, type:'Dyad'})[0];

		// This function is failing because two nodes are matching below
		var found = false;
		$.each(sociogram.getKineticEdges(), function(index, value) {
			if (value !== undefined) {
				if (value.attrs.from === fromNode && value.attrs.to === toNode || value.attrs.from === toNode && value.attrs.to === fromNode ) {
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

	// Main initialisation functions

	sociogram.initKinetic = function () {
		// Initialise KineticJS stage
		stage = new Konva.Stage({
			container: 'kineticCanvas',
			width: window.innerWidth,
			height: window.innerHeight
		});

		circleLayer = new Konva.Layer();
		nodeLayer = new Konva.Layer();
		edgeLayer = new Konva.Layer();
		uiLayer = new Konva.Layer();

		stage.add(circleLayer);
		stage.add(edgeLayer);
		stage.add(nodeLayer);
		stage.add(uiLayer);
		note.debug('Konva stage initialised.');
	};

	sociogram.drawUIComponents = function () {

		// Draw all UI components
		var circleFills, circleLines;
		var currentColor = sociogram.settings.concentricCircleColor ;
		var totalHeight = window.innerHeight-(sociogram.settings.defaultNodeSize); // Our sociogram area is the window height minus twice the node radius (for spacing)
		var currentOpacity = 0.1;

		//draw concentric circles
		for(var i = 0; i < sociogram.settings.concentricCircleNumber; i++) {
			var ratio = 1-(i/sociogram.settings.concentricCircleNumber);
			var currentRadius = (totalHeight/2 * ratio);

			circleLines = new Konva.Circle({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				radius: currentRadius,
				stroke: 'white',
				strokeWidth: 1.5,
				opacity: 0
			});

			circleFills = new Konva.Circle({
				x: window.innerWidth / 2,
				y: (window.innerHeight / 2),
				radius: currentRadius,
				fill: currentColor,
				opacity: currentOpacity,
				strokeWidth: 0,
			});

			// currentColor = tinycolor.darken(currentColor, amount = 15).toHexString();
			currentOpacity = currentOpacity+((0.3-currentOpacity)/sociogram.settings.concentricCircleNumber);
			circleLayer.add(circleFills);
			circleLayer.add(circleLines);

		}

		circleLayer.draw();
		uiLayer.draw();

		// sociogram.initNewNodeForm();
		note.debug('User interface initialised.');
	};

	// New Node Form

	sociogram.initNewNodeForm = function() {
		var form = $('<div class="new-node-form"></div>');
		var innerForm = $('<div class="new-node-inner"></div>');
		form.append(innerForm);
		innerForm.append('<h1>Add a new contact</h1>');
		innerForm.append('<p>Some text accompanying the node creation box.</p>');
		// TODO: Use a innerForm generation class here.
		// For now, just an input box.
		innerForm.append('<input type="text" class="form-control name-box"></input>');

		$('.content').after(form); // add after the content container.


		// Key bindings
		$(window.document).on('keypress', sociogram.keyPressHandler);

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
		$.each(sociogram.settings.nodeTypes, function(index, value) {
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
