import { shallow } from 'enzyme';
import { createStore } from 'redux';

import DropZone from '../DropZone';

const mockStore = createStore(() => ({ droppable: { activeZones: [] } }));

describe('DropZone component', () => {
  it('renders ok', () => {
    const component = shallow(<DropZone id="foo" store={mockStore} />);

    expect(component).toMatchSnapshot();
  });
});
