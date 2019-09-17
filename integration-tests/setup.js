/* eslint-env jest */
import { toMatchImageSnapshot } from 'jest-image-snapshot';

jest.setTimeout(30000);

expect.extend({ toMatchImageSnapshot });
