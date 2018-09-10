/* eslint-env jest */

import * as NameGen from '../name-generator';

const mockPrompt = {
  id: 'promptId123',
  text: 'sample protocol',
  cardOptions: {
    displayLabel: 'card label',
    additionalProperties: ['blue'],
  },
  sortOptions: {
    sortableProperties: ['age'],
    sortOrder: [{
      property: 'name',
      direction: 'asc',
    }],
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
  panels: [
    { foo: 'bar' },
  ],
};

const externalNode = {
  uid: 'person_1',
  type: 'person',
  attributes: {
    name: 'F. Anita',
    nickname: 'Annie',
    age: 23,
  },
};

const mockProtocol = {
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

const personNode = { uid: 1, attributes: { name: 'foo', type: 'person' } };
const closeFriendNode = { uid: 2, attributes: { name: 'bar', type: 'person', close_friend: true } };

const nodes = [personNode, closeFriendNode, { uid: 3, attributes: { name: 'baz', type: 'venue' } }];

const edges = [{ to: 'bar', from: 'foo' }, { to: 'asdf', from: 'qwerty' }];

const mockState = {
  network: { nodes, edges },
  protocol: mockProtocol,
  externalData: {
    schoolPupils: {
      nodes: [externalNode],
    },
  },
};

describe('name generator selector', () => {
  describe('makeGetPanelConfiguration()', () => {
    const getPanelConfiguration = NameGen.makeGetPanelConfiguration();

    it('returns an array of panel configurations', () => {
      const subject = getPanelConfiguration(mockState, mockProps);
      expect(subject[0]).toMatchObject(
        {
          dataSource: 'existing',
          foo: 'bar',
          title: '',
        },
      );
      expect(subject[0]).toHaveProperty('filter');
    });

    it('always returns an array', () => {
      const subject = getPanelConfiguration(
        mockState,
        {
          stage: {
          },
        },
      );

      expect(subject).toEqual([]);
    });
  });
  describe('memoed selectors', () => {
    it('should get node attributes for the prompt', () => {
      const selected = NameGen.makeGetPromptNodeAttributes();
      expect(selected(mockState, mockProps)).toEqual({
        attributes: { close_friend: true },
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
      expect(NameGen.getSortableFields(mockState, mockProps)).toEqual(['age']);
      expect(NameGen.getSortableFields(null, emptyProps)).toEqual([]);
    });

    it('should get sort defaults', () => {
      expect(NameGen.getInitialSortOrder(mockState, mockProps)).toEqual([{ property: 'name', direction: 'asc' }]);
      expect(NameGen.getInitialSortOrder(null, emptyProps)).toEqual([]);
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
