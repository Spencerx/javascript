/**
 * {@link PubNub} client configuration module.
 */

import { PubNubFileConstructor, PubNubFileInterface } from '../types/file';
import { RequestRetryPolicy } from '../components/retry-policy';
import { PubNubError } from '../../errors/pubnub-error';
import { ICryptoModule } from './crypto-module';
import { KeySet, Payload } from '../types/api';
import { Logger, LogLevel } from './logger';
import { LoggerManager } from '../components/logger-manager';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------

// region Defaults
/**
 * Whether secured connection should be used by or not.
 */
const USE_SSL = true;

/**
 * Whether PubNub client should catch up subscription after network issues.
 */
const RESTORE = false;

/**
 * Whether network availability change should be announced with `PNNetworkDownCategory` and
 * `PNNetworkUpCategory` state or not.
 */
const AUTO_NETWORK_DETECTION = false;

/**
 * Whether messages should be de-duplicated before announcement or not.
 */
const DEDUPE_ON_SUBSCRIBE = false;

/**
 * Maximum cache which should be used for message de-duplication functionality.
 */
const DEDUPE_CACHE_SIZE = 100;

/**
 * Maximum number of file message publish retries.
 */
const FILE_PUBLISH_RETRY_LIMIT = 5;

/**
 * Whether subscription event engine should be used or not.
 */
const ENABLE_EVENT_ENGINE = false;

/**
 * Whether configured user presence state should be maintained by the PubNub client or not.
 */
const MAINTAIN_PRESENCE_STATE = true;

/**
 * Whether heartbeat should be postponed on successful subscribe response or not.
 */
const USE_SMART_HEARTBEAT = false;

/**
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = false;

/**
 * Whether leave events should be suppressed or not.
 */
const SUPPRESS_LEAVE_EVENTS = false;

/**
 * Whether heartbeat request failure should be announced or not.
 */
const ANNOUNCE_HEARTBEAT_FAILURE = true;

/**
 * Whether heartbeat request success should be announced or not.
 */
const ANNOUNCE_HEARTBEAT_SUCCESS = false;

/**
 * Whether PubNub client instance id should be added to the requests or not.
 */
const USE_INSTANCE_ID = false;

/**
 * Whether unique identifier should be added to the request or not.
 */
const USE_REQUEST_ID = true;

/**
 * Transactional requests timeout.
 */
const TRANSACTIONAL_REQUEST_TIMEOUT = 15;

/**
 * Subscription request timeout.
 */
const SUBSCRIBE_REQUEST_TIMEOUT = 310;

/**
 * File upload / download request timeout.
 */
const FILE_REQUEST_TIMEOUT = 300;

/**
 * Default user presence timeout.
 */
const PRESENCE_TIMEOUT = 300;

/**
 * Maximum user presence timeout.
 */
const PRESENCE_TIMEOUT_MAXIMUM = 320;
// endregion

/**
 * Base user-provided PubNub client configuration.
 */
