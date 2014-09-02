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
  var nodes = [];
  var edges = [];
  window.log = session.registerData('log', true); 

  network.addNode = function(properties) {
    var nodeProperties = {
      id: nodes.length,
      properties: []
    };
    extend(nodeProperties, properties);    
    nodes.push(nodeProperties);

    return nodeProperties.id;
  };

  network.addEdge = function(properties) {

    if (!properties.from || !properties.to) {
      return false;
    }

    var edgeProperties = {
      id: edges.length,
      properties: []
    };

    extend(edgeProperties, properties);
    edges.push(edgeProperties);

    return edgeProperties.id;
  };

  network.getNode = function(id) {
    if (id === undefined) { return false; }

    for (var i = 0;i<nodes.length; i++) {
      if (nodes[i].id === id) {return nodes[i]; }
    }

  };

  network.getEdge = function(id) {
    
    return edges[id];
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
    if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
      return network.filterObject(nodes,criteria);  
    } else {
      return nodes;
    }
    
  };

  network.getNodeEdges = function(nodeID) {
    var edgeList = [];

    $.each(edges, function(index, value){
      if (value.from === nodeID) {
        edgeList.push(value);
      }
    });

    return edgeList;
  };

  network.getEdges = function(criteria) {

    return network.filterObject(edges,criteria);

  };

  network.setNodeProperties = function(node, properties) {

    if (typeof node === 'undefined') { return false; }

    if (typeof node === 'object' && node.length>0) {
      console.log('pass object');
      // Multiple nodes!
      for (var i = 0; i < node.length; i++) {
        $.extend(node[i], properties);     
      }     
    } else {
      console.log('passed single');
      // Just one node.
        $.extend(node, properties);    
    }

  };

  network.returnNetwork = function() {
    return graph;
  };

  network.returnAllNodes = function() {
    return nodes;
  };

  network.returnAllEdges = function() {
    return edges;
  };

  network.createRandomGraph = function(nodeCount,edgeProbability) {
    nodeCount = nodeCount || 10;
    edgeProbability = edgeProbability || 0.4;
    var nodes = network.getKineticNodes(); 
    notify("Creating random graph...",1);
    for (var i=0;i<nodeCount;i++) {
      var current = i+1;
      notify("Adding node "+current+" of "+nodeCount,2);
      // Use random coordinates
      var nodeOptions = {
        coords: [Math.round(randomBetween(100,window.innerWidth-100)),Math.round(randomBetween(100,window.innerHeight-100))]
      };
      session.addNode(nodeOptions); 
    }

    notify("Adding edges.",3);
    $.each(nodes, function (index) {
      if (randomBetween(0, 1) < edgeProbability) {
        var randomFriend = Math.round(randomBetween(0,nodes.length-1));
        session.addEdge(nodes[index],nodes[randomFriend]);

      }
    });
  };


  return network;
};