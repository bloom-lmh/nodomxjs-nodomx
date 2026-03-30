const DEVTOOLS_HOOK_KEY = "__NODOMX_DEVTOOLS_HOOK__";
const DEVTOOLS_APP_ID = "__nodomxDevtoolsAppId";

export function createDevtools(options = {}) {
    const hook = installDevtoolsHook(options);
    return {
        name: "nodomx-devtools",
        install(app) {
            app.config.globalProperties.$devtools = hook;
            registerApp(app);
            if (options.overlay !== false) {
                hook.openOverlay();
            }
        }
    };
}

export function installDevtoolsHook(options = {}) {
    const target = getGlobalTarget();
    if (!target) {
        return createDetachedHook(options);
    }
    if (target[DEVTOOLS_HOOK_KEY]) {
        if (options.overlay !== false) {
            target[DEVTOOLS_HOOK_KEY].openOverlay();
        }
        return target[DEVTOOLS_HOOK_KEY];
    }
    const hook = createHook(target, options);
    target[DEVTOOLS_HOOK_KEY] = hook;
    if (options.overlay !== false) {
        hook.openOverlay();
    }
    return hook;
}

export function getDevtoolsHook() {
    return getGlobalTarget()?.[DEVTOOLS_HOOK_KEY];
}

export function registerApp(app) {
    const hook = getDevtoolsHook();
    if (!hook || !app) {
        return null;
    }
    return hook.registerApp(app);
}

export function unregisterApp(app) {
    getDevtoolsHook()?.unregisterApp(app);
}

export function notifyDevtoolsUpdate(app, reason = "update", details = {}) {
    getDevtoolsHook()?.notifyUpdate(app, reason, details);
}

function createDetachedHook(options = {}) {
    return createHook(undefined, {
        ...options,
        overlay: false
    });
}

