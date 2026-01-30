/* eslint-disable no-magic-numbers */
export enum MessagePriority {
  /** No vibration or sound. The notification will be under the fold in "Other notifications". */
  MIN = 1,
  /** No vibration or sound. Notification will not visibly show up until notification drawer is pulled down. */
  LOW = 2,
  /** Short default vibration and sound. Default notification behavior. */
  DEFAULT = 3,
  /** Long vibration burst, default notification sound with a pop-over notification. */
  HIGH = 4,
  /** Really long vibration bursts, default notification sound with a pop-over notification. */
  MAX = 5,
}
/* eslint-enable no-magic-numbers */

export type Action =
  | ({
      type: 'broadcast';
    } & BroadcastAction)
  | ({
      type: 'http';
    } & HTTPAction)
  | ({
      type: 'view';
    } & ViewAction);

export type AttachmentConfig = {
  /**
   * You can send images and other files to your phone as attachments to a notification. The attachments are then
   * downloaded onto your phone (depending on size and setting automatically), and can be used from the Downloads
   * folder.
   *
   * There are two different ways to send attachments:
   *
   * * sending a local file, e.g. from `~/Flowers/flower.jpg` or `ringtone.mp3`
   * * or by passing an external URL as an attachment, e.g. `https://f-droid.org/F-Droid.apk`
   */
  fileAttachment: string;
} & Omit<BaseConfig, 'fileURL'>;

