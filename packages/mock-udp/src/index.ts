import {Socket} from 'node:dgram';

type SendCallback = (error: Error | null, bytes: number) => void;

let intercepts: {
  [path: string]: Scope[];
} = {};

const originalSocketSend = Socket.prototype.send;

class Scope {
  public _done: boolean;
  public address?: string;
  public buffer?: ArrayBuffer | NodeJS.TypedArray | readonly any[] | SharedArrayBuffer | string;
  public length?: number;
  public offset?: number;
  public port?: number;

  constructor() {
    this._done = false;
  }

  public done(): boolean {
    return this._done;
  }
}

function overriddenSocketSend(
  msg: NodeJS.ArrayBufferView | readonly any[] | string,
  port?: number,
  address?: string,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: NodeJS.ArrayBufferView | readonly any[] | string,
  port?: number,
  callback?: SendCallback
): void;
function overriddenSocketSend(msg: NodeJS.ArrayBufferView | readonly any[] | string, callback?: SendCallback): void;
function overriddenSocketSend(
  msg: NodeJS.ArrayBufferView | string,
  offset: number,
  length: number,
  port?: number,
  address?: string,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: NodeJS.ArrayBufferView | string,
  offset: number,
  length: number,
  port?: number,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: NodeJS.ArrayBufferView | string,
  offset: number,
  length: number,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: NodeJS.ArrayBufferView | readonly any[] | string,
  offsetOrPortOrCallback?: number | SendCallback,
  lengthOrAddressOrCallback?: number | SendCallback | string,
  portOrCallback?: number | SendCallback,
  addressOrCallback?: SendCallback | string,
  callbackOrUndefined?: SendCallback
): void {
  const hasLengthAndOffset = typeof portOrCallback === 'number';

  const address =
    (hasLengthAndOffset ? (addressOrCallback as string) : (lengthOrAddressOrCallback as string)) || 'localhost';
  const callback = hasLengthAndOffset ? (callbackOrUndefined as SendCallback) : (portOrCallback as SendCallback);
  const length = hasLengthAndOffset ? (lengthOrAddressOrCallback as number) || 0 : 0;
  const offset = hasLengthAndOffset ? (offsetOrPortOrCallback as number) : 0;
  const port = hasLengthAndOffset ? (portOrCallback as number) : (offsetOrPortOrCallback as number);
  const msgLength = msg instanceof DataView ? msg.byteLength : msg.length;

  if (offset >= msgLength) {
    throw new Error('Offset into buffer too large.');
  }

  if (offset + length > msgLength) {
    throw new Error('Offset + length beyond buffer length.');
  }

  const newBuffer =
    msg instanceof DataView ? msg.buffer.slice(offset, offset + length) : msg.slice(offset, offset + length);
  const host = `${address}:${port}`;

  if (intercepts.hasOwnProperty(host)) {
    intercepts[host].forEach(scope => {
      scope._done = true;
      scope.address = address;
      scope.buffer = newBuffer;
      scope.length = length;
      scope.offset = offset;
      scope.port = port;
    });

    delete intercepts[host];

    if (callback) {
      setImmediate(() => callback(null, length));
    }

    return;
  }

  throw new Error(`Request sent to unmocked path: ${host}.`);
}

overriddenSocketSend._mocked = true;

function add(path: string): Scope {
  if (!intercepts.hasOwnProperty(path)) {
    intercepts[path] = [];
  }
  const scope = new Scope();
  intercepts[path].push(scope);
  return scope;
}

function cleanInterceptions(): void {
  intercepts = {};
}

function interceptSocketSend(): void {
  Socket.prototype.send = overriddenSocketSend;
}

function isMocked(): boolean {
  return Socket.prototype.send.hasOwnProperty('_mocked');
}

function restoreSocketSend(): void {
  Socket.prototype.send = originalSocketSend;
}

interceptSocketSend();

export default add;
export {
  add,
  cleanInterceptions as clean,
  interceptSocketSend as intercept,
  isMocked,
  restoreSocketSend as revert,
  Scope,
};
