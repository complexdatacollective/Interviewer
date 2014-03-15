//helper functions go here

var settings = {
    debug: false,
    defaultNodeRadius: 28,
    circleColor: '#fff',
    circleNumber: 4,
}

var Notify = function(text, type){
    if(settings.debug) {
        console.log(text);        
    }
}

var randomBetween = function(min,max) {
    return Math.random() * (max - min) + min;
}

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}


// App declaration

var NetCanvas = (function () {

    // globals
    var stage, newNodeBox, circleLayer, edgeLayer, nodeLayer, currentNode, selected, uiLayer, mySwiper,
        nodes = [],
        _init = false,
        settings = {},
        app = {},
        selectedNodes = [];

    // Colours
    var colors = [];
    colors['blue'] = '#0174DF';
    colors['edge'] = '#0174DF';

    // Dummy Names
    var namesList = new Array("Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive");

    app.init = function (s) {
        if (_init) {
            return;
        }
        _init = true;
        settings = s;
        this.initKinetic();
        this.drawUIComponents();
        this.loadGraph();
    }

    app.addNode = function(coords, size, shape, label) {

        var nodex,nodey;
        var nodeTextLabel = (label != null) ? label : namesList[Math.round(randomBetween(0,namesList.length-1))],
            nodeSize = (size != null) ? size : settings.defaultNodeRadius;

        if (coords != null) {
            nodex = coords[0];
            nodey = coords[1];
        } else {
          //TODO: make the random coordinates fall within a uniform distribution of the largest concentric circle.
          nodex = Math.round(randomBetween(100,window.innerWidth-100));
          nodey = Math.round(randomBetween(100,window.innerHeight-100));
        }

        var nodeGroup = new Kinetic.Group({
            id: nodes.length,
            y: nodey,
            x: nodex,
            name: nodeTextLabel,
            edges: [],
            draggable: true,
            dragDistance: 10,
        });

        var nodeCircle = new Kinetic.Circle({
            radius: nodeSize,
            fill:colors['blue'],
            // stroke: colors['blue'],
            strokeWidth: 0,
        });

        var nodeLabel = new Kinetic.Text({         
            text: nodeTextLabel,
            fontSize: 25,
            fontFamily: 'Lato',
            fill: 'white',
            offsetX: -32,
            offsetY:15,
            fontStyle:100,
        shadowColor: 'black',
        shadowBlur: 4,
        shadowOffset: {x:0, y:0},
        shadowOpacity: 1

        });

        nodeGroup.add(nodeCircle);
        nodeGroup.add(nodeLabel);

        Notify("Putting node "+nodeTextLabel+" at coordinates x:"+nodex+", y:"+nodey, "success"); 

        nodeGroup.on('dragstart', function() {
            Notify("dragstart");
            var dragnode = this;
            this.moveToTop();
            nodeLayer.draw();
        });


        nodeGroup.on('dragmove', function(e) {
            Notify("Dragmove");
            var dragNode = this;
            $.each(edgeLayer.children, function(index, value) {
                // value.setPoints([dragNode.getX(), dragNode.getY() ]);
                if (value.attrs.from == dragNode || value.attrs.to == dragNode) {
                    var points = [value.attrs.from.attrs.x,value.attrs.from.attrs.y,value.attrs.to.attrs.x,value.attrs.to.attrs.y];
                    // var points = new Array();
                    // var points1 = {};
                    // var points2 = {};
                    // points1.x = value.attrs.from.attrs.x;
                    // points1.y = value.attrs.from.attrs.y;
                    // points2.x = value.attrs.to.attrs.x;
                    // points2.y = value.attrs.to.attrs.y;
                    // points.push(points1);
                    // points.push(points2);
                    value.attrs.points = points;       
                }
            });
            edgeLayer.draw();     

        });    

        nodeGroup.on('tap', function(e) {
            this.moveToTop();
            nodeLayer.draw();
        }); 
    
        nodeGroup.on('dbltap', function(e) {
            Notify('double tap');
            selectedNodes.push(this);
            if(selectedNodes.length == 2) {
                app.addEdge(selectedNodes[0],selectedNodes[1]);
                selectedNodes[0].children[0].fill(colors['blue']);
                selectedNodes[1].children[0].fill(colors['blue']);
                selectedNodes = [];
                nodeLayer.draw(); 

            } else {
                this.children[0].fill('red');
                nodeLayer.draw();                
            }

        });      

        nodeGroup.on('dragend', function() {
            Notify('dragend');
            var dragNode = this;
            app.saveGraph();

        });

        nodeLayer.add(nodeGroup);
        nodes.push(nodeGroup);
        nodeGroup.moveToBottom();
        nodeLayer.draw();
        app.saveGraph();
        return nodeGroup;
    }

    app.getNodeByID = function(id) {
        var node = {}
        $.each(nodes, function(index, value) {
            if (value.attrs.id == id) {
                node = value;
            }
        });

        return node;
    }

    app.addEdge = function(from, to) {
        var alreadyExists = false;
        var fromObject,toObject;
        var toRemove;

        //TODO: Make this function accept ID's or names
        //TODO: Check if the nodes exist and return false if they don't.
        //TODO: Make sure you cant add a self-loop

        if (from != null && typeof from === 'object' || to != null && typeof to === 'object') {
            fromObject = from;
            toObject = to;

        } else {
            //assume we have ID's rather than the object, and so iterate through nodes looking for ID's.
            fromObject = app.getNodeByID(from);
            toObject = app.getNodeByID(to);
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
            app.removeEdge(toRemove);
            return false;
        }

        var points = [fromObject.attrs.x, fromObject.attrs.y, toObject.attrs.x, toObject.attrs.y];
        var edge = new Kinetic.Line({
            // dashArray: [10, 10, 00, 10],
            strokeWidth: 4,
            stroke: colors['edge'],
            // opacity: 0.8,
            from: fromObject,
            to: toObject,
            points: points
        });

        edgeLayer.add(edge);
        edgeLayer.draw(); 
        nodeLayer.draw();
        Notify("Created Edge between "+fromObject.children[1].attrs.text+" and "+toObject.children[1].attrs.text, "success");
        app.saveGraph();
        return true;   
    }

    app.removeEdge = function(edge) {
        Notify("Removing edge.");
        $.each(edgeLayer.children, function(index, value) {
            if (value == edge) {
                edgeLayer.children[index].remove();
                edgeLayer.draw();
            }
        }); 

        app.saveGraph();
          
    }    

    app.getSimpleEdges = function() {
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

    app.getEdgeLayer = function() {
        return edgeLayer;
    }

    app.initKinetic = function () {
        // Initialise KineticJS stage
        stage = new Kinetic.Stage({
            container: 'kineticCanvas',
            width: window.innerWidth,
            height: window.innerHeight
        });

      stage.getContent().addEventListener('touchmove', function(evt) {
        var touch1 = evt.touches[0];
        var touch2 = evt.touches[1];
        // Notify(evt.touches);
      }, false);

      stage.getContent().addEventListener("MSHoldVisual", function(e) { e.preventDefault(); }, false);


        circleLayer = new Kinetic.Layer();
        nodeLayer = new Kinetic.Layer();
        edgeLayer = new Kinetic.Layer();
        uiLayer = new Kinetic.Layer();

        stage.add(circleLayer);
        stage.add(edgeLayer);
        stage.add(nodeLayer);
        stage.add(uiLayer);
    }

    app.loadGraph = function () {
        // TODO: Add return false for if this fails.
        Notify("Loading graph from localStorage.");
        loadedNodes = localStorage.getObject('nodes');
        loadedEdges = localStorage.getObject('edges');
        $.each(loadedNodes, function (index, value) {
            var coords = [];
            coords.push(value.x);
            coords.push(value.y);
            var label = value.name;
            app.addNode(coords,null,null,label);
        });

        $.each(loadedEdges, function (index, value) {
            app.addEdge(value.from,value.to);
        });
    }

    app.saveGraph = function () {
        Notify("Saving graph.");
        simpleNodes = app.getSimpleNodes();
        simpleEdges = app.getSimpleEdges();
        localStorage.setObject('nodes', simpleNodes);
        localStorage.setObject('edges', simpleEdges);
    }

    app.getNodes = function() {
        return nodes;
    }

    app.getEdges = function() {
        return edgeLayer.children;
    }    

    app.getSimpleNodes = function() {
        // We need to create a simple representation of the nodes for storing.
        var simpleNodes = new Object();
        $.each(nodes, function (index, value) {
            simpleNodes[value.attrs.id] = {};
            simpleNodes[value.attrs.id].x = value.attrs.x;
            simpleNodes[value.attrs.id].y = value.attrs.y;
            simpleNodes[value.attrs.id].name = value.attrs.name;
        });
        return simpleNodes;
    }

    app.drawUIComponents = function () {

        // Draw all UI components
        var circleFills, circleLines;
        var currentColor = settings.circleColor;
        var totalHeight = window.innerHeight-(settings.defaultNodeRadius *  2); // Our canvas area is the window height minus twice the node radius (for spacing)
        var currentOpacity = 0.1;
        
        //draw concentric circles
        for(i = 0; i < settings.circleNumber; i++) {
            var ratio = 1-(i/settings.circleNumber);
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
            currentOpacity = currentOpacity+((0.3-currentOpacity)/settings.circleNumber);        
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
          Notify(coords);
          var created = app.addNode(coords);
          newNodeBox.moveToBottom();
          uiLayer.draw();
      });

      uiLayer.add(newNodeBox);

      circleLayer.draw();
      uiLayer.draw();

    }

    app.clearGraph = function() {
        edgeLayer.removeChildren();
        edgeLayer.clear();
        nodeLayer.removeChildren();
        nodeLayer.clear();
        nodes = [];
        app.saveGraph();
    }

    app.createRandomGraph = function(nodeCount,edgeProbability) {
        nodeCount = nodeCount || 10;
        edgeProbability = edgeProbability || 0.4;

        Notify("Creating random graph...");
        for (i=0;i<nodeCount;i++) {
            var current = i+1;
            Notify("Adding node "+current+" of "+nodeCount);
            app.addNode();
            
        }

        Notify("Adding edges."); 
        $.each(nodes, function (index, value) {
            if (randomBetween(0, 1) < edgeProbability) {
                var randomFriend = Math.round(randomBetween(0,nodes.length-1));
                app.addEdge(nodes[index],nodes[randomFriend]);
                 
            }
        });
    }

    return app;

})();

