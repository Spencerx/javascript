"use strict";
/**
 * Set Channel Members REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetChannelMembersRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Member` custom field should be included in response or not.
 */
const INCLUDE_CUSTOM_FIELDS = false;
/**
 * Whether member's `status` field should be included in response or not.
 */
const INCLUDE_STATUS = false;
/**
 * Whether member's `type` field should be included in response or not.
 */
const INCLUDE_TYPE = false;
/**
 * Whether total number of members should be included in response or not.
 */
const INCLUDE_TOTAL_COUNT = false;
/**
 * Whether `UUID` fields should be included in response or not.
 */
const INCLUDE_UUID_FIELDS = false;
/**
 * Whether `UUID` status field should be included in response or not.
 */
const INCLUDE_UUID_STATUS_FIELD = false;
/**
 * Whether `UUID` type field should be included in response or not.
 */
const INCLUDE_UUID_TYPE_FIELD = false;
/**
 * Whether `UUID` custom field should be included in response or not.
 */
const INCLUDE_UUID_CUSTOM_FIELDS = false;
/**
 * Number of objects to return in response.
 */
const LIMIT = 100;
// endregion
/**
 * Set Channel Members request.
 *
 * @internal
 */
class SetChannelMembersRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var _l, _m, _o, _p, _q, _r, _s, _t;
        super({ method: transport_request_1.TransportMethod.PATCH });
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_l = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_l.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_m = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_m.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = (_o = parameters.include).statusField) !== null && _d !== void 0 ? _d : (_o.statusField = INCLUDE_STATUS);
        (_e = (_p = parameters.include).typeField) !== null && _e !== void 0 ? _e : (_p.typeField = INCLUDE_TYPE);
        (_f = (_q = parameters.include).UUIDFields) !== null && _f !== void 0 ? _f : (_q.UUIDFields = INCLUDE_UUID_FIELDS);
        (_g = (_r = parameters.include).customUUIDFields) !== null && _g !== void 0 ? _g : (_r.customUUIDFields = INCLUDE_UUID_CUSTOM_FIELDS);
        (_h = (_s = parameters.include).UUIDStatusField) !== null && _h !== void 0 ? _h : (_s.UUIDStatusField = INCLUDE_UUID_STATUS_FIELD);
        (_j = (_t = parameters.include).UUIDTypeField) !== null && _j !== void 0 ? _j : (_t.UUIDTypeField = INCLUDE_UUID_TYPE_FIELD);
        (_k = parameters.limit) !== null && _k !== void 0 ? _k : (parameters.limit = LIMIT);
    }
    operation() {
        return operations_1.default.PNSetMembersOperation;
    }
    validate() {
        const { channel, uuids } = this.parameters;
        if (!channel)
            return 'Channel cannot be empty';
        if (!uuids || uuids.length === 0)
            return 'UUIDs cannot be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v2/objects/${subscribeKey}/channels/${(0, utils_1.encodeString)(channel)}/uuids`;
    }
    get queryParameters() {
        const { include, page, filter, sort, limit } = this.parameters;
        let sorting = '';
        if (typeof sort === 'string')
            sorting = sort;
        else
            sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
        const includeFlags = ['uuid.status', 'uuid.type', 'type'];
        if (include.statusField)
            includeFlags.push('status');
        if (include.typeField)
            includeFlags.push('type');
        if (include.customFields)
            includeFlags.push('custom');
        if (include.UUIDFields)
            includeFlags.push('uuid');
        if (include.UUIDStatusField)
            includeFlags.push('uuid.status');
        if (include.UUIDTypeField)
            includeFlags.push('uuid.type');
        if (include.customUUIDFields)
            includeFlags.push('uuid.custom');
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ count: `${include.totalCount}` }, (includeFlags.length > 0 ? { include: includeFlags.join(',') } : {})), (filter ? { filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit } : {})), (sorting.length ? { sort: sorting } : {}));
    }
    get headers() {
        var _a;
        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
    }
    get body() {
        const { uuids, type } = this.parameters;
        return JSON.stringify({
            [`${type}`]: uuids.map((uuid) => {
                if (typeof uuid === 'string') {
                    return { uuid: { id: uuid } };
                }
                else {
                    return { uuid: { id: uuid.id }, status: uuid.status, type: uuid.type, custom: uuid.custom };
                }
            }),
        });
    }
}
exports.SetChannelMembersRequest = SetChannelMembersRequest;
