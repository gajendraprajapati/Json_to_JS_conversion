
export class Counter {

    public static get next() {
        return ++this.counter;
    }

    public static reset() {
        this.counter = 0;
    }
    private static counter: number = 0;
}
