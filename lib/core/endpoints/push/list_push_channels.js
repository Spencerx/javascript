"use strict";
/**
 * List Device push enabled channels REST API module.
 *
 * @internal
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListDevicePushNotificationChannelsRequest = void 0;
const push_1 = require("./push");
const operations_1 = __importDefault(require("../../constants/operations"));
// endregion
/**
 * List device push enabled channels request.
 *
 * @internal
 */
// prettier-ignore
class ListDevicePushNotificationChannelsRequest extends push_1.BasePushNotificationChannelsRequest {
    constructor(parameters) {
        super(Object.assign(Object.assign({}, parameters), { action: 'list' }));
    }
    operation() {
        return operations_1.default.PNPushNotificationEnabledChannelsOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return { channels: this.deserializeResponse(response) };
        });
    }
}
exports.ListDevicePushNotificationChannelsRequest = ListDevicePushNotificationChannelsRequest;
