
      // globals
      var stage, nodeOrigin, circleLayer, edgeLayer, nodeLayer, currentNode, selected, uiLayer, mySwiper;
      var nodes = [];
      var edges = [];
      var edgeTemp = [];
      var defaultNodeRadius =  33;
      var debug = true;
      var leftHanded = true;
      var currentMode = 1;


      var colors = [];
      colors['blue'] = '#0174DF';
      colors['edge'] = '#888';

      var namesList = new Array("Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive");


      function doNotification(text, type){

      	// notificationStyle = (type !=null) ? type : 'Standard';

        if (debug == true) {
		  // alertify.log(text, notificationStyle);
		  console.log(text);
        }

      }

      function drawNewNodeBox() {

      	// create a 'pot' for nodes to sit in before they are positioned. 
        var nodeOrigin = new Kinetic.Circle({
              radius: 50,
              stroke: '#666',
              strokeWidth: 0,
              y: window.innerHeight - 100,
              x: 100,
            });

        nodeOrigin.on('mousedown touchstart', function() {
            var touchPos = (stage.getTouchPosition() != null) ? stage.getTouchPosition() : stage.getMousePosition();
            var coords = new Array();
            coords[0] = touchPos.x;
            coords[1] = touchPos.y;
            console.log(coords);
            var created = buildNode(coords);
            nodeOrigin.moveToBottom();
            nodeOrigin.setListening(false);
            uiLayer.draw();
        });  

        uiLayer.add(nodeOrigin);
        uiLayer.draw();

      }

      function drawConcentricCircles(number, colour) {
        var colour = (colour != null) ? colour : '#666';
        var circleFills, circles;
        var totalHeight = window.innerHeight-(defaultNodeRadius *  2);
        var increment = totalHeight/number;
        var offset = increment;
        var startOpacity = 0.2;
        var opacityIncrement = startOpacity/number; 
        var opacityOffset = opacityIncrement;

        for(i = 0; i < number; i++) {
          var opacity = startOpacity - (i*opacityIncrement);
          var circles = new Kinetic.Circle({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          radius: offset/2,
          stroke: 'white',
          strokeWidth: 0.5,
          opacity: 1
          });

          var circleFills = new Kinetic.Circle({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          radius: offset/2,
          fill: colour,
          strokeWidth: 0.5,
          opacity: opacity
          });          

          offset+=increment;
          opacityOffset+=opacityIncrement;
        circleLayer.add(circles); 
        circleLayer.add(circleFills);  
        }
        
        circleLayer.draw();
      }

      function randomBetween(min,max) {

        return Math.random() * (max - min) + min;

	  }

      function clearGraph() {
        edgeLayer.removeChildren();
        edgeLayer.clear();
        nodeLayer.removeChildren();
        nodeLayer.clear();
        nodes = [];
        edges = [];

      }

      function animSelected(toAnimate, animColor) {

        $.each(nodes, function (index, value) {
          // nodes[index].children[0].setStroke(null);
          // nodes[index].children[0].setStrokeWidth(null);
        });

        nodeLayer.draw();

        if (selected != toAnimate) {
          var circle = toAnimate.children[0];
          var angularSpeed = Math.PI / 3;
          circle.setStroke(colors['blue']);
          circle.setStrokeWidth(10);
          var anim = new Kinetic.Animation(function(frame) {
            var angleDiff = frame.timeDiff * angularSpeed / 1000;
            circle.rotate(angleDiff);
          }, nodeLayer);

          // anim.start();

          selected = toAnimate;

          return anim;

        }

      }

      function handleNodeTouch(node) {
      	this = node;

      	switch(currentMode) {
          case 1:
            // position nodes


          break;
          case 2:
            // add edges
            if (edgeTemp.length == 1) {

              if (this == edgeTemp[0]) {
                doNotification('Same node. Ignoring...');
                edgeTemp = [];
              } else {
                doNotification('Selected second node.','info');
                buildEdge(edgeTemp[0],this);
                edgeTemp = [];
              }

            } else {
              doNotification('Selected first node.','info');
              edgeTemp.push(this);
            }
          break;
          case 3:
            // draw communities
          break;          
          default:
            // error handling
            doNotification('ERROR: Current mode not set correctly.', 'error');

        }
        
      }


      function randomGraph(nodeCount,edgeProbability) {


        doNotification("Creating random graph...");
        for (i=0;i<nodeCount;i++) {
          nodes.push(buildNode());
        }

        $.each(nodes, function (index, value) {
          if (randomBetween(0, 1) < edgeProbability) {

            var randomFriend = Math.round(randomBetween(0,nodes.length-1));


            buildEdge(nodes[index],nodes[randomFriend]);
            // doNotification("Adding edge between "+nodes[index]+" and "+nodes[randomFriend]+".", "success");

          }
        });
      }

      
      function updateEdgePosition(dragNode) {

         if (dragNode != null) {

          $.each(dragNode.attrs.edges, function(index, value) {

                if (value.attrs.from == dragNode) {
                  value.attrs.points[0].y = dragNode.attrs.y;
                  value.attrs.points[0].x = dragNode.attrs.x;
                } else {
                  value.attrs.points[1].y = dragNode.attrs.y;
                  value.attrs.points[1].x = dragNode.attrs.x;

                }

          });

         }

        edgeLayer.draw();
      }

      function changeMode(newMode) {
        if (newMode != null) {
          currentMode = newMode;
          doNotification('Changing mode to: '+newMode, 'info');

          switch(newMode) {
            case 1:
              // position nodes
            break;
            case 2:
              // add edges
              //disable node dragging
              $.each(nodes, function (index, value) {
                nodes[index].attrs.draggable = false;
              });

            break;
            case 3:
              // draw communities
            break;          
            default:
              // error handling
              doNotification('ERROR: Current mode not set correctly.', 'error');

          }

        } else {
          doNotification('ERROR: No new mode specified.', 'error');
        }
      }

      function buildNode(coords, size, shape, label) {

		var nodex,nodey;

      	if (coords != null) {
      		nodex = coords[0];
      		nodey = coords[1];
      	} else {
      		//no coords supplied, so we will generate some random ones.
      		//TODO: make the random coordinates fall within a uniform distribution of the largest concentric circle.
      		nodex = Math.round(randomBetween(100,window.innerWidth-100));
      		nodey = Math.round(randomBetween(100,window.innerHeight-100));
      	}

        var nodeLabel = (label != null) ? label : namesList[Math.round(randomBetween(0,namesList.length))];
        var nodeSize = (size != null) ? size : defaultNodeRadius;
        var anchor = new Kinetic.Group({
          id: nodes.length,
          draggable: true,
          y: nodey,
          x: nodex,
          edges: []
        });
        var shape = new Kinetic.Circle({
          dashArray: [15, 3],
          radius: nodeSize,
          stroke: colors['blue'],
          strokeWidth: 10,
        });

        var label = new Kinetic.Text({
        text: nodeLabel,
        fontSize: 15,
        fontFamily: 'Raleway',
        fill: colors['blue'],
        offset: [-1.2*nodeSize,8], //[left/right, up/down]
        });

        anchor.add(shape);
        anchor.add(label);


        doNotification("Putting node "+nodeLabel+" at coordinates x:"+nodex+", y:"+nodey, "success");

        anchor.on('click', function(evt) {

       	// handleNodeTouch(this);
        this.moveToTop();
        doNotification("Selected node "+this.children[1].attrs.text);
        if (selected != null) {selected.stop(); $.each(nodes, function(index, value) { nodes[index].setStrokeWidth = 0; }); }
        currentNode = this;
        selected = animSelected(this);
        selected.start();

        });      

        anchor.on('dragmove', function() {
          updateEdgePosition(this);
        });  

        anchor.on('dragend', function() {
          updateEdgePosition(this);
          uiLayer.children[0].setListening(true);
          uiLayer.draw();
          currentNode = null;
        });

        nodeLayer.add(anchor);
        nodes.push(anchor);
        anchor.moveToBottom();
        nodeLayer.draw();
        return anchor;
      }

      function buildEdge(from, to) {

        var alreadyExists = false;

        $.each(from.attrs.edges, function(index, value) {
          if (value.attrs.from == to || value.attrs.to == to) {
            alreadyExists = true;
          }
        });

        if (alreadyExists || from === to) {

          doNotification("Edge already exists. Cancelling.", "error");
          return false;

        } else {

          var firstx = from.attrs.x;
          var firsty = from.attrs.y;
          var secondx = to.attrs.x;
          var secondy = to.attrs.y;


          var edge = new Kinetic.Line({
            // dashArray: [10, 10, 00, 10],
            strokeWidth: 2,
            stroke: colors['edge'],
            // opacity: 0.8,
            from: from,
            to: to,
            points: [firstx, firsty, secondx, secondy]
          });

          // add edge reference to both of the nodes involved
          from.attrs.edges.push(edge);
          to.attrs.edges.push(edge);


          edgeLayer.add(edge);
          edgeLayer.draw(); 
          nodeLayer.draw();
          doNotification("Created Edge between "+from.children[1].attrs.text+" and "+to.children[1].attrs.text, "success");
          return true;   

        }
   
      }


      window.onload = function() {

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

        stage = new Kinetic.Stage({
          container: 'kineticCanvas',
          width: window.innerWidth,
          height: window.innerHeight
        });

        $(".nodebutton").click(function() {
          // $(this).toggleClass('btn-danger');
          changeMode(1);
          buildNode();
        });
        
        $(".edgebutton").click(function() {
          $(this).toggleClass('btn-danger');
          if (currentMode == 2) {
            changeMode(1);
          } else {
            changeMode(2);
          }
          
        });

        $(".communitybutton").click(function() {
          $(this).toggleClass('btn-danger');
          changeMode(3);
        });


        circleLayer = new Kinetic.Layer();
        nodeLayer = new Kinetic.Layer();
        edgeLayer = new Kinetic.Layer();
        uiLayer = new Kinetic.Layer();



        // keep curves in sync with the lines
        nodeLayer.on('beforeDraw', function() {
          if(currentNode != null) {
            updateEdgePosition(currentNode);
          }
          
        });

        stage.add(circleLayer);
        stage.add(edgeLayer);
        stage.add(nodeLayer);
        stage.add(uiLayer);

        updateEdgePosition();

        $('img').on('dragstart', function(event) { event.preventDefault(); });

        // Set up interface
        drawConcentricCircles(4);
        drawNewNodeBox();
        randomGraph(10,0.4);


      };