export type UserConfiguration = {
  /**
   * Specifies the `subscribeKey` to be used for subscribing to a channel and message publishing.
   */
  subscribeKey: string;

  /**
   * Specifies the `subscribe_key` to be used for subscribing to a channel and message publishing.
   *
   * @deprecated Use the {@link subscribeKey} instead.
   */
  subscribe_key?: string;

  /**
   * Specifies the `publishKey` to be used for publishing messages to a channel.
   */
  publishKey?: string;

  /**
   * Specifies the `publish_key` to be used for publishing messages to a channel.
   *
   * @deprecated Use the {@link publishKey} instead.
   */
  publish_key?: string;

  /**
   * Specifies the `secretKey` to be used for request signatures computation.
   */
  secretKey?: string;

  /**
   * Specifies the `secret_key` to be used for request signatures computation.
   *
   * @deprecated Use the {@link secretKey} instead.
   */
  secret_key?: string;

  /**
   * Unique PubNub client user identifier.
   *
   * Unique `userId` to identify the user or the device that connects to PubNub.
   * It's a UTF-8 encoded string of up to 64 alphanumeric characters.
   *
   * If you don't set the `userId`, you won't be able to connect to PubNub.
   */
  userId?: string;

  /**
   * If Access Manager enabled, this key will be used on all requests.
   */
  authKey?: string | null;

  /**
   * Log HTTP information.
   *
   * @default `false`
   *
   * @deprecated Use {@link UserConfiguration.logLevel logLevel} and {@link UserConfiguration.loggers loggers} instead.
   */
  logVerbosity?: boolean;

  /**
   * Minimum messages log level which should be passed to the logger.
   */
  logLevel?: LogLevel;

  /**
   * List of additional custom {@link Logger loggers} to which logged messages will be passed.
   */
  loggers?: Logger[];

  /**
   * If set to true, requests will be made over HTTPS.
   *
   * @default `true` for v4.20.0 onwards, `false` before v4.20.0
   */
  ssl?: boolean;

  /**
   * If a custom domain is required, SDK accepts it here.
   *
   * @default `ps.pndsn.com`
   */
  origin?: string | string[];

  /**
   * How long the server will consider the client alive for presence.The value is in seconds.
   *
   * @default `300`
   */
  presenceTimeout?: number;

  /**
   * How often the client will announce itself to server. The value is in seconds.
   *
   * @default `not set`
   */
  heartbeatInterval?: number;

  /**
   * Transactional requests timeout in milliseconds.
   *
   * Maximum duration for which PubNub client should wait for transactional request completion.
   *
   * @default `15` seconds
   */
  transactionalRequestTimeout?: number;

  /**
   * Subscription requests timeout in milliseconds.
   *
   * Maximum duration for which PubNub client should wait for subscription request completion.
   *
   * @default `310` seconds
   */
  subscribeRequestTimeout?: number;

  /**
   * File upload / download request timeout in milliseconds.
   *
   * Maximum duration for which PubNub client should wait for file upload / download request
   * completion.
   *
   * @default `300` seconds
   */
  fileRequestTimeout?: number;

  /**
   * `true` to allow catch up on the front-end applications.
   *
   * @default `false`
   */
  restore?: boolean;

  /**
   * Whether to include the PubNub object instance ID in outgoing requests.
   *
   * @default `false`
   */
  useInstanceId?: boolean;

  /**
   * When `true` the SDK doesn't send out the leave requests.
   *
   * @default `false`
   */
  suppressLeaveEvents?: boolean;

  /**
   * `PNRequestMessageCountExceededCategory` is thrown when the number of messages into the
   * payload is above of `requestMessageCountThreshold`.
   *
   * @default `100`
   */
  requestMessageCountThreshold?: number;

  /**
   * This flag announces when the network is down or up using the states `PNNetworkDownCategory`
   * and `PNNetworkUpCategory`.
   *
   * @default `false`
   */
  autoNetworkDetection?: boolean;

  /**
   * Whether to use the standardized workflows for subscribe and presence.
   *
   * Note that the `maintainPresenceState` parameter is set to true by default, so make sure to
   * disable it if you don't need to maintain presence state. For more information, refer to the
   * param description in this table.
   *
   *
   * @default `false`
   */
  enableEventEngine?: boolean;

  /**
   * Custom reconnection configuration parameters.
   *
   * `retryConfiguration: policy` is the type of policy to be used.
   *
   * Available values:
   * - `PubNub.LinearRetryPolicy({ delay, maximumRetry })`
   * - `PubNub.ExponentialRetryPolicy({ minimumDelay, maximumDelay, maximumRetry })`
   *
   * For more information, refer to
   * {@link /docs/general/setup/connection-management#reconnection-policy|Reconnection Policy}. JavaScript doesn't
   * support excluding endpoints.
   *
   * @default `not set`
   */
  retryConfiguration?: RequestRetryPolicy;

  /**
   * Whether the `state` set using `setState()` should be maintained for the current `userId`.
   * This option works only when `enableEventEngine` is set to `true`.
   *
   * @default `true`
   */
  maintainPresenceState?: boolean;

  /**
   * Whether heartbeat should be postponed on successful subscribe response.
   *
   * With implicit heartbeat each successful `subscribe` loop response is treated as `heartbeat`
   * and there is no need to send another explicit heartbeat earlier than `heartbeatInterval`
   * since moment of `subscribe` response.
   *
   * **Note:** With disabled implicit heartbeat this feature may cause `timeout` if there is
   * constant activity on subscribed channels / groups.
   *
   * @default `true`
   */
  useSmartHeartbeat?: boolean;

  /**
   * `UUID` to use. You should set a unique `UUID` to identify the user or the device that
   * connects to PubNub.
   * If you don't set the `UUID`, you won't be able to connect to PubNub.
   *
   * @deprecated Use {@link userId} instead.
   */
  uuid?: string;

  /**
   * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
   * opening a new one for each new request.
   *
   * @default `false`
   */
  keepAlive?: boolean;

  /**
   * If the SDK is running as part of another SDK built atop of it, allow a custom `pnsdk` with
   * name and version.
   */
  sdkName?: string;

  /**
   * If the SDK is operated by a partner, allow a custom `pnsdk` item for them.
   */
  partnerId?: string;
};

