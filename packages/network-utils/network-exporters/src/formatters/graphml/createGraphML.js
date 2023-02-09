const { findKey, includes, groupBy } = require('lodash');
const jsSHA = require('jssha/dist/sha1');
const {
  entityAttributesProperty,
  entityPrimaryKeyProperty,
  caseProperty,
  sessionProperty,
  protocolProperty,
  sessionExportTimeProperty,
  sessionFinishTimeProperty,
  sessionStartTimeProperty,
  codebookHashProperty,
  protocolName,
  ncSourceUUID,
  ncTargetUUID,
  edgeSourceProperty,
  edgeTargetProperty,
  ncTypeProperty,
  ncUUIDProperty,
  nodeExportIDProperty,
  edgeExportIDProperty,
} = require('@codaco/shared-consts');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const {
  createDataElement,
  getGraphMLTypeForKey,
  getAttributePropertyFromCodebook,
  formatXml,
} = require('./helpers');
const { getEntityAttributes } = require('../../utils/general');

const eol = '\n';

const variableTypes = Object.freeze({
  boolean: 'boolean',
  text: 'text',
  number: 'number',
  ordinal: 'ordinal',
  categorical: 'categorical',
  layout: 'layout',
  scalar: 'scalar',
  datetime: 'datetime',
});

// Create a serializer for reuse below.
const serializer = new XMLSerializer();
const serialize = (fragment) => `${serializer.serializeToString(fragment)}${eol}`;

// Utility function for indenting and serializing XML element
const formatAndSerialize = (element) => formatXml(serialize(element));

// Utility sha1 function that returns hashed text
const sha1 = (text) => {
  // eslint-disable-next-line new-cap
  const shaInstance = new jsSHA('SHA-1', 'TEXT', { encoding: 'UTF8' });
  shaInstance.update(text.toString());
  return shaInstance.getHash('HEX');
};

// If includeNCMeta is true, include our custom XML schema
const getXmlHeader = () => `<?xml version="1.0" encoding="UTF-8"?>
  <graphml
    xmlns="http://graphml.graphdrawing.org/xmlns"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
    http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd"
    xmlns:nc="http://schema.networkcanvas.com/xmlns">${eol}`;

// Use exportOptions.defaultOptions from FileExportManager to determine parameters
// for edge direction.
const getGraphHeader = ({ useDirectedEdges }, sessionVariables) => {
  const edgeDefault = useDirectedEdges ? 'directed' : 'undirected';

  let metaAttributes = `nc:caseId="${sessionVariables[caseProperty]}"
  nc:sessionUUID="${sessionVariables[sessionProperty]}"
  nc:protocolName="${sessionVariables[protocolName]}"
  nc:protocolUID="${sessionVariables[protocolProperty]}"
  nc:codebookHash="${sessionVariables[codebookHashProperty]}"
  nc:sessionExportTime="${sessionVariables[sessionExportTimeProperty]}"`;

  if (sessionVariables[sessionStartTimeProperty]) {
    metaAttributes += `${eol}    nc:sessionStartTime="${sessionVariables[sessionStartTimeProperty]}"`;
  }

  if (sessionVariables[sessionFinishTimeProperty]) {
    metaAttributes += `${eol}    nc:sessionFinishTime="${sessionVariables[sessionFinishTimeProperty]}"`;
  }
  return `<graph
  edgedefault="${edgeDefault}"
  ${metaAttributes}
>${eol}`;
};

const getGraphFooter = `</graph>${eol}`;

const xmlFooter = `</graphml>${eol}`;

// Use exportOptions from FileExportManager to determine XML properties
const setUpXml = (exportSettings, sessionVariables) => {
  const graphMLOutline = `${getXmlHeader()}${getGraphHeader(exportSettings, sessionVariables)}${xmlFooter}`;
  return (new DOMParser()).parseFromString(graphMLOutline, 'text/xml');
};

