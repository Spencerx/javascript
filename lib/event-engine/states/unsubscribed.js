"use strict";
/**
 * Unsubscribed / disconnected state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscribedState = void 0;
const state_1 = require("../core/state");
const events_1 = require("../events");
const handshaking_1 = require("./handshaking");
/**
 * Unsubscribed / disconnected state.
 *
 * State in which Subscription Event Engine doesn't process any real-time updates.
 *
 * @internal
 */
exports.UnsubscribedState = new state_1.State('UNSUBSCRIBED');
exports.UnsubscribedState.on(events_1.subscriptionChange.type, (_, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return exports.UnsubscribedState.with(undefined);
    return handshaking_1.HandshakingState.with({ channels: payload.channels, groups: payload.groups });
});
exports.UnsubscribedState.on(events_1.restore.type, (_, { payload }) => {
    if (payload.channels.length === 0 && payload.groups.length === 0)
        return exports.UnsubscribedState.with(undefined);
    return handshaking_1.HandshakingState.with({
        channels: payload.channels,
        groups: payload.groups,
        cursor: { timetoken: `${payload.cursor.timetoken}`, region: payload.cursor.region },
    });
});