var menu = (function () {

    var menu = {};
    var open = false;

    menu.open = function() {
        $('.menu-item').animate({'marginLeft': 0,},500,"easeOutQuint");
        $('.menu-container').animate({'opacity': '1'},500,"easeOutQuint");
        open = true; 
    }

    menu.close = function() {
        $('.menu-item').animate({'marginLeft': '-110px',},700,"easeOutQuint");
        $('.menu-container').animate({'opacity': '0'},500,"easeOutQuint");
        open = false;
    }

    menu.toggle = function() {
        if(open) {
            menu.close();
        } else {
            menu.open();
        }

    }

    return menu;

})();

window.onload = function() {
 $('body').addClass('bodyfade');

document.getElementById("kineticCanvas").addEventListener('contextmenu', function (event) {
  event.preventDefault();
});

$('#menu-button').click(function() {
    menu.toggle();
});

$('.menu-item').click(function() {
    menu.close();
});

$('#kineticCanvas').click(function() {
    menu.close();
});

$('#refresh-button').click(function() {
    $(this).addClass('.refresh-animate');
    location.reload(); 
});



$('#generate-graph-submit').click(function() {
    $('.modal').modal('hide');
    menu.close();
    if($('#gen-graph-clear').is(':checked')) {
        NetCanvas.clearGraph();
    }

    var nodeNumber = $('#gen-graph-nodes').val();
    var edgeProb = $('#gen-graph-edge-prob').val();
    NetCanvas.createRandomGraph(nodeNumber,edgeProb);
});

mySwiper = new Swiper('.swiper-container',{
    //Your options here:
    mode:'horizontal',
    loop: false,
    autoResize: true,
    keyboardControl: true,
    speed: 1000,
    onlyExternal: true,
    onSlideChangeStart: function (e) {
    },
    onSlideChangeEnd: function () {
    }  
});

    NetCanvas.init(settings);

};
