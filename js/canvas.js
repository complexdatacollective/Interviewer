/*global extend, Kinetic, notify, network, menu */
/* exported Canvas */
/*jshint bitwise: false*/

'use strict';

var Canvas = function Canvas(userSettings) {

	// Global variables
	var stage, circleLayer, edgeLayer, nodeLayer, uiLayer, canvas = {};
	var sourceNode;
	var selectedNodes = [];
	var menuOpen = false;
	var cancelKeyBindings = false;
	var canvasMenu;

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

	// Default settings
	var settings = {
		defaultNodeSize: 35,
		defaultNodeColor: colors.blue,
		defaultEdgeColor: colors.edge,
		concentricCircleColor: '#ffffff',
		concentricCircleNumber: 1,
		criteria: {from:network.getNodes({type_t0:'Ego'})[0].id},
		nodeTypes: [
		{'name':'Person','color':colors.blue},
		{'name':'OnlinePerson','color':colors.hemlock},
		{'name':'Organisation','color':colors.cayenne},
		{'name':'Professional','color':colors.violettulip}]
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

	// Private event handling functions
	var nodeAddedHandler = function(e) {
		canvas.addNode(e.detail);
	};

	var edgeAddedHandler = function(e) {
		// Ignore edges that original at ego.
		if(typeof e.detail.from !== 'undefined' && e.detail.from !== network.getNodes({type_t0:'Ego'})[0].id) {
			canvas.addEdge(e.detail);
		}
		
	};      

	var nodeRemovedHandler = function(e) {
		canvas.removeNode(e.detail);
	};      

	var edgeRemovedHandler = function(e) {
		canvas.removeEdge(e.detail);
	}; 

	var closePopoverHandler = function() {
		var buttonOffset = $('.info-button').offset();
		var currentOffset = $('.canvas-title').offset();
		$('.canvas-title').data('oldPos', currentOffset);
		$('.canvas-title').css({position: 'absolute'});
		$('.canvas-title').offset(currentOffset);
		$('.canvas-title').children().hide();
		$('.canvas-title').addClass('closed');
		$('.canvas-title').offset(buttonOffset);
		setTimeout(function() {
			$('.canvas-popover').hide();
			$('.info-button').css('visibility', 'visible');
		}, 500);
	};

	var openPopoverHandler = function() {
		$('.info-button').css('visibility', 'hidden');
		$('.canvas-popover').show();
		$('.canvas-title').offset($('.canvas-title').data('oldPos'));
		$('.canvas-title').removeClass('closed');
		setTimeout(function() {
			$('.canvas-title').children().show();
		}, 500);
		

	};  

	var keyPressHandler = function(e) {
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
	};

	var stageChangeHandler = function() {
		canvas.destroy();
	};


	canvas.init = function () {
		notify('Canvas initialising.', 1);
		extend(settings,userSettings);

		// Disabled morph button for now
		// $('<div class="canvas-popover"><div class="canvas-title"><h3>'+settings.heading+'</h3><p class="lead">'+settings.subheading+'</p><button class="btn btn-primary close-popover" type="button">Okay</button></div></div><span class="hi-icon hi-icon-link info-button">Info</span>').insertBefore( "#kineticCanvas" );

		$('<div class="canvas-title"><h3>'+settings.heading+'</h3><p class="lead">'+settings.subheading+'</p></div>').insertBefore( "#kineticCanvas" );

		// handle fallback popup
		if (settings.followup == true) {
			console.log('called');
			var markup = '<div class="container datething">'+
	    					'<div class="row">'+
						        '<div class="col-sm-6">'+
						            '<div class="form-group">'+
						                '<div class="input-group date" id="datetimepicker1">'+
						                    '<input type="text" class="form-control" />'+
						                    '<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span>'+
						                    '</span>'+
						                '</div>'+
						            '</div>'+
						        '</div>'+
						    '</div>'+
						'</div>';
		}

		$('body').append(markup);

		canvas.initKinetic();
		
	   	canvasMenu = menu.addMenu('Canvas','hi-icon-support');

	    menu.addItem(canvasMenu, 'Load Network', 'icon-play', null);
	    menu.addItem(canvasMenu, 'Create Random Graph', 'icon-play', null);
	    menu.addItem(canvasMenu, 'Download Network Data', 'icon-play', null);
	    menu.addItem(canvasMenu, 'Reset Node Positions', 'icon-play', canvas.resetPositions); 
	    menu.addItem(canvasMenu, 'Clear Graph', 'icon-play', null);          

	    window.addEventListener('nodeAdded', nodeAddedHandler, false);
	    window.addEventListener('edgeAdded', edgeAddedHandler, false);
	    window.addEventListener('nodeRemoved', nodeRemovedHandler, false);
	    window.addEventListener('edgeRemoved', edgeRemovedHandler, false);
	    window.addEventListener('changeStageStart', stageChangeHandler, false);
	    $('.close-popover').on('click', closePopoverHandler);
	    $('.info-button').on('click', openPopoverHandler);     

    	// Are there existing nodes? Display them.

    	// Get all nodes that match the criteria
    	var criteriaEdges = network.getEdges(settings.criteria);

    	// Iterate over them
      	for (var i = 0; i < criteriaEdges.length; i++) {
      		var dyadEdge = network.getEdges({from:criteriaEdges[i].from, to:criteriaEdges[i].to, type:'Dyad'})[0];
      		var newNode = canvas.addNode(dyadEdge);

      		// If we are in select mode, set the initial state
      		if (settings.mode === 'Select') {
      			// set initial state of node according to if an edge exists
      			if (network.getEdges({from: network.getNodes({type_t0:'Ego'})[0].id, to: criteriaEdges[i].to, type: settings.edgeType}).length > 0) {
      				newNode.children[0].stroke(colors.selected);
      				nodeLayer.draw();
      			}
      			
      		}
    	}
  		
  		setTimeout(function() {
  			canvas.drawUIComponents();
  		}, 0);

  		// Are there existing edges? Display them
  		var edges;
  		if (settings.mode === 'Edge') {
  			
  			// Set the criteria based on edge type
  			var edgeProperties =  {
				type: settings.edgeType
			};
  			

  			// Filter to remove edges involving ego, unless this is edge select mode.
  			edges = network.getEdges(edgeProperties, function (results) {
  				var filteredResults = [];
  				$.each(results, function(index,value) {
  					if (value.from !== network.getNodes({type_t0:'Ego'})[0].id && value.to !== network.getNodes({type_t0:'Ego'})[0].id) {
  						filteredResults.push(value);
  					}
  				});

	  			return filteredResults;
	  		});

	  		$.each(edges, function(index,value) {
	  			canvas.addEdge(value);
	  		});

  		} else {
  			// Show the social network
  			// Filter to remove edges involving ego, unless this is edge select mode.
  			edges = network.getEdges({type:'Dyad'}, function (results) {
  				var filteredResults = [];
  				$.each(results, function(index,value) {
  					if (value.from !== network.getNodes({type_t0:'Ego'})[0].id && value.to !== network.getNodes({type_t0:'Ego'})[0].id) {
  						filteredResults.push(value);
  					}
  				});

	  			return filteredResults;
	  		});

	  		$.each(edges, function(index,value) {
	  			canvas.addEdge(value);
	  		});

  		}
	};

	canvas.destroy = function() {

        menu.removeMenu(canvasMenu); // remove the network menu when we navigate away from the page.
        $('.new-node-form').remove(); // Remove the new node form 

        window.removeEventListener('nodeAdded', nodeAddedHandler, false);
        window.removeEventListener('edgeAdded', edgeAddedHandler, false);
        window.removeEventListener('nodeRemoved', nodeRemovedHandler, false);
        window.removeEventListener('edgeRemoved', edgeRemovedHandler, false);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $(document).off("keypress", keyPressHandler);
        $('.close-popover').off('click', closePopoverHandler);
        $('.info-button').off('click', openPopoverHandler); 

	};

	// Node manipulation functions

	canvas.resetPositions = function() {
    	var dyadEdges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,type:'Dyad'});
      	for (var i = 0; i < dyadEdges.length; i++) {
      		network.updateEdge(dyadEdges[i].id, {coords: []});
    	}    
	};

	canvas.addNode = function(options) {
		notify('Canvas is creating a node.',2);
		// Placeholder for getting the number of nodes we have.
		var nodeShape;

		var nodeID = 0;
		while (network.getNode(nodeID) !== false) {
			nodeID++;
		}

		var dragStatus = false;
		if (settings.mode === 'Position' || settings.mode === 'Edge') {
			dragStatus = true;
		}

		options.label = options.nname_t0;
		var nodeOptions = {
			coords: [$(window).width()+50,100],
			id: nodeID,
			label: 'Undefined',
			size: settings.defaultNodeSize,
			color: 'rgb(0,0,0)',
			strokeWidth: 4,	
			draggable: dragStatus,
			dragDistance: 10
		};

		extend(nodeOptions, options);

		nodeOptions.id = parseInt(nodeOptions.id, 10);

		nodeOptions.type = 'Person'; // We don't need different node shapes for RADAR
		nodeOptions.x = nodeOptions.coords[0];
		nodeOptions.y = nodeOptions.coords[1];



		var nodeGroup = new Kinetic.Group(nodeOptions);

		switch (nodeOptions.type) {
			case 'Person':                
			nodeShape = new Kinetic.Circle({
				radius: nodeOptions.size,
				fill:nodeOptions.color,
				stroke: 'white',
				strokeWidth: nodeOptions.strokeWidth
			});
			break;

			case 'Organisation':
			nodeShape = new Kinetic.Rect({
				width: nodeOptions.size*2,
				height: nodeOptions.size*2,
				fill:nodeOptions.color,
				stroke: canvas.calculateStrokeColor(nodeOptions.color),
				strokeWidth: nodeOptions.strokeWidth,
				// offset: {x: nodeOptions.size, y: nodeOptions.size}
			});
			break;

			case 'OnlinePerson':
			nodeShape = new Kinetic.RegularPolygon({
				sides: 3,
				fill:nodeOptions.color,
					radius: nodeOptions.size*1.2, // How should I calculate the correct multiplier for a triangle?
					stroke: canvas.calculateStrokeColor(nodeOptions.color),
					strokeWidth: nodeOptions.strokeWidth
				});
			break; 

			case 'Professional':
			nodeShape = new Kinetic.Star({
				numPoints: 6,
				fill:nodeOptions.color,
				innerRadius: nodeOptions.size-(nodeOptions.size/3),
				outerRadius: nodeOptions.size+(nodeOptions.size/3),
				stroke: canvas.calculateStrokeColor(nodeOptions.color),
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
			fontStyle:500

		});

		notify("Putting node "+nodeOptions.label+" at coordinates x:"+nodeOptions.coords[0]+", y:"+nodeOptions.coords[1], 2);
		
		// Node event handlers
		nodeGroup.on('dragstart', function() {
			notify("dragstart",1);

			// Add the current position to the node attributes, so we know where it came from when we stop dragging.
			this.attrs.oldx = this.attrs.x;
			this.attrs.oldy = this.attrs.y;
			this.moveToTop();
			nodeLayer.draw();
		});

		nodeGroup.on('dragmove', function() {
			notify("Dragmove",0);
			var dragNode = nodeOptions.id;
			$.each(edgeLayer.children, function(index, value) {
				
				// value.setPoints([dragNode.getX(), dragNode.getY() ]);
				if (value.attrs.from.id === dragNode || value.attrs.to.id === dragNode) {
					var points = [canvas.getNodeByID(value.attrs.from.id).getX(), canvas.getNodeByID(value.attrs.from.id).getY(), canvas.getNodeByID(value.attrs.to.id).getX(), canvas.getNodeByID(value.attrs.to.id).getY()];
					value.attrs.points = points;
				
				}
			});
			edgeLayer.draw();     

		});    

		nodeGroup.on('tap click', function() {
			var log = new CustomEvent('log', {"detail":{'eventType': 'nodeClick', 'eventObject':this.attrs.id}});
    		window.dispatchEvent(log);
			if (settings.mode === 'Select') {
				var edge;

				// Test if there is an existing edge.
				if (network.getEdges({type: settings.edgeType,from:network.getNodes({type_t0:'Ego'})[0].id, to: this.attrs.to}).length > 0) {
					// if there is, remove it
      				this.children[0].stroke('white');
      				network.removeEdge(network.getEdges({type: settings.edgeType,from:network.getNodes({type_t0:'Ego'})[0].id, to: this.attrs.to})[0]);
				} else {
					// else add it
					edge = {
						from:network.getNodes({type_t0:'Ego'})[0].id,
						to: this.attrs.to,
						type: settings.edgeType,
					};

					if (typeof settings.variables !== 'undefined') {
						$.each(settings.variables, function(index, value) {
							edge[value.label] = value.value;
						});
					}
					
					this.children[0].stroke(colors.selected);
					network.addEdge(edge);

				}

			} else if (settings.mode === 'Edge') {
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
							type: settings.edgeType
						};

						edgeProperties[settings.variables[0]] = 'percieved';


						if (network.addEdge(edgeProperties) === false) {
							notify('Canvas removing edge.',2);
							network.removeEdge(network.getEdges(edgeProperties));
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

		nodeGroup.on('dbltap dblclick', function() {
			if (settings.mode === 'Edge') {
				notify('double tap',1);
				sourceNode = this;
			}
		});      

		nodeGroup.on('dragend', function() {
			notify('dragend',1);

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

    		network.setProperties(network.getEdge(currentNode.attrs.id), {coords: [currentNode.attrs.x,currentNode.attrs.y]});

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
			var tween = new Kinetic.Tween({
				node: nodeGroup,
				x: $(window).width()-150,
				y: 100,
				duration:0.7,
				easing: Kinetic.Easings.EaseOut
			});
			tween.play();
			network.setProperties(network.getNode(nodeOptions.id),{coords:[$(window).width()-150, 100]});           
		}

		return nodeGroup;
	};

	// Edge manipulation functions

	canvas.addEdge = function(properties) {
		

		// the below won't work because we are storing the coords in an edge now...
		// var fromObject = network.getNode(properties.from);
		// var toObject = network.getNode(properties.to);
			notify('Canvas is adding an edge.',2);
			var toObject = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: properties.to, type:'Dyad'})[0];
			var fromObject = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: properties.from, type:'Dyad'})[0];

			var points = [fromObject.coords[0], fromObject.coords[1], toObject.coords[0], toObject.coords[1]];
			var edge = new Kinetic.Line({
				// dashArray: [10, 10, 00, 10],
				strokeWidth: 2,
				opacity:1,
				stroke: settings.defaultEdgeColor,
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
			notify("Created Edge between "+fromObject.label+" and "+toObject.label, "success",2);
		
			return true;
   
	};

	canvas.removeEdge = function(properties) {

		var toNode = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: properties.to, type:'Dyad'})[0];
		var fromNode = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: properties.from, type:'Dyad'})[0];

		notify("Removing edge.");
		


		// This function is failing because two nodes are matching below


		$.each(canvas.getKineticEdges(), function(index, value) {
			if (value.attrs.from === fromNode && value.attrs.to === toNode || value.attrs.from === toNode && value.attrs.to === fromNode ) {
				edgeLayer.children[index].remove();
				edgeLayer.draw();
			}
		}); 

	};

	// Misc functions

	canvas.clearGraph = function() {
		edgeLayer.removeChildren();
		edgeLayer.clear();
		nodeLayer.removeChildren();
		nodeLayer.clear();
		
	};

	// Main initialisation functions

	canvas.initKinetic = function () {
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

	canvas.drawUIComponents = function () {

		// Draw all UI components
		var circleFills, circleLines;
		var currentColor = settings.concentricCircleColor ;
		var totalHeight = window.innerHeight-(settings.defaultNodeSize); // Our canvas area is the window height minus twice the node radius (for spacing)
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
				y: (window.innerHeight / 2),
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

	  	circleLayer.draw();
	  	uiLayer.draw();

	  	// canvas.initNewNodeForm();
		notify("User interface initialised.",1);
	};

	// New Node Form

	canvas.initNewNodeForm = function() {
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
		$(document).on("keypress", keyPressHandler);

	};



	// Get & set functions

	canvas.getKineticNodes = function() {
		return nodeLayer.children;
	};

	canvas.getKineticEdges = function() {
		return edgeLayer.children;
	};    

	canvas.getSimpleNodes = function() {
		// We need to create a simple representation of the nodes for storing.
		var simpleNodes = {};
		var nodes = canvas.getKineticNodes();
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

	canvas.getSimpleEdges = function() {
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

	canvas.getSimpleEdge = function(id) {
		var simpleEdges = canvas.getSimpleEdges();
		if (!id) { return false; }

		var simpleEdge = simpleEdges[id];
		return simpleEdge;
	};

	canvas.getEdgeLayer = function() {
		return edgeLayer;
	};

	canvas.getNodeByID = function(id) {
		var node = {},
		nodes = canvas.getKineticNodes();

		$.each(nodes, function(index, value) {
			if (value.attrs.id === id) {
				node = value;
			}
		});

		return node;
	};

	canvas.getNodeColorByType = function(type) {
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

	canvas.init();
	
	return canvas;
	
};
