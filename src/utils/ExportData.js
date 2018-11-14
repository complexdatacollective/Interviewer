import { findKey, forInRight, isNil } from 'lodash';

import saveFile from './SaveFile';
import { nodePrimaryKeyProperty, nodeAttributesProperty, getNodeAttributes } from '../ducks/modules/network';
import { VariableType, VariableTypeValues } from '../protocol-consts';

const setUpXml = () => {
  const graphMLOutline = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
    'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n' +
    'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n' +
    '  <graph edgedefault="undirected">\n' +
    ' </graph>\n' +
    ' </graphml>\n';

  return (new DOMParser()).parseFromString(graphMLOutline, 'text/xml');
};

const getVariableInfo = (variableRegistry, type, element, key) => (
  variableRegistry[type] && variableRegistry[type][element.type] &&
  variableRegistry[type][element.type].variables &&
  variableRegistry[type][element.type].variables[key]
);

const isVariableRegistryExists = (variableRegistry, type, element, key) => {
  const variableInfo = getVariableInfo(variableRegistry, type, element, key);
  return variableInfo && variableInfo.type && VariableTypeValues.includes(variableInfo.type);
};

const getTypeFromVariableRegistry = (variableRegistry, type, element, key, variableAttribute = 'type') => {
  const variableInfo = getVariableInfo(variableRegistry, type, element, key);
  return variableInfo && variableInfo[variableAttribute];
};

// returns a graphml type
const getTypeForKey = (data, key) => (
  data.reduce((result, value) => {
    const attrs = getNodeAttributes(value);
    if (isNil(attrs[key])) return result;
    let currentType = typeof attrs[key];
    if (currentType === 'number') {
      currentType = Number.isInteger(attrs[key]) ? 'integer' : 'double';
      if (result && currentType !== result) return 'double';
    }
    if (String(Number.parseInt(attrs[key], 10)) === attrs[key]) {
      currentType = 'integer';
      if (result === 'double') return 'double';
    } else if (String(Number.parseFloat(attrs[key], 10)) === attrs[key]) {
      currentType = 'double';
      if (result === 'integer') return 'double';
    }
    if (isNil(currentType)) return result;
    if (currentType === result || result === '') return currentType;
    return 'string';
  }, ''));

const generateKeys = (
  graph, // <Graph> Element
  graphML, // <GraphML> Element
  elements, // networkData.nodes
  type, // 'node' - node type?
  excludeList, // Variables to exlude
  variableRegistry, // variable registry
  layoutVariable, // boolean value uses for edges?
) => {
  // generate keys for attributes
  const missingVariables = [];
  const done = [];

  // add keys for gephi positions
  if (layoutVariable) {
    const xElement = document.createElementNS(graphML.namespaceURI, 'key');
    xElement.setAttribute('id', 'x');
    xElement.setAttribute('attr.name', 'x');
    xElement.setAttribute('attr.type', 'double');
    xElement.setAttribute('for', type);
    graphML.insertBefore(xElement, graph);
    const yElement = document.createElementNS(graphML.namespaceURI, 'key');
    yElement.setAttribute('id', 'y');
    yElement.setAttribute('attr.name', 'y');
    yElement.setAttribute('attr.type', 'double');
    yElement.setAttribute('for', type);
    graphML.insertBefore(yElement, graph);
  }

  if (type === 'edge') {
    const label = document.createElementNS(graphML.namespaceURI, 'key');
    label.setAttribute('id', 'label');
    label.setAttribute('attr.name', 'label');
    label.setAttribute('attr.type', 'string');
    label.setAttribute('for', type);
    graphML.insertBefore(label, graph);
  }

  elements.forEach((element) => {
    let iterableElement = element;
    if (type === 'node') {
      iterableElement = getNodeAttributes(element);
    }
    // Node data model attributes are now stored under a specific propertyy

    Object.keys(iterableElement).forEach((key) => {
      // transpose ids to names based on registry
      const keyName = getTypeFromVariableRegistry(variableRegistry, type, element, key, 'name') || key;
      if (done.indexOf(keyName) === -1 && !excludeList.includes(keyName)) {
        const keyElement = document.createElementNS(graphML.namespaceURI, 'key');
        keyElement.setAttribute('id', keyName);
        keyElement.setAttribute('attr.name', keyName);

        if (!isVariableRegistryExists(variableRegistry, type, element, key)) {
          missingVariables.push(`"${key}" in ${type}.${element.type}`);
        }

        const variableType = getTypeFromVariableRegistry(variableRegistry, type, element, key);
        switch (variableType) {
          case VariableType.boolean:
            keyElement.setAttribute('attr.type', variableType);
            break;
          case VariableType.ordinal:
          case VariableType.number: {
            const keyType = getTypeForKey(elements, key);
            keyElement.setAttribute('attr.type', keyType);
            break;
          }
          case VariableType.layout: {
            // special handling for locations
            keyElement.setAttribute('attr.name', `${keyName}Y`);
            keyElement.setAttribute('id', `${keyName}Y`);
            keyElement.setAttribute('attr.type', 'double');
            const keyElement2 = document.createElementNS(graphML.namespaceURI, 'key');
            keyElement2.setAttribute('id', `${keyName}X`);
            keyElement2.setAttribute('attr.name', `${keyName}X`);
            keyElement2.setAttribute('attr.type', 'double');
            keyElement2.setAttribute('for', type);
            graphML.insertBefore(keyElement2, graph);
            break;
          }
          case VariableType.text:
          case VariableType.datetime:
          case VariableType.categorical:
          case VariableType.location: // TODO: special handling?
          default:
            keyElement.setAttribute('attr.type', 'string');
        }
        keyElement.setAttribute('for', type);
        graphML.insertBefore(keyElement, graph);
        done.push(keyName);
      }
    });
  });
  return missingVariables;
};

