
var Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperatorPolicy = {
   "creditRule": [{

      "RuleID": 42,
      "RType": "Criteria",
      "RuleList": [{
         "CriteriaID": "",
         "cname": "IDISSUEDATERANGE",
         "Outcome": "Approved",
         "remark": "matching issue date range",
         "rules": [
            {
               "val1": "01:06:2019",
               "exp1": ">=",
               "fieldname": "CIBIL_RESPONSE$idList$issueDate",
               "displayname": "ID_ISSUE_DT",
               "exp2": ">",
               "val2": "20:06:2019",
               "operator": "&&",
               "DType": "D",
               "AFSpec": "",
               "FType": "IFF STRUCTURE",
               "ExpType": "Value",
               "outOperator": "",
               "ref": [
                  {
                     "val1": "",
                     "exp1": "",
                     "fieldname": "CIBIL_RESPONSE$idList$issueDate",
                     "displayname": "ID_ISSUE_DT",
                     "exp2": "is not",
                     "val2": "01:12:2018",
                     "operator": "",
                     "DType": "D",
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
export default Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperatorPolicy;