const { isNil } = require('lodash');
const { variableTypes } = require('@codaco/shared-consts');
const { getEntityAttributes } = require('../../utils/general');

// Gephi does not support long lines in graphML, meaning we need to "beautify" the output
const formatXml = (xml, tab = '\t') => { // tab = optional indent value, default is tab (\t)
  let formatted = '';
  let indent = '';

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length); // decrease indent by one 'tab'
    formatted += `${indent}<${node}>\r\n`;
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab; // increase indent
  });
  return formatted.substring(1, formatted.length - 3);
};

const VariableTypeValues = Object.freeze(Object.values(variableTypes));

/**
 * For a given key, return a valid Graphml data 'type' for encoding
 * Graphml types are extended from xs:NMTOKEN:
 *   - boolean
 *   - int
 *   - long
 *   - float
 *   - double
 *   - string
 *
 * @param {*} data
 * @param {*} key
 */
const getGraphMLTypeForKey = (data, key) => (
  data.reduce((result, value) => {
    const attrs = getEntityAttributes(value);
    if (isNil(attrs[key])) return result;
    let currentType = typeof attrs[key];
    if (currentType === 'number') {
      currentType = Number.isInteger(attrs[key]) ? 'int' : 'double';
      if (result && currentType !== result) return 'double';
    }
    if (String(Number.parseInt(attrs[key], 10)) === attrs[key]) {
      currentType = 'int';
      if (result === 'double') return 'double';
    } else if (String(Number.parseFloat(attrs[key], 10)) === attrs[key]) {
      currentType = 'double';
      if (result === 'int') return 'double';
    }
    if (isNil(currentType)) return result;
    if (currentType === result || result === '') return currentType;
    return 'string';
  }, ''));

/**
 * Given a codebook, an entity type, an entity, and an attribute key:
 * retrieve the key value from the entity, via the codebook.
 * @param {*} codebook
 * @param {*} type
 * @param {*} entity
 * @param {*} key
 */
const getVariableInfo = (codebook, type, entity, key) => (
  codebook[type]
  && codebook[type][entity.type]
  && codebook[type][entity.type].variables
  && codebook[type][entity.type].variables[key]
);

/**
 * Ego version of getVariableInfo
 * @param {*} codebook
 * @param {*} type
 * @param {*} key
 */
const getEgoVariableInfo = (codebook, key) => (
  codebook.ego
  && codebook.ego.variables
  && codebook.ego.variables[key]
);

/**
 * Determine if a given variable is one of the valid NC vattribute types
 * @param {*} codebook
 * @param {*} type
 * @param {*} element
 * @param {*} key
 */
const codebookExists = (codebook, type, element, key) => {
  const variableInfo = getVariableInfo(codebook, type, element, key);
  return variableInfo && variableInfo.type && VariableTypeValues.includes(variableInfo.type);
};

/**
 * Get the 'type' of a given variable from the codebook
 * @param {*} codebook
 * @param {*} type node, edge, or ego
 * @param {*} element entity 'type' (person, place, friend, etc.). not used for ego
 * @param {*} key key within element to select
 * @param {*} variableAttribute property of key to return
 */
const getAttributePropertyFromCodebook = (codebook, type, element, key, attributeProperty = 'type') => {
  if (type === 'ego') {
    const variableInfo = getEgoVariableInfo(codebook, key);
    return variableInfo && variableInfo[attributeProperty];
  }
  const variableInfo = getVariableInfo(codebook, type, element, key);
  return variableInfo && variableInfo[attributeProperty];
};

const createElement = (xmlDoc, tagName, attrs = {}, child = null) => {
  const element = xmlDoc.createElement(tagName);
  Object.entries(attrs).forEach(([key, val]) => {
    element.setAttribute(key, val);
  });
  if (child) {
    element.appendChild(child);
  }
  return element;
};

const createDataElement = (xmlDoc, attributes, text) => createElement(xmlDoc, 'data', attributes, xmlDoc.createTextNode(text));

module.exports = {
  codebookExists,
  createDataElement,
  createElement,
  formatXml,
  getAttributePropertyFromCodebook,
  getEgoVariableInfo,
  getGraphMLTypeForKey,
  getVariableInfo,
  VariableTypeValues,
};
