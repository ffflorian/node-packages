import fs from 'node:fs/promises';
import {URL} from 'node:url';

import type {
  AttachmentConfig,
  BaseConfig,
  BroadcastAction,
  Config,
  HTTPAction,
  MessageConfig,
  ResponseData,
  ViewAction,
} from './interfaces.js';

const defaultServerURL = 'https://ntfy.sh';

export class NtfyClient {
  private readonly config?: Partial<BaseConfig>;

  constructor(config?: Partial<BaseConfig>) {
    this.config = config;
  }

  publish<T extends Config>(config: T): Promise<ResponseData<T>> {
    return publish({
      server: defaultServerURL,
      ...this.config,
      ...config,
    });
  }
}

export async function publish<T extends Config>(publishConfig: T): Promise<ResponseData<T>> {
  const requestConfig: {headers: Record<string, string>; withCredentials?: boolean} = {headers: {}};

  let postData: any;

  if (publishConfig.actions && publishConfig.actions.length) {
    requestConfig.headers['X-Actions'] = publishConfig.actions
      .map(action => {
        switch (action.type) {
          case 'broadcast': {
            return buildBroadcastActionString(action);
          }
          case 'http': {
            return buildHTTPActionString(action);
          }
          case 'view': {
            return buildViewActionString(action);
          }
          default: {
            return '';
          }
        }
      })
      .join('; ');
  }

  if (publishConfig.authorization) {
    requestConfig.withCredentials = true;
    if (typeof publishConfig.authorization === 'string') {
      requestConfig.headers.Authorization = `Bearer ${publishConfig.authorization}`;
    } else {
      const credentials = `${publishConfig.authorization.username}:${publishConfig.authorization.password}`;
      requestConfig.headers.Authorization = `Basic ${Buffer.from(credentials).toString('base64')}`;
    }
  }

  if (publishConfig.delay) {
    requestConfig.headers['X-Delay'] = publishConfig.delay;
  }

  if (publishConfig.disableCache) {
    requestConfig.headers['X-Cache'] = 'no';
  }

  if (publishConfig.disableFirebase) {
    requestConfig.headers['X-Firebase'] = 'no';
  }

  if (publishConfig.emailAddress) {
    requestConfig.headers['X-Email'] = publishConfig.emailAddress;
  }

  if (ConfigHasMessage(publishConfig) && publishConfig.fileURL) {
    if (typeof publishConfig.fileURL === 'string') {
      requestConfig.headers['X-Attach'] = publishConfig.fileURL;
    } else {
      requestConfig.headers['X-Attach'] = publishConfig.fileURL.url;
      requestConfig.headers['X-Filename'] = publishConfig.fileURL.filename;
    }
  }

  if (ConfigHasAttachment(publishConfig)) {
    try {
      postData = await fs.readFile(publishConfig.fileAttachment);
    } catch (error) {
      console.error('Error while reading file:', (error as Error).message);
    }
  } else if (publishConfig.message) {
    postData = publishConfig.message;
  } else {
    throw new Error('No message or file attachment specified');
  }

  if (publishConfig.iconURL) {
    requestConfig.headers['X-Icon'] = publishConfig.iconURL;
  }

  if (publishConfig.priority) {
    requestConfig.headers['X-Priority'] = publishConfig.priority.toString();
  }

  if (publishConfig.tags && publishConfig.tags.length) {
    requestConfig.headers['X-Tags'] =
      typeof publishConfig.tags === 'string' ? publishConfig.tags : publishConfig.tags.join(',');
  }

  if (publishConfig.title) {
    requestConfig.headers['X-Title'] = publishConfig.title;
  }

  const url = new URL(publishConfig.topic, publishConfig.server || defaultServerURL);

  const response = await fetch(url.href, {
    body: postData,
    credentials: requestConfig.withCredentials ? 'include' : 'omit',
    headers: requestConfig.headers,
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Error while publishing message: ${response.statusText}`);
  }
  return response.json();
}

function buildBroadcastActionString(action: {type: 'broadcast'} & BroadcastAction): string {
  let str = `${action.type}, ${action.label}`;

  if (action.clear) {
    str += ', clear=true';
  }

  if (action.extras && Object.keys(action.extras).length) {
    str += `, ${Object.entries(action.extras)
      .map(([key, value]) => `extras.${key}=${value}`)
      .join(', ')}`;
  }

  if (action.intent) {
    str += `, intent=${action.intent}`;
  }

  return str;
}

function buildHTTPActionString(action: {type: 'http'} & HTTPAction): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.method) {
    str += `, method=${action.method.toUpperCase()}`;
  }

  if (action.clear) {
    str += ', clear=true';
  }

  if (action.headers && Object.keys(action.headers).length) {
    str += `, ${Object.entries(action.headers)
      .map(([key, value]) => `headers.${key}=${value}`)
      .join(', ')}`;
  }

  if (action.body) {
    str += `, ${action.body}`;
  }

  return str;
}

function buildViewActionString(action: {type: 'view'} & ViewAction): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.clear) {
    str += ', clear=true';
  }

  return str;
}

function ConfigHasAttachment(config: any): config is AttachmentConfig {
  return !!config.fileAttachment;
}

function ConfigHasMessage(config: any): config is MessageConfig {
  return !!config.message;
}
