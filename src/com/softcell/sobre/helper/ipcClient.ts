import { IPCRequestMaster } from "../interfaces/ipcRequest";
import { MasterConfig } from "../models/master/masterConfig";

const ipc = require("node-ipc");

export class IPCClint {

    constructor() {
        this.initConfig();
    }

    public getIPC() {
        return ipc;
    }

    public connect() {
        return new Promise((resolve, reject) => {
            console.log("Staring connection with master ....");
            ipc.connectTo("master", function() {
                ipc.of.master.on("connect", function() {
                    resolve("IPC client connected successfully");
                    console.log("IPC client connected successfully to master ipc id " + "master");
                });
            });
            ipc.of.master.on("disconnect", function() {
                ipc.log("disconnected from master ipc");
            });
        });
    }

    public disconnect() {
        return new Promise(resolve => {
            ipc.disconnect("master");
            console.log(`IPC Client Disconnected From Master`);
        });
    }
    public prepareReqParam(data: any) {
        const reqParam: IPCRequestMaster = {} as IPCRequestMaster;
        reqParam.ipcEventName = this.generateEventName(); // TODO: need to check it performance impact
        reqParam.inputData = data;
        return reqParam;
    }

    public callMasterIPC(ipcReqs: any, eventName: string) {
        this.initConfig();
        const reqParm = this.prepareReqParam(ipcReqs);
        return new Promise<any>((resolve, reject) => {
            ipc.of.master.emit(
                eventName,
                reqParm,
            );
            const hanlder = function(data) {
                ipc.of.master.unSubscribe(reqParm.ipcEventName, hanlder);
                resolve(data);
            };
            ipc.of.master.on(
                reqParm.ipcEventName, // any event or message type your server listens for
                hanlder,
            );
        });
    }

    private initConfig() {
        ipc.config.id = "client";
        ipc.config.retry = 1500;
        ipc.config.silent = true;
    }

    private generateEventName() {
        return "" + process.pid + Math.floor(Math.random() * 100) + new Date().getTime();
    }
}