export interface BaseConfig {
  /**
   * You can add action buttons to notifications to allow yourself to react to a notification directly. This is
   * incredibly useful and has countless applications.
   *
   * You can control your home appliances (open/close garage door, change temperature on thermostat, ...), react to
   * common monitoring alerts (clear logs when disk is full, ...), and many other things. The sky is the limit.
   *
   * As of today, the following actions are supported:
   *
   * * [`view`](https://docs.ntfy.sh/publish/#open-websiteapp): Opens a website or app when the action button is tapped
   * * [`broadcast`](https://docs.ntfy.sh/publish/#send-android-broadcast): Sends an
   * [Android broadcast](https://developer.android.com/guide/components/broadcasts) intent when the action button is
   * tapped (only supported on Android)
   * * [`http`](https://docs.ntfy.sh/publish/#send-http-request): Sends HTTP POST/GET/PUT request when the action button
   * is tapped
   */
  actions?: Action[];
  /**
   * Depending on whether the server is configured to support
   * [access control](https://docs.ntfy.sh/config/#access-control), some topics may be read/write protected so that only
   * users with the correct credentials can subscribe or publish to them.
   *
   * Use either basic credentials or an access token.
   */
  authorization?: {password: string; username: string} | string;
  /**
   * You can define which URL to open when a notification is clicked. This may be useful if your notification is related
   * to a Zabbix alert or a transaction that you'd like to provide the deep-link for. Tapping the notification will open
   * the web browser (or the app) and open the website.
   *
   * If you pass a website URL (`http://` or `https://`) the web browser will open. If you pass another URI that can be
   * handled by another app, the responsible app may open.
   *
   * Examples:
   *
   * * `http://` or `https://` will open your browser (or an app if it registered for a URL)
   * * `mailto:` links will open your mail app, e.g. `mailto:phil@example.com`
   * * `geo:` links will open Google Maps, e.g. `geo:0,0?q=1600+Amphitheatre+Parkway,+Mountain+View,+CA`
   * * `ntfy://` links will open ntfy (see [ntfy:// links](https://docs.ntfy.sh/subscribe/phone/#ntfy-links)), e.g.
   * `ntfy://ntfy.sh/stats`
   * * `twitter://` links will open Twitter, e.g. `twitter://user?screen_name=..`
   * * ...

  */
  clickURL?: string;
  /**
   * You can delay the delivery of messages and let ntfy send them at a later date. This can be used to send yourself
   * reminders or even to execute commands at a later date (if your subscriber acts on messages).
   *
   * Usage is pretty straight forward. You can set the delivery time either by specifying a Unix timestamp (e.g.
   * `1639194738`), a duration (e.g. `30m`, `3h`, `2 days`), or a natural language time string (e.g. `10am`, `8:30pm`,
   * `tomorrow`, `3pm`, `Tuesday`, `7am`, [and more](https://github.com/olebedev/when)).
   *
   * As of today, the minimum delay you can set is 10 seconds and the maximum delay is 3 days. This can currently not be
   * configured otherwise ([let the author know](https://github.com/binwiederhier/ntfy/issues) if you'd like to change
   * these limits).
   *
   * For the purposes of [message caching](https://docs.ntfy.sh/config/#message-cache), scheduled messages are kept in
   * the cache until 12 hours after they were delivered (or whatever the server-side cache duration is set to). For
   * instance, if a message is scheduled to be delivered in 3 days, it'll remain in the cache for 3 days and 12 hours.
   * Also note that naturally, [turning off server-side caching](https://docs.ntfy.sh/publish/#message-caching) is not
   * possible in combination with this feature.
   */
  delay?: string;
  /**
   * **INFO**: If caching is disabled, messages will only be delivered to connected subscribers, and won't be
   * re-delivered if a client re-connects. If a subscriber has (temporary) network issues or is reconnecting
   * momentarily, **messages might be missed**.
   *
   * ---
   *
   * By default, the ntfy server caches messages on disk for 12 hours (see
   * [message caching](https://docs.ntfy.sh/config/#message-cache)), so all messages you publish are stored server-side
   * for a little while. The reason for this is to overcome temporary client-side network disruptions, but arguably this
   * feature also may raise privacy concerns.
   *
   * To avoid messages being cached server-side entirely, you can disable caching. This will make sure that your message
   * is not cached on the server, even if server-side caching is enabled. Messages are still delivered to connected
   * subscribers, but [`since=`](https://docs.ntfy.sh/subscribe/api/#fetch-cached-messages) and
   * [`poll=1`](https://docs.ntfy.sh/subscribe/api/#poll-for-messages) won't return the message anymore.
   */
  disableCache?: boolean;
  /**
   * **INFO**: If Firebase is disabled and instant delivery isn't enabled in the Android app (Google Play variant only),
   * message delivery will be significantly delayed (up to 15 minutes). To overcome this delay, simply enable instant
   * delivery.
   *
   * ---
   *
   * The ntfy server can be configured to use Firebase Cloud Messaging (FCM) (see Firebase config) for message delivery
   * on Android (to minimize the app's battery footprint). The ntfy.sh server is configured this way, meaning that all
   * messages published to ntfy.sh are also published to corresponding FCM topics.
   *
   * If you'd like to avoid forwarding messages to Firebase, you can disabled Firebase. This will instruct the server
   * not to forward messages to Firebase.
   */
  disableFirebase?: boolean;
  /**
   * You can forward messages to e-mail by specifying an address in the header. This can be useful for messages that
   * you'd like to persist longer, or to blast-notify yourself on all possible channels.
   *
   * Only one e-mail address is supported.
   *
   * Since ntfy does not provide auth (yet), the rate limiting is pretty strict (see
   * [limitations](https://docs.ntfy.sh/publish/#limitations)). In the default configuration, you get 16 e-mails per
   * visitor (IP address) and then after that one per hour. On top of that, your IP address appears in the e-mail body.
   * This is to prevent abuse.
   */
  emailAddress?: string;
  /**
   * Instead of sending a local file to your phone, you can use an external URL to specify where the attachment is
   * hosted. This could be a Dropbox link, a file from social media, or any other publicly available URL. Since the
   * files are externally hosted, the expiration or size limits from above do not apply here.
   *
   * To attach an external file, simple pass the `fileURL` parameter to specify the attachment URL. It can be any
   * type of file.
   *
   * ntfy will automatically try to derive the file name from the URL (e.g https://example.com/flower.jpg will yield a
   * filename flower.jpg). To override this filename, you may send use the `FileURL` object.
   */
  fileURL?: FileURL | string;
  /**
   * You can include an icon that will appear next to the text of the notification. Simply specify the URL that the icon
   * is located at. The client will automatically download the icon (unless it is already cached locally, and less than
   * 24 hours old), and show it in the notification. Icons are cached locally in the client until the notification is
   * deleted. **Only JPEG and PNG images are supported at this time**.
   */
  iconURL?: string;
  /**
   * All messages have a priority, which defines how urgently your phone notifies you. On Android, you can set custom
   * notification sounds and vibration patterns on your phone to map to these priorities (see
   * [Android config](https://docs.ntfy.sh/subscribe/phone/)).
   */
  priority?: MessagePriority;
  /**
   * Specify a custom ntfy Server. See [Self-hosting](https://docs.ntfy.sh/install/).
   */
  server?: string;
  /**
   * You can tag messages with emojis and other relevant strings:
   *
   * * Emojis: If a tag matches an [emoji short code](https://docs.ntfy.sh/emojis/), it'll be converted to an emoji and
   * prepended to title or message.
   * * Other tags: If a tag doesn't match, it will be listed below the notification.
   *
   * This feature is useful for things like warnings (⚠️, ️🚨, or 🚩), but also to simply tag messages otherwise (e.g.
   * script names, hostnames, etc.). Use [the emoji short code list](https://docs.ntfy.sh/emojis/) to figure out what
   * tags can be converted to emojis.
   */
  tags?: string | string[];
  /** The notification title is typically set to the topic short URL (e.g. `ntfy.sh/mytopic`). */
  title?: string;
  /**
   * Your topic to publish and subscribe to. Because there is no sign-up, the topic is essentially a password, so pick
   * something that's not easily guessable.
   */
  topic: string;
}

