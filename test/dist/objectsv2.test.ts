/**       */

import chaiAsPromised from 'chai-as-promised';
import chai, { expect } from 'chai';
import chaiNock from 'chai-nock';
import assert from 'assert';

import { Listener } from '../../src/core/components/listener_manager';
import PubNub from '../../src/node';

chai.use(chaiAsPromised);
chai.use(chaiNock);

describe('Objects V2 system tests', () => {
  const TEST_PREFIX = 'objectsV2tests';
  const UUID = `${TEST_PREFIX}-main`;
  const UUID_1 = `${TEST_PREFIX}-uuid-1`;

  const CHANNEL_1 = `${TEST_PREFIX}-channel-1`;

  let pubnub: PubNub;

  const events = [];
  const listener: Listener = {
    objects: (event) => {
      events.push(event);
    },
  };

  before(() => {
    pubnub = new PubNub({
      subscribeKey: process.env.SUBSCRIBE_KEY || 'demo',
      publishKey: process.env.PUBLISH_KEY || 'demo',
      uuid: UUID,
      // logVerbosity: true
    });

    pubnub.subscribe({ channels: [UUID_1] });
    pubnub.addListener(listener);
  });

  after(() => {
    pubnub.unsubscribeAll();
    pubnub.removeListener(listener);
    pubnub.destroy();
  });

  const USER_NAME = `Test Name ${Math.random().toString(16).substr(2, 5)}`;
  const CHANNEL_NAME = `Test Channel Name ${Math.random().toString(16).substr(2, 5)}`;

  it('should set uuid', async () => {
    const result = await pubnub.objects.setUUIDMetadata({ uuid: UUID_1, data: { name: USER_NAME } });

    expect(result.status).to.equal(200);
    expect(result.data.id).to.equal(UUID_1);
  });

  it('should get uuid', async () => {
    const result = await pubnub.objects.getUUIDMetadata({ uuid: UUID_1 });

    expect(result.status).to.equal(200);
    expect(result.data.name).to.equal(USER_NAME);
  });

  it('should get all uuids', async () => {
    const result = await pubnub.objects.getAllUUIDMetadata({ include: { totalCount: true } });

    expect(result.status).to.equal(200);
    expect(result.data[0].name).to.equal(USER_NAME);
  });

  it('should set channel', async () => {
    const result = await pubnub.objects.setChannelMetadata({
      channel: CHANNEL_1,
      data: {
        name: CHANNEL_NAME,
        custom: { foo: true },
      },
    });

    expect(result.status).to.equal(200);
    expect(result.data.name).to.equal(CHANNEL_NAME);
  });

  it('should get channel', async () => {
    const result = await pubnub.objects.getChannelMetadata({ channel: CHANNEL_1 });

    expect(result.status).to.equal(200);
    expect(result.data.name).to.equal(CHANNEL_NAME);
  });

  it('should get all channels', async () => {
    const result = await pubnub.objects.getAllChannelMetadata();

    expect(result.status).to.equal(200);
    expect(result.data[0].name).to.equal(CHANNEL_NAME);
  });

  it('should set memberships', async () => {
    const result = await pubnub.objects.setMemberships({
      uuid: UUID_1,
      channels: [{ id: CHANNEL_1, custom: { myData: 42 }, status: 'active', type: 'test' }],
    });

    expect(result.status).to.equal(200);
  });

  it('should get channel members', async () => {
    const result = await pubnub.objects.getChannelMembers({
      channel: CHANNEL_1,
      include: { customFields: true },
    });

    expect(result.status).to.equal(200);
    expect(result.data[0]?.custom?.myData).to.equal(42);
  });

  it('should get memberships', async () => {
    const result = await pubnub.objects.getMemberships({
      uuid: UUID_1,
      include: {
        statusField: true,
        typeField: true,
        customFields: true,
        customChannelFields: true,
        channelFields: true,
      },
    });

    expect(result.status).to.equal(200);
    expect(result.data[0].custom?.myData).to.equal(42);
    assert('name' in result.data[0].channel);
    expect(result.data[0].status).to.equal('active');
    expect(result.data[0].type).to.equal('test');
    expect(result.data[0].channel?.name).to.equal(CHANNEL_NAME);
    expect(result.data[0].channel?.custom?.foo).to.be.true;
  });

  it('should remove memberships', async () => {
    const result = await pubnub.objects.removeMemberships({ uuid: UUID_1, channels: [CHANNEL_1] });
    expect(result.status).to.equal(200);
  });

  it('should remove uuid', async () => {
    const result = await pubnub.objects.removeUUIDMetadata({ uuid: UUID_1 });

    expect(result.status).to.equal(200);
    expect(result.data).to.be.null;
  });
});
