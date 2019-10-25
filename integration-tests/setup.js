/* eslint-env jest */
import { toMatchImageSnapshot } from 'jest-image-snapshot';

jest.setTimeout(60000);

expect.extend({ toMatchImageSnapshot });
