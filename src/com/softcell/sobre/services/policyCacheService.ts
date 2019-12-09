import { execute, generate, generateAndExecute } from "../../../../../src/generatePolicyProd";
import { Rule } from "../models/ruleModel";
import { SoBREPolicyModel } from "../models/soberPolicyModel";
import { FlowConfiguration, WorkFLowConfigModel } from "../models/workFlowConfigModel";

import * as _ from "lodash";
import { PolicyCacheServiceModel } from "./policyCacheServiceModel";

export class PolicyCacheService {

   public policyModel: PolicyCacheServiceModel = new PolicyCacheServiceModel();

   public getPolicyIdUsingPoliciesAndFlow(reqObject: any, allpolicies: SoBREPolicyModel[], curConfig: WorkFLowConfigModel) {
       const curPolicyModel = new PolicyCacheServiceModel();
       const criteriaDerivedFields = {};
       curPolicyModel.setPolicies(allpolicies);
       curPolicyModel.setWorkFlows([curConfig]);
       return curPolicyModel.fetchPolciyForRequestObject(reqObject, criteriaDerivedFields);
   }

}

const policyCacheService = new PolicyCacheService();
export default policyCacheService;
