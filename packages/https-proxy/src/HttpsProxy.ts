import basicAuth from 'basic-auth';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import logdown from 'logdown';
import http from 'node:http';
import net from 'node:net';
import url from 'node:url';
import compare from 'tsscmp';

export interface AuthenticationOptions extends Options {
  /** If not set, no authentication will be required. */
  password: string;
  /** Default is `8080`. */
  port?: number;
  /** If not set, the requested URL will be used. */
  target?: string;
  /** If not set, no authentication will be required. */
  username: string;
}

export interface Options {
  /** Default is `8080`. */
  port?: number;
  /** If not set, the requested URL will be used. */
  target?: string;
}

const defaultOptions: Required<AuthenticationOptions> = {
  password: '',
  port: 8080,
  target: '',
  username: '',
};

export class HttpsProxy {
  private readonly authenticationEnabled: boolean;
  private readonly logger: logdown.Logger;
  private readonly options: Required<AuthenticationOptions>;
  private readonly server: http.Server;

  constructor(options?: AuthenticationOptions | Options) {
    this.options = {...defaultOptions, ...options};
    this.logger = logdown('https-proxy', {
      logger: console,
      markdown: false,
    });
    this.logger.state.isEnabled = true;
    this.authenticationEnabled = Boolean(this.options.username && this.options.password);

    this.server = http
      .createServer(this.onCreate)
      .on('connect', this.onConnect)
      .on('error', error => this.logger.error(`Server error: "${error.message}"`));
  }

  start(): void {
    const authenticationStatus = this.authenticationEnabled ? 'ON' : 'OFF';

    this.server.listen(this.options.port);
    this.logger.info(
      `Proxy server is listening on port ${this.options.port} (authentication: ${authenticationStatus}).`
    );
  }

  private getClosingProxyMessage(code: number, httpMessage: string): string {
    return [
      `HTTP/1.1 ${code} ${httpMessage}`,
      `Date: ${new Date().toUTCString()}`,
      'Proxy-Authenticate: Basic realm="proxy"',
      'Proxy-Connection: close',
    ].join('\r\n');
  }

  private readonly onConnect = (req: http.IncomingMessage, clientSocket: net.Socket): void => {
    this.logger.info(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url);

    const authorizationHeader = req.headers['proxy-authorization'];

    if (this.authenticationEnabled) {
      if (!authorizationHeader) {
        clientSocket.write(
          this.getClosingProxyMessage(HTTP_STATUS.PROXY_AUTHENTICATION_REQUIRED, 'Proxy Authentication Required')
        );
        clientSocket.end('\r\n\r\n');
        this.logger.warn(`Responded to proxy request from "${clientSocket.remoteAddress}" with authorization request`);
        return;
      }

      if (!this.validateAuthorization(authorizationHeader)) {
        clientSocket.write(this.getClosingProxyMessage(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'));
        clientSocket.end('\r\n\r\n');
        this.logger.warn(`Rejected proxy request with invalid authorization from "${clientSocket.remoteAddress}".`);
        return;
      }
    }

    const {hostname, port} = url.parse(this.options.target || `//${req.url}`, false, true);
    const parsedPort = parseInt(port || '443', 10);

    if (!hostname) {
      clientSocket.end('HTTP/1.1 400 Bad Request\r\n');
      clientSocket.destroy();
      this.logger.warn(`Rejected proxy request without hostname from "${clientSocket.remoteAddress}".`);
      return;
    }

    const serverSocket = net.connect({host: hostname, port: parsedPort});

    clientSocket
      .on('end', () => {
        if (serverSocket) {
          serverSocket.end();
        }
      })
      .on('error', (err: Error) => {
        this.logger.error(`ClientSocket error: "${err.message}"`);
        if (serverSocket) {
          serverSocket.end();
        }
      });

    serverSocket
      .on('connect', () => {
        clientSocket.write(['HTTP/1.1 200 Connection Established', 'Proxy-agent: Node-Proxy'].join('\r\n'));
        clientSocket.write('\r\n\r\n');

        serverSocket.pipe(clientSocket, {end: false});
        clientSocket.pipe(serverSocket, {end: false});

        this.logger.info(`Proxying data between "${clientSocket.remoteAddress}" and "${req.headers.host}".`);
      })
      .on('end', () => {
        if (clientSocket) {
          clientSocket.end(`HTTP/1.1 500 External Server End\r\n`);
        }
        this.logger.info(`Ended proxy between "${clientSocket.remoteAddress}" and "${req.headers.host}".`);
      })
      .on('error', (err: Error) => {
        this.logger.error(`ServerSocket error: "${err.message}"`);
        if (clientSocket) {
          clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`);
        }
      });
  };

  private readonly onCreate = (req: http.IncomingMessage, res: http.ServerResponse) => {
    // discard all request to proxy server except HTTP/1.1 CONNECT method
    res.writeHead(HTTP_STATUS.BAD_REQUEST, {'Content-Type': 'text/plain'});
    res.end('Bad Request');
    this.logger.warn(`Rejected "${req.method}" request from "${req.socket.remoteAddress}"`);
  };

  private validateAuthorization(auth: string): boolean {
    const credentials = basicAuth.parse(auth);
    return (
      !!credentials &&
      compare(credentials.name, this.options.username) &&
      compare(credentials.pass, this.options.password)
    );
  }
}
