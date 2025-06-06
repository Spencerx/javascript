import {
  UserConfiguration,
  ExtendedConfiguration,
  setDefaults as setBaseDefaults,
} from '../../core/interfaces/configuration';
import { ICryptoModule } from '../../core/interfaces/crypto-module';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether PubNub client should update its state using browser's reachability events or not.
 *
 * If the browser fails to detect the network changes from Wi-Fi to LAN and vice versa, or you get
 * reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to take over.
 */
const LISTEN_TO_BROWSER_NETWORK_EVENTS = true;

/**
 * Whether verbose logging should be enabled for `Subscription` worker to print debug messages or not.
 */
const SUBSCRIPTION_WORKER_LOG_VERBOSITY = false;

/**
 * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
 */
const SUBSCRIPTION_WORKER_OFFLINE_CLIENTS_CHECK_INTERVAL = 10;

/**
 * Whether `leave` request should be sent for _offline_ PubNub client or not.
 */
const SUBSCRIPTION_WORKER_UNSUBSCRIBE_OFFLINE_CLIENTS = false;

/**
 * Use modern Web Fetch API for network requests by default.
 */
const TRANSPORT: PubNubConfiguration['transport'] = 'fetch';

/**
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = true;
// endregion

/**
 * Browser platform PubNub client configuration.
 */
export type PubNubConfiguration = UserConfiguration & {
  /**
   * If the browser fails to detect the network changes from Wi-Fi to LAN and vice versa, or you
   * get reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to
   * take over.
   *
   * @default `true`
   */
  listenToBrowserNetworkEvents?: boolean;

  /**
   * Path to the hosted PubNub `Subscription` service worker.
   *
   * **Important:** Serving server should add `Service-Worker-Allowed: /` to response on service worker file request to
   * make it possible for PubNub SDK use own `scope`.
   * **Important:** Service worker file should be server from the same domain where PubNub client will be used. If
   * statics provided from `subdomain.main.com` and page loaded from `account.main.com` - then server should be
   * configured to serve worker file from `account.main.com`.
   */
  subscriptionWorkerUrl?: string | null;

  /**
   * Interval at which Shared Worker should check whether PubNub instances which used it still active or not.
   *
   * With every iteration, Shared Worker will detect for _offline_ PubNub client instances which should be removed from
   * the list of tracked instances.
   *
   * @default `10` seconds
   */
  subscriptionWorkerOfflineClientsCheckInterval?: number;

  /**
   * Whether `leave` request should be sent for _offline_ PubNub client or not.
   *
   * It is possible for Shared Worker as part of _offline_ PubNub clients clean up send `leave` request for proper
   * leave. This behavior can be useful to gracefully handle browser tab / window close.
   *
   * @default `false`
   */
  subscriptionWorkerUnsubscribeOfflineClients?: boolean;

  /**
   * Whether verbose logging should be enabled for `Subscription` worker should print debug messages or not.
   *
   * @default `false`
   */
  subscriptionWorkerLogVerbosity?: boolean;

  /**
   * API which should be used to make network requests.
   *
   * **Important:** `Shared Worker` always use `fetch` API.
   *
   * @default `fetch`
   */
  transport?: 'fetch' | 'xhr';

  /**
   * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
   * opening a new one for each new request.
   *
   * @default `true`
   */
  keepAlive?: boolean;

  /**
   * The cryptography module used for encryption and decryption of messages and files. Takes the
   * {@link cipherKey} and {@link useRandomIVs} parameters as arguments.
   *
   * For more information, refer to the
   * {@link /docs/sdks/javascript/api-reference/configuration#cryptomodule|cryptoModule} section.
   *
   * @default `not set`
   */
  cryptoModule?: ICryptoModule;

  // region Deprecated parameters
  /**
   * If passed, will encrypt the payloads.
   *
   * @deprecated Pass it to {@link cryptoModule} instead.
   */
  cipherKey?: string;

  /**
   * When `true` the initialization vector (IV) is random for all requests (not just for file
   * upload).
   * When `false` the IV is hard-coded for all requests except for file upload.
   *
   * @default `true`
   *
   * @deprecated Pass it to {@link cryptoModule} instead.
   */
  useRandomIVs?: boolean;
};

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @internal
 */
export const setDefaults = (configuration: PubNubConfiguration): PubNubConfiguration & ExtendedConfiguration => {
  // Force to disable service workers if the environment doesn't support them.
  if (configuration.subscriptionWorkerUrl && typeof SharedWorker === 'undefined') {
    configuration.subscriptionWorkerUrl = null;
  }

  return {
    // Set base configuration defaults.
    ...setBaseDefaults(configuration),
    // Set platform-specific options.
    listenToBrowserNetworkEvents: configuration.listenToBrowserNetworkEvents ?? LISTEN_TO_BROWSER_NETWORK_EVENTS,
    subscriptionWorkerUrl: configuration.subscriptionWorkerUrl,
    subscriptionWorkerOfflineClientsCheckInterval:
      configuration.subscriptionWorkerOfflineClientsCheckInterval ?? SUBSCRIPTION_WORKER_OFFLINE_CLIENTS_CHECK_INTERVAL,
    subscriptionWorkerUnsubscribeOfflineClients:
      configuration.subscriptionWorkerUnsubscribeOfflineClients ?? SUBSCRIPTION_WORKER_UNSUBSCRIBE_OFFLINE_CLIENTS,
    subscriptionWorkerLogVerbosity: configuration.subscriptionWorkerLogVerbosity ?? SUBSCRIPTION_WORKER_LOG_VERBOSITY,
    transport: configuration.transport ?? TRANSPORT,
    keepAlive: configuration.keepAlive ?? KEEP_ALIVE,
  };
};
