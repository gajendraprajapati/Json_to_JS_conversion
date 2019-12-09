
export class PollingWorker {
    private pollIntervalRef?: NodeJS.Timeout;

    public startPolling(task: () => Promise<void>, intervalInMS: number) {
        this.stopPolling();
        let isCurTaskFinished: boolean = true;
        this.pollIntervalRef = setInterval(() => {
            if (!isCurTaskFinished) {
                return;
            }
            isCurTaskFinished = false;
            return task().then((result: any) => {
                isCurTaskFinished = true;
                return;
            }).catch((err) => {
                isCurTaskFinished = true;
                throw err;
            });
        }, intervalInMS);
    }

    public stopPolling() {
        if (this.pollIntervalRef) {
            clearInterval(this.pollIntervalRef);
        }
    }
}
