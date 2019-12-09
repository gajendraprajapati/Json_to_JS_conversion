import { applyMasterFieldData, execute, generate, generateAndExecute, getFuncFromString, getScript, prepareReqForMasterData, processMasterData, processMasterData2 } from "../../../../../src/generatePolicyProd";
import { Rule } from "../models/ruleModel";
import { SoBREPolicyModel } from "../models/soberPolicyModel";
import { FlowConfiguration, WorkFLowConfigModel } from "../models/workFlowConfigModel";

import * as fs from "fs";
import * as _ from "lodash";
import { getData } from "../helper/masterIPCHelper";
import { PolicyValidator } from "../helper/policyValidator";
import { MasterConfig } from "../models/master/masterConfig";
import { MasterModel } from "../models/master/masterModel";

export class PolicyCacheServiceModel {

    private _allPolicies: SoBREPolicyModel[] = new Array<SoBREPolicyModel>();

    private _allPoliciesMap: any = {};
    private _allPoliciesMapById: any = {};

    private _allWorkFlows: WorkFLowConfigModel[] = new Array<WorkFLowConfigModel>();
    private _allWorkFlowMap: any = {};

    private _localFilePath: string;

    private _lastUpdatedDataForSync: Date;

    public getLastUpdatedDataForSync() {
        return this._lastUpdatedDataForSync;
    }

    public setLastUpdatedDataForSync(date: Date) {
        this._lastUpdatedDataForSync = date;
    }

    public setLocalFilePath(filePath: string) {
        this._localFilePath = filePath;
    }

    public getLocalFilePath() {
        return this._localFilePath;
    }

    public getPolicyByPolicyId(policyId, institutionId) {
        return this._allPoliciesMapById[institutionId.toString() + "_" + policyId.toString()];
    }

    public setWorkFlows(workFlows: WorkFLowConfigModel[]) {
        this._allWorkFlows = workFlows;
        this._allWorkFlowMap = {};
        this._allWorkFlows.forEach((workFlow) => {
            this._allWorkFlowMap[workFlow.intitutionId] = workFlow;
        });
    }

    public getStats() {
        const stat: any = {};
        stat.institutionsCount = Object.keys(this._allPoliciesMap).length;

    }

    public setPolicies(allPolicies: SoBREPolicyModel[]) {
        const sortedArray = this.orderTheArray(allPolicies);
        this.sortAndCreateMapOfPolicies(sortedArray);
        allPolicies.forEach((policy) => {
            policy.breJsCriterionScript2 = getScript(policy.breJsCriterion);
            policy.breJsCriterionFunc = getFuncFromString(policy.breJsCriterion);
        });
        this.printStat();
        // this.writeAllPoliciesToLocal(allPolicies);
    }

    public setPolicy(updatedPolci: SoBREPolicyModel) {
        updatedPolci.breJsCriterionScript2 = getScript(updatedPolci.breJsCriterion);
        updatedPolci.breJsCriterionFunc = getFuncFromString(updatedPolci.breJsCriterion);
        this.managePolicy(updatedPolci, false);
        //  this.writepolicyToLocal(updatedPolci);
    }

    public orderTheArray(allPolicies: SoBREPolicyModel[]) {
        allPolicies.forEach((polciy) => {
            polciy.createdDate = new Date(polciy.createdDate);
        });
        const shorByDate = _.sortBy(allPolicies, ["createdDate"]);
        return _.sortBy(shorByDate, ["INSTITUTION_ID", "priority"]);
    }

    public writeAllPoliciesToLocal(allPolicies: SoBREPolicyModel[]) {
        allPolicies.forEach((polciy) => {

            this.writepolicyToLocal(polciy);
        });
    }

    public writepolicyToLocal(updatedPolci: SoBREPolicyModel) {
        const policyId = updatedPolci.PolicyID;
        const institutionId = updatedPolci.INSTITUTION_ID;
        const key = institutionId.toString() + "_" + policyId.toString();

        this._allPoliciesMapById[key] = updatedPolci;
        const updateDate = new Date(updatedPolci.updateDate);
        if (!this._lastUpdatedDataForSync || updateDate > this._lastUpdatedDataForSync) {
            this._lastUpdatedDataForSync = updateDate;
        }
        const fileName = this._localFilePath + key + ".json";
        fs.writeFileSync(fileName, JSON.stringify(updatedPolci));
        console.log("file has been created for ", fileName);
    }

