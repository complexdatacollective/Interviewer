// App declaration

var NetworkCanvas = function (options) {

    // Global variables
    var stage, newNodeBox, circleLayer, edgeLayer, nodeLayer, currentNode, selected, uiLayer, mySwiper,
        app = this;
        eventLog = new Array();
        selectedNodes = [];

    // Colours
    var colors = [];
    colors['blue'] = '#0174DF';
    colors['placid-blue'] = '#83b5dd';
    colors['violet-tulip'] = '#9B90C8';
    colors['hemlock'] = '#9eccb3';
    colors['paloma'] = '#aab1b0';
    colors['freesia'] = '#ffd600';
    colors['cayenne'] = '#c40000';
    colors['celosia-orange'] = '#f47d44';
    colors['sand'] = '#ceb48d';
    colors['dazzling-blue'] = '#006bb6';
    colors['edge'] = colors['blue'];
    colors['selected'] = colors['sand'];

    // Default settings
    var defaultSettings = {
        debugLevel: 3,
        defaultNodeSize: 27,
        defaultNodeColor: colors['blue'],
        defaultEdgeColor: colors['edge'],
        concentricCircleColor: '#ffffff',
        concentricCircleNumber: 4,
        nodeTypes: [
        {'name':'Person','color':colors['blue']},
        {'name':'OnlinePerson','color':colors['hemlock']},
        {'name':'Organisation','color':colors['cayenne']},
        {'name':'Professional','color':colors['violet-tulip']}]
    }

    var logEventMap = new Array('nodeMove','nodeTouch','edgeCreate','edgeDelete');

    var settings = defaultSettings;

    // Dummy Names
    var namesList = new Array("Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive");

    this.init = function () {
        app.initKinetic();
        app.drawUIComponents();
        app.loadGraph();
    }


// Event log functions

    this.addToLog = function(type,d,id) {
        if (!d && !type) { return false; }

        var date = +new Date();
        var data = {};
        data.timestamp = date;
        data.eventType = type;
        data.eventValue = d;
        data.objectID = id;

        eventLog.push(data);
        Notify("Logged "+data.eventType+" on object "+data.objectID+" at time point "+date,1);
        return true;
    }

// Node manipulation functions

    this.addNode = function(coords, size, type, label, id, color) {

        // Placeholder for getting the number of nodes we have.
        var nodes = app.getNodes();

        // If we have an id, use that. if not, increment based on length of nodes array.
        // THIS IS NOT A SAFE ASSUMPTION!
        var nodeNumber = id || nodes.length;



        // Create and populate the node properties object which will be sent to the event log
        var nodeProperties = {};

        // calculate random coords within a safe boundary of our window
        nodeProperties.coords = coords || new Array(Math.round(randomBetween(100,window.innerWidth-100)),Math.round(randomBetween(100,window.innerHeight-100)));

        // if we don't have a label for the node, use a random one from the list. if we dont have a size, use the default node size. (and so on)
        nodeProperties.size = size || settings.defaultNodeSize;
        nodeProperties.label = label || namesList[Math.round(randomBetween(0,namesList.length-1))];
        nodeProperties.id = id || nodes.length;
        var randomType = Math.round(randomBetween(0,settings.nodeTypes.length-1));
        nodeProperties.type = type || settings.nodeTypes[randomType].name;
        nodeProperties.color = color || settings.nodeTypes[randomType].color;

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
                var nodeShape = new Kinetic.Circle({
                    radius: nodeProperties.size,
                    fill:nodeProperties.color,
                    stroke: app.calculateStrokeColor(nodeProperties.color),
                    strokeWidth: 2
                });
            break;

            case 'Organisation':
                var nodeShape = new Kinetic.Rect({
                    width: nodeProperties.size*2,
                    height: nodeProperties.size*2,
                    fill:nodeProperties.color,
                    stroke: app.calculateStrokeColor(nodeProperties.color),
                    strokeWidth: 2,
                    offset: {x: nodeProperties.size, y: nodeProperties.size}
                });
            break;

            case 'OnlinePerson':
                var nodeShape = new Kinetic.RegularPolygon({
                    sides: 3,
                    fill:nodeProperties.color,
                    radius: nodeProperties.size*1.2, // How should I calculate the correct multiplier for a triangle?
                    stroke: app.calculateStrokeColor(nodeProperties.color),
                    strokeWidth: 2
                });
            break; 

            case 'Professional':
                var nodeShape = new Kinetic.Star({
                    numPoints: 6,
                    fill:nodeProperties.color,
                    innerRadius: nodeProperties.size-(nodeProperties.size/3),
                    outerRadius: nodeProperties.size+(nodeProperties.size/3),
                    stroke: app.calculateStrokeColor(nodeProperties.color),
                    strokeWidth: 2
                });
            break;

        }

        var nodeLabel = new Kinetic.Text({         
            text: nodeProperties.label,
            fontSize: 20,
            fontFamily: 'Lato',
            fill: 'white',
            offsetX: (nodeProperties.size*-1)-10, //left right
            offsetY:(nodeProperties.size*1)-10, //up down
            fontStyle:300,

        });

        nodeGroup.add(nodeShape);
        nodeGroup.add(nodeLabel);

        Notify("Putting node "+nodeProperties.label+" at coordinates x:"+nodeProperties.coords[0]+", y:"+nodeProperties.coords[0], 2);
        app.addToLog('nodeCreate', nodeProperties, nodeNumber); 


        // Node event handlers
        nodeGroup.on('dragstart', function() {
            Notify("dragstart",0);

            // Add the current position to the node attributes, so we know where it came from when we stop dragging.
            this.attrs.oldx = this.attrs.x;
            this.attrs.oldy = this.attrs.y;
            var dragnode = this;
            this.moveToTop();
            nodeLayer.draw();
        });

        nodeGroup.on('dragmove', function(e) {
            Notify("Dragmove",0);
            var dragNode = this;
            $.each(edgeLayer.children, function(index, value) {
                // value.setPoints([dragNode.getX(), dragNode.getY() ]);
                if (value.attrs.from == dragNode || value.attrs.to == dragNode) {
                    var points = [value.attrs.from.attrs.x,value.attrs.from.attrs.y,value.attrs.to.attrs.x,value.attrs.to.attrs.y];
                    value.attrs.points = points;       
                }
            });
            edgeLayer.draw();     

        });    

        nodeGroup.on('tap click', function(e) {
            Notify('tap or click.', 0);
            app.addToLog('nodeClick',this, this.attrs.id);
            this.moveToTop();
            nodeLayer.draw();
        }); 
    
        nodeGroup.on('dbltap dblclick', function(e) {
            Notify('double tap',0);

            // Store this node in our special array for currently selected nodes.
            selectedNodes.push(this);

            // If this makes a couple, link them.
            if(selectedNodes.length == 2) {
                app.addEdge(selectedNodes[0],selectedNodes[1]);
                selectedNodes[0].children[0].stroke(app.calculateStrokeColor(app.getNodeColorByType(selectedNodes[0].attrs.type)));
                selectedNodes[1].children[0].stroke(app.calculateStrokeColor(app.getNodeColorByType(selectedNodes[1].attrs.type)));
                selectedNodes = [];
                nodeLayer.draw(); 

            } else {
                // If not, simply turn the node stroke to the selected style so we can see that it has been selected.
                this.children[0].stroke(colors['selected']);
                nodeLayer.draw();                
            }

        });      

        nodeGroup.on('dragend', function() {
            Notify('dragend',0);

            // set the context
            var dragNode = this;
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
            }

            // Log the movement and save the graph state.
            app.addToLog('nodeMove',eventObject, this.attrs.id);
            app.saveGraph();

            // remove the attributes, just incase.
            delete this.attrs.oldx;
            delete this.attrs.oldy;

        });

        nodeLayer.add(nodeGroup);
        nodeGroup.moveToBottom();
        nodeLayer.draw();
        app.saveGraph();
        return nodeGroup;
    }

