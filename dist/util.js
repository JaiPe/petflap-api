var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as os from 'os';
const DEFAULT_HEADERS = {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Origin: 'https://surepetcare.io',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 7.0; SM-G930F Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36',
    Referer: 'https://surepetcare.io/',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en-GB;q=0.9',
    'X-Requested-With': 'com.sureflap.surepetcare',
};
export default function createDeviceId() {
    const interfaces = os.networkInterfaces();
    const [{ mac }] = interfaces[Object.keys(interfaces)[0]];
    return String(parseInt(mac.replace(/[-:]/g, '').substr(0, 10), 16));
}
export function put(endpoint, body, path = '', token) {
    return __awaiter(this, void 0, void 0, function* () {
        const req = yield fetch(`${endpoint}/${path}`, {
            method: 'PUT',
            headers: token
                ? Object.assign(Object.assign({}, DEFAULT_HEADERS), { Authorization: `Bearer ${token}` }) : DEFAULT_HEADERS,
            body: JSON.stringify(body),
        });
        if (req.ok) {
            return req.status >= 200 && req.status <= 299;
        }
        throw new Error(`PUT request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`);
    });
}
export function post(endpoint, body, path = '') {
    return __awaiter(this, void 0, void 0, function* () {
        const req = yield fetch(`${endpoint}/${path}`, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(body),
        });
        if (req.ok) {
            const json = yield req.json();
            if (json) {
                return json.data;
            }
        }
        throw new Error(`POST request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`);
    });
}
export function get(endpoint, path, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const req = yield fetch(`${endpoint}/${path}`, {
            headers: Object.assign(Object.assign({}, DEFAULT_HEADERS), { Authorization: `Bearer ${token}` }),
        });
        if (req.ok) {
            const json = yield req.json();
            if (json) {
                return json.data;
            }
        }
        throw new Error(`GET request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`);
    });
}
