/* eslint-env jest */
import saveFile from '../SaveFile';
import ExportData from '../ExportData';
import { NodePK } from '../../ducks/modules/network';

function mockSerializeToString() {
  return { serializeToString: xmlData => xmlData.documentElement.outerHTML };
}
window.XMLSerializer = window.XMLSerializer || mockSerializeToString;

jest.mock('../SaveFile');
saveFile.mockImplementation(data => data);

const variableRegistry = {
  node: {
    person: {
      variables: {
        type: { type: 'text' },
        name: { type: 'text' },
        aString: { type: 'text' },
        aNumber: { type: 'number' },
        bNumber: { type: 'number' },
        cNumber: { type: 'number' },
        aBoolean: { type: 'boolean' },
        aDatetime: { type: 'datetime' },
        aCategorical: { type: 'categorical' },
        aOrdinal: { type: 'ordinal' },
        aLayout: { type: 'layout' },
        aLocation: { type: 'location' },
      },
    },
  },
  edge: {
    friend: {
      variables: {
        type: { type: 'text' },
        connected: { type: 'boolean' },
      },
    },
  },
};

const sessionA = {
  network: {
    edges: [
      { type: 'friend', to: 1, from: 2, connected: true },
    ],
    edgo: {},
    nodes: [
      { [NodePK]: 1,
        type: 'person',
        name: 'soAndSo',
        aString: 'content',
        aNumber: 123,
        bNumber: 0.33,
        cNumber: 3,
        aBoolean: true,
        aDatetime: 1529349451847,
        aCategorical: 24,
        aOrdinal: 1,
        aLayout: { x: 0.4134, y: 0.2356 },
        aLocation: { latitude: 41.799756, longitude: -87.66443 },
      },
      { [NodePK]: 2,
        type: 'person',
        name: 'whoDunnit',
        aString: 'Another Content',
        aNumber: 456,
        bNumber: 1.8,
        cNumber: 33,
        aBoolean: false,
        aDatetime: 1529343481847,
        aCategorical: 77,
        aOrdinal: 2,
        aLayout: { x: 0.3434, y: 0.3156 },
        aLocation: { latitude: 44.9756, longitude: 18.443 },
      },
      { [NodePK]: 3,
        type: 'person',
        name: 'whatsErName',
        aString: 'More Content',
        aNumber: 789,
        bNumber: 0.43,
        cNumber: 0.1,
        aBoolean: true,
        aDatetime: 1579349481847,
        aCategorical: 34,
        aOrdinal: -1,
        aLayout: { x: 0.1134, y: 0.7356 },
        aLocation: { latitude: 13.9756, longitude: -27.443 },
      },
    ],
  },
};

describe('export data function', () => {
  it('should create valid xml for network data', () => {
    const xmlResult = ExportData(sessionA.network, variableRegistry, () => {});
    expect(xmlResult).toMatchSnapshot();
  });

  it('translates node primary key to "id" attribute', () => {
    const xml = ExportData(sessionA.network, variableRegistry, () => {});
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const node = doc.querySelector('graph node:first-child');
    expect(node.id).toEqual(`${sessionA.network.nodes[0][NodePK]}`);
    expect(node.querySelector(`[key="${NodePK}"]`)).toBe(null);
  });
});
