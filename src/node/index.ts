import { ProxyAgentOptions } from 'proxy-agent';
import CborReader from 'cbor-sync';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

import { NodeCryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import type { NodeCryptoModule as CryptoModuleType } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';

import { ExtendedConfiguration, PlatformConfiguration } from '../core/interfaces/configuration';
import { PubNubConfiguration, setDefaults } from './components/configuration';
import PubNubFile, { PubNubFileParameters } from '../file/modules/node';
import { CryptorConfiguration } from '../core/interfaces/crypto-module';
import { makeConfiguration } from '../core/components/configuration';
import { TokenManager } from '../core/components/token_manager';
import { Cryptography } from '../core/interfaces/cryptography';
import { NodeTransport } from '../transport/node-transport';
import { PubNubMiddleware } from '../transport/middleware';
import { PubNubFileConstructor } from '../core/types/file';
import { decode } from '../core/components/base64_codec';
import NodeCryptography from '../crypto/modules/node';
import Crypto from '../core/components/cryptography';
import { PubNubError } from '../errors/pubnub-error';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';

/**
 * PubNub client for Node.js platform.
 */
class PubNub extends PubNubCore<string | ArrayBuffer | Buffer | Readable, PubNubFileParameters, PubNubFile> {
  /**
   * Data encryption / decryption module constructor.
   */
  // @ts-expect-error Allowed to simplify interface when module can be disabled.
  static CryptoModule: typeof CryptoModuleType =
    process.env.CRYPTO_MODULE !== 'disabled' ? NodeCryptoModule : undefined;

  /**
   * PubNub File constructor.
   */
  public File: PubNubFileConstructor<PubNubFile, PubNubFileParameters> = PubNubFile;

  /**
   * Actual underlying transport provider.
   *
   * @internal
   */
  private nodeTransport: NodeTransport;

  /**
   * Create and configure PubNub client core.
   *
   * @param configuration - User-provided PubNub client configuration.
   *
   * @returns Configured and ready to use PubNub client.
   */
  constructor(configuration: PubNubConfiguration) {
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration: ExtendedConfiguration & PlatformConfiguration = {
      ...configurationCopy,
      sdkFamily: 'Nodejs',
    };

    if (process.env.FILE_SHARING_MODULE !== 'disabled') platformConfiguration.PubNubFile = PubNubFile;

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(
      platformConfiguration,
      (cryptoConfiguration: CryptorConfiguration) => {
        if (!cryptoConfiguration.cipherKey) return undefined;

        if (process.env.CRYPTO_MODULE !== 'disabled') {
          return new NodeCryptoModule({
            default: new LegacyCryptor({
              ...cryptoConfiguration,
              ...(!cryptoConfiguration.logger ? { logger: clientConfiguration.logger() } : {}),
            }),
            cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
          });
        } else return undefined;
      },
    );

    if (process.env.CRYPTO_MODULE !== 'disabled') {
      // Ensure that the logger has been passed to the user-provided crypto module.
      if (clientConfiguration.getCryptoModule())
        (clientConfiguration.getCryptoModule() as NodeCryptoModule).logger = clientConfiguration.logger();
    }

    // Prepare Token manager.
    let tokenManager: TokenManager | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') {
      tokenManager = new TokenManager(
        new Cbor((buffer: ArrayBuffer) => CborReader.decode(Buffer.from(buffer)), decode),
      );
    }

    // Legacy crypto (legacy data encryption / decryption and request signature support).
    let crypto: Crypto | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') {
      crypto = new Crypto({
        secretKey: clientConfiguration.secretKey,
        cipherKey: clientConfiguration.getCipherKey(),
        useRandomIVs: clientConfiguration.getUseRandomIVs(),
        customEncrypt: clientConfiguration.getCustomEncrypt(),
        customDecrypt: clientConfiguration.getCustomDecrypt(),
        logger: clientConfiguration.logger(),
      });
    }

    let cryptography: Cryptography<string | ArrayBuffer | Buffer | Readable> | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') cryptography = new NodeCryptography();

    // Setup transport provider.
    const transport = new NodeTransport(
      clientConfiguration.logger(),
      configuration.keepAlive,
      configuration.keepAliveSettings,
    );
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport,
      shaHMAC: process.env.CRYPTO_MODULE !== 'disabled' ? crypto?.HMACSHA256.bind(crypto) : undefined,
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      cryptography,
      tokenManager,
      crypto,
    });

    this.nodeTransport = transport;
  }

  /**
   * Update request proxy configuration.
   *
   * @param configuration - Updated request proxy configuration.
   *
   * @throws An error if {@link PubNub} client already configured to use `keepAlive`.
   * `keepAlive` and `proxy` can't be used simultaneously.
   */
  public setProxy(configuration?: ProxyAgentOptions) {
    if (configuration && (this._configuration.keepAlive ?? false))
      throw new PubNubError("Can't set 'proxy' because already configured for 'keepAlive'");

    this.nodeTransport.setProxy(configuration);
    this.reconnect();
  }
}

export = PubNub;
