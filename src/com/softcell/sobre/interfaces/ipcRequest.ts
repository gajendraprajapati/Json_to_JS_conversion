import { MasterConfig } from "../models/master/masterConfig";

export interface IPCRequestMaster {
  ipcEventName: string;
  inputData: MasterConfig[];
}
