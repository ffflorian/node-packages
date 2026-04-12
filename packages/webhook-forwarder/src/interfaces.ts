export interface WebhookForwarderOptions {
  /** Host to listen on. Default is `0.0.0.0`. */
  host?: string;
  /** Path to listen on. Default is `/`. */
  path?: string;
  /** Port to listen on. Default is `8080`. */
  port?: number;
  /** Target URL to forward webhooks to. */
  targetUrl: string;
  /** Forwarding request timeout in milliseconds. Default is `30000`. */
  timeout?: number;
}
