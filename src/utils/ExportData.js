import { findKey, forInRight, isNil, join } from 'lodash';

import saveFile from './SaveFile';
import { NodePrimaryKeyProperty } from '../ducks/modules/network';

const setUpXml = () => {
  const xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"\n' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
    'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns\n' +
    'http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n' +
    '  <graph edgedefault="undirected">\n' +
    ' </graph>\n' +
    ' </graphml>\n';

  let xml = '';
  if (window.DOMParser) { // Standard
    xml = (new DOMParser()).parseFromString(xmlDoc, 'text/xml');
  }
  return xml;
};

const getVariableInfo = (variableRegistry, type, element, key) => (
  variableRegistry[type] && variableRegistry[type][element.type] &&
  variableRegistry[type][element.type].variables &&
  variableRegistry[type][element.type].variables[key]
);

const isVariableRegistryExists = (variableRegistry, type, element, key) => {
  const knownTypes = ['boolean', 'text', 'number', 'datetime', 'categorical', 'ordinal', 'layout',
    'location'];
  const variableInfo = getVariableInfo(variableRegistry, type, element, key);
  return variableInfo && variableInfo.type && knownTypes.includes(variableInfo.type);
};

const getTypeFromVariableRegistry = (variableRegistry, type, element, key) => {
  const variableInfo = getVariableInfo(variableRegistry, type, element, key);
  return variableInfo && variableInfo.type;
};

const getTypeForKey = (data, key) => (
  data.reduce((result, value) => {
    if (isNil(value[key])) return result;
    let currentType = typeof value[key];
    if (currentType === 'number') {
      currentType = Number.isInteger(value[key]) ? 'integer' : 'double';
      if (result && currentType !== result) return 'double';
    }
    if (String(Number.parseInt(value[key], 10)) === value[key]) {
      currentType = 'integer';
      if (result === 'double') return 'double';
    } else if (String(Number.parseFloat(value[key], 10)) === value[key]) {
      currentType = 'double';
      if (result === 'integer') return 'double';
    }
    if (isNil(currentType)) return result;
    if (currentType === result || result === '') return currentType;
    return 'string';
  }, ''));

const generateKeys = (graph, graphML, elements, type, excludeList, variableRegistry,
  layoutVariable) => {
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

  elements.forEach((element) => {
    Object.keys(element).forEach((key) => {
      if (done.indexOf(key) === -1 && !excludeList.includes(key)) {
        const keyElement = document.createElementNS(graphML.namespaceURI, 'key');
        keyElement.setAttribute('id', key);
        keyElement.setAttribute('attr.name', key);

        if (!isVariableRegistryExists(variableRegistry, type, element, key)) {
          missingVariables.push(`"${key}" in ${type}.${element.type}`);
        }

        switch (getTypeFromVariableRegistry(variableRegistry, type, element, key)) {
          case 'boolean':
            keyElement.setAttribute('attr.type', 'boolean');
            break;
          case 'integer':
            keyElement.setAttribute('attr.type', 'integer');
            break;
          case 'double':
            keyElement.setAttribute('attr.type', 'double');
            break;
          case 'ordinal':
          case 'number': {
            const keyType = getTypeForKey(elements, key);
            keyElement.setAttribute('attr.type', keyType);
            break;
          }
          case 'layout': {
            // special handling for locations
            keyElement.setAttribute('attr.name', `${key}Y`);
            keyElement.setAttribute('id', `${key}Y`);
            keyElement.setAttribute('attr.type', 'double');
            const keyElement2 = document.createElementNS(graphML.namespaceURI, 'key');
            keyElement2.setAttribute('id', `${key}X`);
            keyElement2.setAttribute('attr.name', `${key}X`);
            keyElement2.setAttribute('attr.type', 'double');
            keyElement2.setAttribute('for', type);
            graphML.insertBefore(keyElement2, graph);
            break;
          }
          case 'text':
          case 'datetime':
          case 'categorical':
          case 'location':
          default:
            keyElement.setAttribute('attr.type', 'string');
        }
        keyElement.setAttribute('for', type);
        graphML.insertBefore(keyElement, graph);
        done.push(key);
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
  graph,
  uri,
  dataList,
  type,
  excludeList,
  variableRegistry,
  layoutVariable,
  extra = false) => {
  dataList.forEach((dataElement, index) => {
    const domElement = document.createElementNS(uri, type);
    if (dataElement[NodePrimaryKeyProperty]) {
      domElement.setAttribute('id', dataElement[NodePrimaryKeyProperty]);
    } else {
      domElement.setAttribute('id', index);
    }
    if (extra) domElement.setAttribute('source', dataElement.from);
    if (extra) domElement.setAttribute('target', dataElement.to);
    graph.appendChild(domElement);

    Object.keys(dataElement).forEach((key) => {
      if (!excludeList.includes(key)) {
        if (typeof dataElement[key] !== 'object') {
          domElement.appendChild(getDataElement(uri, key, dataElement[key]));
        } else if (getTypeFromVariableRegistry(variableRegistry, type, dataElement, key) === 'layout') {
          domElement.appendChild(getDataElement(uri, `${key}X`, dataElement[key].x));
          domElement.appendChild(getDataElement(uri, `${key}Y`, dataElement[key].y));
        } else {
          domElement.appendChild(getDataElement(uri, key, JSON.stringify(dataElement[key])));
        }
      }
    });

    // add positions for gephi
    if (layoutVariable && dataElement[layoutVariable]) {
      domElement.appendChild(getDataElement(uri, 'x', dataElement[layoutVariable].x * window.innerWidth));
      domElement.appendChild(getDataElement(uri, 'y', (1.0 - dataElement[layoutVariable].y) * window.innerHeight));
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

const createGraphML = (networkData, variableRegistry, openErrorDialog) => {
  // default graph structure
  const xml = setUpXml();
  const graph = xml.getElementsByTagName('graph')[0];
  const graphML = xml.getElementsByTagName('graphml')[0];

  // find the first variable of type layout
  let layoutVariable;
  forInRight(variableRegistry.node, (value) => {
    layoutVariable = findKey(value.variables, { type: 'layout' });
  });

  // generate keys for attributes
  let missingVariables = generateKeys(graph, graphML, networkData.nodes, 'node', [NodePrimaryKeyProperty], variableRegistry, layoutVariable);
  missingVariables = missingVariables.concat(generateKeys(graph, graphML, networkData.edges, 'edge', ['from', 'to'], variableRegistry));
  if (missingVariables.length > 0) {
    // hard fail if checking the registry fails
    // remove this to fall back to using "text" for unknowns
    openErrorDialog(`The variable registry seems to be missing "type" of: ${join(missingVariables, ', ')}.`);
    return null;
  }

  // add nodes and edges to graph
  addElements(graph, graphML.namespaceURI, networkData.nodes, 'node', [NodePrimaryKeyProperty], variableRegistry, layoutVariable);
  addElements(graph, graphML.namespaceURI, networkData.edges, 'edge', ['from', 'to'], variableRegistry, null, true);

  return saveFile(xmlToString(xml), openErrorDialog, 'graphml', ['graphml'], 'networkcanvas.graphml', 'text/xml',
    { message: 'Your network canvas graphml file.', subject: 'network canvas export' });
};

export default createGraphML;