function createHook(globalTarget, options = {}) {
    const apps = new Map();
    const listeners = new Set();
    let panel = null;
    let selectedId = null;

    const hook = {
        version: 1,
        apps,
        registerApp(app) {
            const id = ensureAppId(app);
            const snapshot = snapshotApp(app);
            apps.set(id, {
                app,
                id,
                lastEvent: "mount",
                lastUpdatedAt: new Date().toISOString(),
                snapshot
            });
            selectedId ||= id;
            emit("mount", id, snapshot);
            return id;
        },
        unregisterApp(app) {
            const id = app?.[DEVTOOLS_APP_ID];
            if (!id || !apps.has(id)) {
                return;
            }
            apps.delete(id);
            if (selectedId === id) {
                selectedId = apps.keys().next().value || null;
            }
            emit("unmount", id);
        },
        notifyUpdate(app, reason = "update", details = {}) {
            const id = ensureAppId(app);
            const existing = apps.get(id) || {
                app,
                id
            };
            existing.app = app;
            existing.id = id;
            existing.lastEvent = reason;
            existing.lastUpdatedAt = new Date().toISOString();
            existing.snapshot = snapshotApp(app, details);
            apps.set(id, existing);
            selectedId ||= id;
            emit(reason, id, existing.snapshot);
        },
        getSnapshot() {
            return Array.from(apps.values()).map(entry => ({
                id: entry.id,
                lastEvent: entry.lastEvent,
                lastUpdatedAt: entry.lastUpdatedAt,
                snapshot: cloneValue(entry.snapshot)
            }));
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        selectApp(id) {
            if (apps.has(id)) {
                selectedId = id;
                renderOverlay();
            }
        },
        openOverlay() {
            if (!globalTarget?.document) {
                return null;
            }
            panel ||= createOverlay(globalTarget.document, hook, () => selectedId, id => {
                selectedId = id;
                renderOverlay();
            });
            renderOverlay();
            return panel;
        },
        closeOverlay() {
            if (!panel) {
                return;
            }
            panel.root.remove();
            panel = null;
        }
    };

    function emit(type, id, snapshot) {
        const payload = {
            id,
            snapshot: snapshot ? cloneValue(snapshot) : null,
            type
        };
        for (const listener of listeners) {
            listener(payload);
        }
        renderOverlay();
    }

    function renderOverlay() {
        if (!panel) {
            return;
        }
        panel.render(Array.from(apps.values()), selectedId);
    }

    return hook;
}

function createOverlay(documentRef, hook, getSelectedId, setSelectedId) {
    const root = documentRef.createElement("aside");
    root.setAttribute("data-nodomx-devtools", "");
    Object.assign(root.style, {
        position: "fixed",
        right: "16px",
        bottom: "16px",
        width: "360px",
        maxHeight: "70vh",
        overflow: "hidden",
        zIndex: "2147483647",
        background: "rgba(11, 18, 32, 0.96)",
        color: "#e5eef7",
        borderRadius: "16px",
        boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        border: "1px solid rgba(148, 163, 184, 0.25)"
    });
    documentRef.body.appendChild(root);

    function render(entries, selectedId) {
        const appTabs = entries.map(entry => {
            const active = entry.id === selectedId;
            return `<button data-app-id="${entry.id}" style="cursor:pointer;border:none;border-radius:999px;padding:6px 10px;background:${active ? "#14b8a6" : "rgba(148,163,184,0.18)"};color:${active ? "#042f2e" : "#e5eef7"};">${escapeHtml(entry.snapshot?.name || entry.id)}</button>`;
        }).join(" ");
        const current = entries.find(entry => entry.id === selectedId) || entries[0];
        const snapshotText = current
            ? escapeHtml(JSON.stringify(current.snapshot, null, 2))
            : "No mounted NodomX app.";

        root.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(148,163,184,0.18);">
                <strong style="font-size:13px;letter-spacing:0.04em;">NodomX Devtools</strong>
                <div style="display:flex;gap:8px;align-items:center;">
                    <button data-action="refresh" style="cursor:pointer;border:none;border-radius:10px;padding:6px 10px;background:#1d4ed8;color:white;">Refresh</button>
                    <button data-action="close" style="cursor:pointer;border:none;border-radius:10px;padding:6px 10px;background:rgba(148,163,184,0.18);color:#e5eef7;">Close</button>
                </div>
            </div>
            <div style="padding:12px 14px;display:grid;gap:12px;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;">${appTabs || '<span style="opacity:.7;">No app</span>'}</div>
                <div style="display:grid;gap:6px;font-size:12px;opacity:.85;">
                    <div>Selected: ${escapeHtml(current?.id || "-")}</div>
                    <div>Last event: ${escapeHtml(current?.lastEvent || "-")}</div>
                    <div>Updated at: ${escapeHtml(current?.lastUpdatedAt || "-")}</div>
                </div>
                <pre style="margin:0;padding:12px;background:rgba(15,23,42,0.85);border-radius:12px;overflow:auto;max-height:42vh;font-size:11px;line-height:1.5;">${snapshotText}</pre>
            </div>
        `;
        root.querySelector('[data-action="refresh"]')?.addEventListener("click", () => {
            for (const entry of entries) {
                hook.notifyUpdate(entry.app, "refresh");
            }
        });
        root.querySelector('[data-action="close"]')?.addEventListener("click", () => {
            hook.closeOverlay();
        });
        for (const button of root.querySelectorAll("[data-app-id]")) {
            button.addEventListener("click", () => {
                setSelectedId(button.getAttribute("data-app-id"));
            });
        }
    }

    return {
        render,
        root
    };
}

function snapshotApp(app, details = {}) {
    const instance = app?.instance;
    const rootModule = instance ? snapshotModule(instance) : null;
    return {
        details,
        name: app?.rootComponent?.name || instance?.constructor?.name || "AnonymousApp",
        rootModule,
        selector: app?.selector || null,
        store: snapshotStore(app?.config?.globalProperties?.$store)
    };
}

function snapshotModule(module) {
    if (!module) {
        return null;
    }
    return {
        children: Array.isArray(module.children) ? module.children.map(snapshotModule) : [],
        hotId: typeof module.getHotId === "function" ? module.getHotId() : module.constructor?.name || "AnonymousModule",
        props: cloneValue(module.props || {}),
        route: cloneRoute(module),
        setup: typeof module.captureSetupState === "function" ? cloneValue(module.captureSetupState()) : {},
        state: cloneValue(module.model || {})
    };
}

function snapshotStore(storeContainer) {
    const stores = storeContainer?._stores;
    if (!(stores instanceof Map)) {
        return [];
    }
    return Array.from(stores.values()).map(store => ({
        id: store?.$id || "store",
        state: cloneValue(store?.$state || {})
    }));
}

function cloneRoute(module) {
    const route = module?.model?.$route || module?.$route;
    if (!route || typeof route !== "object") {
        return null;
    }
    return cloneValue({
        fullPath: route.fullPath,
        hash: route.hash,
        name: route.name,
        params: route.params,
        path: route.path,
        query: route.query
    });
}

function cloneValue(value, seen = new WeakMap()) {
    if (value === null || value === undefined) {
        return value;
    }
    if (typeof value === "function") {
        return `[Function ${value.name || "anonymous"}]`;
    }
    if (typeof value !== "object") {
        return value;
    }
    if (seen.has(value)) {
        return "[Circular]";
    }
    if (Array.isArray(value)) {
        seen.set(value, true);
        return value.map(item => cloneValue(item, seen));
    }
    seen.set(value, true);
    const output = {};
    for (const key of Object.keys(value)) {
        output[key] = cloneValue(value[key], seen);
    }
    return output;
}

function ensureAppId(app) {
    if (!app[DEVTOOLS_APP_ID]) {
        app[DEVTOOLS_APP_ID] = `app-${Math.random().toString(36).slice(2, 10)}`;
    }
    return app[DEVTOOLS_APP_ID];
}

function getGlobalTarget() {
    if (typeof window !== "undefined") {
        return window;
    }
    if (typeof globalThis !== "undefined") {
        return globalThis;
    }
    return null;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;");
}
