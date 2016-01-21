/* exported Network, Node, Edge, document */
/* global $, window, note, deepmerge, tools */

/**
* This module should implement 'networky' methods, and a querying syntax for
* selecting nodes or edges by their various properties, and interating over them.
* @constructor
*/

module.exports = function Network() {
    'use strict';
    var nodes = [];
    var edges = [];
    var network = {};
    var namesList = ['Joshua', 'Bernie', 'Michelle', 'Gregory', 'Patrick', 'Barney', 'Jonathon','Myles','Alethia','Tammera','Veola','Meredith','Renee','Grisel','Celestina','Fausto','Eliana','Raymundo','Lyle','Carry','Kittie','Melonie','Elke','Mattie','Kieth','Lourie','Marcie','Trinity','Librada','Lloyd','Pearlie','Velvet','Stephan','Hildegard','Winfred','Tempie','Maybelle','Melynda','Tiera','Lisbeth','Kiera','Gaye','Edra','Karissa','Manda','Ethelene','Michelle','Pamella','Jospeh','Tonette','Maren','Aundrea','Madelene','Epifania','Olive'];

    /**
    * @public
    * @name Network#addNode
    * @function
    * @param {object} properties An object containing the desired node properties.
    * @param {boolean} [ego=false] Whether or not the node being added is an Ego.
    * @param {boolean} [force=false] Override reserved IDs.
    */
    network.addNode = function(properties, ego, force) {

        var reserved_ids;

        if (!force) { force = false; }

        // Check if we are adding an ego
        if (!ego) { ego = false;}

        // if we are adding an ego create an empty reserved_ids array for later, if not use Ego's.
        if (ego) {
            // fetch in use IDs from Ego
            reserved_ids = [];
        } else {
            // We aren't adding an Ego, so make sure an Ego exists
            if (network.egoExists()) {
                reserved_ids = network.getEgo().reserved_ids;
            } else {
                throw new Error('You must add an Ego before attempting to add other nodes.');
            }

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
        while (network.getNode(newNodeID) !== false || reserved_ids.indexOf(newNodeID) !== -1) {
            newNodeID++;
        }
        var nodeProperties = {
            id: newNodeID
        };
        window.tools.extend(nodeProperties, properties);

        nodes.push(nodeProperties);
        reserved_ids.push(newNodeID);

        var log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeCreate', 'eventObject':nodeProperties}});
        window.dispatchEvent(log);
        var nodeAddedEvent = new window.CustomEvent('nodeAdded',{'detail':nodeProperties});
        window.dispatchEvent(nodeAddedEvent);
        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);

        return nodeProperties.id;
    };

    network.loadNetwork = function(data, overwrite) {
        if (!data || !data.nodes || !data.edges) {
            note.error('Error loading network. Data format incorrect.');
            return false;
        } else {
            if (!overwrite) {
                overwrite = false;
            }

            if (overwrite) {
                nodes = data.nodes;
                network.dges = data.edges;
            } else {
                nodes = nodes.concat(data.nodes);
                edges = edges.concat(data.edges);
            }

            return true;
        }
    };

    network.resetNetwork = function() {
        nodes = [];
        edges = [];
    };

    network.createEgo = function(properties) {
        if (network.egoExists() === false) {
            var egoProperties = {
                id:0,
                type: 'Ego',
                reserved_ids: [0]
            };
            window.tools.extend(egoProperties, properties);
            network.addNode(egoProperties, true);
        } else {
            throw new Error('Ego already exists.');
        }
    };

    network.getEgo = function() {
        note.debug('network.getEgo() called.');
        if (network.getNodes({type:'Ego'}).length !== 0) {
            return network.getNodes({type:'Ego'})[0];
        } else {
            return false;
        }
    };

    network.egoExists = function() {
        if (network.getEgo() !== false) {
            return true;
        } else {
            return false;
        }
    };

    network.edgeExists = function(edge) {
        note.debug('network.edgeExists() called.');
        note.debug(edge);
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

        var straightExists = (network.getEdges(edge).length > 0) ? true : false;
        var reverseExists = (network.getEdges(reversed).length > 0) ? true : false;

        if (straightExists === true || reverseExists === true) { // Test if an edge matches either the proposed edge or the reversed edge.
            note.debug('network.edgeExists() true.');
            return true;
        } else {
            note.debug('network.edgeExists() false.');
            return false;
        }
    };

    network.addEdge = function(properties) {
        note.debug('network.addEdge() called.');
        // todo: make nickname unique, and provide callback so that interface can respond if a non-unique nname is used.

        if (typeof properties.from === 'undefined' || typeof properties.to === 'undefined') {
            note.error('Error while executing network.addEdge(). "To" and "From" must BOTH be defined.');
            return false;
        }
        // Required variables (id and type) generated here. These are overwritten as long as the values have been provided.
        var edgeProperties = {
            type: 'Default'
        };

        window.tools.extend(edgeProperties, properties);

        if(network.edgeExists(edgeProperties) === false) {

            if (edgeProperties.id === 'undefined' || network.getEdge(edgeProperties.id) !== false) {
                note.warn('Either you didn\'t provide an ID, or an edge with this id already exists! I\'m generating a new one for you.');

                var newEdgeID = 0;
                while (network.getEdge(newEdgeID) !== false) {
                    newEdgeID++;
                }

                edgeProperties.id = newEdgeID;
            }

            edges.push(edgeProperties);
            var log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeCreate', 'eventObject':edgeProperties}});
            window.dispatchEvent(log);
            var edgeAddedEvent = new window.CustomEvent('edgeAdded',{'detail':edgeProperties});
            window.dispatchEvent(edgeAddedEvent);
            var unsavedChanges = new window.Event('unsavedChanges');
            window.dispatchEvent(unsavedChanges);

            return edgeProperties.id;
        } else {
            return false;
        }

    };

    network.removeEdges = function(edges) {
        note.debug('network.removeEdges() called.');
        network.removeEdge(edges);
    };

    network.removeEdge = function(edge) {
        var counter = 0;
        note.debug('network.removeEdge() called.');

        if (!edge) {
            note.error('network.removeEdge(): No edge specified!');
            return false;
        }
        var log;
        var edgeRemovedEvent;

        if (typeof edge === 'object' && typeof edge.length !== 'undefined') {
            // we've got an array of object edges
            for (var i = 0; i < edge.length; i++) {
                // localEdges.remove(edge[i]);
                counter = window.tools.removeFromObject(edge[i], edges);
                log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeRemove', 'eventObject':edge[i]}});
                edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{'detail':edge[i]});
                window.dispatchEvent(log);
                window.dispatchEvent(edgeRemovedEvent);
            }
        } else {
            // we've got a single edge, which is an object {}
            counter = window.tools.removeFromObject(edge, edges);

            log = new window.CustomEvent('log', {'detail':{'eventType': 'edgeRemove', 'eventObject':edge}});
            edgeRemovedEvent = new window.CustomEvent('edgeRemoved',{'detail':edge});
            window.dispatchEvent(log);
            window.dispatchEvent(edgeRemovedEvent);
        }

        var unsavedChanges = new window.Event('unsavedChanges');
        window.dispatchEvent(unsavedChanges);
        if (counter > 0) {
            return true;
        } else {
            return false;
        }
    };

    network.removeNode = function(id, preserveEdges) {
        note.debug('network.removeNode() called.');

        if (!preserveEdges) { preserveEdges = false; }

        // Unless second parameter is present, also delete this nodes edges
        if (!preserveEdges) {
            network.removeEdge(network.getNodeEdges(id));
        } else {
            note.info('NOTICE: preserving node edges after deletion.');
        }

        var nodeRemovedEvent, log;

        for (var i = 0; i<nodes.length; i++) {
            if (nodes[i].id === id) {
                log = new window.CustomEvent('log', {'detail':{'eventType': 'nodeRemove', 'eventObject':nodes[i]}});
                window.dispatchEvent(log);
                nodeRemovedEvent = new window.CustomEvent('nodeRemoved',{'detail':nodes[i]});
                window.dispatchEvent(nodeRemovedEvent);
                window.tools.removeFromObject(nodes[i],nodes);
                return true;
            }
        }
        return false;
    };

    network.updateEdge = function(id, properties, callback) {
        note.debug('network.updateEdge() called.');
        if(network.getEdge(id) === false || properties === undefined) {
            return false;
        }
        var edge = network.getEdge(id);
        var edgeUpdateEvent, log;

        $.extend(edge, properties);
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

    network.updateNode = function(id, properties, callback) {
        note.info('network.updateNode() called for node id '+id+'.');
        // console.log(typeof id);
        note.debug(properties);

        if(this.getNode(id) === false || properties === undefined) {
            note.error('network.updateNode() couldn\'t find node with id '+id);
            return false;
        }
        var node = this.getNode(id);
        var nodeUpdateEvent, log;

        $.extend(node, properties);
        // console.log('node:');
        // console.log(node);
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

    network.deepUpdateNode = function(id, properties, callback) {
        if(this.getNode(id) === false || properties === undefined) {
            return false;
        }
        var node = this.getNode(id);
        var nodeUpdateEvent, log;

        node = deepmerge(node, properties);
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

    network.getNode = function(id) {
        // Ensure that ID is always treated as int for === comparisons to work reliably.
        id = parseInt(id);

        if (id === undefined) { return false; }
        for (var i = 0;i<nodes.length; i++) {
            if (nodes[i].id === id) {return nodes[i]; }
        }
        return false;

    };

    network.getEdge = function(id) {
        if (id === undefined) { return false; }
        for (var i = 0;i<edges.length; i++) {
            if (edges[i].id === id) {return edges[i]; }
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

    network.getNodes = function(criteria, filter) {
        var results;
        if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
            results = network.filterObject(nodes,criteria);
        } else {
            results = nodes;
        }

        if (filter) {
            results = filter(results);
        }

        return results;
    };

    network.getEdges = function(criteria, filter) {
        var results;
        if (typeof criteria !== 'undefined' && Object.keys(criteria).length !== 0) {
            results = network.filterObject(edges,criteria);
        } else {
            results = edges;
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
                $.extend(object[i], properties);
            }
        } else {
            // Just one object.
            $.extend(object, properties);
        }

    };

    network.returnAllNodes = function() {
        return nodes;
    };

    network.returnAllEdges = function() {
        return edges;
    };

    network.clearGraph = function() {
        edges = [];
        nodes = [];
    };

    network.createRandomGraph = function(nodeCount,edgeProbability) {
        nodeCount = nodeCount || 10;

        edgeProbability = edgeProbability || 0.4;
        note.info('Creating random graph...');

        for (var i=0;i<nodeCount;i++) {
            var current = i+1;
            window.tools.notify('Adding node '+current+' of '+nodeCount,2);
            // Use random coordinates
            var nodeOptions = {
                name: namesList[Math.floor(window.tools.randomBetween(0,namesList.length))],
                coords: [Math.round(window.tools.randomBetween(100,window.innerWidth-100)),Math.round(window.tools.randomBetween(100,window.innerHeight-100))]
            };
            network.addNode(nodeOptions);
        }

        note.debug('Adding edges.');
        $.each(nodes, function (index) {
            if (window.tools.randomBetween(0, 1) < edgeProbability) {
                var randomFriend = Math.round(window.tools.randomBetween(0,nodes.length-1));
                network.addEdge({from:nodes[index].id,to:nodes[randomFriend].id});

            }
        });
    };

    return network;

};
