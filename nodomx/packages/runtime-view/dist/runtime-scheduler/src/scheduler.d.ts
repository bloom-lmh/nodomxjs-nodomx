export declare class Scheduler {
    private static tasks;
    private static started;
    private static pending;
    private static scheduleTick;
    static dispatch(): void;
    static start(scheduleTick?: number): void;
    static request(): void;
    static addTask(foo: () => void, thiser?: object): void;
    static removeTask(foo: () => void, thiser?: object): void;
}
