import { Endpoint, LockMode } from './types.js'
import createDeviceId, { put, get, post } from './util.js'

const GENERIC_DEVICE_ID = createDeviceId()

type AuthJSONBody = {
    email_address: string
    password: string
    device_id: string
}

type Pet = { id: number; name: string }
enum Location {
    INSIDE = 1,
    OUTSIDE,
}
export default class SurePetAPI {
    #token: string
    #petInfo: { [key: string]: Pet }
    #flapIds: number[]
    #householdIds: number[]

    async token() {
        if (!process.env.SUREPET_EMAIL || !process.env.SUREPET_PASSWORD) {
            throw new Error('Missing email and password')
        }
        this.#token =
            this.#token ||
            (await getAuthToken({
                email_address: process.env.SUREPET_EMAIL,
                password: process.env.SUREPET_PASSWORD,
                device_id: GENERIC_DEVICE_ID,
            }))
        return this.#token
    }

    async #flaps(householdId: number) {
        this.#flapIds =
            this.#flapIds || (await getFlapIds(await this.#token, householdId))
        return this.#flapIds
    }

    async #households() {
        this.#householdIds =
            this.#householdIds || (await getHouseholdIds(this.#token))
        return this.#householdIds
    }

    async lockIn() {
        return await setFlapLock(
            await this.token(),
            (
                await this.#flaps((await this.#households())[0])
            )[0],
            LockMode.LOCKED_IN
        )
    }

    async lockOut() {
        return await setFlapLock(
            await this.token(),
            (
                await this.#flaps((await this.#households())[0])
            )[0],
            LockMode.LOCKED_OUT
        )
    }

    async #pets() {
        this.#petInfo =
            this.#petInfo ||
            (await getPetInfo(
                await this.token(),
                (
                    await this.#households()
                )[0]
            ))
        return this.#petInfo
    }

    async locationOf(petName: string) {
        const petId = (await this.#pets())[petName.toLowerCase()]?.id
        if (!petId) {
            throw new Error('Could not find pet with this name')
        }
        return await getPetLocation(await this.token(), petId)
    }

    async lock() {
        return await setFlapLock(
            await this.token(),
            (
                await this.#flaps((await this.#households())[0])
            )[0],
            LockMode.LOCKED_BOTH
        )
    }

    async unlock() {
        return await setFlapLock(
            await this.token(),
            (
                await this.#flaps((await this.#households())[0])
            )[0],
            LockMode.UNLOCKED
        )
    }

    async status() {
        return await getFlapStatus(
            await this.token(),
            (
                await this.#flaps((await this.#households())[0])
            )[0]
        )
    }
}

async function setFlapLock(
    token: string,
    flapId: number,
    mode: LockMode
): Promise<boolean> {
    return await put<{ locking: LockMode }>(
        Endpoint.DEVICE,
        { locking: mode },
        `${flapId}/control`,
        token
    )
}

async function getPetLocation(
    token: string,
    petId: number
): Promise<{ location: 'inside' | 'outside' | 'unknown'; since: Date }> {
    const location = await get<{ since: string; where: Location }>(
        Endpoint.PET,
        `${petId}/position`,
        token
    )
    const since = new Date(Date.parse(location.since))
    if (location.where > 2 || location.where < 1) {
        return {
            location: 'unknown',
            since,
        }
    }
    return {
        location: location.where === Location.INSIDE ? 'inside' : 'outside',
        since,
    }
}

async function getPetInfo(
    token: string,
    householdId: number
): Promise<{ [key: string]: Pet }> {
    const pet = await get<Pet[]>(
        Endpoint.HOUSEHOLD,
        `${householdId}/pet`,
        token
    )
    return pet.reduce((byName, pet) => {
        byName[pet.name.toLowerCase()] = pet
        return byName
    }, {})
}

async function getFlapStatus(token: string, flapId: number): Promise<string> {
    const {
        locking: { mode },
    } = await get<{ locking: { mode: LockMode } }>(
        Endpoint.DEVICE,
        `${flapId}/status`,
        token
    )

    if (mode === undefined) {
        throw new Error('Cannot find flap status')
    }

    switch (mode) {
        case LockMode.LOCKED_BOTH:
            return 'locked both ways'
        case LockMode.LOCKED_IN:
            return 'locked in'
        case LockMode.LOCKED_OUT:
            return 'locked out'
        case LockMode.UNLOCKED:
        case LockMode.CURFEW_UNLOCKED:
            return 'not locked'
        case LockMode.CURFEW || LockMode.CURFEW_LOCKED || LockMode.CURFEW_OTHER:
            return 'locked by app curfew settings'
        default:
    }
    return 'unknown'
}

async function getHouseholdIds(token): Promise<number[]> {
    const households = await get<{ id: number }[]>(
        Endpoint.HOUSEHOLD,
        '',
        token
    )

    if (households.length > 0) {
        return households.map(({ id }) => id)
    } else {
        throw new Error('No households found.')
    }
}

async function getAuthToken(credentials: AuthJSONBody): Promise<string> {
    const { token } = await post<AuthJSONBody, { token: string }>(
        Endpoint.AUTH,
        credentials
    )
    return token
}

async function getFlapIds(token, householdId): Promise<number[]> {
    const devices = await get<{ id: number; product_id: number }[]>(
        Endpoint.HOUSEHOLD,
        `${householdId}/device`,
        token
    )
    const flaps = devices.filter(
        (device) => device.product_id === 3 || device.product_id === 6
    )

    if (flaps.length) {
        return flaps.map(({ id }) => id)
    }

    throw new Error('Could not find any cat flap devices.')
}
