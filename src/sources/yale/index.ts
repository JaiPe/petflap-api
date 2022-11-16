import { Endpoint, AuthJSONBody, AlarmMode } from './types.js';
import { BodyEncoding, get, post } from '../../common.js';

// This came from ...
export const YALE_AUTH_TOKEN =
    'VnVWWDZYVjlXSUNzVHJhcUVpdVNCUHBwZ3ZPakxUeXNsRU1LUHBjdTpkd3RPbE15WEtENUJ5ZW1GWHV0am55eGhrc0U3V0ZFY2p0dFcyOXRaSWNuWHlSWHFsWVBEZ1BSZE1xczF4R3VwVTlxa1o4UE5ubGlQanY5Z2hBZFFtMHpsM0h4V3dlS0ZBcGZzakpMcW1GMm1HR1lXRlpad01MRkw3MGR0bmNndQ==';

export default class YaleAPI {
    #token: string;

    async token() {
        if (!process.env.YALE_USERNAME || !process.env.YALE_PASSWORD) {
            throw new Error('Missing username and password');
        }
        if (!this.#token) {
            this.#token = await getAuthToken({
                username: process.env.YALE_USERNAME,
                password: process.env.YALE_PASSWORD,
                grant_type: 'password'
            });
        }

        return { token: this.#token };
    }

    async isArmed() {
        const [{ mode }] = await get<[{ area: string; mode: AlarmMode }]>(
            Endpoint.STATUS,
            '',
            await this.token()
        );
        return (
            mode === AlarmMode.ARMED_FULL || mode === AlarmMode.ARMED_PARTIAL
        );
    }

    async partArm() {
        const { result, message } = await post<
            { area: string; mode: AlarmMode },
            { result: boolean; message: string }
        >(
            Endpoint.STATUS,
            { area: '1', mode: AlarmMode.ARMED_PARTIAL },
            '',
            await this.token(),
            BodyEncoding.FORM
        );
        if (!result) {
            throw new Error(message);
        }
        return result;
    }

    async disarm() {
        console.log(await this.token());

        const { result, message } = await post<
            { area: string; mode: AlarmMode },
            { result: boolean; message: string }
        >(
            Endpoint.STATUS,
            { area: '1', mode: AlarmMode.DISARMED },
            '',
            await this.token(),
            BodyEncoding.FORM
        );
        if (!result) {
            throw new Error(message);
        }
        return result;
    }
}

async function getAuthToken(credentials: AuthJSONBody): Promise<string> {
    const result = await post<
        AuthJSONBody,
        { error: string; error_description: string } | { access_token: string }
    >(
        Endpoint.AUTH,
        credentials,
        '',
        { type: 'Basic', token: YALE_AUTH_TOKEN },
        BodyEncoding.FORM
    );
    if ('error' in result) {
        throw new Error(result.error_description);
    }

    return result.access_token;
}