    public updatePolicyFromLocal(policyId: number, institutionId: number) {
        const fileData = fs.readFileSync(this._localFilePath + institutionId.toString() + "_" + policyId.toString() + ".json", "utf8");
        if (fileData) {
            const policyData = JSON.parse(fileData);
            this.setPolicy(policyData);
            console.log("Cache updated successfully for PolicyId", policyId);
        }

    }

    public setPoliciesFromLocal() {
        const policyFiles = fs.readdirSync(this._localFilePath);
        const allpolciies = [];
        policyFiles && policyFiles.length && policyFiles.forEach((masterfile) => {

            const fileName = this._localFilePath + masterfile;
            const policyData = JSON.parse(fs.readFileSync(fileName, "utf-8"));

            console.log("policy criterion data loaded ", fileName);
            allpolciies.push(policyData);
        });
        this.setPolicies(allpolciies);
        console.log("all policy selections loaded ", allpolciies && allpolciies.length);
    }

    // TODO: Anuj Need to accept master data here
    // for each policy need to prepare master config using reqobject and getData(data: IPCRequestMaster)(moved to unit test)
    // need to call prepareReqForMasterData for each policy using this masterdata refer
    // for each policy need to call the execute method with criterionJS
    public fetchPolciyForRequestObject(reqObject: any, criteriaDerivedFields: any, allMasterData?: MasterModel, extype: number= 1): number {
        const result = PolicyValidator.validateHeader(reqObject);
        if (result) {
            throw result;
        }

        const institutionid = Number(reqObject.HEADER["INSTITUTION-ID"]);
        const appid = reqObject.HEADER["APP-TYPE"];

        const workFlow: WorkFLowConfigModel = this._allWorkFlowMap[institutionid];

        if (!workFlow) {
            console.log("not a valid req object no workflow found");
            const result = PolicyValidator.errorScoringResponse("COMPLETED", "L2", "Workflow Configuration Not Defined for this Institution", null);
            if (result) {
                throw result;
            }
        }

        let decidedFLowConfiguration: FlowConfiguration;

        for (let count = 0; count < workFlow.flowConfiguration.length; count++) {
            const curConfig = workFlow.flowConfiguration[count];
            if (this.checkIfConfigMatch(curConfig, reqObject)) {
                decidedFLowConfiguration = curConfig;
                break;
            }

        }

        if (!decidedFLowConfiguration) {
            console.log("not a valid req object no decidedFLowConfiguration found");
            const result = PolicyValidator.errorScoringResponse("COMPLETED", "L2", "Workflow Configuration Not Defined for this Product", null);
            if (result) {
                throw result;
            }
        }

        const productType = decidedFLowConfiguration.productType;

        const allPolicies = this._allPoliciesMap[institutionid];
        if (!allPolicies || !allPolicies[appid] || !allPolicies[appid][productType]) {
            console.log("all policies not found");
            const result = PolicyValidator.errorScoringResponse("COMPLETED", "L2", "Workflow Configuration Not Defined for this Product", null);
            if (result) {
                throw result;
            }
        }

        let candidatePolicies: SoBREPolicyModel[] = allPolicies[appid][productType];
        candidatePolicies = candidatePolicies.filter((x) => x.status == "Active");

        let selectedPolicy: SoBREPolicyModel;

        let instruPolicyExCount = 0;
        (<any>global).customFieldsCacheInContext={};
        reqObject.__customFieldsCacheInContext={};
        for (let count = 0; count < candidatePolicies.length; count++) {
            const curPolicy = candidatePolicies[count];
            if (curPolicy.masterConfig && allMasterData && allMasterData.length) {
                if (extype == 2) {
                    processMasterData2(curPolicy, reqObject, allMasterData);
                } else {
                    processMasterData(curPolicy, reqObject, allMasterData);
                }
            }
            const output = execute(curPolicy.breJsCriterionFunc, reqObject, true, false);

            // Collect all the custom fields from the Criteria to set in the final response DERIVED_FIELDS
            if (output.DERIVED_FIELDS) {
                for (const key in output.DERIVED_FIELDS) {
                    if (key != "POLICY_ID" && key != "POLICY_NAME") {
                        criteriaDerivedFields[key] = output.DERIVED_FIELDS[key];
                    }
                }
            }
            instruPolicyExCount = instruPolicyExCount + 1;
            if (output.ruleResult == "true") {
                selectedPolicy = curPolicy;
                console.log("Policy criteria matched for PolicyId and InstitutionId ",
                curPolicy.INSTITUTION_ID + "_" + curPolicy.PolicyID)
                break;
            }
            else {
                console.log("Policy criteria not matched for PolicyId and InstitutionId ",
                curPolicy.INSTITUTION_ID + "_" + curPolicy.PolicyID)
            }
        }
        console.log("policy selection completed after instance execution count ", instruPolicyExCount);
        if (!selectedPolicy || selectedPolicy.PolicyID == 0) {
            console.log("policy not found for loan processing");
            const result = PolicyValidator.errorScoringResponse("COMPLETED", "L2", "NO POLICY MATCH", null);
            result["DERIVED_FIELDS"] = {};

            for (const key in criteriaDerivedFields) {
                if (key != "POLICY_ID" && key != "POLICY_NAME") {
                    result.DERIVED_FIELDS[key] = criteriaDerivedFields[key];
                }
            }
            if (result) {
                throw result;
            }
        }

        return selectedPolicy && selectedPolicy.PolicyID;
    }

