export enum LockMode {
    UNLOCKED,
    LOCKED_IN,
    LOCKED_OUT,
    LOCKED_BOTH,
    CURFEW,
    CURFEW_LOCKED,
    CURFEW_UNLOCKED,
    CURFEW_OTHER
}

export enum LockModeFriendlyName {
    LOCKED_BOTH = '',
    LOCKED_IN = 'in',
    LOCKED_OUT = 'out'
}

export const enum Endpoint {
    AUTH = 'https://app.api.surehub.io/api/auth/login',
    HOUSEHOLD = 'https://app.api.surehub.io/api/household',
    DEVICE = 'https://app.api.surehub.io/api/device',
    PET = 'https://app.api.surehub.io/api/pet'
}

export type AuthJSONBody = {
    email_address: string;
    password: string;
    device_id: string;
};

export type Pet = { id: number; name: string };
export enum Location {
    INSIDE = 1,
    OUTSIDE
}
