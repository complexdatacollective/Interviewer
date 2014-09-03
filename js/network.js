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
  var namesList = ["Barney","Jonathon","Myles","Alethia","Tammera","Veola","Meredith","Renee","Grisel","Celestina","Fausto","Eliana","Raymundo","Lyle","Carry","Kittie","Melonie","Elke","Mattie","Kieth","Lourie","Marcie","Trinity","Librada","Lloyd","Pearlie","Velvet","Stephan","Hildegard","Winfred","Tempie","Maybelle","Melynda","Tiera","Lisbeth","Kiera","Gaye","Edra","Karissa","Manda","Ethelene","Michelle","Pamella","Jospeh","Tonette","Maren","Aundrea","Madelene","Epifania","Olive"];

  network.init = function() {

      // window.addEventListener('newDataLoaded', function () {
      //   notify('Network noticed that new data has been loaded.',2); 
      //     for (var i = 0; i < session.returnData('nodes').length; i++) {
      //       network.addNode(session.returnData('nodes')[i]);
      //     }
      // }, false);

    notify('Network Initialising', 2);
    window.nodes = session.registerData('nodes', true);
    window.edges = session.registerData('edges', true);

    return true;
  };

  network.addNode = function(properties) {

    var localNodes = session.returnData('nodes');
    var nodeProperties = {
      id: localNodes.length,
      properties: [],
      label: namesList[Math.round(randomBetween(0,namesList.length-1))],
      // color: 'red'
    };
    extend(nodeProperties, properties);    
    
    localNodes.push(nodeProperties);
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
    var localEdges = session.returnData('edges');
    var edgeProperties = {
      id: localEdges.length,
      properties: []
    };

    extend(edgeProperties, properties);
    localEdges.push(edgeProperties);
    var log = new CustomEvent('log', {"detail":{'eventType': 'edgeCreate', 'eventObject':edgeProperties}});
    window.dispatchEvent(log);
    var edgeAddedEvent = new CustomEvent('edgeAdded',{"detail":edgeProperties});
    window.dispatchEvent(edgeAddedEvent);
    var unsavedChanges = new Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);

    return edgeProperties.id;
  };

  network.getNode = function(id) {
    if (id === undefined) { return false; }
    var localNodes = session.returnData('nodes');
    for (var i = 0;i<localNodes.length; i++) {
      if (localNodes[i].id === id) {return localNodes[i]; }
    }

  };

  network.getEdge = function(id) {
    
    return window.edges[id];
  };

  network.filterObject = function(targetArray,criteria) {

    if (!criteria) { return false; }

    // Get nodes using .filter(). Function is called for each of nodes.Nodes.
    var result = targetArray.filter(function(el){

      // Iterate through the properties of this node.
      var keys = Object.keys(el);
      for (var i = 0; i < keys.length; i++) {

        // Check if the current property exists in the criteria object
        // If it does, check if the criteria and the object value match.
        if (criteria[keys[i]] !== undefined && el[keys[i]] === criteria[keys[i]]) {
          return el;
        }
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

  network.getNodeEdges = function(nodeID) {
    return network.getEdges({from:nodeID});
  };

  network.getEdges = function(criteria) {
    return network.filterObject(window.edges,criteria);
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