/**
 * Extended client configuration.
 *
 * Extended configuration contains unannounced configuration options.
 *
 * @internal
 */
export type ExtendedConfiguration = UserConfiguration & {
  /**
   * PubNub Account key set.
   */
  keySet: KeySet;

  /**
   * Real-time updates filtering expression.
   */
  filterExpression?: string | null;

  /**
   * Whether messages should be de-duplicated on subscribe before announcement or not.
   *
   * @default `false`
   */
  dedupeOnSubscribe: boolean;

  /**
   * Maximum size of deduplication manager cache.
   */
  maximumCacheSize: number;

  /**
   * Whether unique request identifier should be used in request query or not.
   *
   * @default `false`
   */
  useRequestId?: boolean;

  /**
   * Whether heartbeat request success should be announced or not.
   *
   * @default `false`
   */
  announceSuccessfulHeartbeats: boolean;

  /**
   * Whether heartbeat request failure should be announced or not.
   *
   * @default `true`
   */
  announceFailedHeartbeats: boolean;

  /**
   * How many times file message publish attempt should be retried.
   *
   * @default `5`
   */
  fileUploadPublishRetryLimit: number;
};

/**
 * Platform-specific PubNub client configuration.
 *
 * Part of configuration which is added by platform-specific PubNub client initialization code.
 *
 * @internal
 */
export type PlatformConfiguration = {
  /**
   * Track of the SDK family for identifier generator.
   */
  sdkFamily: string;

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

  /**
   * Platform-specific file representation
   */
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  PubNubFile?: PubNubFileConstructor<PubNubFileInterface, any>;

  // region Deprecated parameters
  /**
   * If passed, will encrypt the payloads.
   *
   * @deprecated Pass it to `cryptoModule` instead.
   */
  cipherKey?: string;

  /**
   * When `true` the initialization vector (IV) is random for all requests (not just for file
   * upload).
   * When `false` the IV is hard-coded for all requests except for file upload.
   *
   * @default `true`
   *
   * @deprecated Pass it to `cryptoModule` instead.
   */
  useRandomIVs?: boolean;

  /**
   * Custom data encryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data encryption.
   */
  customEncrypt?: (data: string | Payload) => string;

  /**
   * Custom data decryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data decryption.
   */
  customDecrypt?: (data: string) => string;
  // endregion
};

/**
 * User-provided configuration object interface.
 *
 * Interface contains limited set of settings manipulation and access.
 */
export interface ClientConfiguration {
  /**
   * Get a PubNub client user identifier.
   *
   * @returns Current PubNub client user identifier.
   */
  getUserId(): string;

  /**
   * Change the current PubNub client user identifier.
   *
   * **Important:** Change won't affect ongoing REST API calls.
   *
   * @param value - New PubNub client user identifier.
   *
   * @throws Error empty user identifier has been provided.
   */
  setUserId(value: string): void;

