import { MasterContants } from "../constants/masterConstants";
import { IPCReqParam } from "../interfaces/ipcReqParam";
import { MasterConfig } from "../models/master/masterConfig";
import { MasterModel } from "../models/master/masterModel";
import { MasterStateModel } from "../models/master/masterStateModel";
import { IPCClint } from "./ipcClient";

export function getData(masterConfig: MasterConfig[], allMasterData: MasterModel) {

    return masterConfig.map((x) => {
        const masterData = allMasterData[x.collectionName];
        return {
            ...x,
            lookupVal: masterData && masterData[x.primaryKeyVal] && masterData[x.primaryKeyVal][x.lookupField],
        };
    });
}

export function getData2(masterConfig: MasterConfig[], allMasterData: MasterModel) {

    return masterConfig.map((x) => {
        const masterData = allMasterData[x.collectionName];
        let myval;
        if (masterData && masterData[x.primaryKeyVal]) {
            myval = JSON.parse(masterData && masterData[x.primaryKeyVal])[x.lookupField];
        }

        return {
            ...x,
            lookupVal:  myval,
        };
    });
}

export function constructMasterName(masterData: MasterStateModel) {
    return masterData.Name + "_" + masterData.FileID + "_" + masterData.INSTITUTION_ID + "_MASTER";
}

export function getDataFromMasterIPC(ipcReqParam: IPCReqParam, ipcClient: IPCClint): Promise<any> {
    return new Promise((resolve, reject) => {
        /*
         below code implementated masterIPC fallback provision.
         if data not fetched from masterIPC in specified time say 1 sec then data will fetched from
         api.
        */
        let masterTimeout: NodeJS.Timeout;
        console.log("data is fetching from master ipc server.");
        // fetch data from masterIPC
        ipcClient.callMasterIPC(ipcReqParam.reqConfig, ipcReqParam.eventName).then((masterData) => {
            console.log("data is successfully fetched from master ipc server.");
            clearTimeout(masterTimeout);
            resolve(masterData);
        });
        masterTimeout = setTimeout(() => {
            console.log("master ipc server is not responding, hence required data is fetching from api server.");
            ipcReqParam.fallBackFn().then((results) => {
                resolve(results);
            });
        }, ipcReqParam.fallBackTime);
    });
}
