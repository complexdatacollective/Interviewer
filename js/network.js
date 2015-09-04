/* exported Network, Node, Edge */
/* global $, window,note, tools */

/*

Previously I had been storing Nodes and Edges within the KineticJS framework
Nodes were stored as Kinetic Groups (text and a shape), and edges stored as Kinetic Lines.

This approach worked fine when the scope of the interaction was limited to
KineticJS, but needs revision when nodes much be created, edited, and managed
from different interfaces.

This module should implement 'networky' methods, and a querying syntax for
selecting nodes or edges by their various properties, and interating over them.

*/

module.exports = function Network() {
    'use strict';
    this.nodes = [];
    this.edges = [];
    var _this = this;

    this.addNode = function(properties, ego, force) {

        var reserved_ids;

        if (!force) { force = false; }

        // Check if we are adding an ego
        if (!ego) { ego = false;}

        // if we are adding an ego create an empty reserved_ids array for later, it not use Ego's.
        if (ego) {
            // fetch in use IDs from Ego
            reserved_ids = [];
        } else {
            reserved_ids = _this.getEgo().reserved_ids;
        }


        // Check if an ID has been passed, and then check if the ID is already in use. Cancel if it is.
        if (typeof properties.id !== 'undefined' && this.getNode(properties.id) !== false) {
            note.error('Node already exists with id '+properties.id+'. Cancelling!');
            return false;
        }

        // To prevent confusion in longitudinal studies, once an ID has been allocated, it is always reserved.
        // This reserved list is stored with the ego.
        if (!force) {
            if (reserved_ids.indexOf(properties.id) !== -1) {
                note.error('Node id '+properties.id+' is already in use with this ego. Cancelling!');
                return false;
            }
        }

        // Locate the next free node ID
        // should this be wrapped in a conditional to check if properties.id has been provided? probably.
        var newNodeID = 0;
        while (_this.getNode(newNodeID) !== false || reserved_ids.indexOf(newNodeID) !== -1) {
            newNodeID++;
        }
        var nodeProperties = {
            id: newNodeID
        };
        window.tools.extend(nodeProperties, properties);

        _this.nodes.push(nodeProperties);
        reserved_ids.push(newNodeID);

        var log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeCreate', 'eventObject':nodeProperties}});
        window.dispatchEvent(log);
        var nodeAddedEvent = new window.CustomEvent('nodeAdded',{'detail':nodeProperties});
        window.dispatchEvent(nodeAddedEvent);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        return nodeProperties.id;
    };

    this.loadNetwork = function(data, overwrite) {
        if (!data || !data.nodes || !data.edges) {
            note.error('Error loading network. Data format incorrect.');
            return false;
        } else {
            if (!overwrite) {
                overwrite = false;
            }

            if (overwrite) {
                _this.nodes = data.nodes;
                _this.dges = data.edges;
            } else {
                _this.nodes = _this.nodes.concat(data.nodes);
                _this.edges = _this.edges.concat(data.edges);
            }

            return true;
        }
    };

    this.createEgo = function(properties) {
        if (_this.egoExists() === false) {
            var egoProperties = {
                id:0,
                type_t0: 'Ego',
                reserved_ids: [0]
            };
            window.tools.extend(egoProperties, properties);
            _this.addNode(egoProperties, true);
        } else {
            return false;
        }
    };

    this.getEgo = function() {
        note.debug('network.getEgo() called.');
        if (_this.getNodes({type_t0:'Ego'}).length !== 0) {
            return _this.getNodes({type_t0:'Ego'})[0];
        } else {
            return false;
        }
    };

    this.egoExists = function() {
        if (_this.getEgo() !== false) {
            return true;
        } else {
            return false;
        }
    };

    this.edgeExists = function(edge) {
        note.debug('network.edgeExists() called.');
        if (typeof edge === 'undefined') {
            note.error('ERROR: No edge passed to network.edgeExists().');
            return false;
        }
        // old way of checking if an edge existed checked for values of to, from, and type. We needed those to not have to be unique.
        // New way: check if all properties are the same.

        var reversed = {}, temp;
        reversed = $.extend(true,{}, edge); // Creates a copy not a reference
        temp = reversed.to; // Switch the order (do the reversing)
        reversed.to = reversed.from;
        reversed.from = temp;

        var straightExists = (_this.getEdges(edge).length > 0) ? true : false;
        var reverseExists = (_this.getEdges(reversed).length > 0) ? true : false;


        if (straightExists === true || reverseExists === true) { // Test if an edge matches either the proposed edge or the reversed edge.
            return true;
        } else {
            return false;
        }
    };

    this.addEdge = function(properties) {
        note.debug('network.addEdge() called.');
        // todo: make nickname unique, and provide callback so that interface can respond if a non-unique nname is used.

        if (typeof properties.from === 'undefined' || typeof properties.to === 'undefined') {
            note.error('Error while executing network.addEdge(). "To" and "From" must BOTH be defined.');
            return false;
        }

        if (properties.id !== 'undefined' && _this.getEdge(properties.id) !== false) {
            note.warn('An edge with this id already exists! I\'m generating a new one for you.');
            var newEdgeID = 0;
            while (_this.getEdge(newEdgeID) !== false) {
                newEdgeID++;
            }

            properties.id = newEdgeID;
        }

        var position = 0;
        while(_this.getEdge(position) !== false) {
            position++;
        }

        // Required variables (id and type) generated here. These are overwritten as long as the values have been provided.
        var edgeProperties = {
            id: position,
            type: 'Default'
        };

        window.tools.extend(edgeProperties, properties);

        if(_this.edgeExists(edgeProperties) === false) {

            _this.edges.push(edgeProperties);
            var log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeCreate', 'eventObject':edgeProperties}});
            window.dispatchEvent(log);
            var edgeAddedEvent = new window.CustomEvent('edgeAdded',{'detail':edgeProperties});
            window.dispatchEvent(edgeAddedEvent);
            var unsavedChanges = new window.Event('unsavedChanges');
            window.dispatchEvent(unsavedChanges);

            return edgeProperties.id;
        } else {
            note.warn('Warning: Proposed edge already exists. Cancelling.');
            return false;
        }

    };

    this.removeEdges = function(edges) {
        note.debug('network.removeEdges() called.');
        _this.removeEdge(edges);
    };

    this.removeEdge = function(edge) {
        note.debug('network.removeEdge() called.');
        if (!edge) {
            return false;
        }
        var log;
        var edgeRemovedEvent;

        if (typeof edge === 'object' && typeof edge.length !== 'undefined') {
            // we've got an array of object edges
            for (var i = 0; i < edge.length; i++) {
                // localEdges.remove(edge[i]);
                window.tools.removeFromObject(edge[i], _this.edges);
                log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeRemove', 'eventObject':edge[i]}});
                edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{'detail':edge[i]});
                window.dispatchEvent(log);
                window.dispatchEvent(edgeRemovedEvent);
            }
        } else {
            // we've got a single edge, which is an object {}
            window.tools.removeFromObject(edge, _this.edges);
            log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeRemove', 'eventObject':edge}});
            edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{'detail':edge});
            window.dispatchEvent(log);
            window.dispatchEvent(edgeRemovedEvent);
        }

        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        return true;
    };

    this.removeNode = function(id, preserveEdges) {
        note.debug('network.removeNode() called.');
        if (!preserveEdges) { preserveEdges = false; }

        // Unless second parameter is present, also delete this nodes edges
        if (!preserveEdges) {
            this.removeEdge(_this.getNodeEdges(id));
        } else {
            note.info('NOTICE: preserving node edges after deletion.');
        }

        var nodeRemovedEvent, log;

        for (var i = 0; i<_this.nodes.length; i++) {
            if (_this.nodes[i].id === id) {
                log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeRemove', 'eventObject':_this.nodes[i]}});
                window.dispatchEvent(log);
                nodeRemovedEvent = new window.CustomEvent('nodeRemoved',{'detail':_this.nodes[i]});
                window.dispatchEvent(nodeRemovedEvent);
                window.tools.removeFromObject(_this.nodes[i],_this.nodes);
                return true;
            }
        }
        return false;
    };

    this.updateEdge = function(id, properties, callback) {
        note.debug('network.updateEdge() called.');
        if(_this.getEdge(id) === false || properties === undefined) {
            return false;
        }
        var edge = _this.getEdge(id);
        var edgeUpdateEvent, log;

        window.tools.extend(edge, properties);
        edgeUpdateEvent = new window.CustomEvent('edgeUpdatedEvent',{'detail':edge});
        window.dispatchEvent(edgeUpdateEvent);
        log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeUpdate', 'eventObject':edge}});
        window.dispatchEvent(log);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        if(callback) {
            callback();
        }

    };

    this.updateNode = function(id, properties, callback) {
        note.debug('network.updateNode() called.');
        if(this.getNode(id) === false || properties === undefined) {
            return false;
        }
        var node = this.getNode(id);
        var nodeUpdateEvent, log;

        window.tools.extend(node, properties);
        nodeUpdateEvent = new window.CustomEvent('nodeUpdatedEvent',{'detail':node});
        window.dispatchEvent(nodeUpdateEvent);
        log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeUpdate', 'eventObject':node}});
        window.dispatchEvent(log);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        if(callback) {
            callback();
        }

    };

    this.getNode = function(id) {
        if (id === undefined) { return false; }
        for (var i = 0;i<_this.nodes.length; i++) {
            if (_this.nodes[i].id === id) {return _this.nodes[i]; }
        }
        return false;

    };

    this.getEdge = function(id) {
        if (id === undefined) { return false; }
        for (var i = 0;i<_this.edges.length; i++) {
            if (_this.edges[i].id === id) {return _this.edges[i]; }
        }
        return false;
    };

    this.filterObject = function(targetArray,criteria) {
        // Return false if no criteria provided
        if (!criteria) { return false; }
        // Get _this.nodes using .filter(). Function is called for each of _this.nodes.Nodes.
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
            reversed = $.extend(true,{}, criteria);
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

    this.getNodes = function(criteria, filter) {
        var results;
        if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
            results = _this.filterObject(_this.nodes,criteria);
        } else {
            results = _this.nodes;
        }

        if (filter) {
            results = filter(results);
        }

        return results;
    };

    this.getEdges = function(criteria, filter) {
        var results;
        if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
            results = _this.filterObject(_this.edges,criteria);
        } else {
            results = _this.edges;
        }

        if (filter) {
            results = filter(results);
        }

        return results;
    };

    this.getNodeInboundEdges = function(nodeID) {
        return _this.getEdges({to:nodeID});
    };

    this.getNodeOutboundEdges = function(nodeID) {
        return _this.getEdges({from:nodeID});
    };

    this.getNodeEdges = function(nodeID) {
        if (_this.getNode(nodeID) === false) {
            return false;
        }
        var inbound = _this.getNodeInboundEdges(nodeID);
        var outbound = _this.getNodeOutboundEdges(nodeID);
        var concat = inbound.concat(outbound);
        return concat;
    };

    this.setProperties = function(object, properties) {

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

    this.returnAllNodes = function() {
        return _this.nodes;
    };

    this.returnAllEdges = function() {
        return _this.edges;
    };

    this.clearGraph = function() {
        _this.edges = [];
        _this.nodes = [];
    };

    this.createRandomGraph = function(nodeCount,edgeProbability) {
        nodeCount = nodeCount || 10;
        edgeProbability = edgeProbability || 0.4;
        note.info('Creating random graph...');
        for (var i=0;i<nodeCount;i++) {
            var current = i+1;
            window.tools.notify('Adding node '+current+' of '+nodeCount,2);
            // Use random coordinates
            var nodeOptions = {
                coords: [Math.round(tools.randomBetween(100,window.innerWidth-100)),Math.round(tools.randomBetween(100,window.innerHeight-100))]
            };
            this.addNode(nodeOptions);
        }

        note.debug('Adding _this.edges.');
        $.each(_this.nodes, function (index) {
            if (tools.randomBetween(0, 1) < edgeProbability) {
                var randomFriend = Math.round(tools.randomBetween(0,_this.nodes.length-1));
                _this.addEdge({from:_this.nodes[index].id,to:_this.nodes[randomFriend].id});

            }
        });
    };

};
