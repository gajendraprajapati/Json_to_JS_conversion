const handlebars = require('handlebars');
const decode = require('unescape');
const vm = require('vm');

import { HandleBarhelpers } from '../../src/handleBarHelper';

(new HandleBarhelpers()).addAllHelpers(handlebars);

describe('Oops POC', function () {
    const simpleRuleTemplate =
        `var {{name}} = (input) => {
            if({{getIfExpression field operator checkValue}}) {
                return "{{Outcome}}";
            }
            return "{{defaultOutCome}}";
            }
        output.{{name}} = {{name}}(input);`;

    const overrideTemplate =
        `var {{name}} = (input) => {
            if({{getIfExpression field operator checkValue}}) {
                return "Override - {{Outcome}}";
            }
            return "Override - {{defaultOutCome}}";
            }
        output.{{name}} = {{name}}(input);`;

    handlebars.registerPartial({
        simpleRuleTemplate, overrideTemplate
    });
    const policyRules = require('../../data/policyRules.json');

    let compiledSimpleRuleTemplate = handlebars.compile('{{> simpleRuleTemplate}}');
    let compiledOverrideSimpleRuleTemplate = handlebars.compile('{{> overrideTemplate}}');
    let rulesScript = decode(compiledSimpleRuleTemplate(policyRules.data.creditRules[0]));
    let overrideScript = decode(compiledOverrideSimpleRuleTemplate(policyRules.data.creditRules[0]));

    it('should override the existing compiled rules', function () {
        let input = {};
        const SUPP_MAST_DEALER_CITY_ID = 15;
        input["GNG_MASTER_FIELDS"] = {};
        input["GNG_MASTER_FIELDS"]["SUPP_MAST_DEALER_CITY_ID"] = SUPP_MAST_DEALER_CITY_ID;
        input["GNG_MASTER_FIELDS"]["Outcome"] = "Declined";
        input["GNG_MASTER_FIELDS"]["defaultOutCome"] = "";

        let sandbox = {
            input: input,
            output: {}
        };

        vm.createContext(sandbox);
        vm.runInContext(rulesScript + overrideScript, sandbox);
        console.log("input: " + SUPP_MAST_DEALER_CITY_ID);
        console.log("Rule Name: " + policyRules.data.creditRules[0].name);
        console.log("Output: " + JSON.stringify(sandbox.output, null, 2));

        console.log("\n");
    });
});