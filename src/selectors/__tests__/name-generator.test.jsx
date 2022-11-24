/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import * as NameGen from '../name-generator';

const mockPrompt = {
  id: 'promptId123',
  text: 'sample protocol',
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

const mockProtocol = {
  codebook: {
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
  prompt: {},
  stage: {
    cardOptions: {},
    externalData: {},
  },
};

const personNode = { uid: 1, attributes: { name: 'foo', type: 'person' } };
const closeFriendNode = { uid: 2, attributes: { name: 'bar', type: 'person', close_friend: true } };

const nodes = [personNode, closeFriendNode, { uid: 3, attributes: { name: 'baz', type: 'venue' } }];

const edges = [{ to: 'bar', from: 'foo' }, { to: 'asdf', from: 'qwerty' }];

const mockState = {
  activeSessionId: 'a',
  sessions: {
    a: {
      network: { nodes, edges },
      protocolUID: 'mockProtocol',
    },
  },
  installedProtocols: {
    mockProtocol,
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

    it('should get node icon name', () => {
      const selected = NameGen.makeGetNodeIconName();
      expect(selected(mockState, mockProps)).toEqual('add-a-person');
    });
  });
});
