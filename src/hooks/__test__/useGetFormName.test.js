/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import React from 'react';
import { mount } from 'enzyme';
import useGetFormName from '../useGetFormName';

describe('useGetFormName', () => {
  /**
   * formName should be in the format:
   * const formName = getFormName(uid); // `${prefix}_$uid`
   * where prefix is generated on intial render and when stage id changes
   */

  it('form name prefix does not change unless stage id changes', () => {
    const MockComponent = ({ stage, uid }) => {
      const getFormName = useGetFormName(stage);
      return getFormName(uid);
    };

    const result = mount(<MockComponent uid={1} stage={{ id: 'foo' }} />);

    const formName1 = result.text();
    const formName2 = result.setProps({ uid: 2 }).text();
    const formName3 = result.setProps({ uid: 1, stage: { id: 'bazz' } }).text();

    expect(formName1.slice(0, -2)).toEqual(formName2.slice(0, -2));
    expect(formName3.slice(0, -2)).not.toEqual(formName1.slice(0, -2));
  });

  it('form name uid is set when calling getFormName', () => {
    const MockComponent = ({ stage, uid }) => {
      const getFormName = useGetFormName(stage);
      return getFormName(uid);
    };

    const result = mount(<MockComponent uid={1} stage={{ id: 'foo' }} />);

    const formName1 = result.text();
    const formName2 = result.setProps({ uid: 2 }).text();
    const formName3 = result.setProps({ uid: 3, stage: { id: 'bazz' } }).text();

    expect(formName1.slice(-2)).toEqual('_1');
    expect(formName2.slice(-2)).toEqual('_2');
    expect(formName3.slice(-2)).toEqual('_3');
  });

  it('form uid is optional', () => {
    const MockComponent = ({ stage, uid }) => {
      const getFormName = useGetFormName(stage);
      return getFormName(uid);
    };

    const result = mount(<MockComponent uid={null} stage={{ id: 'foo' }} />);

    const formName1 = result.text();
    const formName2 = result.setProps({ miscProp: 'foo' }).text();

    expect(formName1).toEqual(formName2);
  });
});
