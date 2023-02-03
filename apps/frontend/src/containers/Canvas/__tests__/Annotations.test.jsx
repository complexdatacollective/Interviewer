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
    expect(firstLine.find('Fade')).toHaveLength(1);
    expect(firstLine.find('path')).toHaveLength(1);
  });

  it('freezes lines drawn by user', () => {
    const subject = shallow(<Annotations isFrozen />);
    subject.setState({ lines: [[{ x: 0, y: 0 }, { x: 1, y: 1 }]], linesShowing: [true, true] });
    const lines = subject.find('AnnotationLines').dive();
    const firstLine = lines.find('AnnotationLine').dive();
    expect(firstLine.find('Fade')).toHaveLength(0);
    expect(firstLine.find('path')).toHaveLength(1);
  });
});
