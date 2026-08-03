import { shallow } from 'enzyme';

import Panels from '../Panel';

describe('Panels component', () => {
  it('renders ok', () => {
    const component = shallow(
      <Panels>
        <span>foo</span>
      </Panels>,
    );

    expect(component).toMatchSnapshot();
  });
});
