/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import { UnconnectedFinishSession as FinishSession } from '../FinishSession';

const findButtonMatching = (text, container) => (
  container.find('Button').filterWhere(b => b.prop('children') === text)
);

describe('the Finish Interface', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      currentSession: {},
      defaultServer: { secureServiceUrl: 'x.x.x.x' },
      remoteProtocolId: 'mockProtocolId',
    };
  });

  it('Renders a Finish button', () => {
    const elem = shallow(<FinishSession {...mockProps} />);
    expect(findButtonMatching('Finish', elem)).toHaveLength(1);
  });
});
