export enum LockMode {
    UNLOCKED,
    LOCKED_IN,
    LOCKED_OUT,
    LOCKED_BOTH,
    CURFEW,
    CURFEW_LOCKED,
    CURFEW_UNLOCKED,
    CURFEW_OTHER,
  }
  
  export const enum Endpoint {
    AUTH = "https://app.api.surehub.io/api/auth/login",
    HOUSEHOLD = "https://app.api.surehub.io/api/household",
    DEVICE = "https://app.api.surehub.io/api/device",
    PET = "https://app.api.surehub.io/api/pet",
  }