/* global Konva, window, alert, $, ConvexHullGrahamScan */
/* exported Sociogram */
/*jshint bitwise: false*/

// Can be replaced with npm module once v0.9.5 reaches upstream.
module.exports = function Sociogram() {
	'use strict';
	// Global variables
	var stage, circleLayer, edgeLayer, nodeLayer, wedgeLayer, hullLayer, uiLayer, sociogram = {};
	var selectedNodes = [];
	var log;
	var menuOpen = false;
	var cancelKeyBindings = false;
	var taskComprehended = false;
	var longPressTimer;
	var touchNotTap = false;
	var hulls = [];
	var hullShapes = [];

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
		targetEl: 'kineticCanvas',
		// consecutive single tap - edge mode
		// drag - layout mode
		// double tap - select mode
		// long press - community mode
		modes:['Edge', 'Community', 'Position', 'Select'], //edge - create edges, position - lay out, select - node attributes
		panels: ['mode', 'context'], // Mode - switch between modes, Context - convex hull drawing and labelling
		options: {
			defaultNodeSize: 35,
			defaultNodeColor: 'white',
			defaultNodeStrokeWidth: 4,
			defaultLabelColor: 'black',
			defaultEdgeColor: colors.edge,
			concentricCircleColor: '#ffffff',
			concentricCircleNumber: 4,
		},
		nodeTypes: [
			{'name':'Person','color':colors.blue},
			{'name':'OnlinePerson','color':colors.hemlock},
			{'name':'Organisation','color':colors.cayenne},
			{'name':'Professional','color':colors.violettulip}
		],
		dataDestination: {
			// indexed by mode. one for each active mode
			'Edge': {
				target: 'edge', // edge or node. where do we store the attriute?
				variables: [
					{'type': 'Friend'}, // node or edge type. Should this be promoted out of the variables array? Might need to respect existing exdges or nodes. When to we overwrite vs update?
					{'namegenerator': 'closenest'}
					// {'weight': function() { some callback eval code }}
				]
			},
			'Select': {
				target: 'node',
				variables: [
					{'drugUser': 'true'}
				]
			},
			'Position': { // probably not needed
			},
			'Community' : {
				target: 'node',
				variables: [
					{'memberOf': '$community'} // template language?
				]
			}
		},
		criteria: { // criteria for being shown on this screen
			type: 'edge',
			includeEgo: false,
			query: {
				type:'Dyad',
				from:window.network.getEgo()
			}
		},
		heading: 'A default heading',
		subheading: 'A default subheading'
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

	sociogram.init = function (userSettings) {
		window.tools.notify('Sociogram initialising.', 1);
		window.tools.extend(sociogram.settings,userSettings);

		// Add the title and heading
		$('<div class="sociogram-title"><h4>'+sociogram.settings.heading+'</h4><p>'+sociogram.settings.subheading+'</p></div>').insertBefore('#'+sociogram.settings.targetEl );

		// Initialise the konva stage
		sociogram.initKinetic();

		// Add the evevent listeners
		window.addEventListener('nodeAdded', sociogram.addNode, false);
		window.addEventListener('edgeAdded', sociogram.addEdge, false);
		window.addEventListener('nodeRemoved', sociogram.removeNode, false);
		window.addEventListener('edgeRemoved', sociogram.removeEdge, false);
		window.addEventListener('changeStageStart', sociogram.destroy, false);


		// Panels
		if (sociogram.settings.panels.indexOf('context') !== -1) {
			$('<div class="context-panel"><h4>Named Contexts:</h4><ul class="context-list"><li class="context" data-context="0"><div class="context-color" style="background:Tomato"></div> Family</li><li class="context" data-context="0"><div class="context-color" style="background:Teal"></div> Friends</li></ul></div>').appendTo('#'+sociogram.settings.targetEl);
		}

		if (sociogram.settings.panels.indexOf('mode') !== -1) {
			var sociogramModesMenu = window.menu.addMenu('Modes', 'check-circle-o');
			window.menu.addItem(sociogramModesMenu, 'Context', null, function() {setTimeout(function() {}, 500); });
		}

		// Are there existing nodes? Display them.

		// Get all nodes or that match the criteria
		//
		// First, are we dealing with a node or an edge query?
		// - If a node query, simply query the nodes and use the node properties to create sociogram.nodes
		// - If an edge query, do three things:
		// 		- Run the edge query
		// 		- If the nodePropertiesEdge key exists, use that to get the sociogram.node properties
		// 		- If it doesn't, use the edge properties instead.

		if (sociogram.settings.criteria.type === 'edge') {

			// Get edges according to criteria query
			var criteriaEdges = sociogram.settings.network.getEdges(sociogram.settings.criteria.query);

			// Iterate over them
			for (var i = 0; i < criteriaEdges.length; i++) {

				var dyadEdge;

				// If the 'nodePropertiesEdge' key is set, use that to get the sociogram.node properties.
				if (typeof sociogram.settings.criteria.nodePropertiesEdge !== 'undefined') {
					dyadEdge = sociogram.settings.network.getEdges({from:criteriaEdges[i].from, to:criteriaEdges[i].to, type:sociogram.settings.criteria.nodePropertiesEdge})[0];
				} else {
				// If 'nodePropertiesEdge' key is not set, simply copy the edge values to the sociogram.nodes
					dyadEdge = criteriaEdges[i];
				}
				// Create the sociogram.node
				sociogram.addNode(dyadEdge);

			}

		} else if (sociogram.settings.criteria.type === 'node') {


			var criteriaNodes;

			// get nodes according to criteria query
			// filter out ego if required
			if (sociogram.settings.criteria.includeEgo !== true) {
				criteriaNodes = sociogram.settings.network.getNodes(sociogram.settings.criteria.query, function (results) {
					var filteredResults = [];
					$.each(results, function(index,value) {
						if (value.type !== 'Ego') {
							filteredResults.push(value);
						}
					});

					return filteredResults;
				});
			} else {
				criteriaNodes = sociogram.settings.network.getNodes(sociogram.settings.criteria.query);
			}

			for (var j = 0; j < criteriaNodes.length; j++) {
				sociogram.addNode(criteriaNodes[j]);
			}
		}

		// Update initial states of all nodes and edges;
		sociogram.updateInitialNodeState();

		setTimeout(function() { // seems to be needed in Chrome Canary. Why!?
			sociogram.drawUIComponents();
		}, 0);
	};

	sociogram.updateInitialNodeState = function() {

		// This method uses the dataOrigin settings key to retrieve the initial states of nodes and edges

				// // Select mode
				// if (sociogram.settings.modes.indexOf('Select') !== -1) {
				// 	// test if we are flipping a variable or assigning an edge
				// 	if (sociogram.settings.variable) {
				// 		//we are flipping a variable
				// 		var properties = {
				// 			from: sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id,
				// 			to: criteriaEdges[i].to,
				// 		};
				//
				// 		properties[sociogram.settings.variable] = 1;
				//
				// 		if (sociogram.settings.network.getEdges(properties).length > 0) {
				// 			newNode.children[0].stroke(colors.selected);
				// 			nodeLayer.draw();
				// 		}
				// 	} else {
				// 		// we are assigning an edge
				// 		// set initial state of node according to if an edge exists
				// 		if (sociogram.settings.network.getEdges({from: sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id, to: criteriaEdges[i].to, type: sociogram.settings.edgeType}).length > 0) {
				// 			newNode.children[0].stroke(colors.selected);
				// 			nodeLayer.draw();
				// 		}
				//
				// 	}
				// }

				// Edge Mode
				if (sociogram.settings.modes.indexOf('Edge') !== -1) {

					// get the source of the edges according to dataOrigin
					if (sociogram.settings.dataOrigin.Edge.type === 'edge') {
						// Get any edges involving the currently visible nodes (needless complexity?) that meet the criteria
						var properties = {};
						$.each(sociogram.settings.dataOrigin.Edge.variables, function(index, value) {
							window.tools.extend(properties, value);
						});
						var edges = sociogram.settings.network.getEdges(properties);
						$.each(edges, function(index, edge) {
							console.log('edge');
							console.log(edge);
							sociogram.addEdge(edge);
						});

					} else if (sociogram.settings.dataOrigin.Edge.type === 'node') {
						console.log('Not yet implemented.');
					} else {
						console.log('Error.');
					}

				}
				//
				// // Select Mode
				// if (sociogram.settings.modes.indexOf('Select') !== -1 || sociogram.settings.modes.indexOf('Update') !== -1) {
				// 	// Select mode
				//
				// 	// Show the social window.network
				// 	// Filter to remove edges involving ego, unless this is edge select mode.
				// 	edgeProperties = {};
				//
				// 	if (sociogram.settings.showEdge) {
				// 		edgeProperties =  {
				// 			type: sociogram.settings.showEdge
				// 		};
				// 	} else {
				// 		edgeProperties =  {
				// 			type: 'Dyad'
				// 		};
				// 	}
				// 	edges = sociogram.settings.network.getEdges(edgeProperties, function (results) {
				// 		var filteredResults = [];
				// 		$.each(results, function(index,value) {
				// 			if (value.from !== sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id && value.to !== sociogram.settings.network.getNodes({type_t0:'Ego'})[0].id) {
				// 				filteredResults.push(value);
				// 			}
				// 		});
				//
				// 		return filteredResults;
				// 	});
				//
				// 	$.each(edges, function(index,value) {
				// 		sociogram.addEdge(value);
				// 	});
				//
				// }

				// Layout Mode
				if (sociogram.settings.modes.indexOf('Position') !== -1) {
					console.log('Position mode enabled');
					// Get the dataOrigin for position
					if (sociogram.settings.dataOrigin.Position.type === 'node') {
						// position data is coming from the node
						var nodes = sociogram.getKineticNodes();
						$.each(nodes, function(index,node) {
							console.log('setting position');
							console.log(node);
							console.log(sociogram.settings.dataOrigin.Position.variable);
							console.log(node.attrs[sociogram.settings.dataOrigin.Position.variable]);
							node.setPosition(node.attrs[sociogram.settings.dataOrigin.Position.variable]);
						});

					} else if (sociogram.settings.dataOrigin.Position.type === 'edge') {
						// position data is coming from the edge

					} else {
						// error!
					}

				}

				// Community mode
				if (sociogram.settings.modes.indexOf('Community') !== -1) {

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

	sociogram.addHull = function() {
        console.log('adding hull');
        var convexHull = new ConvexHullGrahamScan();
        hulls.push(convexHull);

        var color = window.tools.getRandomColor();
        var hullPoints = [];

        var hullShape = new Konva.Line({
          points: hullPoints,
          fill: color,
          opacity:0.5,
          stroke: color,
          lineJoin: 'round',
          lineCap: 'round',
          tension : 0.1,
          strokeWidth: 100,
          closed : true
        });

        hullShapes.push(hullShape);

        $('.hull-list').append('<li class="hull" data-hull="'+window.hullShapes.length+'"><div class="color" style="background:'+color+'"></div> Hull '+window.hullShapes.length+'</li>');
        // $('.hull-list').append('<li>Josh</li>');
        hullLayer.add(hullShape);
        hullLayer.draw();
    };

    sociogram.addPointToHull = function(point, hull) {

        console.log('adding point to hull');
        console.log('adding hull: '+hull+' to point:');
        console.log(point);



        point.attrs.hulls.push(hull);
        // redraw all hulls here (probably)

        var pointHulls = point.attrs.hulls;
        for (var i = 0; i < pointHulls.length; i++) {
            var newHull = new ConvexHullGrahamScan();

            for (var j = 0; j < window.nodeLayer.children.length; j++) {
                var thisChildHulls = window.nodeLayer.children[j].attrs.hulls;
                if (thisChildHulls.indexOf(pointHulls[i]) !== -1) {
                    var coords = window.nodeLayer.children[j].getPosition();
                    newHull.addPoint(coords.x, coords.y);
                }
            }

            hullShapes[pointHulls[i]].setPoints(toPointFromObject(newHull.getHull()));
            hullLayer.draw();
            nodeLayer.draw();

        }
    };

	// Node manipulation functions

	sociogram.addNode = function(options) {
		console.log(options);
		window.tools.notify('Sociogram is creating a node.',2);
		// Placeholder for getting the number of nodes we have.
		var nodeShape;

		var nodeID = 0;
		while (sociogram.settings.network.getNode(nodeID) !== false) {
			nodeID++;
		}

		var dragStatus = false;
		if (sociogram.settings.modes.indexOf('Position') !== -1 || sociogram.settings.modes.indexOf('Edge') !== -1) {
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
			coords: [$(window).width()+50,100],
			id: nodeID,
			label: 'Undefined',
			size: sociogram.settings.options.defaultNodeSize,
			color: sociogram.settings.options.defaultNodeColor,
			strokeWidth: sociogram.settings.options.defaultNodeStrokeWidth,
			stroke: sociogram.settings.options.defaultNodeColor,
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
			fill: sociogram.settings.options.defaultLabelColor,
			align: 'center',
			// offsetX: (nodeOptions.size*-1)-10, //left right
			// offsetY:(nodeOptions.size*1)-10, //up down
			fontStyle:500

		});

		window.tools.notify('Putting node '+nodeOptions.label+' at coordinates x:'+nodeOptions.coords[0]+', y:'+nodeOptions.coords[1], 2);

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


			window.tools.notify('dragstart',1);

			// Add the current position to the node attributes, so we know where it came from when we stop dragging.
			this.attrs.oldx = this.attrs.x;
			this.attrs.oldy = this.attrs.y;
			this.moveToTop();
			nodeLayer.draw();
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

			window.tools.notify('Dragmove',0);
			var dragNode = nodeOptions.id;

			// Update the position of any connected edges
			$.each(edgeLayer.children, function(index, value) {

				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from === dragNode || value.attrs.to === dragNode) {
					var points = [sociogram.getNodeByID(value.attrs.from).getX(), sociogram.getNodeByID(value.attrs.from).getY(), sociogram.getNodeByID(value.attrs.to).getX(), sociogram.getNodeByID(value.attrs.to).getY()];
					value.attrs.points = points;

				}
			});
			edgeLayer.draw();

		});

		nodeGroup.on('touchstart mousedown', function() {

			window.wedge.setAbsolutePosition(this.getAbsolutePosition());

			window.wedge.anim = new Konva.Animation(function(frame) {
				var duration = 700;
				if (frame.time >= duration) {
					alert('finished');
					window.wedge.anim.stop();
					window.clearTimeout(longPressTimer);
				} else {
					window.wedge.opacity(frame.time*(1/duration));
					window.wedge.setStrokeWidth(1+(frame.time*(20/duration)));
					window.wedge.setAngle(frame.time*(360/duration));
				}

			}, wedgeLayer);

			longPressTimer = setTimeout(function() {
				touchNotTap = true;
				window.wedge.anim.start();
			}, 200);

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
			console.log('double tap');
			// if (taskComprehended === false) {
			// 	var eventProperties = {
			// 		stage: window.netCanvas.Modules.session.currentStage(),
			// 		timestamp: new Date()
			// 	};
			// 	log = new window.CustomEvent('log', {'detail':{'eventType': 'taskComprehended', 'eventObject':eventProperties}});
			// 	window.dispatchEvent(log);
			// 	taskComprehended = true;
			// }
			// log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeClick', 'eventObject':this.attrs.id}});
			// var currentNode = this;
			//
			// window.dispatchEvent(log);
			// if (sociogram.settings.modes.indexOf('Select') !== -1) {
			// 	var edge;
			//
			// 	// Check if we are flipping a binary variable on the Dyad edge or setting an edge
			// 	if (sociogram.settings.variable) {
			// 		// We are flipping a variable
			//
			// 		var properties = {};
			// 		var currentValue = sociogram.settings.network.getEdge(currentNode.attrs.id)[sociogram.settings.variable];
			// 		if (currentValue === 0 || typeof currentValue === 'undefined') {
			// 			properties[sociogram.settings.variable] = 1;
			// 			currentNode.children[0].stroke(colors.selected);
			// 		} else {
			// 			properties[sociogram.settings.variable] = 0;
			// 			currentNode.children[0].stroke('white');
			// 		}
			//
			// 		sociogram.settings.network.setProperties(sociogram.settings.network.getEdge(currentNode.attrs.id), properties);
			//
			//
			// 	} else {
			// 		// We are setting an edge
			// 		// Test if there is an existing edge.
			// 		if (sociogram.settings.network.getEdges({type: sociogram.settings.edgeType,from:sociogram.settings.network.getEgo().id, to: this.attrs.to}).length > 0) {
			// 			// if there is, remove it
			// 			this.children[0].stroke('white');
			// 			sociogram.settings.network.removeEdge(sociogram.settings.network.getEdges({type: sociogram.settings.edgeType,from:sociogram.settings.network.getEgo().id, to: this.attrs.to})[0]);
			// 		} else {
			// 			// else add it
			// 			edge = {
			// 				from:sociogram.settings.network.getEgo().id,
			// 				to: this.attrs.to,
			// 				type: sociogram.settings.edgeType,
			// 			};
			//
			// 			if (typeof sociogram.settings.variables !== 'undefined') {
			// 				$.each(sociogram.settings.variables, function(index, value) {
			// 					edge[value.label] = value.value;
			// 				});
			// 			}
			//
			// 			this.children[0].stroke(colors.selected);
			// 			sociogram.settings.network.addEdge(edge);
			// 		}
			// 	}
			//
			//
			// }
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('tap click', function() {
			if (!touchNotTap) {
				console.log('tap');
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
				log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeClick', 'eventObject':this.attrs.id}});
				window.dispatchEvent(log);

				if (sociogram.settings.modes.indexOf('Edge') !== -1) {

					// Ignore two clicks on the same node
					if (selectedNodes[0] === this) {return false;}

					// Push the clicked node into the selected nodes array;
					selectedNodes.push(this);

					// Check the length of the selected nodes array.
					if(selectedNodes.length === 2) {
						//If it containes two nodes, create an edge

						//Reset the styling
						selectedNodes[1].children[0].stroke(sociogram.settings.options.defaultNodeColor);
						selectedNodes[0].children[0].stroke(sociogram.settings.options.defaultNodeColor);

						// Create an edge object

						if (sociogram.settings.dataDestination.Edge.type === 'edge')   {// We are storing the edge on an edge

							var edgeProperties = {};
							console.log(selectedNodes);
							if (sociogram.settings.criteria.type === 'node') {
								edgeProperties = {
									from: selectedNodes[0].attrs.id,
									to: selectedNodes[1].attrs.id,
								};
							}

							// Add the custom variables
							$.each(sociogram.settings.dataDestination.Edge.variables, function(index, value) {
								window.tools.extend(edgeProperties, value);
							});

							console.log(edgeProperties);
							// Try adding the edge. If it returns fals, it already exists, so remove it.
							if (sociogram.settings.network.addEdge(edgeProperties) === false) {
								window.tools.notify('Sociogram removing edge.',2);
								sociogram.settings.network.removeEdge(sociogram.settings.network.getEdges(edgeProperties));
							} else {
								window.tools.notify('Sociogram adding edge.',2);
							}

							// Empty the selected nodes array and draw the layer.
							selectedNodes = [];
						} else if (sociogram.settings.dataDestination.Edge.type === 'node')   {// We are storing the edge as a node attribute
							window.tools.notify('Storing edges as a node attribute is not yet implemented.', 1);
						} else {
							window.tools.notify('Error with edge destination.', 1);
						}
					} else { // First node selected. Simply turn the node stroke to the selected style so we can see that it has been selected.
						this.children[0].stroke(sociogram.settings.options.defaultEdgeColor);
					}
				}
				this.moveToTop();
				nodeLayer.draw();
			} else {
				touchNotTap = false;
			}

		});

		nodeGroup.on('dragend', function() {
			window.tools.notify('dragend',1);

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
			if (sociogram.settings.dataDestination.Position.type === 'node') {
				// Find the node we need to store the coordinates on, and update it.
				console.log('updating coords');
				console.log(this.attrs.id);
				console.log(this.attrs.coords);

				// Create a dummy object so we can use the variable name set in sociogram.settings.dataDestination
				var properties = {};
				properties[sociogram.settings.dataDestination.Position.variable] = this.attrs.coords;

				// Update the node with the object
				sociogram.settings.network.updateNode(this.attrs.id, properties, function() {
					window.tools.notify('Network node updated', 1);
				});

			} else if (sociogram.settings.dataDestination.Position.type === 'edge') {
				// not yet implemented
			}


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
		// This doesn't *usually* get called directly. Rather, it responds to an event fired by the network module.

		if(typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== sociogram.settings.network.getEgo().id) {
			// We have been called by an event
			properties = properties.detail;
		} else if (typeof properties.from !== 'undefined' && typeof properties.to !== 'undefined' && properties.from !== sociogram.settings.network.getEgo().id) {
			// We have been called by another sociogram method
			properties = properties;	
		} else {
			return false;
		}

		console.log(properties);
		// the below won't work because we are storing the coords in an edge now...
		window.tools.notify('Sociogram is adding an edge.',2);
		var toObject = sociogram.getNodeByID(properties.to);
	 	var fromObject = sociogram.getNodeByID(properties.from);

		var points = [fromObject.attrs.coords[0], fromObject.attrs.coords[1], toObject.attrs.coords[0], toObject.attrs.coords[1]];
		var edge = new Konva.Line({
			// dashArray: [10, 10, 00, 10],
			strokeWidth: 4,
			opacity:1,
			stroke: sociogram.settings.options.defaultEdgeColor,
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
		window.tools.notify('Created Edge between '+fromObject.label+' and '+toObject.label, 'success',2);

		return true;

	};

	sociogram.removeEdge = function(properties) {
		if(typeof properties.detail !== 'undefined' && typeof properties.detail.from !== 'undefined' && properties.detail.from !== sociogram.settings.network.getEgo().id) {
			properties = properties.detail;
		} else {
			return false;
		}

		var toObject = properties.to;
	 	var fromObject = properties.from;

		window.tools.notify('Removing edge.');

		// This function is failing because two nodes are matching below
		$.each(sociogram.getKineticEdges(), function(index, value) {
			if (value !== undefined) {
				if (value.attrs.from === fromObject && value.attrs.to === toObject || value.attrs.from === toObject && value.attrs.to === fromObject ) {
					edgeLayer.children[index].remove();
					edgeLayer.draw();
				}
			}

		});

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
			container: sociogram.settings.targetEl,
			width: window.innerWidth,
			height: window.innerHeight
		});

		circleLayer = new Konva.Layer();
		wedgeLayer = new Konva.Layer();
		nodeLayer = new Konva.Layer();
		edgeLayer = new Konva.Layer();
		uiLayer = new Konva.Layer();
		hullLayer = new Konva.Layer();

		stage.add(circleLayer);
		stage.add(edgeLayer);
		stage.add(wedgeLayer);
		stage.add(nodeLayer);
		stage.add(hullLayer);
		stage.add(uiLayer);
		window.tools.notify('Konva stage initialised.',1);
	};

	sociogram.drawUIComponents = function () {

		// Draw all UI components
		var circleFills, circleLines;
		var currentColor = sociogram.settings.options.concentricCircleColor ;
		var totalHeight = window.innerHeight-(sociogram.settings.options.defaultNodeSize); // Our sociogram area is the window height minus twice the node radius (for spacing)
		var currentOpacity = 0.1;

		//draw concentric circles
		for(var i = 0; i < sociogram.settings.options.concentricCircleNumber; i++) {
			var ratio = 1-(i/sociogram.settings.options.concentricCircleNumber);
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
			currentOpacity = currentOpacity+((0.3-currentOpacity)/sociogram.settings.options.concentricCircleNumber);
			circleLayer.add(circleFills);
			circleLayer.add(circleLines);

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
			radius: sociogram.settings.options.defaultNodeSize+5,
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
		uiLayer.draw();

		// sociogram.initNewNodeForm();
		window.tools.notify('User interface initialised.',1);
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
