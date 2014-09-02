/*global extend, session, randomBetween, Kinetic, modifyColor, notify */
/* exported NetworkCanvas */
/*jshint bitwise: false*/

'use strict';

var NetworkCanvas = function NetworkCanvas(userSettings) {

	// Global variables
	var stage, circleLayer, edgeLayer, nodeLayer, uiLayer, network = {};
	var selectedNodes = [];
	var menuOpen = false;
	var cancelKeyBindings = false;

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
		edge: '#bbb',
		selected: 'gold',
	};	

	// Default settings
	var settings = {
		defaultNodeSize: 40,
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

	// Dummy Names
	var namesList = ["Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive"];

	network.init = function () {

		network.initKinetic();
		network.drawUIComponents();
		extend(settings,userSettings);

		window.addEventListener('nodeAdded', function (e) { 
      		network.addNode(e.details);
    	}, false);

	};


	// Private functions


	// Adjusts the size of text so that it will always fit inside a given shape.
	function padText(text, container, amount){
		while ((text.width()*1.001)<container.width()-(amount*2)) {
			text.fontSize(text.fontSize() * 1.001);

			text.y((container.height() - text.height())/2);

			text.width(container.width());
			text.height(container.height());			
		}
	}	

	// Node manipulation functions

	network.addNode = function(options) {

		// Placeholder for getting the number of nodes we have.
		var nodeShape;
		var randomType = Math.round(randomBetween(0,settings.nodeTypes.length-1));
		var nodeID = window.nodes.length+1;

		var nodeOptions = {
			coords: [$(window).width()+50,100],
			id: nodeID,
			label: namesList[Math.round(randomBetween(0,namesList.length-1))],
			size: settings.defaultNodeSize,
			type: settings.nodeTypes[randomType].name,
			color: settings.nodeTypes[randomType].color,
			strokeWidth: 4
		};

		extend(nodeOptions, options);

		nodeOptions.id = parseInt(nodeOptions.id, 10);

		nodeOptions.type = 'Person'; // We don't need different node shapes for RADAR
		
		var nodeGroup = new Kinetic.Group({
			id: nodeOptions.id,
			x: nodeOptions.coords[0],
			y: nodeOptions.coords[1],
			name: nodeOptions.label,
			edges: [],
			type: nodeOptions.type,
			draggable: true,
			dragDistance: 10
		});

		switch (nodeOptions.type) {
			case 'Person':                
			nodeShape = new Kinetic.Circle({
				radius: nodeOptions.size,
				fill:nodeOptions.color,
				stroke: network.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

			case 'Organisation':
			nodeShape = new Kinetic.Rect({
				width: nodeOptions.size*2,
				height: nodeOptions.size*2,
				fill:nodeOptions.color,
				stroke: network.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth,
				// offset: {x: nodeOptions.size, y: nodeOptions.size}
			});
			break;

			case 'OnlinePerson':
			nodeShape = new Kinetic.RegularPolygon({
				sides: 3,
				fill:nodeOptions.color,
					radius: nodeOptions.size*1.2, // How should I calculate the correct multiplier for a triangle?
					stroke: network.calculateStrokeColor(nodeOptions.color),
					strokeWidth: nodeOptions.strokeWidth
				});
			break; 

			case 'Professional':
			nodeShape = new Kinetic.Star({
				numPoints: 6,
				fill:nodeOptions.color,
				innerRadius: nodeOptions.size-(nodeOptions.size/3),
				outerRadius: nodeOptions.size+(nodeOptions.size/3),
				stroke: network.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

		}

		var nodeLabel = new Kinetic.Text({         
			text: nodeOptions.label,
			// fontSize: 20,
			fontFamily: 'Lato',
			fill: 'white',
			align: 'center',
			// offsetX: (nodeOptions.size*-1)-10, //left right
			// offsetY:(nodeOptions.size*1)-10, //up down
			fontStyle:500,

		});

		notify("Putting node "+nodeOptions.label+" at coordinates x:"+nodeOptions.coords[0]+", y:"+nodeOptions.coords[1], 2);
		
		// Node event handlers
		nodeGroup.on('dragstart', function() {
			notify("dragstart",2);

			// Add the current position to the node attributes, so we know where it came from when we stop dragging.
			this.attrs.oldx = this.attrs.x;
			this.attrs.oldy = this.attrs.y;
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragmove', function() {
			notify("Dragmove",2);
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
			var log = new CustomEvent('log', {"detail":{'eventType': 'nodeClick', 'eventObject':this.attrs.id}});
    		window.dispatchEvent(log);
			this.moveToTop();
			nodeLayer.draw();
		}); 

		nodeGroup.on('dbltap dblclick', function() {
			notify('double tap',2);

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
			notify('dragend',2);

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

			var currentNode = this;

			// Log the movement and save the graph state.
			var log = new CustomEvent('log', {"detail":{'eventType': 'nodeMove', 'eventObject':eventObject}});
    		window.dispatchEvent(log);
			var currentNodes = session.returnData('nodes');
			$.each(currentNodes, function(index, value) {
				if (value.id === currentNode.attrs.id) {
					// extend(value, currentNode.attrs);
					value.coords = [currentNode.attrs.x,currentNode.attrs.y];
					value.type = currentNode.attrs.type;
					value.color = currentNode.attrs.color;

				}

			});			
			session.addData('nodes', currentNodes, false);

			// remove the attributes, just incase.
			delete this.attrs.oldx;
			delete this.attrs.oldy;

		});

		padText(nodeLabel,nodeShape, 10);
		nodeGroup.add(nodeShape);
		nodeGroup.add(nodeLabel);
		nodeLayer.add(nodeGroup);
		nodeGroup.moveToBottom();
		nodeLayer.draw();

		if (!nodeOptions.coords) {
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
		var log = new CustomEvent('log', {"detail":{'eventType': 'createEdge', 'eventObject':simpleEdge}});
    	window.dispatchEvent(log);
		
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
		notify("Kinetic stage initialised.",1);
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

	  		// Turn this into a delete box
	  	});

	  	uiLayer.add(deleteNodeBox);

	  	circleLayer.draw();
	  	uiLayer.draw();

	  	network.initNewNodeForm();
		notify("User interface initialised.",1);
	};

	// New Node Form

	network.initNewNodeForm = function() {
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
		$(document).on("keypress", function (e) {
			if (!cancelKeyBindings) {

				if (!menuOpen) {
					//open the menu
					$('.new-node-form').addClass('node-form-open');
					$('.content').addClass('blurry'); //blur content background
					menuOpen = true;
					$('.name-box').focus();					
				}

				// Prevent accidental backspace navigation
				if (e.which === 8 && !$(e.target).is("input, textarea, div")) {
					e.preventDefault();
				}

				// Enter key = create new node
				if (event.which === 13) {
					//close menu
					$('.new-node-form').removeClass('node-form-open');
					$('.content').removeClass('blurry');
					menuOpen = false;
					var nodeOptions = {
						label: $('.name-box').val()
					};				
					network.addNode(nodeOptions);
					$('.name-box').val('');
				}

			}
			
		});

	};

	// Get & set functions

	network.getKineticNodes = function() {
		return nodeLayer.children;
	};

	network.getKineticEdges = function() {
		return edgeLayer.children;
	};    

	network.getSimpleNodes = function() {
		// We need to create a simple representation of the nodes for storing.
		var simpleNodes = {};
		var nodes = network.getKineticNodes();
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
		nodes = network.getKineticNodes();

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

	network.init();
	
	return network;
	
};