// <key> elements provide the type definitions for GraphML data elements
// @return {Object} a fragment to insert
//                  codebook: `{ fragment: <DocumentFragment> }`.
const generateKeyElements = (
  document, // the XML ownerDocument
  entities, // network.nodes or edges, or ego
  type, // 'node' or 'edge' or 'ego'
  excludeList, // Variables to exlcude
  codebook, // codebook
  useScreenLayoutCoordinates,
) => {
  let fragment = '';

  // Create an array to track variables we have already created <key>s for
  const done = [];

  // Create <key> for a 'label' variable that is allowed on all elements.
  // This is used by Gephi to label nodes/edges.
  // Only create once!
  if (type === 'node' && done.indexOf('label') === -1 && !excludeList.includes('label')) {
    const labelDataElement = document.createElement('key');
    labelDataElement.setAttribute('id', 'label');
    labelDataElement.setAttribute('attr.name', 'label');
    labelDataElement.setAttribute('attr.type', 'string');
    labelDataElement.setAttribute('for', 'all');
    fragment += `${serialize(labelDataElement)}`;
    done.push('label');
  }

  // Create a <key> for the network canvas entity type.
  if (type === 'node' && done.indexOf('type') === -1 && !excludeList.includes('type')) {
    const typeDataElement = document.createElement('key');
    typeDataElement.setAttribute('id', ncTypeProperty);
    typeDataElement.setAttribute('attr.name', ncTypeProperty);
    typeDataElement.setAttribute('attr.type', 'string');
    typeDataElement.setAttribute('for', 'all');
    fragment += `${serialize(typeDataElement)}`;
    done.push('type');
  }

  // Create a <key> for network canvas UUID.
  if (type === 'node' && done.indexOf('uuid') === -1 && !excludeList.includes('uuid')) {
    const typeDataElement = document.createElement('key');
    typeDataElement.setAttribute('id', ncUUIDProperty);
    typeDataElement.setAttribute('attr.name', ncUUIDProperty);
    typeDataElement.setAttribute('attr.type', 'string');
    typeDataElement.setAttribute('for', 'all');
    fragment += `${serialize(typeDataElement)}`;
    done.push('uuid');
  }

  // Create a <key> for `from` and `to` properties that reference network canvas UUIDs.
  if (type === 'edge' && done.indexOf('originalEdgeSource') === -1) {
    // Create <key> for type
    const typeDataElement = document.createElement('key');
    typeDataElement.setAttribute('id', ncTargetUUID);
    typeDataElement.setAttribute('attr.name', ncTargetUUID);
    typeDataElement.setAttribute('attr.type', 'string');
    typeDataElement.setAttribute('for', 'edge');
    fragment += `${serialize(typeDataElement)}`;

    const typeDataElement2 = document.createElement('key');
    typeDataElement2.setAttribute('id', ncSourceUUID);
    typeDataElement2.setAttribute('attr.name', ncSourceUUID);
    typeDataElement2.setAttribute('attr.type', 'string');
    typeDataElement2.setAttribute('for', 'edge');
    fragment += `${serialize(typeDataElement2)}`;

    done.push('originalEdgeSource');
  }

  // Main loop over entities
  entities.forEach((element) => {
    const elementAttributes = getEntityAttributes(element);

    // nodes and edges have for="node|edge" but ego has for="graph"
    const keyTarget = type === 'ego' ? 'graph' : type;

    // Loop over attributes for this entity
    Object.keys(elementAttributes).forEach((key) => {
      // transpose ids to names based on codebook; fall back to the raw key
      const keyName = getAttributePropertyFromCodebook(codebook, type, element, key, 'name') || key;

      // Test if we have already created a key for this variable, and that it
      // isn't on our exclude list.
      if (done.indexOf(key) === -1 && !excludeList.includes(keyName)) {
        const keyElement = document.createElement('key');

        // Determine attribute type to decide how to encode it
        const variableType = getAttributePropertyFromCodebook(codebook, type, element, key);

        // <key> id must be xs:NMTOKEN: http://books.xmlschemata.org/relaxng/ch19-77231.html
        // do not be tempted to change this to the variable 'name' for this reason!
        if (variableType) {
          keyElement.setAttribute('id', key);
        } else {
          // If variableType is undefined, variable wasn't in the codebook (could be external data).
          // This means that key might not be a UUID, so update the key ID to be SHA1 of variable
          // name to ensure it is xs:NMTOKEN compliant
          const hashedKeyName = sha1(key);
          keyElement.setAttribute('id', hashedKeyName);
        }

        // Use human readable variable name for the attr.name attribute
        keyElement.setAttribute('attr.name', keyName);

        switch (variableType) {
          case variableTypes.boolean:
            keyElement.setAttribute('attr.type', variableType);
            break;
          case variableTypes.ordinal:
          case variableTypes.number: {
            const keyType = getGraphMLTypeForKey(entities, key);
            keyElement.setAttribute('attr.type', keyType || 'string');
            break;
          }
          case variableTypes.layout: {
            // special handling for layout variables: split the variable into
            // two <key> elements - one for X and one for Y.
            keyElement.setAttribute('attr.name', `${keyName}_Y`);
            keyElement.setAttribute('id', `${key}_Y`);
            keyElement.setAttribute('attr.type', 'double');

            // Create a second element to model the <key> for
            // the X value
            const keyElement2 = document.createElement('key');
            keyElement2.setAttribute('id', `${key}_X`);
            keyElement2.setAttribute('attr.name', `${keyName}_X`);
            keyElement2.setAttribute('attr.type', 'double');
            keyElement2.setAttribute('for', keyTarget);
            fragment += `${serialize(keyElement2)}`;

            if (useScreenLayoutCoordinates) {
              // Create a third element to model the <key> for
              // the screen space Y value
              const keyElement3 = document.createElement('key');
              keyElement3.setAttribute('id', `${key}_screenSpaceY`);
              keyElement3.setAttribute('attr.name', `${keyName}_screenSpaceY`);
              keyElement3.setAttribute('attr.type', 'double');
              keyElement3.setAttribute('for', keyTarget);
              fragment += `${serialize(keyElement3)}`;

              // Create a fourth element to model the <key> for
              // the screen space X value
              const keyElement4 = document.createElement('key');
              keyElement4.setAttribute('id', `${key}_screenSpaceX`);
              keyElement4.setAttribute('attr.name', `${keyName}_screenSpaceX`);
              keyElement4.setAttribute('attr.type', 'double');
              keyElement4.setAttribute('for', keyTarget);
              fragment += `${serialize(keyElement4)}`;
            }

            break;
          }
          case variableTypes.categorical: {
            /*
            * Special handling for categorical variables:
            * Because categorical variables can have multiple membership, we
            * split them out into several boolean variables
            *
            * Because key id must be an xs:NMTOKEN, we hash the option value.
            */

            // fetch options property for this variable
            const options = getAttributePropertyFromCodebook(codebook, type, element, key, 'options');

            options.forEach((option, index) => {
              // Hash the value to ensure that it is NKTOKEN compliant
              const hashedOptionValue = sha1(option.value);

              if (index === options.length - 1) {
                keyElement.setAttribute('id', `${key}_${hashedOptionValue}`);
                keyElement.setAttribute('attr.name', `${keyName}_${option.value}`);
                keyElement.setAttribute('attr.type', 'boolean');
              } else {
                const keyElement2 = document.createElement('key');
                keyElement2.setAttribute('id', `${key}_${hashedOptionValue}`);
                keyElement2.setAttribute('attr.name', `${keyName}_${option.value}`);
                keyElement2.setAttribute('attr.type', 'boolean');
                keyElement2.setAttribute('for', keyTarget);
                fragment += `${serialize(keyElement2)}`;
              }
            });
            break;
          }
          case variableTypes.scalar:
            keyElement.setAttribute('attr.type', 'float');
            break;
          case variableTypes.text:
          case variableTypes.datetime:
          default:
            keyElement.setAttribute('attr.type', 'string');
        }

        keyElement.setAttribute('for', keyTarget);
        fragment += `${serialize(keyElement)}`;
        done.push(key);
      }
    });
  });
  return fragment;
};

