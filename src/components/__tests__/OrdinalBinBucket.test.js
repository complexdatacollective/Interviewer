/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';

import { UnconnectedOrdinalBinBucket as OrdinalBinBucket } from '../OrdinalBinBucket';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';

jest.mock('../../containers/Node');
jest.mock('../../behaviours/selectable', () => el => el);

describe('OrdinalBinBucket', () => {
  let bucket;

  beforeEach(() => {
    bucket = mount(<OrdinalBinBucket nodes={[{}]} />);
  });

  it('renders connected node items', () => {
    expect(bucket.find('Connect(Node)')).toHaveLength(1);
  });

  it('specifies no_scroll on items for improved drag responsiveness', () => {
    expect(bucket.find('Connect(Node)').prop('scrollDirection')).toEqual(NO_SCROLL);
  });
});
