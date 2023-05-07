import { Endpoint, LockMode, Pet, AuthJSONBody, Location } from './types.js';
import createDeviceId, {
    put,
    get,
    post,
    Token,
    BodyEncoding
} from '../../common.js';

const GENERIC_DEVICE_ID = createDeviceId();

const ADDITIONAL_HEADERS = {
    Origin: 'https://surepetcare.io',
    Referer: 'https://surepetcare.io/',
    'X-Requested-With': 'com.sureflap.surepetcare'
};

export default class SurePetAPI {
    #token: Token;
    #petInfo: { [key: string]: Pet };
    #flapIds: number[];
    #householdIds: number[];

    async token() {
        if (!process.env.SUREPET_EMAIL || !process.env.SUREPET_PASSWORD) {
            throw new Error('Missing email and password');
        }
        return (this.#token =
            this.#token ||
            (await getAuthToken({
                email_address: process.env.SUREPET_EMAIL,
                password: process.env.SUREPET_PASSWORD,
                device_id: GENERIC_DEVICE_ID
            })));
    }

    async #flaps(householdId: number) {
        return (this.#flapIds =
            this.#flapIds ||
            (await getFlapIds(await this.token(), householdId)));
    }

    async #households() {
        return (this.#householdIds =
            this.#householdIds || (await getHouseholdIds(await this.token())));
    }

    async lockIn() {
        return new Promise(async (resolve, reject) => {
            const timerId = setTimeout(() => {
                resolve(true);
            }, 3000);
            put<{ locking: LockMode }>(
                Endpoint.DEVICE,
                { locking: LockMode.LOCKED_IN},
                `${await this.#flaps(await this.#firstHousehold())}/control`,
                await this.token(),
                ADDITIONAL_HEADERS
            ).then(result => {
                clearTimeout(timerId);
                resolve(result);
            })
            .catch(reject);
        });
    }

    async lockOut() {
        return new Promise(async (resolve, reject) => {
            const timerId = setTimeout(() => {
                resolve(true);
            }, 3000);
            put<{ locking: LockMode }>(
                Endpoint.DEVICE,
                { locking: LockMode.LOCKED_OUT },
                `${await this.#flaps(await this.#firstHousehold())}/control`,
                await this.token(),
                ADDITIONAL_HEADERS
            ).then(result => {
                clearTimeout(timerId);
                resolve(result);
            })
            .catch(reject);
        });
    }

    async #pets() {
        this.#petInfo =
            this.#petInfo ||
            (await getPetInfo(
                await this.token(),
                await this.#firstHousehold()
            ));
        return this.#petInfo;
    }

    async locationOf(petName: string) {
        const petId = (await this.#pets())[petName.toLowerCase()]?.id;
        if (!petId) {
            throw new Error('Could not find pet with this name');
        }
        return await getPetLocation(await this.token(), petId);
    }

    async lock() {
        return await put<{ locking: LockMode }>(
            Endpoint.DEVICE,
            { locking: LockMode.LOCKED_BOTH },
            `${await this.#flaps(await this.#firstHousehold())}/control`,
            await this.token(),
            ADDITIONAL_HEADERS
        );
    }

    async unlock() {
        return await put<{ locking: LockMode }>(
            Endpoint.DEVICE,
            { locking: LockMode.UNLOCKED },
            `${await this.#flaps(await this.#firstHousehold())}/control`,
            await this.token(),
            ADDITIONAL_HEADERS
        );
    }

    async #firstHousehold() {
        return (await this.#households())[0];
    }

    async #firstFlap() {
        return (await this.#flaps(await this.#firstHousehold()))[0];
    }

    async status() {
        return await getFlapStatus(await this.token(), await this.#firstFlap());
    }
}

async function getPetLocation(
    token: Token,
    petId: number
): Promise<{ location: 'inside' | 'outside' | 'unknown'; since: Date }> {
    const { data: location } = await get<{
        data: { since: string; where: Location };
    }>(Endpoint.PET, `${petId}/position`, token, ADDITIONAL_HEADERS);
    const since = new Date(Date.parse(location.since));
    if (location.where > 2 || location.where < 1) {
        return {
            location: 'unknown',
            since
        };
    }
    return {
        location: location.where === Location.INSIDE ? 'inside' : 'outside',
        since
    };
}

async function getPetInfo(
    token: Token,
    householdId: number
): Promise<{ [key: string]: Pet }> {
    const { data: pet } = await get<{ data: Pet[] }>(
        Endpoint.HOUSEHOLD,
        `${householdId}/pet`,
        token,
        ADDITIONAL_HEADERS
    );
    return pet.reduce((byName, pet) => {
        byName[pet.name.toLowerCase()] = pet;
        return byName;
    }, {});
}

async function getFlapStatus(token: Token, flapId: number): Promise<string> {
    const {
        data: {
            locking: { mode }
        }
    } = await get<{ data: { locking: { mode: LockMode } } }>(
        Endpoint.DEVICE,
        `${flapId}/status`,
        token,
        ADDITIONAL_HEADERS
    );

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
}

async function getHouseholdIds(token): Promise<number[]> {
    const { data: households } = await get<{ data: { id: number }[] }>(
        Endpoint.HOUSEHOLD,
        '',
        token,
        ADDITIONAL_HEADERS
    );

    if (households.length > 0) {
        return households.map(({ id }) => id);
    } else {
        throw new Error('No households found.');
    }
}

async function getAuthToken(credentials: AuthJSONBody): Promise<Token> {
    const { data } = await post<AuthJSONBody, { data: Token }>(
        Endpoint.AUTH,
        credentials,
        '',
        null,
        BodyEncoding.JSON,
        ADDITIONAL_HEADERS
    );
    return data;
}

async function getFlapIds(token, householdId): Promise<number[]> {
    const { data: devices } = await get<{
        data: { id: number; product_id: number }[];
    }>(Endpoint.HOUSEHOLD, `${householdId}/device`, token, ADDITIONAL_HEADERS);
    const flaps = devices.filter(
        (device) => device.product_id === 3 || device.product_id === 6
    );

    if (flaps.length) {
        return flaps.map(({ id }) => id);
    }

    throw new Error('Could not find any cat flap devices.');
}
