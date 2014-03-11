//helper functions go here
var touchNumber = 0;
var Notify = function(text, type){
        console.log(text);
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
        edges = [],
        edgeTemp = [],
        defaultNodeRadius =  33,
        debug = true,
        leftHanded = true,
        currentMode = 1,
        _init = false,
        app = {};

    // Colours
    var colors = [];
    colors['blue'] = '#0174DF';
    colors['edge'] = '#888';

    // Dummy Names
    var namesList = new Array("Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive");

    app.init = function () {
        if (_init) {
            return;
        }
        _init = true;

        this.initKinetic();
        this.drawUIComponents();
        // this.createRandomGraph(10,0.4);
        this.loadGraph();
    }

    app.addNode = function(coords, size, shape, label) {

        var nodex,nodey;
        var nodeTextLabel = (label != null) ? label : namesList[Math.round(randomBetween(0,namesList.length-1))],
            nodeSize = (size != null) ? size : defaultNodeRadius;

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
            draggable: true,
            y: nodey,
            x: nodex,
            name: nodeTextLabel,
            edges: []
        });

        var nodeCircle = new Kinetic.Circle({
            dashArray: [15, 3],
            radius: nodeSize,
            stroke: colors['blue'],
            strokeWidth: 10,
        });

        var nodeLabel = new Kinetic.Text({         
            text: nodeTextLabel,
            fontSize: 15,
            fontFamily: 'Raleway',
            fill: 'red',
            offsetX: -40,
            offsetY: 10,

        });

        nodeGroup.add(nodeCircle);
        nodeGroup.add(nodeLabel);

        Notify("Putting node "+nodeTextLabel+" at coordinates x:"+nodex+", y:"+nodey, "success"); 

        nodeGroup.on('dragstart', function() {
            Notify("dragstart");
            var dragnode = this;
        });


        nodeGroup.on('dragmove', function(e) {
            Notify("Dragmove");
            var dragNode = this;
            var currX = this.attrs.x;
            var currY = this.attrs.y;
            var touchY = e.touches[0].clientY;
            var touchX = e.touches[0].clientX;
            // console.log(e.touches[0].clientX+' ('+currX+'), '+e.touches[0].clientY+' ('+currY+')');

            if( (Math.abs(currX-touchX)) > 10 || (Math.abs(currY-touchY)) > 10 ) {
                console.log(e);
                $.each(edges, function(index, value) {
                    // value.setPoints([dragNode.getX(), dragNode.getY() ]);
                    if (value.attrs.from == dragNode || value.attrs.to == dragNode) {
                        var points = [value.attrs.from.attrs.x,value.attrs.from.attrs.y,value.attrs.to.attrs.x,value.attrs.to.attrs.y];
                        value.attrs.points = points;          
                    }
                });
                edgeLayer.draw();     
            } else {
                Notify('false.')
                dragNode.setDraggable(false);
            }

            dragNode.setDraggable(true);

        });    

        nodeGroup.on('dragend', function() {
            Notify('dragend');
            var dragNode = this;
            dragNode.setDraggable(true);
            uiLayer.children[0].setListening(true); // Listen for click events on the new node box again.
            app.saveGraph();

        });

        nodeLayer.add(nodeGroup);
        nodes.push(nodeGroup);
        nodeGroup.moveToBottom();
        nodeLayer.draw();
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

        $.each(edges, function(index, value) {
            if (value.attrs.from == toObject || value.attrs.to == toObject) {
                alreadyExists = true;
            }
        });  

        if (alreadyExists || fromObject === toObject) {
            Notify("Edge already exists. Cancelling.", "error");
            return false;
        }

        var points = [fromObject.attrs.x, fromObject.attrs.y, toObject.attrs.x, toObject.attrs.y];
        var edge = new Kinetic.Line({
            // dashArray: [10, 10, 00, 10],
            strokeWidth: 2,
            stroke: colors['edge'],
            // opacity: 0.8,
            from: fromObject,
            to: toObject,
            points: points
        });

        edges.push(edge);
        edgeLayer.add(edge);
        edgeLayer.draw(); 
        nodeLayer.draw();
        Notify("Created Edge between "+fromObject.children[1].attrs.text+" and "+toObject.children[1].attrs.text, "success");
        return true;   
    }

    app.getSimpleEdges = function() {
        var simpleEdges = {}
        var edgeCounter = 0;
        $.each(edges, function(index, value) {
            simpleEdges[edgeCounter] = {};
            simpleEdges[edgeCounter].from = value.attrs.from.attrs.id;
            simpleEdges[edgeCounter].to = value.attrs.to.attrs.id;
            edgeCounter++;
        });

        return simpleEdges;
    }

    app.initKinetic = function () {
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
        return edges;
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
    
    app.getEdges = function() {
        return edges;
    }

    app.drawUIComponents = function () {

        var settings = {
                circleColor: '#C3D5E6',
                circleNumber: 4,
            }
        // Draw all UI components
        var circleFills, circleLines;
        var currentColor = settings.circleColor;
        var totalHeight = window.innerHeight-(defaultNodeRadius *  2); // Our canvas area is the window height minus twice the node radius (for spacing)
        
        //draw concentric circles
        for(i = 0; i < settings.circleNumber; i++) {
            var ratio = 1-(i/settings.circleNumber);
            var currentRadius = totalHeight/2 * ratio;
      
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
                strokeWidth: 0
            });

            currentColor = tinycolor.darken(currentColor, amount = 15).toHexString();        
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
          console.log(coords);
          var created = app.addNode(coords);
          newNodeBox.moveToBottom();
          nodeOrigin.setListening(false);
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
        edges = [];
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

window.onload = function() {
$('#menu-button').click(function() {
    // $(this).toggleClass( "btn-link" );
    // $(this).toggleClass( "btn-primary" );
    console.log($('.menu-container').css('opacity'));
    if($('.menu-container').css('opacity') == '1') {
        $('.menu-item').animate({
            'marginLeft': '-110px',
        },1000,"easeOutQuint");
        $('.menu-container').animate({
            'opacity': '0'
        },1000,"easeOutQuint");
    } else {
        $('.menu-item').animate({
            'marginLeft': 0,
        },1000,"easeOutQuint");
        $('.menu-container').animate({
            'opacity': '1'
        },1000,"easeOutQuint");        
    }

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

    NetCanvas.init();

};
