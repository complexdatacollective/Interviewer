/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../prompt';
import { actionTypes as protocolActionTypes } from '../protocol';
import { actionTypes as stageActionTypes } from '../stage';

const stage = {

};

describe('session reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}, stage),
    ).toEqual(
      {
        index: 0,
        counts: [],
      },
    );
  });

  it('should handle SET_PROTOCOL', () => {
    expect(
      reducer([], {
        type: protocolActionTypes.SET_PROTOCOL,
        protocol: {
          stages: [
            { prompts: Array(3) },
            { prompts: Array(1) },
            { prompts: Array(2) },
          ],
        },
      }),
    ).toEqual(
      {
        index: 0,
        counts: [3, 1, 2],
      },
    );
  });

  it('should handle NEXT_PROMPT', () => {
    expect(
      reducer({
        index: 0,
        counts: [3, 1, 2],
      }, {
        type: actionTypes.NEXT_PROMPT,
      }, {
        index: 2,
      }),
    ).toEqual(
      {
        index: 1,
        counts: [3, 1, 2],
      },
    );

    expect(
      reducer({
        index: 1,
        counts: [3, 1, 2],
      }, {
        type: actionTypes.NEXT_PROMPT,
      }, {
        index: 2,
      }),
    ).toEqual(
      {
        index: 0,
        counts: [3, 1, 2],
      },
    );
  });

  it('should handle PREVIOUS_PROMPT', () => {
    expect(
      reducer({
        index: 1,
        counts: [3, 1, 2],
      }, {
        type: actionTypes.PREVIOUS_PROMPT,
      }, {
        index: 2,
      }),
    ).toEqual(
      {
        index: 0,
        counts: [3, 1, 2],
      },
    );

    expect(
      reducer({
        index: 0,
        counts: [3, 1, 2],
      }, {
        type: actionTypes.PREVIOUS_PROMPT,
      }, {
        index: 2,
      }),
    ).toEqual(
      {
        index: 1,
        counts: [3, 1, 2],
      },
    );
  });

  it('should handle SET_STAGE', () => {
    expect(
      reducer({
        index: 2,
        counts: [3, 1, 2],
      }, {
        type: stageActionTypes.SET_STAGE,
      }),
    ).toEqual(
      {
        index: 0,
        counts: [3, 1, 2],
      },
    );
  });
});

describe('session actions', () => {
  it('should create a next stage action', () => {
    const expectedAction = {
      type: actionTypes.NEXT_PROMPT,
    };

    expect(actionCreators.next()).toEqual(expectedAction);
  });

  it('should create a previous stage action', () => {
    const expectedAction = {
      type: actionTypes.PREVIOUS_PROMPT,
    };

    expect(actionCreators.previous()).toEqual(expectedAction);
  });
});
