/* exported Network, Node, Edge */
/* global console, randomBetween */


/*

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

  network.init = function() {

    global.tools.notify('Network Initialising', 2);
    global.nodes = global.session.registerData('nodes', true);
    global.edges = global.session.registerData('edges', true);

    return true;
  };

  network.addNode = function(properties) {

    // Check if an ID has been passed, and then check if the ID is already in use. Cancel if it is.
    if (typeof properties.id !== 'undefined' && network.getNode(properties.id) !== false) {
      global.tools.notify('Node already exists with id '+properties.id+'. Cancelling!',2);
      return false;
    }

    // Locate the next free node ID
    var newNodeID = 0;
    while (network.getNode(newNodeID) !== false) {
      newNodeID++;
    }
    var nodeProperties = {
      id: newNodeID
    };
    global.tools.extend(nodeProperties, properties);

    global.session.addData('nodes', nodeProperties, true);
    var log = new window.CustomEvent('log', {"detail":{'eventType': 'nodeCreate', 'eventObject':nodeProperties}});
    window.dispatchEvent(log);
    var nodeAddedEvent = new window.CustomEvent('nodeAdded',{"detail":nodeProperties});
    window.dispatchEvent(nodeAddedEvent);
    var unsavedChanges = new window.Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);

    return nodeProperties.id;
  };

  network.addEdge = function(properties) {

    //TODO: make nickname unique, and provide callback so that interface can respond if a non-unique nname is used.

    if (typeof properties.from === 'undefined' || typeof properties.to === 'undefined') {
      global.tools.notify('ERROR: "To" and "From" must BOTH be defined.',2);
      return false;
    }

    if (properties.id !== 'undefined' && network.getEdge(properties.id) !== false) {
      global.tools.notify('edge with this id already exists!!!', 2);
      return false;
    }

    var position = 0;
    while(network.getEdge(position) !== false) {
      position++;
    }

    var edgeProperties = {
      id: position,
      type: "Default"
    };

    global.tools.extend(edgeProperties, properties);
    var alreadyExists = false;

    // old way of checking if an edge existed checked for values of to, from, and type. We needed those to not have to be unique.
    // New way: check if all properties are the same.

    var reversed = {}, temp;
    reversed = $.global.tools.extend(true,{}, properties);
    temp = reversed.to;
    reversed.to = reversed.from;
    reversed.from = temp;

    if (network.getEdges(properties).length > 0 || network.getEdges(reversed).length > 0) {

      alreadyExists = true;
    }

    if(alreadyExists === false) {

      global.session.addData('edges', edgeProperties, true);
      var log = new window.CustomEvent('log', {"detail":{'eventType': 'edgeCreate', 'eventObject':edgeProperties}});
      window.dispatchEvent(log);
      var edgeAddedEvent = new window.CustomEvent('edgeAdded',{"detail":edgeProperties});
      window.dispatchEvent(edgeAddedEvent);
      var unsavedChanges = new window.Event('unsavedChanges');
      window.dispatchEvent(unsavedChanges);

      return edgeProperties.id;
    } else {

      global.tools.notify('ERROR: Edge already exists!',2);
      return false;
    }

  };

  network.removeEdges = function(edges) {
    network.removeEdge(edges);
  };

  network.removeEdge = function(edge) {
    console.log(edge);
    if (!edge) {
      return false;
    }
    var log;
    var edgeRemovedEvent;
    var localEdges = global.session.returnData('edges');

    if (typeof edge === 'object' && typeof edge.length !== 'undefined') {
      // we've got an array
      for (var i = 0; i < edge.length; i++) {
        // localEdges.remove(edge[i]);
        global.tools.removeFromObject(edge[i], localEdges);
        log = new window.CustomEvent('log', {"detail":{'eventType': 'edgeRemove', 'eventObject':edge[i]}});
        edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{"detail":edge[i]});
        window.dispatchEvent(log);
        window.dispatchEvent(edgeRemovedEvent);
      }
    } else {
      // we've got a single edge, which is an object {}
    //   localEdges.remove(edge);
      global.tools.removeFromObject(edge, localEdges);
      log = new window.CustomEvent('log', {"detail":{'eventType': 'edgeRemove', 'eventObject':edge}});
      edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{"detail":edge});
      window.dispatchEvent(log);
      window.dispatchEvent(edgeRemovedEvent);
    }

    global.session.addData('edges', localEdges);

    var unsavedChanges = new window.Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
    return true;
  };

  network.removeNode = function(id) {
    var nodeRemovedEvent, log;

    network.removeEdge(network.getNodeEdges(id));

    var localNodes = global.session.returnData('nodes');
    for (var i = 0; i<localNodes.length; i++) {
      if (localNodes[i].id === id) {
        log = new window.CustomEvent('log', {"detail":{'eventType': 'nodeRemove', 'eventObject':localNodes[i]}});
        window.dispatchEvent(log);
        nodeRemovedEvent = new window.CustomEvent('edgeRemoved',{"detail":localNodes[i]});
        window.dispatchEvent(nodeRemovedEvent);
        // localNodes.remove(localNodes[i]);
        global.tools.removeFromObject(localNodes[i],localNodes);
        global.session.addData('nodes', localNodes);
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

    global.tools.extend(edge, properties);
    edgeUpdateEvent = new window.CustomEvent('edgeUpdatedEvent',{"detail":edge});
    window.dispatchEvent(edgeUpdateEvent);
    log = new window.CustomEvent('log', {"detail":{'eventType': 'edgeUpdate', 'eventObject':edge}});
    window.dispatchEvent(log);
    var unsavedChanges = new window.Event('unsavedChanges');
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

    global.tools.extend(node, properties);
    nodeUpdateEvent = new window.CustomEvent('nodeUpdatedEvent',{"detail":node});
    window.dispatchEvent(nodeUpdateEvent);
    log = new window.CustomEvent('log', {"detail":{'eventType': 'nodeUpdate', 'eventObject':node}});
    window.dispatchEvent(log);
    var unsavedChanges = new window.Event('unsavedChanges');
    window.dispatchEvent(unsavedChanges);
    if(callback) {
      callback();
    }

  };

  network.getNode = function(id) {
    if (id === undefined) { return false; }
    var localNodes = global.session.returnData('nodes');
    for (var i = 0;i<localNodes.length; i++) {
      if (localNodes[i].id === id) {return localNodes[i]; }
    }
    return false;

  };

  network.getEdge = function(id) {
    if (id === undefined) { return false; }
    var localEdges = global.session.returnData('edges');
    for (var i = 0;i<localEdges.length; i++) {
      if (localEdges[i].id === id) {return localEdges[i]; }
    }
    return false;
  };

  network.filterObject = function(targetArray,criteria) {
    // Return false if no criteria provided
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
          } else {
            match = false;
          }
      }

      if (match === true) {
        return el;
      }

    });

    // reverse to and from to check for those matches.
    if (typeof criteria.from !== 'undefined' && typeof criteria.to !== 'undefined') {

      var reversed = {}, temp;
      reversed = $.global.tools.extend(true,{}, criteria);
      temp = reversed.to;
      reversed.to = reversed.from;
      reversed.from = temp;




      var result2 = targetArray.filter(function(el){
        var match = true;

        for (var criteriaKey in reversed) {

            if (el[criteriaKey] !== undefined) {


              // current criteria exists in object.
              if (el[criteriaKey] !== reversed[criteriaKey]) {
                match = false;
              }
            } else {
              match = false;
            }
        }

        if (match === true) {
          return el;
        }

      });

      result = result.concat(result2);
    }


    return result;
  };

  network.getNodes = function(criteria, filter) {
    var localNodes = global.session.returnData('nodes');
    var results;
    if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
      results = network.filterObject(localNodes,criteria);
    } else {
      results = localNodes;
    }

    if (filter) {
      results = filter(results);
    }

    return results;
  };

  network.getEdges = function(criteria, filter) {
    var localEdges = global.session.returnData('edges');
    var results;
    if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
      results = network.filterObject(localEdges,criteria);
    } else {
      results = localEdges;
    }

    if (filter) {
      results = filter(results);
    }

    return results;
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

  network.setProperties = function(object, properties) {

    if (typeof object === 'undefined') { return false; }

    if (typeof object === 'object' && object.length>0) {
      // Multiple objects!
      for (var i = 0; i < object.length; i++) {
        $.global.tools.extend(object[i], properties);
      }
    } else {
      // Just one object.
        $.global.tools.extend(object, properties);
    }

  };

  network.returnNetwork = function() {
    return graph;
  };

  network.returnAllNodes = function() {
    return global.session.returnData('nodes');
  };

  network.returnAllEdges = function() {
    return global.session.returnData('edges');
  };

  network.createRandomGraph = function(nodeCount,edgeProbability) {
    var localNodes = global.session.returnData('nodes');
    nodeCount = nodeCount || 10;
    edgeProbability = edgeProbability || 0.4;
    global.tools.notify("Creating random graph...",1);
    for (var i=0;i<nodeCount;i++) {
      var current = i+1;
      global.tools.notify("Adding node "+current+" of "+nodeCount,2);
      // Use random coordinates
      var nodeOptions = {
        coords: [Math.round(randomBetween(100,window.innerWidth-100)),Math.round(randomBetween(100,window.innerHeight-100))]
      };
      network.addNode(nodeOptions);
    }

    global.tools.notify("Adding edges.",3);
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

module.exports = new Network();