/**
 * Function for creating data elements for ego
 * Ego data elements are attached directly to the <graph> element
 *
 * @param {*} document - the XML ownerDocument
 * @param {Object} ego - an object representing ego
 * @param {Array} excludeList - Attributes to exclude lookup of in codebook
 * @param {Object} codebook - Copy of codebook
 * @param {Object} exportSettings - Export options object
 */
const generateEgoDataElements = (
  document,
  ego,
  excludeList,
  codebook,
  exportSettings,
) => {
  let fragment = '';

  const {
    screenLayoutWidth,
    screenLayoutHeight,
    useScreenLayoutCoordinates,
  } = exportSettings;

  // Get the ego's attributes for looping over later
  const entityAttributes = getEntityAttributes(ego);

  // Create data element for Ego UUID
  fragment += formatAndSerialize(
    createDataElement(
      document,
      { key: ncUUIDProperty },
      ego[entityPrimaryKeyProperty],
    ),
  );

  // Add entity attributes
  Object.keys(entityAttributes).forEach((key) => {
    let keyName = getAttributePropertyFromCodebook(codebook, 'ego', null, key, 'name');
    const keyType = getAttributePropertyFromCodebook(codebook, 'ego', null, key, 'type');

    // Generate sha1 of keyName if it wasn't found in the codebook
    // To ensure NMTOKEN compliance
    if (!keyName) {
      keyName = sha1(key);
    }

    if (!excludeList.includes(keyName) && entityAttributes[key] !== null) {
      if (keyType === 'categorical') {
        const options = getAttributePropertyFromCodebook(codebook, 'ego', null, key, 'options');
        options.forEach((option) => {
          const hashedOptionValue = sha1(option.value);
          const optionKey = `${key}_${hashedOptionValue}`;
          fragment += formatAndSerialize(
            createDataElement(
              document,
              { key: optionKey },
              !!entityAttributes[key] && includes(entityAttributes[key], option.value),
            ),
          );
        });
      } else if (keyType && typeof entityAttributes[key] !== 'object') {
        fragment += formatAndSerialize(createDataElement(document, { key }, entityAttributes[key]));
      } else if (keyType === 'layout') {
        // TODO: can ego have a layout?
        // Determine if we should use the normalized or the "screen space" value
        const xCoord = entityAttributes[key].x;
        const yCoord = entityAttributes[key].y;

        fragment += formatAndSerialize(createDataElement(document, { key: `${key}_X` }, xCoord));
        fragment += formatAndSerialize(createDataElement(document, { key: `${key}_Y` }, yCoord));

        if (useScreenLayoutCoordinates) {
          const screenSpaceXCoord = (xCoord * screenLayoutWidth).toFixed(2);
          const screenSpaceYCoord = ((1.0 - yCoord) * screenLayoutHeight).toFixed(2);
          fragment += formatAndSerialize(createDataElement(document, { key: `${key}_screenSpaceX` }, screenSpaceXCoord));
          fragment += formatAndSerialize(createDataElement(document, { key: `${key}_screenSpaceY` }, screenSpaceYCoord));
        }
      } else {
        fragment += formatAndSerialize(
          createDataElement(document, { key: keyName }, entityAttributes[key]),
        );
      }
    }
  });

  return fragment;
};

