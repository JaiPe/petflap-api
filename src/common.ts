import _ from 'lodash';
import * as os from 'os';
import fetch from 'node-fetch';

export const enum BodyEncoding {
    JSON = 'application/json',
    FORM = 'application/x-www-form-urlencoded; charset=UTF-8'
}

export type Token = { type?: 'Basic' | 'Bearer'; token: string };

const DEFAULT_HEADERS = {
    Accept: BodyEncoding.JSON,
    'User-Agent':
        'Mozilla/5.0 (Linux; Android 7.0; SM-G930F Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en-GB;q=0.9'
};

export default function createDeviceId() {
    const interfacesByKey = os.networkInterfaces();

    let ni;
    for (const key in interfacesByKey) {
        ni = _.find(
            interfacesByKey[key],
            (value) => value.mac && value.mac !== '00:00:00:00:00:00'
        );

        if (ni) {
            break;
        }
    }
    if (!ni) {
        throw new Error('Could not resolve mac address');
    }
    return String(parseInt(ni.mac.replace(/[-:]/g, '').substr(0, 10), 16));
}

export async function put<Body>(
    endpoint: string,
    body: Body,
    path: string = '',
    token: Token = null,
    additionalHeaders: Record<string, string> = {}
): Promise<boolean> {
    const req = await fetch(`${endpoint}/${path}`, {
        method: 'PUT',
        headers: applyTokenHeader(
            {
                ...DEFAULT_HEADERS,
                ...additionalHeaders,
                'Content-Type': BodyEncoding.JSON
            },
            token
        ),
        body: JSON.stringify(body)
    });
    if (req.status === 401) {
        throw new Error('Authorization failed');
    }
    if (req.ok) {
        return req.status >= 200 && req.status <= 299;
    }
    throw new Error(
        `PUT request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`
    );
}

function asFormData(data: Record<string, string>) {
    const formData = [];

    for (const key in data) {
        formData.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
        );
    }

    return formData.join('&');
}

export async function post<Body extends Record<string, string>, Result>(
    endpoint: string,
    body: Body,
    path: string = '',
    token: Token = null,
    bodyEncoding: BodyEncoding = BodyEncoding.JSON,
    additionalHeaders: Record<string, string> = {}
): Promise<Result> {
    const req = await fetch(`${endpoint}/${path}`, {
        method: 'POST',
        headers: applyTokenHeader(
            {
                ...DEFAULT_HEADERS,
                ...additionalHeaders,
                'Content-Type': bodyEncoding
            },
            token
        ),
        body:
            BodyEncoding.JSON === bodyEncoding
                ? JSON.stringify(body)
                : asFormData(body)
    });
    if (req.status === 401) {
        throw new Error('Authorization failed');
    }
    if (req.ok) {
        return (await req.json()) as Result;
    }
    throw new Error(
        `POST request to ${endpoint}/${path} failed with code ${req.status} ${
            req.statusText
        } ${await req.text()}`
    );
}

function applyTokenHeader(
    headers: Record<string, string>,
    tokenDescriptor: Token
) {
    return tokenDescriptor
        ? {
              ...headers,
              Authorization: `${tokenDescriptor.type || 'Bearer'} ${
                  tokenDescriptor.token
              }`
          }
        : headers;
}

export async function get<Result>(
    endpoint: string,
    path: string,
    token: Token = null,
    additionalHeaders: Record<string, string> = {}
): Promise<Result> {
    const req = await fetch(`${endpoint}/${path}`, {
        headers: applyTokenHeader(
            { ...DEFAULT_HEADERS, ...additionalHeaders },
            token
        )
    });
    if (req.status === 401) {
        throw new Error('Authorization failed');
    }
    if (req.ok) {
        return (await req.json()) as Result;
    }
    throw new Error(
        `GET request to ${endpoint}/${path} failed with code ${req.status} ${req.statusText}`
    );
}
