import axios, {AxiosHeaders, AxiosRequestConfig} from 'axios';
import {URL} from 'url';
import {promises as fs} from 'fs';
import type {
  AttachmentConfig,
  BroadcastAction,
  Config,
  FileURL,
  HTTPAction,
  MessageConfig,
  ResponseData,
  ViewAction,
} from './interfaces.js';

const defaultServerURL = 'https://ntfy.sh';

export class NtfyClient {
  private readonly serverURL: string;

  /**
   * @param serverURL Specify your own ntfy Server. See [Self-hosting](https://docs.ntfy.sh/install/).
   */
  constructor(serverURL?: string) {
    this.serverURL = serverURL || defaultServerURL;
  }

  publish<T extends Config>(config: T): Promise<ResponseData<T>> {
    return publish({
      server: this.serverURL,
      ...config,
    });
  }
}

function buildBroadcastActionString(action: BroadcastAction & {type: 'broadcast'}): string {
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

function ConfigHasAttachment(config: any): config is AttachmentConfig {
  return !!config.fileAttachment;
}

function ConfigHasMessage(config: any): config is MessageConfig {
  return !!config.message;
}

function buildHTTPActionString(action: HTTPAction & {type: 'http'}): string {
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

function buildViewActionString(action: ViewAction & {type: 'view'}): string {
  let str = `${action.type}, ${action.label}, ${action.url}`;

  if (action.clear) {
    str += ', clear=true';
  }

  return str;
}

export async function publish<T extends Config>(config: T): Promise<ResponseData<T>> {
  const axiosConfig: AxiosRequestConfig & {headers: AxiosHeaders} = {headers: new AxiosHeaders()};

  let postData: any;

  if (config.actions && config.actions.length) {
    axiosConfig.headers.set(
      'X-Actions',
      config.actions
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
        .join('; ')
    );
  }

  if (config.authorization) {
    axiosConfig.withCredentials = true;
    axiosConfig.auth = config.authorization;
  }

  if (config.delay) {
    axiosConfig.headers.set('X-Delay', config.delay);
  }

  if (config.disableCache) {
    axiosConfig.headers.set('X-Cache', 'no');
  }

  if (config.disableFirebase) {
    axiosConfig.headers.set('X-Firebase', 'no');
  }

  if (config.emailAddress) {
    axiosConfig.headers.set('X-Email', config.emailAddress);
  }

  if (ConfigHasMessage(config) && config.fileURL) {
    if (typeof config.fileURL === 'string') {
      axiosConfig.headers.set('X-Attach', config.fileURL as string);
    }
    axiosConfig.headers.set('X-Attach', (config.fileURL as FileURL).url);
    axiosConfig.headers.set('X-Filename', (config.fileURL as FileURL).filename);
  }

  if (ConfigHasAttachment(config)) {
    try {
      postData = await fs.readFile(config.fileAttachment);
    } catch (error: unknown) {
      console.error('Error while reading file:', (error as Error).message);
    }
  } else if (config.message) {
    postData = config.message;
  } else {
    throw new Error('No message or file attachment specified');
  }

  if (config.iconURL) {
    axiosConfig.headers.set('X-Icon', config.iconURL);
  }

  if (config.priority) {
    axiosConfig.headers.set('X-Priority', config.priority);
  }

  if (config.tags && config.tags.length) {
    axiosConfig.headers.set('X-Tags', typeof config.tags === 'string' ? config.tags : config.tags.join(','));
  }

  if (config.title) {
    axiosConfig.headers.set('X-Title', config.title);
  }

  const url = new URL(config.topic, config.server || defaultServerURL);

  const {data} = await axios.post(url.href, postData, axiosConfig);
  return data;
}
