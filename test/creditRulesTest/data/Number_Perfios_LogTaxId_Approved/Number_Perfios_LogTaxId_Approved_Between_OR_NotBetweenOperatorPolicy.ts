var Number_Perfios_LogTaxId_Approved_Between_OR_NotBetweenOperatorPolicy =
{
   "creditRule": [{

      "RuleID": 46,
      "type": "Criteria",
      "RuleList": [{
         "CriteriaID": "",
         "cname": "LOG TAX ID",
         "Outcome": "Approved",
         "remark": "valid log tax id and sobre score",
         "rules": [
            {
               "val1": "11",
               "exp1": "<=",
               "fieldname": "PERFIOS$sLogTxnId",
               "displayname": "LOG_TXN_ID",
               "exp2": "<",
               "val2": "20",
               "operator": "||",
               "DType": "N",
               "AFSpec": "",
               "FType": "IFF STRUCTURE",
               "ExpType": "Value",
               "outOperator": "",
               "ref": [
                  {
                     "val1": "500",
                     "exp1": ">=",
                     "fieldname": "WORKFLOW_FIELD$FINAL_SCORE0",
                     "displayname": "SOBRE_SCORE",
                     "exp2": ">",
                     "val2": "201",
                     "operator": "",
                     "DType": "N",
                     "AFSpec": "",
                     "FType": "IFF STRUCTURE",
                     "ExpType": "Value"
                  }
               ]
            }
         ]
      }]
   }]

}

export default Number_Perfios_LogTaxId_Approved_Between_OR_NotBetweenOperatorPolicy;