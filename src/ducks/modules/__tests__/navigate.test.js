/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import { last } from 'lodash';
import { actionCreators } from '../navigate';

const getState = vi.fn();

const dispatch = vi.fn((arg) => {
  if (typeof arg === 'function') {
    return arg(dispatch, getState);
  }
  return arg;
});

const mockState = {
  activeSessionId: 'MOCK_SESSION',
  sessions: {
    MOCK_SESSION: {
      promptIndex: 0,
      stageIndex: 0,
      protocolUID: 'MOCK_PROTOCOL',
    },
  },
  installedProtocols: {
    MOCK_PROTOCOL: {
      stages: [
        {
          prompts: [{}, {}],
        },
        {},
      ],
    },
  },
};

const getMockState = (stage, prompt, state = {}) => ({
  ...mockState,
  sessions: {
    MOCK_SESSION: {
      promptIndex: prompt,
      stageIndex: stage,
      protocolUID: 'MOCK_PROTOCOL',
    },
  },
  ...state,
});

describe('navigate actionCreators', () => {
  describe('goToNext()', () => {
    beforeEach(() => {
      dispatch.mockClear();
    });

    describe('forwards', () => {
      it('If there is a next prompt it advances the prompt', () => {
        getState.mockReturnValue(getMockState(0, 0));

        actionCreators.goToNext(1)(dispatch, getState);

        expect(last(dispatch.mock.calls)[0]).toMatchObject({
          promptIndex: 1,
          type: 'UPDATE_PROMPT',
        });
      });

      it('If there is not another prompt it advances the stage', () => {
        getState.mockReturnValue(getMockState(0, 1));

        actionCreators.goToNext(1)(dispatch, getState);

        expect(dispatch.mock.calls.slice(-1)[0][0]).toMatchObject({
          payload: {
            method: 'push',
            args: ['/session/MOCK_SESSION/1'],
          },
          type: '@@router/CALL_HISTORY_METHOD',
        });
      });

      it('Assumes an additional stage for the Finish screen', () => {
        getState.mockReturnValue(getMockState(1, 0));

        actionCreators.goToNext(1)(dispatch, getState);

        expect(dispatch.mock.calls.slice(-1)[0][0]).toMatchObject({
          payload: {
            method: 'push',
            args: ['/session/MOCK_SESSION/2'],
          },
          type: '@@router/CALL_HISTORY_METHOD',
        });
      });

      it('If we are at the end of interview it does nothing', () => {
        getState.mockReturnValue(getMockState(2, 0));

        actionCreators.goToNext(1)(dispatch, getState);

        expect(dispatch.mock.calls).toEqual([]);
      });
    });

    describe('backwards', () => {
      it('If there is a previous prompt it goes back to the previous prompt', () => {
        getState.mockReturnValue(getMockState(0, 1));

        actionCreators.goToNext(-1)(dispatch, getState);

        expect(last(dispatch.mock.calls)[0]).toMatchObject({
          promptIndex: 0,
          type: 'UPDATE_PROMPT',
        });
      });

      it('If there is not another prompt it goes back to the previous stage', () => {
        getState.mockReturnValue(getMockState(1, 0));

        actionCreators.goToNext(-1)(dispatch, getState);

        expect(dispatch.mock.calls.slice(-1)[0][0]).toMatchObject({
          payload: {
            method: 'push',
            args: ['/session/MOCK_SESSION/0/?back'],
          },
          type: '@@router/CALL_HISTORY_METHOD',
        });
      });

      it('Assumes an additional stage for the Finish screen', () => {
        getState.mockReturnValue(getMockState(2, 0));

        actionCreators.goToNext(-1)(dispatch, getState);

        expect(dispatch.mock.calls.slice(-1)[0][0]).toMatchObject({
          payload: {
            method: 'push',
            args: ['/session/MOCK_SESSION/1/?back'],
          },
          type: '@@router/CALL_HISTORY_METHOD',
        });
      });

      it('If we are at the start of interview it does nothing', () => {
        getState.mockReturnValue(getMockState(0, 0));

        actionCreators.goToNext(-1)(dispatch, getState);

        expect(dispatch.mock.calls).toEqual([]);
      });
    });
  });

  it.todo('goToNextStage()');

  it.todo('goToNextPrompt()');

  it.todo('goToStage()');
});
