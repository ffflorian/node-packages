import {Socket} from 'dgram';

type SendCallback = (error: Error | null, bytes: number) => void;

let intercepts: {
  [path: string]: Scope[];
} = {};

const originalSocketSend = Socket.prototype.send;

class Scope {
  public _done: boolean;
  public address?: string;
  public buffer?: Buffer | string | Uint8Array | any[];
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

function overriddenSocketSend(msg: string | Uint8Array | any[], callback?: SendCallback): void;
function overriddenSocketSend(msg: string | Uint8Array | any[], port?: number, callback?: SendCallback): void;
function overriddenSocketSend(
  msg: string | Uint8Array | any[],
  port?: number,
  address?: string,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: string | Uint8Array | any[],
  offset: number,
  length: number,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: string | Uint8Array | any[],
  offset: number,
  length: number,
  port?: number,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: string | Uint8Array | any[],
  offset: number,
  length: number,
  port?: number,
  address?: string,
  callback?: SendCallback
): void;
function overriddenSocketSend(
  msg: Buffer | string | Uint8Array | any[],
  offsetOrPortOrCallback?: number | SendCallback,
  lengthOrAddressOrCallback?: number | string | SendCallback,
  portOrCallback?: number | SendCallback,
  addressOrCallback?: string | SendCallback,
  callbackOrUndefined?: SendCallback
): void {
  const hasLengthAndOffset = typeof portOrCallback === 'number';

  const address =
    (hasLengthAndOffset ? (addressOrCallback as string) : (lengthOrAddressOrCallback as string)) || 'localhost';
  const callback = hasLengthAndOffset ? (callbackOrUndefined as SendCallback) : (portOrCallback as SendCallback);
  const length = hasLengthAndOffset ? (lengthOrAddressOrCallback as number) || 0 : 0;
  const offset = hasLengthAndOffset ? (offsetOrPortOrCallback as number) : 0;
  const port = hasLengthAndOffset ? (portOrCallback as number) : (offsetOrPortOrCallback as number);

  if (offset >= msg.length) {
    throw new Error('Offset into buffer too large.');
  }

  if (offset + length > msg.length) {
    throw new Error('Offset + length beyond buffer length.');
  }

  const newBuffer = msg.slice(offset, offset + length);
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
  restoreSocketSend as revert,
  interceptSocketSend as intercept,
  cleanInterceptions as clean,
  isMocked,
  Scope,
};
