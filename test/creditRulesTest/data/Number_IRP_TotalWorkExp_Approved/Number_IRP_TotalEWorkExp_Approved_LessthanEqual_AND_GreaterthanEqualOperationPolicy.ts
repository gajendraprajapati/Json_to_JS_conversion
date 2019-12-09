var Number_IRP_TotalEWorkExp_Approved_LessthanEqual_AND_GreaterthanEqualOperationPolicy =
{
   "creditRule": [{
      "RuleID": 45,
      "type": "Criteria",
      "RuleList": [{
         "CriteriaID": "",
         "cname": "TOTAL WORK EXPERIENCE",
         "Outcome": "Approved",
         "remark": "work experience range is 3 to 5",
         "rules": [
            {
               "val1": "",
               "exp1": "",
               "fieldname": "IRP$oReq$oApplicant$aEmpl$sWorkExps",
               "displayname": "TOTAL WORK EXPERIENCE",
               "exp2": "<=",
               "val2": "5",
               "operator": "&&",
               "DType": "N",
               "AFSpec": "",
               "FType": "IFF STRUCTURE",
               "ExpType": "Value",
               "outOperator": "",
               "ref": [
                  {
                     "val1": "",
                     "exp1": "",
                     "fieldname": "IRP$oReq$oApplicant$aEmpl$sWorkExps",
                     "displayname": "TOTAL WORK EXPERIENCE",
                     "exp2": ">=",
                     "val2": "3",
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

export default Number_IRP_TotalEWorkExp_Approved_LessthanEqual_AND_GreaterthanEqualOperationPolicy;