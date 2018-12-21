/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import ConvexHulls from '../ConvexHulls';

describe('<ConvexHulls />', () => {
  it('renders a ConvexHull for each group', () => {
    const props = { nodesByGroup: { groupA: [], groupB: [] }, layoutVariable: '' };
    expect(shallow(<ConvexHulls {...props} />).find('ConvexHull')).toHaveLength(2);
  });
});
