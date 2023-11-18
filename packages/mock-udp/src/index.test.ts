/* eslint-disable no-magic-numbers */

import {assert, expect, describe, test, beforeEach} from 'vitest';
import * as dgram from 'node:dgram';
import * as mockudp from './index.js';
const buffer = Buffer.from('hello world');

describe('mock-udp.intercept', () => {
  test('should have punched Socket.prototype.send in the face', () => {
    mockudp.intercept();
    expect(mockudp.isMocked()).toBe(true);
    mockudp.revert();
  });
});

describe('mock-udp.revert', () => {
  test('should revert back to the unpunched state', () => {
    mockudp.intercept();
    mockudp.revert();
    expect(mockudp.isMocked()).not.toBe(true);
  });
});

describe('mock-udp.add', () => {
  test('should return a new, unused Scope', () => {
    const scope = mockudp.add('');
    expect(scope.done()).toBe(false);
    mockudp.clean();
  });
});

describe('mock-udp.clean', () => {
  test('should clean all interceptions', () => {
    const range = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    range.forEach(index => mockudp.add(`localhost:100${index}`));
    mockudp.intercept();
    mockudp.clean();
    const client = dgram.createSocket('udp4');
    range.forEach(index => {
      try {
        client.send(buffer, 0, buffer.length, 1000 + index, 'localhost');
        assert.fail();
      } catch (error) {}
    });
  });
});

describe('mock-udp.overriddenSocketSend', () => {
  beforeEach(() => {
    mockudp.intercept();
    mockudp.clean();
  });

  test('should intercept a basic UDP request', () => {
    return new Promise(done => {
      const scope = mockudp.add('localhost:1000');
      const client = dgram.createSocket('udp4');
      client.send(buffer, 0, buffer.length, 1000, 'localhost', () => {
        scope.done();
        done(void 0);
      });
    });
  });

  test('should not throw an exception with a missing callback', () => {
    mockudp.add('localhost:1000');
    const client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, 1000, 'localhost');
  });

  test('should return the correct number of bytes to the callback', () => {
    return new Promise(done => {
      mockudp.add('localhost:1000');
      const client = dgram.createSocket('udp4');
      client.send(buffer, 0, 5, 1000, 'localhost', (_, bytes) => {
        expect(bytes).toBe(5);
        done(void 0);
      });
    });
  });

  test('should return a scope with a correct buffer', () => {
    return new Promise(done => {
      const scope = mockudp.add('localhost:1000');
      const client = dgram.createSocket('udp4');
      client.send(buffer, 1, 6, 1000, 'localhost', () => {
        if (!scope.buffer) {
          return assert.fail();
        }
        expect(scope.buffer.toString()).toBe('ello w');
        done(void 0);
      });
    });
  });

  test('should handle two UDP intercepts per request', () => {
    return new Promise(done => {
      const scope1 = mockudp.add('localhost:1000');
      const scope2 = mockudp.add('localhost:1000');
      const client = dgram.createSocket('udp4');
      client.send(buffer, 0, buffer.length, 1000, 'localhost', () => {
        scope1.done();
        scope2.done();
        done(void 0);
      });
    });
  });

  test('should throw an error when reusing an intercept', () => {
    return new Promise(done => {
      const scope = mockudp.add('localhost:1000');
      const client = dgram.createSocket('udp4');
      client.send(buffer, 0, buffer.length, 1000, 'localhost', () => {
        scope.done();
        try {
          client.send(buffer, 0, buffer.length, 1000, 'localhost');
          assert.fail();
        } catch (error) {
          done(void 0);
        }
      });
    });
  });

  test('should throw an error if offset is equal to the length of the buffer', () => {
    const scope = mockudp.add('localhost:1000');
    const client = dgram.createSocket('udp4');
    try {
      client.send(buffer, buffer.length, buffer.length, 1000, 'localhost');
      assert.fail();
    } catch (error) {}
    expect(scope.done()).toBe(false);
  });

  test('should throw an error if offset is greater than the length of the buffer', () => {
    const scope = mockudp.add('localhost:1000');
    const client = dgram.createSocket('udp4');
    try {
      client.send(buffer, buffer.length + 1, buffer.length, 1000, 'localhost');
      assert.fail();
    } catch (error) {}
    expect(scope.done()).toBe(false);
  });

  test('should throw an error if the length is greater than the length of the buffer', () => {
    const scope = mockudp.add('localhost:1000');
    const client = dgram.createSocket('udp4');
    try {
      client.send(buffer, 0, buffer.length + 1, 1000, 'localhost');
      assert.fail();
    } catch (error) {}
    expect(scope.done()).toBe(false);
  });
});