const getDataElement = (uri, key, text) => {
  const data = document.createElementNS(uri, 'data');
  data.setAttribute('key', key);
  data.appendChild(document.createTextNode(text));
  return data;
};

const addElements = (
  graph, // <Graph> XML Element
  uri, // the xmlns attribute from <GraphML>
  dataList, // List of nodes or edges
  type, // Element type to be created. "node" or "egde"
  excludeList, // Attributes to exclude lookup of in variable registry
  variableRegistry, // Copy of variable registry
  layoutVariable, // Primary layout variable. Null for edges
  extra = false, // ???
) => {
  dataList.forEach((dataElement, index) => {
    const domElement = document.createElementNS(uri, type);
    const nodeAttrs = getNodeAttributes(dataElement);

    if (dataElement[nodePrimaryKeyProperty]) {
      domElement.setAttribute('id', dataElement[nodePrimaryKeyProperty]);
    } else {
      domElement.setAttribute('id', index);
    }
    if (extra) domElement.setAttribute('source', dataElement.from);
    if (extra) domElement.setAttribute('target', dataElement.to);
    graph.appendChild(domElement);

    if (extra) {
      const label = variableRegistry && variableRegistry[type] &&
        variableRegistry[type][dataElement.type] && (variableRegistry[type][dataElement.type].name
          || variableRegistry[type][dataElement.type].label);
      domElement.appendChild(getDataElement(uri, 'label', label));
    }

    // Add node attributes
    if (type === 'node') {
      Object.keys(nodeAttrs).forEach((key) => {
        const keyName = getTypeFromVariableRegistry(variableRegistry, type, dataElement, key, 'name') || key;
        if (!excludeList.includes(keyName)) {
          if (typeof nodeAttrs[key] !== 'object') {
            domElement.appendChild(
              getDataElement(uri, keyName, nodeAttrs[key]));
          } else if (getTypeFromVariableRegistry(variableRegistry, type, dataElement, key) === 'layout') {
            domElement.appendChild(getDataElement(uri, `${keyName}X`, nodeAttrs[key].x));
            domElement.appendChild(getDataElement(uri, `${keyName}Y`, nodeAttrs[key].y));
          } else {
            domElement.appendChild(
              getDataElement(uri, keyName, JSON.stringify(nodeAttrs[key])));
          }
        }
      });
    } else {
      Object.keys(dataElement).forEach((key) => {
        const keyName = getTypeFromVariableRegistry(variableRegistry, type, dataElement, key, 'name') || key;
        if (!excludeList.includes(keyName)) {
          if (typeof dataElement[key] !== 'object') {
            domElement.appendChild(getDataElement(uri, keyName, dataElement[key]));
          } else if (getTypeFromVariableRegistry(variableRegistry, type, dataElement, key) === 'layout') {
            domElement.appendChild(getDataElement(uri, `${keyName}X`, dataElement[key].x));
            domElement.appendChild(getDataElement(uri, `${keyName}Y`, dataElement[key].y));
          } else {
            domElement.appendChild(getDataElement(uri, keyName, JSON.stringify(dataElement[key])));
          }
        }
      });
    }

    // add positions for gephi
    if (layoutVariable && nodeAttrs[layoutVariable]) {
      domElement.appendChild(getDataElement(uri, 'x', nodeAttrs[layoutVariable].x * window.innerWidth));
      domElement.appendChild(getDataElement(uri, 'y', (1.0 - nodeAttrs[layoutVariable].y) * window.innerHeight));
    }
  });
};

const xmlToString = (xmlData) => {
  let xmlString;
  if (window.ActiveXObject) { // IE
    xmlString = xmlData.xml;
  } else { // code for Mozilla, Firefox, Opera, etc.
    xmlString = (new window.XMLSerializer()).serializeToString(xmlData);
  }
  return xmlString;
};

const createGraphML = (networkData, variableRegistry, onError) => {
  // default graph structure
  const xml = setUpXml();
  const graph = xml.getElementsByTagName('graph')[0];
  const graphML = xml.getElementsByTagName('graphml')[0];

  // find the first variable of type layout
  let layoutVariable;
  forInRight(variableRegistry.node, (value) => {
    layoutVariable = findKey(value.variables, { type: 'layout' });
  });

  // generate keys for nodes
  let missingVariables = generateKeys(
    graph,
    graphML,
    networkData.nodes,
    'node',
    [nodePrimaryKeyProperty],
    variableRegistry,
    layoutVariable,
  );

  // generate keys for edges and add to keys for nodes
  missingVariables = missingVariables.concat(generateKeys(
    graph,
    graphML,
    networkData.edges,
    'edge',
    ['from', 'to', 'type'],
    variableRegistry,
  ));

  if (missingVariables.length > 0) {
    // hard fail if checking the registry fails
    // remove this to fall back to using "text" for unknowns
    // onError(`The variable registry seems to be missing
    // "type" of: ${join(missingVariables, ', ')}.`);
    // return null;
  }

  // add nodes and edges to graph
  addElements(graph, graphML.namespaceURI, networkData.nodes, 'node', [nodePrimaryKeyProperty, nodeAttributesProperty], variableRegistry, layoutVariable);
  addElements(graph, graphML.namespaceURI, networkData.edges, 'edge', ['from', 'to', 'type'], variableRegistry, null, true);

  return saveFile(xmlToString(xml), onError, 'graphml', ['graphml'], 'networkcanvas.graphml', 'text/xml',
    { message: 'Your network canvas graphml file.', subject: 'network canvas export' });
};

export default createGraphML;
