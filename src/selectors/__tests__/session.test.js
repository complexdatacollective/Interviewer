/* eslint-env jest */

import * as Session from '../session';

const mockStage = {
  id: 'stageId123',
  label: 'Welcome',
  type: 'Information',
  title: 'Title for the screen',
};

const mockProps = {
  stage: mockStage,
};

const mockState = {
  menu: {
    sessionMenuIsOpen: false,
    stageMenuIsOpen: true,
    stageSearchTerm: 'elc',
  },
  protocol: {
    stages: [mockStage, {
      label: 'Not Here',
    }],
  },
};

describe('session selector', () => {
  describe('memoed selectors', () => {
    it('should get session menu is open', () => {
      expect(Session.sessionMenuIsOpen(mockState)).toEqual(false);
    });

    it('should get stage menu is open', () => {
      expect(Session.stageMenuIsOpen(mockState)).toEqual(true);
    });

    it('should get stage search term', () => {
      expect(Session.stageSearchTerm(mockState)).toEqual('elc');
    });

    it('should get stage search term', () => {
      expect(Session.filteredStages(mockState)).toEqual([mockStage]);
    });
  });
});
