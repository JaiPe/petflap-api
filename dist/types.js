export var LockMode;
(function (LockMode) {
    LockMode[LockMode["UNLOCKED"] = 0] = "UNLOCKED";
    LockMode[LockMode["LOCKED_IN"] = 1] = "LOCKED_IN";
    LockMode[LockMode["LOCKED_OUT"] = 2] = "LOCKED_OUT";
    LockMode[LockMode["LOCKED_BOTH"] = 3] = "LOCKED_BOTH";
    LockMode[LockMode["CURFEW"] = 4] = "CURFEW";
    LockMode[LockMode["CURFEW_LOCKED"] = 5] = "CURFEW_LOCKED";
    LockMode[LockMode["CURFEW_UNLOCKED"] = 6] = "CURFEW_UNLOCKED";
    LockMode[LockMode["CURFEW_OTHER"] = 7] = "CURFEW_OTHER";
})(LockMode || (LockMode = {}));
