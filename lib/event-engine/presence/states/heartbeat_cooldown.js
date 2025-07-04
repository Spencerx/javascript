"use strict";
/**
 * Waiting next heartbeat state module.
 *
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatCooldownState = void 0;
const state_1 = require("../../core/state");
const events_1 = require("../events");
const effects_1 = require("../effects");
const heartbeating_1 = require("./heartbeating");
const heartbeat_stopped_1 = require("./heartbeat_stopped");
const heartbeat_inactive_1 = require("./heartbeat_inactive");
/**
 * Waiting next heartbeat state.
 *
 * State in which Presence Event Engine is waiting when delay will run out and next heartbeat call should be done.
 *
 * @internal
 */
exports.HeartbeatCooldownState = new state_1.State('HEARTBEAT_COOLDOWN');
exports.HeartbeatCooldownState.onEnter(() => (0, effects_1.wait)());
exports.HeartbeatCooldownState.onExit(() => effects_1.wait.cancel);
exports.HeartbeatCooldownState.on(events_1.timesUp.type, (context, _) => heartbeating_1.HeartbeatingState.with({
    channels: context.channels,
    groups: context.groups,
}));
exports.HeartbeatCooldownState.on(events_1.joined.type, (context, event) => heartbeating_1.HeartbeatingState.with({
    channels: [...context.channels, ...event.payload.channels.filter((channel) => !context.channels.includes(channel))],
    groups: [...context.groups, ...event.payload.groups.filter((group) => !context.groups.includes(group))],
}));
exports.HeartbeatCooldownState.on(events_1.left.type, (context, event) => heartbeating_1.HeartbeatingState.with({
    channels: context.channels.filter((channel) => !event.payload.channels.includes(channel)),
    groups: context.groups.filter((group) => !event.payload.groups.includes(group)),
}, [(0, effects_1.leave)(event.payload.channels, event.payload.groups)]));
exports.HeartbeatCooldownState.on(events_1.disconnect.type, (context, event) => heartbeat_stopped_1.HeartbeatStoppedState.with({ channels: context.channels, groups: context.groups }, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
exports.HeartbeatCooldownState.on(events_1.leftAll.type, (context, event) => heartbeat_inactive_1.HeartbeatInactiveState.with(undefined, [
    ...(!event.payload.isOffline ? [(0, effects_1.leave)(context.channels, context.groups)] : []),
]));
