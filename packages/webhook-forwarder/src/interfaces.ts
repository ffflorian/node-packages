/** A single route mapping a webhook path to a target URL. */
export interface Route {
  /** Path to listen on for this route. */
  path: string;
  /** Target URL to forward webhooks to. */
target: string;
  /** Forwarding request timeout in milliseconds. Default is `30000`. */
  timeout?: number;
}

/** Config file structure loaded by cosmiconfig. */
export interface ConfigFile {
  /** Host to listen on. Default is `0.0.0.0`. */
  host?: string;
  /** Port to listen on. Default is `8080`. */
  port?: number;
  /** Route definitions mapping webhook paths to target URLs. */
  routes: Route[];
}

export interface WebhookForwarderOptions {
  /** Path to a configuration file. If `false`, no config file lookup is performed. */
  configFile?: false | string;
  /** Host to listen on. Default is `0.0.0.0`. */
  host?: string;
  /** Port to listen on. Default is `8080`. */
  port?: number;
  /** Route definitions mapping webhook paths to target URLs. */
  routes?: Route[];
  /** Forwarding request timeout in milliseconds (default for all routes). Default is `30000`. */
  timeout?: number;
}
