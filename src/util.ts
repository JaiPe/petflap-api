import * as os from 'os'

import { Endpoint } from './types.js'

const DEFAULT_HEADERS = {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Origin: 'https://surepetcare.io',
    'User-Agent':
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930F Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36',
    Referer: 'https://surepetcare.io/',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en-GB;q=0.9',
    'X-Requested-With': 'com.sureflap.surepetcare',
}

export default function createDeviceId() {
    const interfaces = os.networkInterfaces()
    const [{ mac }] = interfaces[Object.keys(interfaces)[0]]!

    return String(parseInt(mac.replace(/[-:]/g, '').substr(0, 10), 16))
}

export async function put<Body>(
    endpoint: Endpoint,
    body: Body,
    path: string = '',
    token: string
): Promise<boolean> {
    const req = await fetch(`${endpoint}/${path}`, {
        method: 'PUT',
        headers: token
            ? { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` }
            : DEFAULT_HEADERS,
        body: JSON.stringify(body),
    })
    if (req.ok) {
        return req.status >= 200 && req.status <= 299
    }
    throw new Error(
        `PUT request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`
    )
}

export async function post<Body, Result>(
    endpoint: Endpoint,
    body: Body,
    path: string = ''
): Promise<Result> {
    const req = await fetch(`${endpoint}/${path}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(body),
    })
    if (req.ok) {
        const json = await req.json()

        if (json) {
            return json.data
        }
    }
    throw new Error(
        `POST request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`
    )
}

export async function get<Result>(
    endpoint: Endpoint,
    path: string,
    token: string
): Promise<Result> {
    const req = await fetch(`${endpoint}/${path}`, {
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
    })
    if (req.ok) {
        const json = await req.json()

        if (json) {
            return json.data
        }
    }
    throw new Error(
        `GET request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`
    )
}