// @return {DocumentFragment} a fragment containing all XML elements for the supplied dataList
const generateDataElements = (
  document, // the XML ownerDocument
  entities, // List of nodes or edges or an object representing ego
  type, // Element type to be created. "node" or "egde"
  excludeList, // Attributes to exclude lookup of in codebook
  codebook, // Copy of codebook
  exportSettings, // Export options object
) => {
  let fragment = '';

  const {
    useScreenLayoutCoordinates,
    screenLayoutWidth,
    screenLayoutHeight,
  } = exportSettings;

  // Iterate entities
  entities.forEach((entity) => {
    // Create an element representing the entity (<node> or <edge>)
    const domElement = document.createElement(type);

    // Get the entity's attributes for looping over later
    const entityAttributes = getEntityAttributes(entity);

    // Set the id of the entity element to the export ID property
    domElement.setAttribute('id', type === 'node' ? entity[nodeExportIDProperty] : entity[edgeExportIDProperty]);

    // Create data element for entity UUID
    domElement.appendChild(
      createDataElement(
        document,
        { key: ncUUIDProperty },
        entity[entityPrimaryKeyProperty],
      ),
    );

    // Create data element for entity type
    const entityTypeName = codebook[type][entity.type].name || entity.type;
    domElement.appendChild(createDataElement(document, { key: ncTypeProperty }, entityTypeName));

    // Special handling for model variables and variables unique to entity type
    if (type === 'edge') {
      // Add source and target properties and map
      // them to the _from and _to attributes
      domElement.setAttribute('source', entity[edgeSourceProperty]);
      domElement.setAttribute('target', entity[edgeTargetProperty]);

      // Insert the nc UUID versions of 'to' and 'from' under special properties
      domElement.appendChild(
        createDataElement(
          document,
          { key: ncSourceUUID },
          entity[ncSourceUUID],
        ),
      );

      domElement.appendChild(
        createDataElement(
          document,
          { key: ncTargetUUID },
          entity[ncTargetUUID],
        ),
      );
    } else {
      // For nodes, add a <data> element for the label using the name property
      const entityLabel = () => {
        const variableCalledName = findKey(codebook[type][entity.type].variables, (variable) => variable.name.toLowerCase() === 'name');

        if (variableCalledName && entity[entityAttributesProperty][variableCalledName]) {
          return entity[entityAttributesProperty][variableCalledName];
        }

        return 'Node';
      };

      domElement.appendChild(createDataElement(document, { key: 'label' }, entityLabel()));
    }

    // Add entity attributes
    Object.keys(entityAttributes).forEach((key) => {
      let keyName = getAttributePropertyFromCodebook(codebook, type, entity, key, 'name');
      const keyType = getAttributePropertyFromCodebook(codebook, type, entity, key, 'type');

      // Generate sha1 of keyName if it wasn't found in the codebook
      if (!keyName) {
        keyName = sha1(key);
      }

      if (!excludeList.includes(keyName) && entityAttributes[key] !== null) {
        // Handle categorical variables
        if (keyType === 'categorical') {
          const options = getAttributePropertyFromCodebook(codebook, type, entity, key, 'options');
          options.forEach((option) => {
            const hashedOptionValue = sha1(option.value);
            const optionKey = `${key}_${hashedOptionValue}`;
            domElement.appendChild(createDataElement(
              document,
              { key: optionKey },
              !!entityAttributes[key] && includes(entityAttributes[key], option.value),
            ));
          });
          // Handle all codebook variables apart from layout variables
        } else if (keyType && typeof entityAttributes[key] !== 'object') {
          domElement.appendChild(createDataElement(document, { key }, entityAttributes[key]));
          // Handle layout variables
        } else if (keyType === 'layout') {
          // Determine if we should use the normalized or the "screen space" value
          const xCoord = entityAttributes[key].x;
          const yCoord = entityAttributes[key].y;

          domElement.appendChild(createDataElement(document, { key: `${key}_X` }, xCoord));
          domElement.appendChild(createDataElement(document, { key: `${key}_Y` }, yCoord));

          if (useScreenLayoutCoordinates) {
            const screenSpaceXCoord = (xCoord * screenLayoutWidth).toFixed(2);
            const screenSpaceYCoord = ((1.0 - yCoord) * screenLayoutHeight).toFixed(2);
            domElement.appendChild(createDataElement(document, { key: `${key}_screenSpaceX` }, screenSpaceXCoord));
            domElement.appendChild(createDataElement(document, { key: `${key}_screenSpaceY` }, screenSpaceYCoord));
          }

          // Handle non-codebook variables
        } else {
          // If we reach this point, we could not detect the attribute type by looking
          // in the codebook.
          // We therefore use the SHA1 hash of the name as the key
          domElement.appendChild(
            createDataElement(document, { key: keyName }, entityAttributes[key]),
          );
        }
      }
    });

    fragment += `${formatAndSerialize(domElement)}`;
  });

  return fragment;
};

