/* eslint-env jest */

import { actionCreators } from '../navigate';

const dispatch = jest.fn();
const getState = jest.fn();

describe('navigate actionCreators', () => {
  describe('goToNext()', () => {
    it('', () => {
      getState.mockReturnValueOnce({
      });
      actionCreators.goToNext(1)(dispatch, getState);
      expect(dispatch.calls).toBe(null);
    });
  });

  it.todo('goToNextStage()');

  it.todo('goToNextPrompt()');

  it.todo('goToStage()');
});
