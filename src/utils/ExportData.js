import { isElectron, isCordova } from './Environment';

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
  } else if (window.ActiveXObject) { // old IE
    xml = new window.ActiveXObject('Microsoft.XMLDOM');
    xml.async = false;
    xml.loadXML(xmlDoc);
  }

  return xml;
};

const generateKeys = (graph, graphML, elements, type, excludeList) => {
// generate keys for attributes
  const done = [];
  elements.forEach((element) => {
    Object.keys(element).forEach((key) => {
      if (done.indexOf(key) === -1 && !excludeList.includes(key)) {
        const keyElement = document.createElementNS(graphML.namespaceURI, 'key');
        keyElement.setAttribute('id', key);
        keyElement.setAttribute('attr.name', key);
        switch (typeof element[key]) {
          case 'boolean':
            keyElement.setAttribute('attr.type', 'boolean');
            break;
          case 'number':
            if (Number.isInteger(element[key])) {
              keyElement.setAttribute('attr.type', 'int');
            } else {
              keyElement.setAttribute('attr.type', 'double');
            }
            break;
          case 'object':
            // special handling for locations
            if (element[key].type && element[key].type === 'layout') {
              keyElement.setAttribute('attr.name', `${key}Y`);
              keyElement.setAttribute('id', `${key}Y`);
              keyElement.setAttribute('attr.type', 'double');
              const keyElement2 = document.createElementNS(graphML.namespaceURI, 'key');
              keyElement2.setAttribute('id', `${key}X`);
              keyElement2.setAttribute('attr.name', `${key}X`);
              keyElement2.setAttribute('attr.type', 'double');
              keyElement2.setAttribute('for', type);
              graphML.insertBefore(keyElement2, graph);
            } else {
              keyElement.setAttribute('attr.type', 'string');
            }
            break;
          default:
            keyElement.setAttribute('attr.type', 'string');
        }
        keyElement.setAttribute('for', type);
        graphML.insertBefore(keyElement, graph);
        done.push(key);
      }
    });
  });
};

const getDataElement = (uri, key, text) => {
  const data = document.createElementNS(uri, 'data');
  data.setAttribute('key', key);
  data.appendChild(document.createTextNode(text));
  return data;
};

const addElements = (graph, uri, dataList, type, excludeList, extra: false) => {
  dataList.forEach((dataElement, index) => {
    const domElement = document.createElementNS(uri, type);
    if (dataElement.id) {
      domElement.setAttribute('id', dataElement.id);
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
        } else if (dataElement[key].type && dataElement[key].type === 'layout') {
          domElement.appendChild(getDataElement(uri, `${key}X`, dataElement[key].x));
          domElement.appendChild(getDataElement(uri, `${key}Y`, dataElement[key].y));
        } else {
          domElement.appendChild(getDataElement(uri, key, JSON.stringify(dataElement[key])));
        }
      }
    });
  });
};

const xmlToString = (xmlData) => {
  let xmlString;
  if (window.ActiveXObject) { // IE
    xmlString = xmlData.xml;
  } else { // code for Mozilla, Firefox, Opera, etc.
    xmlString = (new XMLSerializer()).serializeToString(xmlData);
  }
  return xmlString;
};

const saveFile = (data) => {
  if (isElectron()) { // electron save dialog
    const fs = window.require('fs');
    const { dialog } = window.require('electron').remote;
    dialog.showSaveDialog({ filters: [{ name: 'graphml', extensions: ['graphml'] }] }, (filename) => {
      if (filename === undefined) return;
      fs.writeFile(filename, data, (err) => {
        if (err) {
          dialog.showErrorBox('Error Saving File.', err.message);
        }
      });
    });
  } else if (isCordova()) { // cordova save to downloads
    window.requestFileSystem(window.LocalFileSystem.TEMPORARY, 5 * 1024 * 1024, (fileSystem) => {
      fileSystem.root.getFile('networkcanvas.graphml', {
        create: true,
        exclusive: false,
      }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
          const blob = new Blob([data], { type: 'text/xml' });
          fileWriter.seek(0);
          fileWriter.write(blob);

          const options = {
            message: 'Your network canvas graphml file.', // not supported on some apps
            subject: 'network canvas export',
            files: [fileEntry.toURL()],
            chooserTitle: 'Share file via', // Android only
          };

          const onSuccess = () => {
            // On Android apps result.completed mostly returns false even while it's true
          };

          const onError = (msg) => {
            alert(`Sharing failed with message: ${msg}`);
          };

          window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
        }, () => alert('Sorry! We had a problem writing your file.'));
      }, () => alert('Sorry! We had a problem creating your file.'));
    }, () => alert('Sorry! We had a problem accessing your file system.'));
  } else { // browser save to downloads
    const filename = 'networkcanvas.graphml';
    const blob = new Blob([data], { type: 'text/xml' });
    if (window.navigator.msSaveBlob) { // IE save/open
      window.navigator.msSaveBlob(blob, filename);
    } else { // everything else
      const element = document.createElement('a');
      element.setAttribute('href', window.URL.createObjectURL(blob));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.getElementById('root').appendChild(element);
      element.click();
      document.getElementById('root').removeChild(element);
      window.URL.revokeObjectURL(blob);
    }
  }
};

const createGraphML = (networkData) => {
  // default graph structure
  const xml = setUpXml();
  const graph = xml.getElementsByTagName('graph')[0];
  const graphML = xml.getElementsByTagName('graphml')[0];

  // generate keys for attributes
  generateKeys(graph, graphML, networkData.nodes, 'node', ['id']);
  generateKeys(graph, graphML, networkData.edges, 'edge', ['from', 'to', 'id']);

  // add nodes and edges to graph
  addElements(graph, graphML.namespaceURI, networkData.nodes, 'node', ['id']);
  addElements(graph, graphML.namespaceURI, networkData.edges, 'edge', ['from', 'to', 'id'], true);

  saveFile(xmlToString(xml));
};

export default createGraphML;
