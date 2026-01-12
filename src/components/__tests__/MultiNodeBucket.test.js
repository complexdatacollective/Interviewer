/* eslint-disable @codaco/spellcheck/spell-checker */
import { vi } from 'vitest';
import React from 'react';
import { mount } from 'enzyme';

vi.mock('../../containers/Node');

import MultiNodeBucket from '../MultiNodeBucket';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';

describe('MultiNodeBucket', () => {
  let bucket;

  beforeEach(() => {
    bucket = mount(<MultiNodeBucket nodes={[{}]} sortOrder={[]} />);
  });

  it('renders connected node items', () => {
    expect(bucket.find('Connect(Node)')).toHaveLength(1);
  });

  it('specifies no_scroll on items for improved drag responsiveness', () => {
    expect(bucket.find('Connect(Node)').prop('scrollDirection')).toEqual(NO_SCROLL);
  });
});
