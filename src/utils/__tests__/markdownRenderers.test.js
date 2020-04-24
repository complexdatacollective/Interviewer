/* eslint-env jest */
/* eslint-disable @codaco/spellcheck/spell-checker */

import { shallow } from 'enzyme';

import markdownRenderers from '../markdownRenderers';

describe('markdownRenderers', () => {
  describe('externalLinkRenderer', () => {
    it('renders links in with a _blank target', () => {
      const a = shallow(markdownRenderers.link({ href: '', children: [] }));
      expect(a.prop('target')).toEqual('_blank');
    });

    it('adds emoji support to text', () => {
      const text = markdownRenderers.text(':100:');
      expect(text).toEqual('💯');
    });
  });
});
