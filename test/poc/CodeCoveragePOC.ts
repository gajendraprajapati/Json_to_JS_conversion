const handlebars = require('handlebars');
const decode = require('unescape');
const vm = require('vm');

import { HandleBarhelpers } from '../../src/handleBarHelper';

(new HandleBarhelpers()).addAllHelpers(handlebars);

describe('Code Coverage POC', function () {
    const template1 =
        `let {{name}} = (input) => {
            if({{getIfExpression field operator checkValue}}) {
                return "{{Outcome}}";
            }
            return "{{defaultOutCome}}";
            }
        output.{{name}} = myexecute({{name}} , input , "{{name}}");`;

    const template2 =
        `let {{name}} = (input) => {
            if({{getIfExpression field operator checkValue}}) {
                return "{{Outcome}}";
            }
            return "{{defaultOutCome}}";
            }
        output.{{name}} = myexecute( {{name}} , input , "{{name}}");`;

    handlebars.registerPartial({
        template1, template2
    });
    const policyRules = require('../../data/policyRules.json');

    let compiledSimpleRuleTemplate = handlebars.compile('{{> template1}}');
    let compiledOverrideSimpleRuleTemplate = handlebars.compile('{{> template2}}');
    let rulesScript1 = decode(compiledSimpleRuleTemplate(policyRules.data.creditRules[0]));
    let rulesScript2 = decode(compiledOverrideSimpleRuleTemplate(policyRules.data.creditRules[1]));

    it('should provide you number of rules executed information', function () {
        let input = {};
        const SUPP_MAST_DEALER_CITY_ID = 15;
        input["GNG_MASTER_FIELDS"] = {};
        input["GNG_MASTER_FIELDS"]["SUPP_MAST_DEALER_CITY_ID"] = SUPP_MAST_DEALER_CITY_ID;
        input["GNG_MASTER_FIELDS"]["Outcome"] = "Declined";
        input["GNG_MASTER_FIELDS"]["defaultOutCome"] = "";
        input["IRP"] = {};
        input["IRP"]["age"] = 25;
        input["IRP"]["Outcome"] = "Declined";
        input["IRP"]["defaultOutCome"] = "";

        let instrumentObj={};
        const myexecute=(func, obj, funNanme)=>{
            if(!instrumentObj[funNanme]){
                instrumentObj[funNanme]=0;
            }
            instrumentObj[funNanme]+=1;
            func(obj);
        };

        let sandbox = {
            input: input,
            output: {},
            instrumentObj:instrumentObj,
            myexecute: myexecute
        };

        vm.createContext(sandbox);
        vm.runInContext(rulesScript1 + rulesScript2, sandbox);
        console.log("instrumentObj: " + JSON.stringify(instrumentObj, null, 2));
        console.log("\n");
    });
});