/**
 * The broadcast action sends an Android broadcast intent when the action button is tapped. This allows integration
 * into automation apps such as MacroDroid or Tasker, which basically means you can do everything your phone is
 * capable of. Examples include taking pictures, launching/killing apps, change device settings, write/read files,
 * etc.
 *
 * By default, the intent action **`io.heckel.ntfy.USER_ACTION`** is broadcast, though this can be changed with the
 * `intent` parameter. To send extras, use the `extras` parameter. Currently, only string extras are supported.
 */
export interface BroadcastAction {
  /** Clear notification after action button is tapped, default is `false`. */
  clear?: boolean;
  /** Android intent extras. */
  extras?: Record<string, string>;
  /** Android intent name, default is `io.heckel.ntfy.USER_ACTION`. */
  intent?: string;
  /** Label of the action button in the notification. */
  label: string;
}

export type Config = AttachmentConfig | MessageConfig;

export interface FileURL {
  filename: string;
  url: string;
}

export interface HTTPAction {
  /** HTTP body. */
  body?: string;
  /**
   * Clear notification after HTTP request succeeds. If the request fails, the notification is not cleared.
   * Default is `false`.
   */
  clear?: boolean;
  /** HTTP headers to pass in request. */
  headers?: Record<string, string>;
  /** Label of the action button in the notification. */
  label: string;
  /** HTTP method to use for request, default is POST ⚠️. */
  method?: HTTPMethod;
  /** URL to which the HTTP request will be sent. */
  url: string;
}

export type HTTPMethod =
  | 'delete'
  | 'DELETE'
  | 'get'
  | 'GET'
  | 'head'
  | 'HEAD'
  | 'link'
  | 'LINK'
  | 'options'
  | 'OPTIONS'
  | 'patch'
  | 'PATCH'
  | 'post'
  | 'POST'
  | 'purge'
  | 'PURGE'
  | 'put'
  | 'PUT'
  | 'unlink'
  | 'UNLINK';

export type MessageConfig = {
  /**
   * Main body of the message as shown in the notification.
   */
  message: string;
} & BaseConfig;

export type ResponseData<T extends Config> = {
  id: string;
  time: number;
} & T;

/**
 * The view action **opens a website or app when the action button is tapped**, e.g. a browser, a Google Maps location,
 * or even a deep link into Twitter or a show ntfy topic. How exactly the action is handled depends on how Android and
 * your desktop browser treat the links. Normally it'll just open a link in the browser.
 *
 * Examples:
 *
 * * `http://` or `https://` will open your browser (or an app if it registered for a URL)
 * * `mailto:` links will open your mail app, e.g. `mailto:phil@example.com`
 * * `geo:` links will open Google Maps, e.g. `geo:0,0?q=1600+Amphitheatre+Parkway,+Mountain+View,+CA`
 * * `ntfy://` links will open ntfy (see [ntfy:// links](https://docs.ntfy.sh/subscribe/phone/#ntfy-links)), e.g.
 * `ntfy://ntfy.sh/stats`
 * * `twitter://` links will open Twitter, e.g. `twitter://user?screen_name=..`
 * * ...
 */
export interface ViewAction {
  /** Clear notification after action button is tapped, default is `false`. */
  clear?: boolean;
  /** Label of the action button in the notification */
  label: string;
  /** URL to open when action is tapped */
  url: string;
}
