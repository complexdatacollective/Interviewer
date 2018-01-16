/* eslint-disable import/prefer-default-export */
/* eslint-env jest */

const readFile = jest.fn(() => Promise.resolve('{ "foo": "bar" }'));

export { readFile };