// Edge manipulation functions

    this.addEdge = function(from, to) {
        var alreadyExists = false;
        var fromObject,toObject;
        var toRemove;

        //TODO: Check if the nodes exist and return false if they don't.
        //TODO: Make sure you cant add a self-loop

        if (from != null && typeof from === 'object' || to != null && typeof to === 'object') {
            fromObject = from;
            toObject = to;

        } else {
            //assume we have ID's rather than the object, and so iterate through nodes looking for ID's.
            fromObject = this.getNodeByID(from);
            toObject = this.getNodeByID(to);
        }

        if (edgeLayer.children.length > 0) {
            $.each(edgeLayer.children, function(index, value) {
                if (value.attrs.from == fromObject && value.attrs.to == toObject || value.attrs.to == fromObject && value.attrs.from == toObject) {
                    toRemove = value;
                    alreadyExists = true;
            }
        });  

        }

        if (alreadyExists) {
            this.removeEdge(toRemove);
            return false;
        }

        var points = [fromObject.attrs.x, fromObject.attrs.y, toObject.attrs.x, toObject.attrs.y];
        var edge = new Kinetic.Line({
            // dashArray: [10, 10, 00, 10],
            strokeWidth: 2,
            stroke: settings.defaultEdgeColor,
            // opacity: 0.8,
            from: fromObject,
            to: toObject,
            points: points
        });

        edgeLayer.add(edge);
        edgeLayer.draw(); 
        nodeLayer.draw();
        Notify("Created Edge between "+fromObject.children[1].attrs.text+" and "+toObject.children[1].attrs.text, "success",2);
        
        var simpleEdge = app.getSimpleEdge(edgeLayer.children.length-1);
        app.addToLog('edgeCreate',simpleEdge, '0');
        app.saveGraph();
        return true;   
    }

    this.removeEdge = function(edge) {
        Notify("Removing edge.");
        $.each(edgeLayer.children, function(index, value) {
            if (value == edge) {
                edgeLayer.children[index].remove();
                edgeLayer.draw();
            }
        }); 

        this.saveGraph();
          
    }

