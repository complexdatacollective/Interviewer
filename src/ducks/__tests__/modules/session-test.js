/* eslint-env jest */

import reducer, {actionCreators, actionTypes} from '../../modules/session';
import { actionTypes as protocolActionTypes } from '../../modules/protocol';

describe('session reducer', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(
      {
        stageIndex: 0,
        stageCount: 0,
      }
    )
  });

  it('should handle SET_PROTOCOL', () => {
    expect(
      reducer([], {
        type: protocolActionTypes.SET_PROTOCOL,
        protocol: {
          stages: Array(3),
        }
      })
    ).toEqual(
      {
        stageIndex: 0,
        stageCount: 3,
      }
    )
  });

  it('should handle NEXT_STAGE', () => {
    expect(
      reducer({
        stageIndex: 0,
        stageCount: 3,
      }, {
        type: actionTypes.NEXT_STAGE
      })
    ).toEqual(
      {
        stageIndex: 1,
        stageCount: 3,
      }
    )

    expect(
      reducer({
        stageIndex: 2,
        stageCount: 3,
      }, {
        type: actionTypes.NEXT_STAGE
      })
    ).toEqual(
      {
        stageIndex: 0,
        stageCount: 3,
      }
    )
  });

  it('should handle PREVIOUS_STAGE', () => {
    expect(
      reducer({
        stageIndex: 2,
        stageCount: 3,
      }, {
        type: actionTypes.PREVIOUS_STAGE
      })
    ).toEqual(
      {
        stageIndex: 1,
        stageCount: 3,
      }
    )

    expect(
      reducer({
        stageIndex: 0,
        stageCount: 3,
      }, {
        type: actionTypes.PREVIOUS_STAGE
      })
    ).toEqual(
      {
        stageIndex: 2,
        stageCount: 3,
      }
    )
  });


});

describe('session actions', () => {
  it('should create a next stage action', () => {
    const expectedAction = {
      type: actionTypes.NEXT_STAGE
    }

    expect(actionCreators.nextStage()).toEqual(expectedAction)
  })

  it('should create a previous stage action', () => {
    const expectedAction = {
      type: actionTypes.PREVIOUS_STAGE
    }

    expect(actionCreators.previousStage()).toEqual(expectedAction)
  })
})
