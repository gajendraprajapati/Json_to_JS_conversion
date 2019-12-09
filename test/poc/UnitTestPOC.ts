const handlebars = require('handlebars');
const decode = require('unescape');
const vm = require('vm');

import { HandleBarhelpers } from '../../src/handleBarHelper';

(new HandleBarhelpers()).addAllHelpers(handlebars);

describe('Unit Test POC', function () {
    const simpleRuleTemplate =
        `const {{name}} = (input) => {
            if({{getIfExpression field operator checkValue}}) {
                return "{{Outcome}}";
            }
            return "{{defaultOutCome}}";
            }
        output.{{name}} = {{name}}(input);`;

    handlebars.registerPartial({
        simpleRuleTemplate
    });
    const policyRules = require('../../data/policyRules.json');

    let compiledSimpleRuleTemplate = handlebars.compile('{{> simpleRuleTemplate}}');
    let rulesScript = decode(compiledSimpleRuleTemplate(policyRules.data.creditRules[0]));

    it('should show the criteria name, input and output values - Test1', function () {
        let input = {};
        const SUPP_MAST_DEALER_CITY_ID = 15;
        input["GNG_MASTER_FIELDS"] = {};
        input["GNG_MASTER_FIELDS"]["SUPP_MAST_DEALER_CITY_ID"] = SUPP_MAST_DEALER_CITY_ID;
        input["GNG_MASTER_FIELDS"]["Outcome"] = "Declined";
        input["GNG_MASTER_FIELDS"]["defaultOutCome"] = "";

        let sandbox = {
            input,
            output: {}
        };

        vm.createContext(sandbox);
        vm.runInContext(rulesScript, sandbox);
        console.log("input: "+SUPP_MAST_DEALER_CITY_ID);
        console.log("Rule Name: "+policyRules.data.creditRules[0].name);
        console.log("Output: "+JSON.stringify(sandbox.output, null, 2));

        console.log("\n");
    });

    it('should show the criteria name, input and output values - Test2', function () {
        let input = {};
        const SUPP_MAST_DEALER_CITY_ID = 30;
        input["GNG_MASTER_FIELDS"] = {};
        input["GNG_MASTER_FIELDS"]["SUPP_MAST_DEALER_CITY_ID"] = 40;
        input["GNG_MASTER_FIELDS"]["Outcome"] = "Declined";
        input["GNG_MASTER_FIELDS"]["defaultOutCome"] = "";

        let sandbox = {
            input,
            output: {}
        };

        vm.createContext(sandbox);
        vm.runInContext(rulesScript, sandbox);
        console.log("input: "+SUPP_MAST_DEALER_CITY_ID);
        console.log("Rule Name: "+policyRules.data.creditRules[0].name);
        console.log("Output: "+JSON.stringify(sandbox.output, null, 2));

        console.log("\n");
    });
});