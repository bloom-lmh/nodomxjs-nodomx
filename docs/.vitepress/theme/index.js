import DefaultTheme from "vitepress/theme";
import { onBeforeUnmount, onMounted } from "vue";
import "./custom.css";

function isGithubPagesRuntime() {
    return typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
}

function installGithubPagesNavigationFallback() {
    let cleanup;

    onMounted(() => {
        if (!isGithubPagesRuntime()) {
            return;
        }

        const handler = (event) => {
            if (
                event.defaultPrevented ||
                !(event.target instanceof Element) ||
                event.button !== 0 ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.metaKey
            ) {
                return;
            }

            const anchor = event.target.closest("a");
            if (
                !anchor ||
                anchor.closest(".vp-raw") ||
                anchor.hasAttribute("download") ||
                anchor.hasAttribute("target")
            ) {
                return;
            }

            const href = anchor.getAttribute("href") || anchor.getAttribute("xlink:href");
            if (!href) {
                return;
            }

            const url = new URL(href, anchor.baseURI);
            const current = new URL(window.location.href);
            const base = window.__VP_SITE_DATA__?.base || "/";

            if (url.origin !== current.origin || !url.pathname.startsWith(base)) {
                return;
            }

            if (url.pathname === current.pathname && url.search === current.search) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.assign(`${url.pathname}${url.search}${url.hash}`);
        };

        window.addEventListener("click", handler, true);
        cleanup = () => window.removeEventListener("click", handler, true);
    });

    onBeforeUnmount(() => {
        cleanup?.();
    });
}

export default {
    ...DefaultTheme,
    setup() {
        installGithubPagesNavigationFallback();
    }
};
