/* eslint-env jest */

import reducer, { actionCreators, actionTypes } from '../../modules/stage';
import { actionTypes as protocolActionTypes } from '../../modules/protocol';

describe('session reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {}),
    ).toEqual(
      {
        index: 0,
        count: 0,
      },
    );
  });

  it('should handle SET_PROTOCOL', () => {
    expect(
      reducer([], {
        type: protocolActionTypes.SET_PROTOCOL,
        protocol: {
          stages: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        },
      }),
    ).toEqual(
      {
        index: 0,
        count: 3,
      },
    );
  });

  it('should handle NEXT_STAGE', () => {
    expect(
      reducer({
        index: 0,
        count: 3,
      }, {
        type: actionTypes.NEXT_STAGE,
      }),
    ).toEqual(
      {
        index: 1,
        count: 3,
      },
    );

    expect(
      reducer({
        index: 2,
        count: 3,
      }, {
        type: actionTypes.NEXT_STAGE,
      }),
    ).toEqual(
      {
        index: 0,
        count: 3,
      },
    );
  });

  it('should handle PREVIOUS_STAGE', () => {
    expect(
      reducer({
        index: 2,
        count: 3,
      }, {
        type: actionTypes.PREVIOUS_STAGE,
      }),
    ).toEqual(
      {
        index: 1,
        count: 3,
      },
    );

    expect(
      reducer({
        index: 0,
        count: 3,
      }, {
        type: actionTypes.PREVIOUS_STAGE,
      }),
    ).toEqual(
      {
        index: 2,
        count: 3,
      },
    );
  });

  it('should handle SET_STAGE', () => {
    expect(
      reducer({
        index: 0,
        count: 3,
      }, {
        type: actionTypes.SET_STAGE,
        stages: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        id: 'd',
      }),
    ).toEqual(
      {
        index: 0,
        count: 3,
      },
    );

    expect(
      reducer({
        index: 1,
        count: 3,
      }, {
        type: actionTypes.SET_STAGE,
        stages: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        id: 'c',
      }),
    ).toEqual(
      {
        index: 2,
        count: 3,
      },
    );
  });
});

describe('session actions', () => {
  it('should create a next stage action', () => {
    const expectedAction = {
      type: actionTypes.NEXT_STAGE,
    };

    expect(actionCreators.next()).toEqual(expectedAction);
  });

  it('should create a previous stage action', () => {
    const expectedAction = {
      type: actionTypes.PREVIOUS_STAGE,
    };

    expect(actionCreators.previous()).toEqual(expectedAction);
  });

  it('should create a set stage action', () => {
    const expectedAction = {
      type: actionTypes.SET_STAGE,
    };

    expect(actionCreators.setStage()).toEqual(expectedAction);
  });
});
