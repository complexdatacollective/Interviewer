/* eslint-env jest */

import React from 'react';
import { shallow } from 'enzyme';

import Annotations from '../Annotations';

describe('Annotations', () => {
  it('renders lines drawn by user', () => {
    const subject = shallow(<Annotations />);
    subject.setState({ lines: [[{ x: 0, y: 0 }, { x: 1, y: 1 }]] });
    const lines = subject.find('AnnotationLines').dive();
    const firstLine = lines.find('AnnotationLine').dive();
    expect(firstLine.find('path')).toHaveLength(1);
  });
});