    private printStat() {
        for (const intsId in this._allPoliciesMap) {
            for (const appid in this._allPoliciesMap[intsId]) {
                for (const prodid in this._allPoliciesMap[intsId][appid]) {
                    if (this._allPoliciesMap[intsId][appid][prodid]) {
                        const objMap = this._allPoliciesMap[intsId][appid][prodid];
                        console.log("policy selections load count instituteid appid prodid", objMap.length, intsId, appid, prodid);
                    }
                }
            }
        }
    }

    private checkIfConfigMatch(flowConfig: FlowConfiguration, loanreqObj) {
        const paths = flowConfig.productKey.replace("IRP", "REQUEST").split("$");
        const valueToCompare = flowConfig.productType;
        let tempPathVariable = loanreqObj;
        paths.forEach((path) => {
            tempPathVariable = tempPathVariable && tempPathVariable[path];
        });

        if (tempPathVariable == valueToCompare) {
            return true;
        }
        return false;

    }

    private managePolicy(policy: SoBREPolicyModel, isNew: boolean = true) {
        const mapOfPolicies = this._allPoliciesMap;
        if (!mapOfPolicies[policy.INSTITUTION_ID]) {
            mapOfPolicies[policy.INSTITUTION_ID] = {};
        }
        policy.AppList.forEach((applist) => {
            if (!mapOfPolicies[policy.INSTITUTION_ID][applist.value]) {
                mapOfPolicies[policy.INSTITUTION_ID][applist.value] = {};
            }
            policy.ProdList.forEach((prodlist) => {
                if (!mapOfPolicies[policy.INSTITUTION_ID][applist.value][prodlist.value]) {
                    mapOfPolicies[policy.INSTITUTION_ID][applist.value][prodlist.value] = [];
                }
                if (isNew) {
                    mapOfPolicies[policy.INSTITUTION_ID][applist.value][prodlist.value].push(policy);
                } else {
                    const extpolicies: SoBREPolicyModel[] = mapOfPolicies[policy.INSTITUTION_ID][applist.value][prodlist.value];
                    const extPolicy = extpolicies.filter((x) => x.PolicyID == policy.PolicyID);
                    let oldPolicy;
                    if (extPolicy && extPolicy.length) {
                        oldPolicy = extPolicy[0];
                        extpolicies[extpolicies.indexOf(oldPolicy)] = policy;
                    } else {
                        extpolicies.push(policy);
                    }
                    mapOfPolicies[policy.INSTITUTION_ID][applist.value][prodlist.value] = this.orderTheArray(extpolicies);

                }
            });
        });

    }

    private sortAndCreateMapOfPolicies(allPolicies: SoBREPolicyModel[]): any {
        const mapOfPolicies = this._allPoliciesMap;
        // sort all policies based on prority and created date

        allPolicies.forEach((policy) => {
            this.managePolicy(policy, true);
        });
    }

}
export default PolicyCacheServiceModel;