// Misc functions

    this.calculateStrokeColor = function(color) {
        return ModifyColor(color, 15);
    }

    this.clearGraph = function() {
        edgeLayer.removeChildren();
        edgeLayer.clear();
        nodeLayer.removeChildren();
        nodeLayer.clear();
        app.saveGraph();
    }

    this.createRandomGraph = function(nodeCount,edgeProbability) {
        nodeCount = nodeCount || 10;
        edgeProbability = edgeProbability || 0.4;

        Notify("Creating random graph...",3);
        for (i=0;i<nodeCount;i++) {
            var current = i+1;
            Notify("Adding node "+current+" of "+nodeCount,1);
            app.addNode();
            
        }

        Notify("Adding edges.",3);
        var nodes = app.getNodes(); 
        $.each(nodes, function (index, value) {
            if (randomBetween(0, 1) < edgeProbability) {
                var randomFriend = Math.round(randomBetween(0,nodes.length-1));
                app.addEdge(nodes[index],nodes[randomFriend]);
                 
            }
        });
    }

// Main initialisation functions

    this.initKinetic = function () {
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
    }

    this.drawUIComponents = function () {

        // Draw all UI components
        var circleFills, circleLines;
        var currentColor = settings.concentricCircleColor ;
        var totalHeight = window.innerHeight-(settings.defaultNodeSize *  2); // Our canvas area is the window height minus twice the node radius (for spacing)
        var currentOpacity = 0.1;
        
        //draw concentric circles
        for(i = 0; i < settings.concentricCircleNumber; i++) {
            var ratio = 1-(i/settings.concentricCircleNumber);
            var currentRadius = (totalHeight/2 * ratio);
      
            var circleLines = new Kinetic.Circle({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                radius: currentRadius,
                stroke: 'white',
                strokeWidth: 1.5,
                opacity: 0
            });

            var circleFills = new Kinetic.Circle({
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
      var newNodeBox = new Kinetic.Circle({
            radius: 50,
            stroke: '#666',
            strokeWidth: 0,
            y: window.innerHeight - 100,
            x: 100,
      });

      newNodeBox.on('click tap', function() {
          var touchPos = stage.getPointerPosition();
          var coords = new Array();
          coords[0] = touchPos.x;
          coords[1] = touchPos.y;
          var created = app.addNode(coords);
          newNodeBox.moveToBottom();
          uiLayer.draw();
      });

      uiLayer.add(newNodeBox);

      circleLayer.draw();
      uiLayer.draw();

    }

// Graph saving/loading/exporting functions

    this.loadGraph = function () {
        // TODO: Add return false for if this fails.
        Notify("Loading graph from localStorage.",3);
        loadedNodes = localStorage.getObject('nodes') || {};
        loadedEdges = localStorage.getObject('edges') || {};
        $.each(loadedNodes, function (index, value) {
            var coords = [];
            coords.push(value.x);
            coords.push(value.y);
            app.addNode(coords,value.nodeSize,value.type,value.name,index,value.color);
        });

        $.each(loadedEdges, function (index, value) {
            app.addEdge(value.from,value.to);
        });
    }

    this.saveGraph = function () {
        Notify("Saving graph.",3);
        simpleNodes = app.getSimpleNodes();
        simpleEdges = app.getSimpleEdges();
        log = app.getLog();
        localStorage.setObject('nodes', simpleNodes);
        localStorage.setObject('edges', simpleEdges);
        localStorage.setObject('log', log);
    }

// Get & set functions

    this.getNodes = function() {
        return nodeLayer.children;
    }

    this.getEdges = function() {
        return edgeLayer.children;
    }    

    this.getSimpleNodes = function() {
        // We need to create a simple representation of the nodes for storing.
        var simpleNodes = new Object();
        var nodes = app.getNodes();
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
    }

    this.getSimpleEdges = function() {
        var simpleEdges = {}
        var edgeCounter = 0;
        $.each(edgeLayer.children, function(index, value) {
            simpleEdges[edgeCounter] = {};
            simpleEdges[edgeCounter].from = value.attrs.from.attrs.id;
            simpleEdges[edgeCounter].to = value.attrs.to.attrs.id;
            edgeCounter++;
        });

        return simpleEdges;
    }

    this.getSimpleEdge = function(id) {
        var simpleEdges = app.getSimpleEdges();
        if (!id) { return false; }

        var simpleEdge = simpleEdges[id];
        return simpleEdge;
    }

    this.getEdgeLayer = function() {
        return edgeLayer;
    }

    this.getNodeByID = function(id) {
        var node = {}
        var nodes = app.getNodes();
        $.each(nodes, function(index, value) {
            if (value.attrs.id == id) {
                node = value;
            }
        });

        return node;
    }

    this.getNodeColorByType = function(type) {
        var returnVal = null;
        $.each(settings.nodeTypes, function(index, value) {
            if (value.name == type) returnVal = value.color;
        });

        if (returnVal) {
            return returnVal
        } else {
            return false;
        }
    }

    this.getLog = function() {
        return eventLog;
    }

    this.getLastEvent = function() {
        return eventLog[eventLog.length-1];
    }

// helper functions

    var randomBetween = function(min,max) {
        return Math.random() * (max - min) + min;
    }

    function ModifyColor(col, amt) {
      
        var usePound = false;
      
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
     
        var num = parseInt(col,16);
     
        var r = (num >> 16) + amt;
     
        if (r > 255) r = 255;
        else if  (r < 0) r = 0;
     
        var b = ((num >> 8) & 0x00FF) + amt;
     
        if (b > 255) b = 255;
        else if  (b < 0) b = 0;
     
        var g = (num & 0x0000FF) + amt;
     
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
     
        return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
      
    }

    Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
    }

    Storage.prototype.getObject = function(key) {
        if (this.getItem(key) === null) {
            Notify('Key not found in localStorage. Returning false.');
            return false;
        } else {
            Notify('Key found in localStorage. Returning.');
            var value = this.getItem(key);
            return value && JSON.parse(value);            
        }

    }

    var Notify = function(text, level){
        var level = level || 0;
        if (level >= settings.debugLevel) {
            console.log(text);
        }
    }
    app.init();
    

};