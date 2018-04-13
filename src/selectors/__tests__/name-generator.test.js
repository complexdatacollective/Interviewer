/* eslint-env jest */

import * as NameGen from '../name-generator';
import * as Interface from '../interface';

const mockPrompt = {
  id: 'promptId123',
  text: 'sample protocol',
  cardOptions: {
    displayLabel: 'card label',
    additionalProperties: ['blue'],
  },
  sortOptions: {
    sortableProperties: ['age'],
    sortOrder: {
      name: 'asc',
    },
  },
  dataSource: 'schoolPupils',
};

const mockStage = {
  id: 'stageId123',
  label: 'Welcome',
  type: 'Information',
  title: 'Title for the screen',
  additionalAttributes: {
    close_friend: true,
  },
  subject: {
    entity: 'node',
    type: 'person',
  },
};

const externalNode = {
  uid: 'person_1',
  type: 'person',
  name: 'F. Anita',
  nickname: 'Annie',
  age: 23,
};
const mockProtocol = {
  externalData: {
    schoolPupils: {
      nodes: [externalNode],
    },
  },
  variableRegistry: {
    node: {
      person: {
        iconVariant: 'add-a-person',
      },
    },
  },
};

const mockProps = {
  prompt: mockPrompt,
  stage: mockStage,
};

const emptyProps = {
  prompt: {
    cardOptions: {},
    externalData: {},
  },
  stage: {},
};

const personNode = { uid: 1, name: 'foo', type: 'person' };
const closeFriendNode = { uid: 2, name: 'bar', type: 'person', close_friend: true };

const nodes = [personNode, closeFriendNode, { uid: 3, name: 'baz', type: 'venue' }];

const edges = [{ to: 'bar', from: 'foo' }, { to: 'asdf', from: 'qwerty' }];

const mockState = {
  network: { nodes, edges },
  protocol: mockProtocol,
};

describe('name generator selector', () => {
  describe('memoed selectors', () => {
    it('should get node type', () => {
      const selected = Interface.makeGetNodeType();
      expect(selected(mockState, mockProps)).toEqual('person');
    });

    it('should get node attributes for the prompt', () => {
      const selected = NameGen.makeGetPromptNodeAttributes();
      expect(selected(mockState, mockProps)).toEqual({
        close_friend: true,
        type: 'person',
        promptId: 'promptId123',
        stageId: 'stageId123',
      });
    });

    it('should get card display label', () => {
      expect(NameGen.getCardDisplayLabel(mockState, mockProps)).toEqual('card label');
      expect(NameGen.getCardDisplayLabel(null, emptyProps)).toEqual(undefined);
    });

    it('should get card additional properties', () => {
      expect(NameGen.getCardAdditionalProperties(mockState, mockProps)).toEqual(['blue']);
      expect(NameGen.getCardAdditionalProperties(null, emptyProps)).toEqual([]);
    });

    it('should get sortable properties', () => {
      expect(NameGen.getSortFields(mockState, mockProps)).toEqual(['age']);
      expect(NameGen.getSortFields(null, emptyProps)).toEqual([]);
    });

    it('should get sort order default', () => {
      expect(NameGen.getSortOrderDefault(mockState, mockProps)).toEqual('name');
      expect(NameGen.getSortOrderDefault(null, emptyProps)).toEqual('');
    });

    it('should get sort direction default', () => {
      expect(NameGen.getSortDirectionDefault(mockState, mockProps)).toEqual('asc');
      expect(NameGen.getSortDirectionDefault(null, emptyProps)).toEqual('');
    });

    it('should get data by prompt', () => {
      expect(NameGen.getDataByPrompt(mockState, mockProps)).toEqual([externalNode]);
    });

    it('should get node icon name', () => {
      const selected = NameGen.makeGetNodeIconName();
      expect(selected(mockState, mockProps)).toEqual('add-a-person');
    });
  });
});
