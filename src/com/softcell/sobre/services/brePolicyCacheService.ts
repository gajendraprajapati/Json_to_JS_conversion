import { BrePolicyCacheServiceModel } from "./brePolicyCacheServiceModel";
import * as fs from "fs";
import { getFuncFromString } from "../../../../generatePolicyProd";
import { resolve, reject } from "bluebird";

export class BrepolicyCacheService {

    private _cache: any = {};
    private brePolicyCacheServiceModel: BrePolicyCacheServiceModel;


    constructor() {
        this.brePolicyCacheServiceModel= new BrePolicyCacheServiceModel();
    }


    public setBrePolicyCachePath(filepath: string) {
        this.brePolicyCacheServiceModel.setLocalFilePath(filepath);
    }
    public getBrePolicyCachePath() {
        return this.brePolicyCacheServiceModel.getLocalFilePath();
    }
    public writeBrePolicyToLocal(data:string){
        this.brePolicyCacheServiceModel.writepolicyToLocal(data);       
    }
 
    public clearCacheForPolicy(policyId: number, institutionId: number) {
        const key = this.GetBrePolicyKey(institutionId, policyId);
        console.log(`Service : BrePolicyCache  clearing cache for ${key}`);
        this._cache[key] = undefined;
    }
    private GetBrePolicyKey(institutionId: number, policyId: number) {
        return institutionId.toString() + "_" + policyId.toString();
    }

    public getPolicy(policyId: number, institutionId: number): any {
        const key = this.GetBrePolicyKey(institutionId, policyId);
        if (this._cache[key]) {
            console.log(` BrePolicy Service : policy found in cache for ${key}`);
            return this._cache[key];
        }
        if (fs.existsSync(this.getBrePolicyCachePath() + `${key}.json`)) {
            console.log(`BrePolicy Service : Cache key Not found! Reading from ${key}.json now `)
            let brePolicy = JSON.parse(fs.readFileSync(this.getBrePolicyCachePath() + `${key}.json`, 'utf-8'));
            const brejs = brePolicy.brejs;
            brejs["breJSFunc"] = getFuncFromString(brePolicy.brejs.breJsString);
            brejs["functionList"] = brePolicy.functionList;
            const breJsObj = { brejs };
            breJsObj["functionListCount"] = brePolicy.functionList && brePolicy.functionList.length;
            const brePolicyObj: Array<any> = [breJsObj];
            this._cache[key] = brePolicyObj;
            console.log(`BrePolicy Service : Cache is loaded with key  ${key}`);
            return this._cache[key];
        }
        return;
    }

}

const breCacheservice = new BrepolicyCacheService();
export default breCacheservice;
