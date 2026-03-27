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
    PatchFlags[PatchFlags["UNKEYED_FRAGMENT"] = 256] = "UNKEYED_FRAGMENT";
    PatchFlags[PatchFlags["BAIL"] = 512] = "BAIL";
})(PatchFlags || (PatchFlags = {}));
export var StructureFlags;
(function (StructureFlags) {
    StructureFlags[StructureFlags["NONE"] = 0] = "NONE";
    StructureFlags[StructureFlags["CONDITIONAL"] = 1] = "CONDITIONAL";
    StructureFlags[StructureFlags["SLOT"] = 2] = "SLOT";
    StructureFlags[StructureFlags["MODULE"] = 4] = "MODULE";
    StructureFlags[StructureFlags["ROUTE_LINK"] = 8] = "ROUTE_LINK";
    StructureFlags[StructureFlags["ROUTE_VIEW"] = 16] = "ROUTE_VIEW";
    StructureFlags[StructureFlags["RECURSIVE"] = 32] = "RECURSIVE";
    StructureFlags[StructureFlags["LIST"] = 64] = "LIST";
})(StructureFlags || (StructureFlags = {}));
export var EModuleState;
(function (EModuleState) {
    EModuleState[EModuleState["INIT"] = 1] = "INIT";
    EModuleState[EModuleState["UNMOUNTED"] = 2] = "UNMOUNTED";
    EModuleState[EModuleState["MOUNTED"] = 3] = "MOUNTED";
})(EModuleState || (EModuleState = {}));
//# sourceMappingURL=types.js.map