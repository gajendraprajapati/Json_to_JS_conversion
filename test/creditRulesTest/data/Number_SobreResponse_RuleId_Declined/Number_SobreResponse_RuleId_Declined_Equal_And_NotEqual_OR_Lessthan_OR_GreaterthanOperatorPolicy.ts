var Number_SobreResponse_RuleId_Declined_Equal_And_NotEqual_OR_Lessthan_OR_GreaterthanOperatorPolicy =
{
   "creditRule": [{

      "RuleID": 47,
      "type": "Criteria",
      "RuleList": [{
         "CriteriaID": "",
         "cname": "RULE ID ",
         "Outcome": "Declined",
         "remark": "matched rule ids are  displaying declined rules",
         "rules": [
            {
               "val1": "",
               "exp1": "",
               "fieldname": "SOBRE_RESPONSE$DECISION_RESPONSE$RuleID",
               "displayname": "RULEID",
               "exp2": "==",
               "val2": "10",
               "operator": "&&",
               "DType": "N",
               "AFSpec": "",
               "FType": "IFF STRUCTURE",
               "ExpType": "Value",
               "outOperator": "||",
               "ref": [
                  {
                     "val1": "",
                     "exp1": "",
                     "fieldname": "SOBRE_RESPONSE$DECISION_RESPONSE$RuleID",
                     "displayname": "RULEID",
                     "exp2": "!=",
                     "val2": "11",
                     "operator": "",
                     "DType": "N",
                     "AFSpec": "",
                     "FType": "IFF STRUCTURE",
                     "ExpType": "Value"
                  }
               ]
            },
            {
               "val1": "",
               "exp1": "",
               "fieldname": "SOBRE_RESPONSE$DECISION_RESPONSE$RuleID",
               "displayname": "RULEID",
               "exp2": "<",
               "val2": "5",
               "operator": "",
               "DType": "N",
               "AFSpec": "",
               "FType": "IFF STRUCTURE",
               "ExpType": "Value",
               "outOperator": "||",
               "ref": [

               ]
            },
            {
               "val1": "",
               "exp1": "",
               "fieldname": "SOBRE_RESPONSE$DECISION_RESPONSE$RuleID",
               "displayname": "RULEID",
               "exp2": ">",
               "val2": "2",
               "operator": "",
               "DType": "N",
               "AFSpec": "",
               "FType": "IFF STRUCTURE",
               "ExpType": "Value",
               "outOperator": "",
               "ref": [

               ]
            }
         ]

      }
      ]
   }
   ]


}

export default Number_SobreResponse_RuleId_Declined_Equal_And_NotEqual_OR_Lessthan_OR_GreaterthanOperatorPolicy;
