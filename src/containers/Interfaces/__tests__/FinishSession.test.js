/* eslint-env jest */
import React from 'react';
import { render, shallow } from 'enzyme';

import { UnconnectedFinishSession as FinishSession } from '../FinishSession';

jest.mock('../../../behaviours/modal', () => wrapped => wrapped);

const findButtonMatching = (text, container) => (
  container.find('Button').filterWhere(b => b.prop('children') === text)
);

describe('the Finish Interface', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      currentSession: { protocolIdentifier: '1' },
      defaultServer: { apiUrl: 'x.x.x.x' },
    };
  });

  it('Renders a Finish button', () => {
    const elem = shallow(<FinishSession {...mockProps} />);
    expect(findButtonMatching('Finish', elem)).toHaveLength(1);
  });

  it('Renders an export button when session is exportable', () => {
    const elem = shallow(<FinishSession {...mockProps} />);
    expect(findButtonMatching('Export', elem)).toHaveLength(1);
  });

  it('Renders confirmation after export', () => {
    mockProps.currentSession.lastExportedAt = 1529686211439;
    const elem = render(<FinishSession {...mockProps} />);
    expect(elem.text()).toMatch('Export Success');
  });

  it('Skips the export button when session is not exportable', () => {
    mockProps.currentSession.protocolIdentifier = null;
    const elem = shallow(<FinishSession {...mockProps} />);
    expect(elem.find('Button').filterWhere(b => b.prop('children') === 'Export')).toHaveLength(0);
  });

  it('Skips the export button when there is no paired server', () => {
    mockProps.defaultServer = null;
    const elem = shallow(<FinishSession {...mockProps} />);
    expect(elem.find('Button').filterWhere(b => b.prop('children') === 'Export')).toHaveLength(0);
  });
});
