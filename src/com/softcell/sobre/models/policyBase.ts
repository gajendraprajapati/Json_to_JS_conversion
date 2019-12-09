
export class PolicyBase {
    public iffData: any;

    constructor(iffData: any) {
        if (!iffData) {
            return;
        }
        this.iffData = iffData;
    }
}
