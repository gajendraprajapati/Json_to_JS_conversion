export {};

import { Counter } from "../models/counter";
import { PolicyModel } from "../models/policyModel";

export const generateBREJson = (policy: PolicyModel) => {
    let BREXJson = [];
    Counter.reset();
    BREXJson = policy.generateCustomFields();
    return BREXJson;
};
