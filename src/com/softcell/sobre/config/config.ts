export class Config {
    public static readonly mongoConnStr = "mongodb://localhost:27017";
    public static readonly dbName = "soberdb";
    public static readonly poolSize = 200;
    public static readonly numberOfRetries = 3;
    public static readonly ipcId = "master";
    public static readonly ipcRetry = 1500; // in ms
    public static readonly ipcSilent = true;
    public static readonly ipcEventMain = "eventMain";
    public static readonly dataRootDir = "D:/softcell/softcellpoc/brexData";
}
