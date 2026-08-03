import { shallow } from 'enzyme';
import { createStore } from 'redux';

import NodeBin from '../NodeBin';

const mockState = {
  draggable: {
    isDragging: true,
    draggableType: 'NODE',
  },
};

describe('NodeBin component', () => {
  it('renders ok', () => {
    const component = shallow(<NodeBin store={createStore(() => mockState)} />);

    expect(component).toMatchSnapshot();
  });
});