/**
 * Generator function to supply XML content in chunks to both string and stream producers
 * @param {*} network
 * @param {*} codebook
 * @param {*} exportSettings
 */
function* graphMLGenerator(network, codebook, exportSettings) {
  yield getXmlHeader();
  const xmlDoc = setUpXml(exportSettings, network.sessionVariables);

  const generateEgoKeys = (ego) => generateKeyElements(
    xmlDoc,
    [ego],
    'ego',
    [],
    codebook,
  );

  const generateNodeKeys = (nodes) => generateKeyElements(
    xmlDoc,
    nodes,
    'node',
    [],
    codebook,
    exportSettings.useScreenLayoutCoordinates,
  );

  const generateEdgeKeys = (edges) => generateKeyElements(
    xmlDoc,
    edges,
    'edge',
    [],
    codebook,
  );
  const generateNodeElements = (nodes) => generateDataElements(
    xmlDoc,
    nodes,
    'node',
    [],
    codebook,
    exportSettings,
  );

  const generateEdgeElements = (edges) => generateDataElements(
    xmlDoc,
    edges,
    'edge',
    [],
    codebook,
    exportSettings,
  );

  const generateEgoElements = (ego) => generateEgoDataElements(
    xmlDoc,
    ego,
    [],
    codebook,
    exportSettings,
  );

  // generate keys for ego
  if (exportSettings.unifyNetworks) {
    const combinedEgos = Object.values(network.ego).reduce((union, ego) => ({
      [entityAttributesProperty]:
        { ...union[entityAttributesProperty], ...ego[entityAttributesProperty] },
    }), { [entityAttributesProperty]: {} });

    yield generateEgoKeys(combinedEgos);
  } else {
    yield generateEgoKeys(network.ego);
  }

  // generate keys for nodes
  yield generateNodeKeys(network.nodes);

  // generate keys for edges
  yield generateEdgeKeys(network.edges);

  if (exportSettings.unifyNetworks) {
    // Group nodes and edges by sessionProperty, and then map.
    const groupedNetwork = {
      nodes: groupBy(network.nodes, sessionProperty),
      edges: groupBy(network.edges, sessionProperty),
    };

    /* eslint-disable no-restricted-syntax, guard-for-in, no-unused-vars */
    for (const sessionID in network.sessionVariables) {
      yield getGraphHeader(exportSettings, network.sessionVariables[sessionID]);

      // Add ego to graph
      if (network.ego[sessionID] && codebook.ego) {
        yield generateEgoElements(network.ego[sessionID]);
      }

      // add nodes and edges to graph
      if (groupedNetwork.nodes[sessionID]) {
        for (let i = 0; i < groupedNetwork.nodes[sessionID].length; i += 100) {
          yield generateNodeElements(groupedNetwork.nodes[sessionID].slice(i, i + 100));
        }
      }

      if (groupedNetwork.edges[sessionID]) {
        for (let i = 0; i < groupedNetwork.edges[sessionID].length; i += 100) {
          yield generateEdgeElements(groupedNetwork.edges[sessionID].slice(i, i + 100));
        }
      }

      yield getGraphFooter;
    }
    /* eslint-enable no-restricted-syntax, guard-for-in */
  } else {
    // TODO: reduce duplication with this code
    yield getGraphHeader(exportSettings, network.sessionVariables);

    // Add ego to graph
    if (network.ego && codebook.ego) {
      yield generateEgoElements(network.ego);
    }

    // add nodes and edges to graph
    if (network.nodes) {
      for (let i = 0; i < network.nodes.length; i += 100) {
        yield generateNodeElements(network.nodes.slice(i, i + 100));
      }
    }

    if (network.edges) {
      for (let i = 0; i < network.edges.length; i += 100) {
        yield generateEdgeElements(network.edges.slice(i, i + 100));
      }
    }

    yield getGraphFooter;
  }

  yield xmlFooter;
}

module.exports = graphMLGenerator;
