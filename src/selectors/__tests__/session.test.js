/* eslint-env jest */

import { getSessionPath } from '../session';

const activeSessionId = 'foo';
const mockState = { activeSessionId };

describe('getSessionPath()', () => {
  it('returns session id path for no index', () => {
    expect(getSessionPath(mockState)).toEqual(`/session/${activeSessionId}`);
  });

  it('returns stage path for any index', () => {
    expect(getSessionPath(mockState, 0)).toEqual(`/session/${activeSessionId}/0`);

    expect(getSessionPath(mockState, 5)).toEqual(`/session/${activeSessionId}/5`);
  });
});