  /**
   * Change REST API endpoint access authorization key.
   *
   * @param authKey - New authorization key which should be used with new requests.
   */
  setAuthKey(authKey: string | null): void;

  /**
   * Real-time updates filtering expression.
   *
   * @returns Filtering expression.
   */
  getFilterExpression(): string | undefined | null;

  /**
   * Update real-time updates filtering expression.
   *
   * @param expression - New expression which should be used or `undefined` to disable filtering.
   */
  setFilterExpression(expression: string | null | undefined): void;

  /**
   * Change data encryption / decryption key.
   *
   * @param key - New key which should be used for data encryption / decryption.
   */
  setCipherKey(key: string | undefined): void;

  /**
   * Get PubNub SDK version.
   *
   * @returns Current SDK version.
   */
  get version(): string;

  /**
   * Get PubNub SDK version.
   *
   * @returns Current SDK version.
   */
  getVersion(): string;

  /**
   * Add framework's prefix.
   *
   * @param name - Name of the framework which would want to add own data into `pnsdk` suffix.
   * @param suffix - Suffix with information about framework.
   */
  _addPnsdkSuffix(name: string, suffix: string | number): void;

  // --------------------------------------------------------
  // ---------------------- Deprecated ----------------------
  // --------------------------------------------------------
  // region Deprecated

  /**
   * Get a PubNub client user identifier.
   *
   * @returns Current PubNub client user identifier.
   *
   * @deprecated Use the {@link getUserId} or {@link userId} getter instead.
   */
  getUUID(): string;

  /**
   * Change the current PubNub client user identifier.
   *
   * **Important:** Change won't affect ongoing REST API calls.
   *
   * @param value - New PubNub client user identifier.
   *
   * @returns {Configuration} Reference to the configuration instance for easier chaining.
   *
   * @throws Error empty user identifier has been provided.
   *
   * @deprecated Use the {@link setUserId} or {@link userId} setter instead.
   */
  setUUID(value: string): void;
  // endregion
}

/**
 * Internal PubNub client configuration object interface.
 *
 * @internal
 */
export interface PrivateClientConfiguration
  extends ClientConfiguration,
    Omit<ExtendedConfiguration, 'subscribe_key' | 'publish_key' | 'secret_key' | 'uuid'> {
  /**
   * Registered loggers manager.
   */
  logger(): LoggerManager;

  /**
   * REST API endpoint access authorization key.
   *
   * It is required to have `authorization key` with required permissions to access REST API
   * endpoints when `PAM` enabled for user key set.
   */
  getAuthKey(): string | undefined | null;

  /**
   * Data encryption / decryption module.
   *
   * @returns Data processing crypto module (if set).
   */
  getCryptoModule(): ICryptoModule | undefined;

  /**
   * Whether `-pnpres` should not be filtered out from list of channels / groups in presence-related requests or not.
   *
   * This option required and set to `true` for Shared Worker setup to properly update client's state.
   *
   * @returns `true` if `-pnpres` channels and groups shouldn't be removed before sending request.
   */
  getKeepPresenceChannelsInPresenceRequests(): boolean;

  /**
   * Retrieve user's presence timeout.
   *
   * @returns User's presence timeout value.
   */
  getPresenceTimeout(): number;

  /**
   * Change user's presence timeout.
   *
   * @param timeout - New timeout for user's presence.
   */
  setPresenceTimeout(timeout: number): void;

  /**
   * Retrieve heartbeat requests interval.
   *
   * @returns Heartbeat requests interval.
   */
  getHeartbeatInterval(): number | undefined;

  /**
   * Change heartbeat requests interval.
   *
   * @param interval - New presence request heartbeat intervals.
   */
  setHeartbeatInterval(interval: number): void;

  /**
   * Transactional request timeout.
   *
   * @returns Maximum duration in milliseconds for which PubNub client should wait for
   * transactional request completion.
   */
  getTransactionTimeout(): number;

  /**
   * Subscription requests timeout.
   *
   * @returns Maximum duration in milliseconds for which PubNub client should wait for
   * subscription request completion.
   */
  getSubscribeTimeout(): number;

  /**
   * File requests timeout.
   *
   * @returns Maximum duration in milliseconds for which PubNub client should wait for
   * file upload / download request completion.
   */
  getFileTimeout(): number;

  /**
   * PubNub file object constructor.
   */
  get PubNubFile(): PubNubFileConstructor<PubNubFileInterface, unknown> | undefined;

  /**
   * Get PubNub client instance identifier.
   *
   * @returns Current PubNub client instance identifier.
   */
  get instanceId(): string | undefined;

  /**
   * Get PubNub client instance identifier.
   *
   * @returns Current PubNub client instance identifier.
   */
  getInstanceId(): string | undefined;

  /**
   * Get SDK family identifier.
   *
   * @returns Current SDK family identifier.
   */
  get sdkFamily(): string;

  /**
   * Compose `pnsdk` suffix string.
   *
   * @param separator - String which will be used to join registered suffixes.
   *
   * @returns Concatenated `pnsdk` suffix string.
   */
  _getPnsdkSuffix(separator: string): string;

  // --------------------------------------------------------
  // ---------------------- Deprecated ----------------------
  // --------------------------------------------------------
  // region Deprecated

  /**
   * If passed, will encrypt the payloads.
   *
   * @deprecated Pass it to `cryptoModule` instead.
   */
  getCipherKey(): string | undefined;

  /**
   * When `true` the initialization vector (IV) is random for all requests (not just for file
   * upload).
   * When `false` the IV is hard-coded for all requests except for file upload.
   *
   * @default `true`
   *
   * @deprecated Pass it to `cryptoModule` instead.
   */
  getUseRandomIVs(): boolean | undefined;

  /**
   * Custom data encryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data encryption.
   */
  getCustomEncrypt(): ((data: string | Payload) => string) | undefined;

  /**
   * Custom data decryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data decryption.
   */
  getCustomDecrypt(): ((data: string) => string) | undefined;
  // endregion
}

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @internal
 */
