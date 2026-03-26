export var PatchFlags;
(function (PatchFlags) {
    PatchFlags[PatchFlags["NONE"] = 0] = "NONE";
    PatchFlags[PatchFlags["TEXT"] = 1] = "TEXT";
    PatchFlags[PatchFlags["CLASS"] = 2] = "CLASS";
    PatchFlags[PatchFlags["STYLE"] = 4] = "STYLE";
    PatchFlags[PatchFlags["PROPS"] = 8] = "PROPS";
    PatchFlags[PatchFlags["ASSETS"] = 16] = "ASSETS";
    PatchFlags[PatchFlags["EVENTS"] = 32] = "EVENTS";
    PatchFlags[PatchFlags["DIRECTIVES"] = 64] = "DIRECTIVES";
    PatchFlags[PatchFlags["KEYED_FRAGMENT"] = 128] = "KEYED_FRAGMENT";
    PatchFlags[PatchFlags["BAIL"] = 256] = "BAIL";
})(PatchFlags || (PatchFlags = {}));
export var EModuleState;
(function (EModuleState) {
    EModuleState[EModuleState["INIT"] = 1] = "INIT";
    EModuleState[EModuleState["UNMOUNTED"] = 2] = "UNMOUNTED";
    EModuleState[EModuleState["MOUNTED"] = 3] = "MOUNTED";
})(EModuleState || (EModuleState = {}));
//# sourceMappingURL=types.js.map