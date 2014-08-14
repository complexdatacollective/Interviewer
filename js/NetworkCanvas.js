/*global Kinetic, randomBetween, modifyColor, menu, Logger, notify */
/* exported NetworkCanvas */
/*jshint bitwise: false*/

'use strict';

var NetworkCanvas = function NetworkCanvas(userSettings) {

	// Global variables
	var stage, circleLayer, edgeLayer, nodeLayer, uiLayer,
	network = {},
	animating = false,
	open = false,
	eventLog = new Logger();
	var selectedNodes = [],
	colors = {};

	// Colours
	colors.blue = '#0174DF';
	colors.placidblue = '#83b5dd';
	colors.violettulip = '#9B90C8';
	colors.hemlock = '#9eccb3';
	colors.paloma = '#aab1b0';
	colors.freesia = '#ffd600';
	colors.cayenne = '#c40000';
	colors.celosiaorange = '#f47d44';
	colors.sand = '#ceb48d';
	colors.dazzlingblue = '#006bb6';
	colors.edge = '#999';
	colors.selected = 'gold';

	// Default settings
	var settings = {
		defaultNodeSize: 20,
		defaultNodeColor: colors.blue,
		defaultEdgeColor: colors.edge,
		concentricCircleColor: '#ffffff',
		concentricCircleNumber: 4,
		nodeTypes: [
		{'name':'Person','color':colors.blue},
		{'name':'OnlinePerson','color':colors.hemlock},
		{'name':'Organisation','color':colors.cayenne},
		{'name':'Professional','color':colors.violettulip}]
	};

	$.extend( true, settings, userSettings); // extend our defaults with user settings.

	// var logEventMap = ['nodeMove','nodeTouch','edgeCreate','edgeDelete'];

	// Dummy Names
	var namesList = ["Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive"];

	network.init = function () {
		network.initKinetic();
		network.drawUIComponents();

		eventLog.init();

		// network.loadGraph();
		$('#new-name-box').focus();
	};

	// Node manipulation functions

	network.addNode = function(coords, id, size, type, label, color) {

		// Placeholder for getting the number of nodes we have.
		var nodeShape;
		if (!id) {
			var nodes = network.getNodes();
			id = nodes.length;
		}
		id = parseInt(id, 10);

		// Create and populate the node properties object which will be sent to the event log
		var nodeProperties = {};

		// calculate random coords within a safe boundary of our window
		// nodeProperties.coords = coords || new Array(Math.round(randomBetween(100,window.innerWidth-100)),Math.round(randomBetween(100,window.innerHeight-100)));
		nodeProperties.coords = coords || [$(window).width()+50,100];


		// if we don't have a label for the node, use a random one from the list. if we dont have a size, use the default node size. (and so on)
		nodeProperties.size = size || settings.defaultNodeSize;
		nodeProperties.label = label || namesList[Math.round(randomBetween(0,namesList.length-1))];
		nodeProperties.id = id;
		var randomType = Math.round(randomBetween(0,settings.nodeTypes.length-1));
		nodeProperties.type = type || settings.nodeTypes[randomType].name;
		nodeProperties.color = color || settings.nodeTypes[randomType].color;
		nodeProperties.strokeWidth = 4;
		var nodeGroup = new Kinetic.Group({
			id: nodeProperties.id,
			x: nodeProperties.coords[0],
			y: nodeProperties.coords[1],
			name: nodeProperties.label,
			edges: [],
			type: nodeProperties.type,
			nodeSize: nodeProperties.size,
			color: nodeProperties.color,
			draggable: true,
			dragDistance: 10
		});

		switch (nodeProperties.type) {
			case 'Person':                
			nodeShape = new Kinetic.Circle({
				radius: nodeProperties.size,
				fill:nodeProperties.color,
				stroke: network.calculateStrokeColor(nodeProperties.color),
				strokeWidth: nodeProperties.strokeWidth
			});
			break;

			case 'Organisation':
			nodeShape = new Kinetic.Rect({
				width: nodeProperties.size*2,
				height: nodeProperties.size*2,
				fill:nodeProperties.color,
				stroke: network.calculateStrokeColor(nodeProperties.color),
				strokeWidth: nodeProperties.strokeWidth,
				offset: {x: nodeProperties.size, y: nodeProperties.size}
			});
			break;

			case 'OnlinePerson':
			nodeShape = new Kinetic.RegularPolygon({
				sides: 3,
				fill:nodeProperties.color,
					radius: nodeProperties.size*1.2, // How should I calculate the correct multiplier for a triangle?
					stroke: network.calculateStrokeColor(nodeProperties.color),
					strokeWidth: nodeProperties.strokeWidth
				});
			break; 

			case 'Professional':
			nodeShape = new Kinetic.Star({
				numPoints: 6,
				fill:nodeProperties.color,
				innerRadius: nodeProperties.size-(nodeProperties.size/3),
				outerRadius: nodeProperties.size+(nodeProperties.size/3),
				stroke: network.calculateStrokeColor(nodeProperties.color),
				strokeWidth: nodeProperties.strokeWidth
			});
			break;

		}

		var nodeLabel = new Kinetic.Text({         
			text: nodeProperties.label,
			fontSize: 20,
			fontFamily: 'Futura',
			fill: 'white',
			stroke:'black',
			strokeWidth:0.2,
			offsetX: (nodeProperties.size*-1)-10, //left right
			offsetY:(nodeProperties.size*1)-10, //up down
			fontStyle:500,

		});

		nodeGroup.add(nodeShape);
		nodeGroup.add(nodeLabel);

		notify("Putting node "+nodeProperties.label+" at coordinates x:"+nodeProperties.coords[0]+", y:"+nodeProperties.coords[1], 2);
		eventLog.addToLog('nodeCreate', nodeProperties, nodeProperties.id); 


		// Node event handlers
		nodeGroup.on('dragstart', function() {
			notify("dragstart",0);

			// Add the current position to the node attributes, so we know where it came from when we stop dragging.
			this.attrs.oldx = this.attrs.x;
			this.attrs.oldy = this.attrs.y;
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragmove', function() {
			notify("Dragmove",0);
			var dragNode = this;
			$.each(edgeLayer.children, function(index, value) {
				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from === dragNode || value.attrs.to === dragNode) {
					var points = [value.attrs.from.attrs.x,value.attrs.from.attrs.y,value.attrs.to.attrs.x,value.attrs.to.attrs.y];
					value.attrs.points = points;       
				}
			});
			edgeLayer.draw();     

		});    

		nodeGroup.on('tap click', function() {
			notify('tap or click.', 0);
			eventLog.addToLog('nodeClick',this, this.attrs.id);
			this.moveToTop();
			nodeLayer.draw();
		}); 

		nodeGroup.on('dbltap dblclick', function() {
			notify('double tap',0);

			// Store this node in our special array for currently selected nodes.
			selectedNodes.push(this);

			// If this makes a couple, link them.
			if(selectedNodes.length === 2) {
				if (!network.addEdge(selectedNodes[0],selectedNodes[1])) {
					network.removeEdge(selectedNodes[0],selectedNodes[1]);
				}
				
				selectedNodes[0].children[0].stroke(network.calculateStrokeColor(network.getNodeColorByType(selectedNodes[0].attrs.type)));
				selectedNodes[1].children[0].stroke(network.calculateStrokeColor(network.getNodeColorByType(selectedNodes[1].attrs.type)));
				selectedNodes = [];
				nodeLayer.draw(); 

			} else {
				// If not, simply turn the node stroke to the selected style so we can see that it has been selected.
				this.children[0].stroke(colors.selected);
				// this.children[0].strokeWidth(4);
				nodeLayer.draw();                
			}

		});      

		nodeGroup.on('dragend', function() {
			notify('dragend',0);

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
				from: from,
				to: to,
			};

			// Log the movement and save the graph state.
			eventLog.addToLog('nodeMove',eventObject, this.attrs.id);
			network.saveGraph();

			// remove the attributes, just incase.
			delete this.attrs.oldx;
			delete this.attrs.oldy;

		});

		nodeLayer.add(nodeGroup);
		nodeGroup.moveToBottom();
		nodeLayer.draw();
		network.saveGraph();

		if (!coords) {
			var tween = new Kinetic.Tween({
				node: nodeGroup,
				x: $(window).width()-150,
				y: 100,
				duration:0.7,
				easing: Kinetic.Easings.EaseOut
			});
			tween.play();            
		}

		return nodeGroup;
	};

	// Edge manipulation functions

	network.addEdge = function(from, to) {
		var alreadyExists = false;
		var fromObject,toObject;
		var toRemove;

		//TODO: Check if the nodes exist and return false if they don't.
		//TODO: Make sure you cant add a self-loop

		if (from !== null && typeof from === 'object' || to !== null && typeof to === 'object') {
			fromObject = from;
			toObject = to;
		} else {
			//assume we have ID's rather than the object, and so iterate through nodes looking for ID's.
			fromObject = this.getNodeByID(from);
			toObject = this.getNodeByID(to);
		}

		if (edgeLayer.children.length > 0) {
			$.each(edgeLayer.children, function(index, value) {
				if (value.attrs.from === fromObject && value.attrs.to === toObject || value.attrs.to === fromObject && value.attrs.from === toObject) {
					toRemove = value;
					alreadyExists = true;
				}
			});  

		}

		if (alreadyExists) {
		    // this.removeEdge(toRemove);
		    return false;
		}

		var points = [fromObject.attrs.x, fromObject.attrs.y, toObject.attrs.x, toObject.attrs.y];
		var edge = new Kinetic.Line({
			// dashArray: [10, 10, 00, 10],
			strokeWidth: 2,
			opacity:0.5,
			stroke: settings.defaultEdgeColor,
			// opacity: 0.8,
			from: fromObject,
			to: toObject,
			points: points
		});

		edgeLayer.add(edge);
		edgeLayer.draw(); 
		nodeLayer.draw();
		notify("Created Edge between "+fromObject.children[1].attrs.text+" and "+toObject.children[1].attrs.text, "success",2);
		
		var simpleEdge = network.getSimpleEdge(edgeLayer.children.length-1);
		eventLog.addToLog('edgeCreate',simpleEdge, '0');
		network.saveGraph();
		return true;   
	};

	network.removeEdge = function(edge) {
		notify("Removing edge.");
		$.each(edgeLayer.children, function(index, value) {
			if (value === edge) {
				edgeLayer.children[index].remove();
				edgeLayer.draw();
			}
		}); 

		this.saveGraph();

	};

	// Misc functions

	network.calculateStrokeColor = function(color) {
		return modifyColor(color, 15);
	};

	network.clearGraph = function() {
		edgeLayer.removeChildren();
		edgeLayer.clear();
		nodeLayer.removeChildren();
		nodeLayer.clear();
		network.saveGraph();
	};

	network.createRandomGraph = function(nodeCount,edgeProbability) {
		nodeCount = nodeCount || 10;
		edgeProbability = edgeProbability || 0.4;
		var nodes = network.getNodes(); 
		notify("Creating random graph...",3);
		for (var i=0;i<nodeCount;i++) {
			var current = i+1;
			notify("Adding node "+current+" of "+nodeCount,1);
			// Use random coordinates
			network.addNode([Math.round(randomBetween(100,window.innerWidth-100)),Math.round(randomBetween(100,window.innerHeight-100))],nodes.length);	
		}

		notify("Adding edges.",3);
		$.each(nodes, function (index) {
			if (randomBetween(0, 1) < edgeProbability) {
				var randomFriend = Math.round(randomBetween(0,nodes.length-1));
				network.addEdge(nodes[index],nodes[randomFriend]);

			}
		});
	};

	// Main initialisation functions

	network.initKinetic = function () {
		// Initialise KineticJS stage
		stage = new Kinetic.Stage({
			container: 'kineticCanvas',
			width: window.innerWidth,
			height: window.innerHeight
		});

		circleLayer = new Kinetic.Layer();
		nodeLayer = new Kinetic.Layer();
		edgeLayer = new Kinetic.Layer();
		uiLayer = new Kinetic.Layer();

		stage.add(circleLayer);
		stage.add(edgeLayer);
		stage.add(nodeLayer);
		stage.add(uiLayer);
		notify("Kinetic stage initialised.",3);
	};

	network.drawUIComponents = function () {

		// Draw all UI components
		var circleFills, circleLines;
		var currentColor = settings.concentricCircleColor ;
		var totalHeight = window.innerHeight-(settings.defaultNodeSize *  2); // Our canvas area is the window height minus twice the node radius (for spacing)
		var currentOpacity = 0.1;
		
		//draw concentric circles
		for(var i = 0; i < settings.concentricCircleNumber; i++) {
			var ratio = 1-(i/settings.concentricCircleNumber);
			var currentRadius = (totalHeight/2 * ratio);

			circleLines = new Kinetic.Circle({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				radius: currentRadius,
				stroke: 'white',
				strokeWidth: 1.5,
				opacity: 0
			});

			circleFills = new Kinetic.Circle({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
				radius: currentRadius,
				fill: currentColor,
				opacity: currentOpacity,
				strokeWidth: 0,
			});

			// currentColor = tinycolor.darken(currentColor, amount = 15).toHexString();
			currentOpacity = currentOpacity+((0.3-currentOpacity)/settings.concentricCircleNumber);        
			circleLayer.add(circleFills); 
			circleLayer.add(circleLines);

		}

	  	// create a new node box
		var deleteNodeBox = new Kinetic.Circle({
			radius: 50,
			stroke: '#666',
			strokeWidth: 0,
				y: window.innerHeight - 100, //padding
				x: 100,
			});

	  	deleteNodeBox.on('click tap', function() {
			var touchPos = stage.getPointerPosition();
			var coords = [];
			var nodes = network.getNodes();
			coords[0] = touchPos.x;
			coords[1] = touchPos.y;
			network.addNode(coords,nodes.length);
			deleteNodeBox.moveToBottom();
			uiLayer.draw();
	  	});

	  	uiLayer.add(deleteNodeBox);

	  	circleLayer.draw();
	  	uiLayer.draw();

		// Key bindings
		$(document).on("keypress", function (e) {

			// Cancel if a modal is currently open
			if (!$("#generate-graph").data()['bs.modal'].isShown) {
				$('#new-name-box').focus();
				// Prevent accidental backspace navigation
				if (e.which === 8 && !$(e.target).is("input, textarea, div")) {
					e.preventDefault();
				}

				// Reject anything but the letter keys
				if (event.which !== 13) {
					menu.close();
					if (animating === false && open === false) {
						animating = true;
						// $('#newNodeForm').css('visibility', 'visible');
						$('#newNodeForm').css('z-index', 9999);
						$('#newNodeForm').transition({opacity: '1', marginTop:'0'},50,'easeInSine');
						$('#newNodeForm > *').transition({ opacity: '1',right:'0'},400,'easeInSine').promise().done( function(){animating = false; open = true;});                    
					} 
				} else {
					if (!animating) {
						animating = true;
						$('#newNodeForm').css('z-index', 0);
						$('#newNodeForm').transition({scale: '2',opacity: '0', marginTop:'0'},300,'easeInSine').promise().done( function(){ //animate out
							$('#newNodeForm > *').transition({opacity:'0',right:'100px'});
							$('#newNodeForm').transition({scale:'1'});
							animating = false;
							open = false;
							// $('#newNodeForm').css('visibility', 'hidden');
							$('#new-name-box').focus();                   
						});
					}                  
				}	
			}
			
		});


		notify("User interface initialised.",3);
	};

	// Graph saving/loading/exporting functions

	network.loadGraph = function () {
		// TODO: Add return false for if this fails.
		notify("Loading graph from localStorage.",3);
		var loadedNodes = localStorage.getObject('nodes') || {};
		var loadedEdges = localStorage.getObject('edges') || {};
		$.each(loadedNodes, function (index, value) {
			var coords = [];
			coords.push(value.x);
			coords.push(value.y);
			network.addNode(coords,index,value.nodeSize,value.type,value.name,value.color);
		});

		$.each(loadedEdges, function (index, value) {
			network.addEdge(value.from,value.to);
		});
	};

	network.saveGraph = function () {
		notify("Saving graph.",3);
		var simpleNodes = network.getSimpleNodes();
		var simpleEdges = network.getSimpleEdges();
		var log = network.getLog();
		localStorage.setObject('nodes', simpleNodes);
		localStorage.setObject('edges', simpleEdges);
		localStorage.setObject('log', log);
	};

	// Get & set functions

	network.getNodes = function() {
		return nodeLayer.children;
	};

	network.getEdges = function() {
		return edgeLayer.children;
	};    

	network.getSimpleNodes = function() {
		// We need to create a simple representation of the nodes for storing.
		var simpleNodes = {};
		var nodes = network.getNodes();
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

	network.getSimpleEdges = function() {
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

	network.getSimpleEdge = function(id) {
		var simpleEdges = network.getSimpleEdges();
		if (!id) { return false; }

		var simpleEdge = simpleEdges[id];
		return simpleEdge;
	};

	network.getEdgeLayer = function() {
		return edgeLayer;
	};

	network.getNodeByID = function(id) {
		var node = {},
		nodes = network.getNodes();

		$.each(nodes, function(index, value) {
			if (value.attrs.id === id) {
				node = value;
			}
		});

		return node;
	};

	network.getNodeColorByType = function(type) {
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

	network.getLog = function() {
		return eventLog;
	};

	network.getLastEvent = function() {
		return eventLog[eventLog.length-1];
	};

	network.init();
	
	return network;
	
};
