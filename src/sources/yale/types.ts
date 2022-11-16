export const enum Endpoint {
    AUTH = 'https://mob.yalehomesystem.co.uk:6013/yapi/o/token',
    STATUS = 'https://mob.yalehomesystem.co.uk:6013/yapi/api/panel/mode',
    SERVICES = 'https://mob.yalehomesystem.co.uk:6013/yapi/services'
}

export enum AlarmMode {
    ARMED_FULL = 'arm',
    ARMED_PARTIAL = 'home',
    DISARMED = 'disarm'
}
export type AuthJSONBody = {
    username: string;
    password: string;
    grant_type: 'password';
};
