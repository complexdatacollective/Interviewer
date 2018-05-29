/* eslint-env jest */
import * as util from '../serverAddressing';

describe('the serverAddressing util', () => {
  it('augments a service with the API URL', () => {
    const mockService = { port: 123, addresses: ['127.0.0.1'] };
    const augmented = util.addApiUrlToService(mockService);
    expect(augmented).toMatchObject(mockService);
    expect(augmented).toHaveProperty('apiUrl');
    expect(augmented.apiUrl).toMatch('127.0.0.1:123');
  });

  describe('port validation', () => {
    it('validates 9999', () => expect(util.isValidPort(9999)).toBe(true));
    it('validates a string port', () => expect(util.isValidPort('9999')).toBe(true));
    it('rejects port 0', () => expect(util.isValidPort(0)).toBe(false));
    it('rejects port 10e6', () => expect(util.isValidPort(10e6)).toBe(false));
    it('rejects port "10e6"', () => expect(util.isValidPort('10e6')).toBe(false));
    it('rejects port > max', () => expect(util.isValidPort(2 ** 16)).toBe(false));
    it('rejects a negative port', () => expect(util.isValidPort(-1)).toBe(false));
  });

  describe('address validation', () => {
    it('detects a valid address', () => expect(util.isValidAddress('192.168.0.1')).toBe(true));
    it('detects an invalid address', () => expect(util.isValidAddress('192.1068.0.1')).toBe(false));
    it('rejects paths', () => expect(util.isValidAddress('192.1068.0.1/foo')).toBe(false));
    it('rejects full URLs', () => expect(util.isValidAddress('http://192.1068.0.1')).toBe(false));
  });
});
