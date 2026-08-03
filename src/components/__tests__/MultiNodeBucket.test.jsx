import { mount } from 'enzyme';
import { vi } from 'vitest';

import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';
import MultiNodeBucket from '../MultiNodeBucket';

vi.mock('../../containers/Node');

describe('MultiNodeBucket', () => {
  let bucket;

  beforeEach(() => {
    bucket = mount(<MultiNodeBucket nodes={[{}]} sortOrder={[]} />);
  });

  it('renders connected node items', () => {
    expect(bucket.find('Connect(Node)')).toHaveLength(1);
  });

  it('specifies no_scroll on items for improved drag responsiveness', () => {
    expect(bucket.find('Connect(Node)').prop('scrollDirection')).toEqual(
      NO_SCROLL,
    );
  });
});
