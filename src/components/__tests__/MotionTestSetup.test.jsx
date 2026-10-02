import { mount } from 'enzyme';
import { motion } from 'framer-motion';
import React from 'react';

describe('legacy Motion test setup', () => {
  it('preserves tap and click handlers on synchronous Motion elements', () => {
    const onClick = vi.fn();
    const onTap = vi.fn();
    const component = mount(
      <motion.button onClick={onClick} onTap={onTap} type="button">
        Continue
      </motion.button>,
    );

    expect(component.find('button').prop('onClick')).toBeTypeOf('function');
    component.find('button').simulate('click');

    expect(onTap).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
