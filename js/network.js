/* exported Network, Node, Edge */
/* global session, extend, notify, randomBetween */


/*

This is a very important module!

Previously I had been storing Nodes and Edges within the KineticJS framework 
Nodes were stored as Kinetic Groups (text and a shape), and edges stored as Kinetic Lines.

This approach worked fine when the scope of the interaction was limited to 
KineticJS, but needs revision when nodes much be created, edited, and managed 
from different interfaces.

This module should implement 'networky' methods, and a querying syntax for 
selecting nodes or edges by their various properties, and interating over them.

*/

var Network = function Network() {
  var network = {};
  var graph = {};
  // var namesList = ["Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive"];

  network.init = function() {

    notify('Network Initialising', 2);
    window.nodes = session.registerData('nodes', true);
    window.edges = session.registerData('edges', true);

    return true;
  };

  network.addNode = function(properties) {
    var newNodeID = 0;
    while (network.getNode(newNodeID) !== false) {
      newNodeID++;
    }
    var nodeProperties = {
      id: newNodeID
      // color: 'red'
    };
    extend(nodeProperties, properties);    
    
    session.addData('nodes', nodeProperties, true);
    var log = new CustomEvent('log', {"detail":{'eventType': 'nodeCreate', 'eventObject':nodeProperties}});
    window.dispatchEvent(log);
    var nodeAddedEvent = new CustomEvent('nodeAdded',{"detail":nodeProperties});
    window.dispatchEvent(nodeAddedEvent);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);

    return nodeProperties.id;
  };

  network.addEdge = function(properties) {

    if (typeof properties.from === 'undefined' || typeof properties.to === 'undefined') {
      return false;
    }

    var edgeProperties = {
      id: session.returnData('edges').length,
      type: "Default"
    };

    extend(edgeProperties, properties);
    var alreadyExists = false;
    var localEdges = session.returnData('edges');
    for (var i = 0; i<localEdges.length; i++) {
      if (localEdges[i].from === edgeProperties.from && localEdges[i].to === edgeProperties.to || localEdges[i].from === edgeProperties.to && localEdges[i].to === edgeProperties.from) {
        //to and from match. what about type? 
        if(localEdges[i].type === edgeProperties.type) {
          if (localEdges[i].type === edgeProperties.type) {
            alreadyExists = true;
          }
        }
      }
    }

    if(alreadyExists === false) {
      session.addData('edges', edgeProperties, true);
      var log = new CustomEvent('log', {"detail":{'eventType': 'edgeCreate', 'eventObject':edgeProperties}});
      window.dispatchEvent(log);
      var edgeAddedEvent = new CustomEvent('edgeAdded',{"detail":edgeProperties});
      window.dispatchEvent(edgeAddedEvent);
      var unsavedChanges = new Event('unsavedChanges');
      window.dispatchEvent(unsavedChanges);

      return edgeProperties.id;      
    } else {
      return false;
    }

  };

  network.removeEdge = function(edge) {
    if (!edge) {
      return false;
    }
    var log;
    var edgeRemovedEvent;
    var localEdges = session.returnData('edges');

    if (typeof edge === 'object' && typeof edge.length !== 'undefined') {
      // we've got an array
      for (var i = 0; i < edge.length; i++) {
        localEdges.remove(edge[i]);
        log = new CustomEvent('log', {"detail":{'eventType': 'edgeRemove', 'eventObject':edge[i]}});
        edgeRemovedEvent = new CustomEvent('edgeRemoved',{"detail":edge[i]});
        window.dispatchEvent(log);
        window.dispatchEvent(edgeRemovedEvent);
      }
    } else {
      // we've got a single edge
      localEdges.remove(edge);
      log = new CustomEvent('log', {"detail":{'eventType': 'edgeRemove', 'eventObject':edge}});
      edgeRemovedEvent = new CustomEvent('edgeRemoved',{"detail":edge});
      window.dispatchEvent(log);
      window.dispatchEvent(edgeRemovedEvent);
    }

    session.addData('edges', localEdges);

    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
    return true;
  };

  network.removeNode = function(id) {
    var nodeRemovedEvent, log;

    network.removeEdge(network.getNodeEdges(id));

    var localNodes = session.returnData('nodes');
    for (var i = 0; i<localNodes.length; i++) {
      if (localNodes[i].id === id) {
        log = new CustomEvent('log', {"detail":{'eventType': 'nodeRemove', 'eventObject':localNodes[i]}});
        window.dispatchEvent(log);
        nodeRemovedEvent = new CustomEvent('edgeRemoved',{"detail":localNodes[i]});
        window.dispatchEvent(nodeRemovedEvent);
        localNodes.remove(localNodes[i]);
        session.addData('nodes', localNodes);
        return true;
      }
    }
    return false;
  };

  network.updateEdge = function(id, properties, callback) {
    if(network.getEdge(id) === false || properties === undefined) {
      return false;
    }
    var edge = network.getEdge(id);
    var edgeUpdateEvent, log;

    extend(edge, properties);
    edgeUpdateEvent = new CustomEvent('edgeUpdatedEvent',{"detail":edge});
    window.dispatchEvent(edgeUpdateEvent);
    log = new CustomEvent('log', {"detail":{'eventType': 'edgeUpdate', 'eventObject':edge}});
    window.dispatchEvent(log);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
    if(callback) {
      callback();
    }

  };

  network.updateNode = function(id, properties, callback) {
    if(network.getNode(id) === false || properties === undefined) {
      return false;
    }
    var node = network.getNode(id);
    var nodeUpdateEvent, log;

    extend(node, properties);
    nodeUpdateEvent = new CustomEvent('nodeUpdatedEvent',{"detail":node});
    window.dispatchEvent(nodeUpdateEvent);
    log = new CustomEvent('log', {"detail":{'eventType': 'nodeUpdate', 'eventObject':node}});
    window.dispatchEvent(log);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
    if(callback) {
      callback();
    }

  };

  network.getNode = function(id) {
    if (id === undefined) { return false; }
    var localNodes = session.returnData('nodes');
    for (var i = 0;i<localNodes.length; i++) {
      if (localNodes[i].id === id) {return localNodes[i]; }
    }
    return false;

  };

  network.getEdge = function(id) {
    if (id === undefined) { return false; }
    var localEdges = session.returnData('edges');
    for (var i = 0;i<localEdges.length; i++) {
      if (localEdges[i].id === id) {return localEdges[i]; }
    }
    return false;
  };

  network.filterObject = function(targetArray,criteria) {

    if (!criteria) { return false; }
    // Get nodes using .filter(). Function is called for each of nodes.Nodes.
    var result = targetArray.filter(function(el){
      var match = true;
      for (var criteriaKey in criteria) {
          if (el[criteriaKey] !== undefined) {
            // current criteria exists in object.
            if (el[criteriaKey] !== criteria[criteriaKey]) {
              match = false;
            }  
          }      
      }

      if (match === true) {
        return el;
      }

    });

    return result;
  };

  network.getNodes = function(criteria) {
    var localNodes = session.returnData('nodes');
    if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
      return network.filterObject(localNodes,criteria);  
    } else {
      return localNodes;
    }
  };

  network.getNodeInboundEdges = function(nodeID) {
    return network.getEdges({to:nodeID});
  };

  network.getNodeOutboundEdges = function(nodeID) {
    return network.getEdges({from:nodeID});
  };  

  network.getNodeEdges = function(nodeID) {
    if (network.getNode(nodeID) === false) {
      return false;
    }
    var inbound = network.getNodeInboundEdges(nodeID);
    var outbound = network.getNodeOutboundEdges(nodeID);
    var concat = inbound.concat(outbound);
    return concat;
  };

  network.getEdges = function(criteria) {
    var localEdges = session.returnData('edges');
    if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
      return network.filterObject(localEdges,criteria);  
    } else {
      return localEdges;
    }
  };

  network.setProperties = function(object, properties) {

    if (typeof object === 'undefined') { return false; }

    if (typeof object === 'object' && object.length>0) {
      // Multiple objects!
      for (var i = 0; i < object.length; i++) {
        $.extend(object[i], properties);     
      }     
    } else {
      // Just one object.
        $.extend(object, properties);    
    }

  };

  network.returnNetwork = function() {
    return graph;
  };

  network.returnAllNodes = function() {
    return session.returnData('nodes');
  };

  network.returnAllEdges = function() {
    return session.returnData('edges');
  };

  network.createRandomGraph = function(nodeCount,edgeProbability) {
    var localNodes = session.returnData('nodes');
    nodeCount = nodeCount || 10;
    edgeProbability = edgeProbability || 0.4;
    notify("Creating random graph...",1);
    for (var i=0;i<nodeCount;i++) {
      var current = i+1;
      notify("Adding node "+current+" of "+nodeCount,2);
      // Use random coordinates
      var nodeOptions = {
        coords: [Math.round(randomBetween(100,window.innerWidth-100)),Math.round(randomBetween(100,window.innerHeight-100))]
      };
      network.addNode(nodeOptions); 
    }

    notify("Adding edges.",3);
    $.each(localNodes, function (index) {
      if (randomBetween(0, 1) < edgeProbability) {
        var randomFriend = Math.round(randomBetween(0,localNodes.length-1));
        network.addEdge({from:localNodes[index].id,to:localNodes[randomFriend].id});

      }
    });
  };

  network.init();

  return network;
};