export const setDefaults = (configuration: UserConfiguration): ExtendedConfiguration => {
  // Copy configuration.
  const configurationCopy = { ...configuration };
  configurationCopy.ssl ??= USE_SSL;
  configurationCopy.transactionalRequestTimeout ??= TRANSACTIONAL_REQUEST_TIMEOUT;
  configurationCopy.subscribeRequestTimeout ??= SUBSCRIBE_REQUEST_TIMEOUT;
  configurationCopy.fileRequestTimeout ??= FILE_REQUEST_TIMEOUT;
  configurationCopy.restore ??= RESTORE;
  configurationCopy.useInstanceId ??= USE_INSTANCE_ID;
  configurationCopy.suppressLeaveEvents ??= SUPPRESS_LEAVE_EVENTS;
  configurationCopy.requestMessageCountThreshold ??= DEDUPE_CACHE_SIZE;
  configurationCopy.autoNetworkDetection ??= AUTO_NETWORK_DETECTION;
  configurationCopy.enableEventEngine ??= ENABLE_EVENT_ENGINE;
  configurationCopy.maintainPresenceState ??= MAINTAIN_PRESENCE_STATE;
  configurationCopy.useSmartHeartbeat ??= USE_SMART_HEARTBEAT;
  configurationCopy.keepAlive ??= KEEP_ALIVE;

  if (configurationCopy.userId && configurationCopy.uuid)
    throw new PubNubError("PubNub client configuration error: use only 'userId'");

  configurationCopy.userId ??= configurationCopy.uuid;

  if (!configurationCopy.userId) throw new PubNubError("PubNub client configuration error: 'userId' not set");
  else if (configurationCopy.userId?.trim().length === 0)
    throw new PubNubError("PubNub client configuration error: 'userId' is empty");

  // Generate default origin subdomains.
  if (!configurationCopy.origin)
    configurationCopy.origin = Array.from({ length: 20 }, (_, i) => `ps${i + 1}.pndsn.com`);

  const keySet: KeySet = {
    subscribeKey: configurationCopy.subscribeKey,
    publishKey: configurationCopy.publishKey,
    secretKey: configurationCopy.secretKey,
  };

  if (configurationCopy.presenceTimeout !== undefined) {
    if (configurationCopy.presenceTimeout > PRESENCE_TIMEOUT_MAXIMUM) {
      configurationCopy.presenceTimeout = PRESENCE_TIMEOUT_MAXIMUM;
      // eslint-disable-next-line no-console
      console.warn(
        'WARNING: Presence timeout is larger than the maximum. Using maximum value: ',
        PRESENCE_TIMEOUT_MAXIMUM,
      );
    } else if (configurationCopy.presenceTimeout <= 0) {
      // eslint-disable-next-line no-console
      console.warn('WARNING: Presence timeout should be larger than zero.');
      delete configurationCopy.presenceTimeout;
    }
  }

  if (configurationCopy.presenceTimeout !== undefined)
    configurationCopy.heartbeatInterval = configurationCopy.presenceTimeout / 2 - 1;
  else configurationCopy.presenceTimeout = PRESENCE_TIMEOUT;

  // Apply extended configuration defaults.
  let announceSuccessfulHeartbeats = ANNOUNCE_HEARTBEAT_SUCCESS;
  let announceFailedHeartbeats = ANNOUNCE_HEARTBEAT_FAILURE;
  let fileUploadPublishRetryLimit = FILE_PUBLISH_RETRY_LIMIT;
  let dedupeOnSubscribe = DEDUPE_ON_SUBSCRIBE;
  let maximumCacheSize = DEDUPE_CACHE_SIZE;
  let useRequestId = USE_REQUEST_ID;

  // @ts-expect-error Not documented legacy configuration options.
  if (configurationCopy.dedupeOnSubscribe !== undefined && typeof configurationCopy.dedupeOnSubscribe === 'boolean') {
    // @ts-expect-error Not documented legacy configuration options.
    dedupeOnSubscribe = configurationCopy.dedupeOnSubscribe;
  }

  // @ts-expect-error Not documented legacy configuration options.
  if (configurationCopy.maximumCacheSize !== undefined && typeof configurationCopy.maximumCacheSize === 'number') {
    // @ts-expect-error Not documented legacy configuration options.
    maximumCacheSize = configurationCopy.maximumCacheSize;
  }

  // @ts-expect-error Not documented legacy configuration options.
  if (configurationCopy.useRequestId !== undefined && typeof configurationCopy.useRequestId === 'boolean') {
    // @ts-expect-error Not documented legacy configuration options.
    useRequestId = configurationCopy.useRequestId;
  }

  if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.announceSuccessfulHeartbeats !== undefined &&
    // @ts-expect-error Not documented legacy configuration options.
    typeof configurationCopy.announceSuccessfulHeartbeats === 'boolean'
  ) {
    // @ts-expect-error Not documented legacy configuration options.
    announceSuccessfulHeartbeats = configurationCopy.announceSuccessfulHeartbeats;
  }

  if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.announceFailedHeartbeats !== undefined &&
    // @ts-expect-error Not documented legacy configuration options.
    typeof configurationCopy.announceFailedHeartbeats === 'boolean'
  ) {
    // @ts-expect-error Not documented legacy configuration options.
    announceFailedHeartbeats = configurationCopy.announceFailedHeartbeats;
  }

  if (
    // @ts-expect-error Not documented legacy configuration options.
    configurationCopy.fileUploadPublishRetryLimit !== undefined &&
    // @ts-expect-error Not documented legacy configuration options.
    typeof configurationCopy.fileUploadPublishRetryLimit === 'number'
  ) {
    // @ts-expect-error Not documented legacy configuration options.
    fileUploadPublishRetryLimit = configurationCopy.fileUploadPublishRetryLimit;
  }

  return {
    ...configurationCopy,
    keySet,
    dedupeOnSubscribe,
    maximumCacheSize,
    useRequestId,
    announceSuccessfulHeartbeats,
    announceFailedHeartbeats,
    fileUploadPublishRetryLimit,
  };
};
