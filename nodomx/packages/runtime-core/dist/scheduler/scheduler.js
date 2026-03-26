import { NError } from "../error";
import { Util } from "../util";
export class Scheduler {
    static dispatch() {
        for (const item of Scheduler.tasks) {
            if (!Util.isFunction(item.func)) {
                continue;
            }
            if (item.thiser) {
                item.func.call(item.thiser);
            }
            else {
                item.func();
            }
        }
    }
    static start(scheduleTick) {
        if (Scheduler.started) {
            return;
        }
        Scheduler.started = true;
        if (typeof scheduleTick === "number" && scheduleTick > 0) {
            Scheduler.scheduleTick = scheduleTick;
        }
        Scheduler.request();
    }
    static request() {
        if (!Scheduler.started || Scheduler.pending) {
            return;
        }
        Scheduler.pending = true;
        const flush = () => {
            Scheduler.pending = false;
            if (!Scheduler.started) {
                return;
            }
            Scheduler.dispatch();
        };
        if (typeof window !== "undefined" && window.requestAnimationFrame) {
            window.requestAnimationFrame(() => flush());
        }
        else if (typeof window !== "undefined") {
            window.setTimeout(flush, Scheduler.scheduleTick);
        }
        else {
            setTimeout(flush, Scheduler.scheduleTick);
        }
    }
    static addTask(foo, thiser) {
        if (!Util.isFunction(foo)) {
            throw new NError("invoke", "Scheduler.addTask", "0", "function");
        }
        if (Scheduler.tasks.some(item => item.func === foo && item.thiser === thiser)) {
            return;
        }
        Scheduler.tasks.push({ func: foo, thiser });
        Scheduler.request();
    }
    static removeTask(foo, thiser) {
        if (!Util.isFunction(foo)) {
            throw new NError("invoke", "Scheduler.removeTask", "0", "function");
        }
        const index = Scheduler.tasks.findIndex(item => item.func === foo && (thiser === undefined || item.thiser === thiser));
        if (index !== -1) {
            Scheduler.tasks.splice(index, 1);
        }
    }
}
Scheduler.tasks = [];
Scheduler.started = false;
Scheduler.pending = false;
Scheduler.scheduleTick = 50;
//# sourceMappingURL=scheduler.js.map