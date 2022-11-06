var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _SurePetAPI_instances, _SurePetAPI_token, _SurePetAPI_petInfo, _SurePetAPI_flapIds, _SurePetAPI_householdIds, _SurePetAPI_flaps, _SurePetAPI_households, _SurePetAPI_pets;
import { LockMode } from './types.js';
import createDeviceId, { put, get, post } from './util.js';
const GENERIC_DEVICE_ID = createDeviceId();
var Location;
(function (Location) {
    Location[Location["INSIDE"] = 1] = "INSIDE";
    Location[Location["OUTSIDE"] = 2] = "OUTSIDE";
})(Location || (Location = {}));
export default class SurePetAPI {
    constructor() {
        _SurePetAPI_instances.add(this);
        _SurePetAPI_token.set(this, void 0);
        _SurePetAPI_petInfo.set(this, void 0);
        _SurePetAPI_flapIds.set(this, void 0);
        _SurePetAPI_householdIds.set(this, void 0);
    }
    token() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!process.env.SUREPET_EMAIL || !process.env.SUREPET_PASSWORD) {
                throw new Error('Missing email and password');
            }
            __classPrivateFieldSet(this, _SurePetAPI_token, __classPrivateFieldGet(this, _SurePetAPI_token, "f") ||
                (yield getAuthToken({
                    email_address: process.env.SUREPET_EMAIL,
                    password: process.env.SUREPET_PASSWORD,
                    device_id: GENERIC_DEVICE_ID,
                })), "f");
            return __classPrivateFieldGet(this, _SurePetAPI_token, "f");
        });
    }
    lockIn() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield setFlapLock(yield this.token(), (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_flaps).call(this, (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_households).call(this))[0]))[0], LockMode.LOCKED_IN);
        });
    }
    lockOut() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield setFlapLock(yield this.token(), (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_flaps).call(this, (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_households).call(this))[0]))[0], LockMode.LOCKED_OUT);
        });
    }
    locationOf(petName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const petId = (_a = (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_pets).call(this))[petName.toLowerCase()]) === null || _a === void 0 ? void 0 : _a.id;
            if (!petId) {
                throw new Error('Could not find pet with this name');
            }
            return yield getPetLocation(yield this.token(), petId);
        });
    }
    lock() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield setFlapLock(yield this.token(), (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_flaps).call(this, (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_households).call(this))[0]))[0], LockMode.LOCKED_BOTH);
        });
    }
    unlock() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield setFlapLock(yield this.token(), (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_flaps).call(this, (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_households).call(this))[0]))[0], LockMode.UNLOCKED);
        });
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield getFlapStatus(yield this.token(), (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_flaps).call(this, (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_households).call(this))[0]))[0]);
        });
    }
}
_SurePetAPI_token = new WeakMap(), _SurePetAPI_petInfo = new WeakMap(), _SurePetAPI_flapIds = new WeakMap(), _SurePetAPI_householdIds = new WeakMap(), _SurePetAPI_instances = new WeakSet(), _SurePetAPI_flaps = function _SurePetAPI_flaps(householdId) {
    return __awaiter(this, void 0, void 0, function* () {
        __classPrivateFieldSet(this, _SurePetAPI_flapIds, __classPrivateFieldGet(this, _SurePetAPI_flapIds, "f") || (yield getFlapIds(yield __classPrivateFieldGet(this, _SurePetAPI_token, "f"), householdId)), "f");
        return __classPrivateFieldGet(this, _SurePetAPI_flapIds, "f");
    });
}, _SurePetAPI_households = function _SurePetAPI_households() {
    return __awaiter(this, void 0, void 0, function* () {
        __classPrivateFieldSet(this, _SurePetAPI_householdIds, __classPrivateFieldGet(this, _SurePetAPI_householdIds, "f") || (yield getHouseholdIds(__classPrivateFieldGet(this, _SurePetAPI_token, "f"))), "f");
        return __classPrivateFieldGet(this, _SurePetAPI_householdIds, "f");
    });
}, _SurePetAPI_pets = function _SurePetAPI_pets() {
    return __awaiter(this, void 0, void 0, function* () {
        __classPrivateFieldSet(this, _SurePetAPI_petInfo, __classPrivateFieldGet(this, _SurePetAPI_petInfo, "f") ||
            (yield getPetInfo(yield this.token(), (yield __classPrivateFieldGet(this, _SurePetAPI_instances, "m", _SurePetAPI_households).call(this))[0])), "f");
        return __classPrivateFieldGet(this, _SurePetAPI_petInfo, "f");
    });
};
function setFlapLock(token, flapId, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield put("https://app.api.surehub.io/api/device" /* Endpoint.DEVICE */, { locking: mode }, `${flapId}/control`, token);
    });
}
function getPetLocation(token, petId) {
    return __awaiter(this, void 0, void 0, function* () {
        const location = yield get("https://app.api.surehub.io/api/pet" /* Endpoint.PET */, `${petId}/position`, token);
        const since = new Date(Date.parse(location.since));
        if (location.where > 2 || location.where < 1) {
            return {
                location: 'unknown',
                since,
            };
        }
        return {
            location: location.where === Location.INSIDE ? 'inside' : 'outside',
            since,
        };
    });
}
function getPetInfo(token, householdId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pet = yield get("https://app.api.surehub.io/api/household" /* Endpoint.HOUSEHOLD */, `${householdId}/pet`, token);
        return pet.reduce((byName, pet) => {
            byName[pet.name.toLowerCase()] = pet;
            return byName;
        }, {});
    });
}
function getFlapStatus(token, flapId) {
    return __awaiter(this, void 0, void 0, function* () {
        const { locking: { mode }, } = yield get("https://app.api.surehub.io/api/device" /* Endpoint.DEVICE */, `${flapId}/status`, token);
        if (mode === undefined) {
            throw new Error('Cannot find flap status');
        }
        switch (mode) {
            case LockMode.LOCKED_BOTH:
                return 'locked both ways';
            case LockMode.LOCKED_IN:
                return 'locked in';
            case LockMode.LOCKED_OUT:
                return 'locked out';
            case LockMode.UNLOCKED:
            case LockMode.CURFEW_UNLOCKED:
                return 'not locked';
            case LockMode.CURFEW || LockMode.CURFEW_LOCKED || LockMode.CURFEW_OTHER:
                return 'locked by app curfew settings';
            default:
        }
        return 'unknown';
    });
}
function getHouseholdIds(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const households = yield get("https://app.api.surehub.io/api/household" /* Endpoint.HOUSEHOLD */, '', token);
        if (households.length > 0) {
            return households.map(({ id }) => id);
        }
        else {
            throw new Error('No households found.');
        }
    });
}
function getAuthToken(credentials) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token } = yield post("https://app.api.surehub.io/api/auth/login" /* Endpoint.AUTH */, credentials);
        return token;
    });
}
function getFlapIds(token, householdId) {
    return __awaiter(this, void 0, void 0, function* () {
        const devices = yield get("https://app.api.surehub.io/api/household" /* Endpoint.HOUSEHOLD */, `${householdId}/device`, token);
        const flaps = devices.filter((device) => device.product_id === 3 || device.product_id === 6);
        if (flaps.length) {
            return flaps.map(({ id }) => id);
        }
        throw new Error('Could not find any cat flap devices.');
    });
}
