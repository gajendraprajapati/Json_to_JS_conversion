var Number_BDSResponse_ScoreValue_Queue_Lessthan_AND_GreaterthanOperatorpolicy =
{
   "creditRule": [{

      "RuleID": 48,
      "type": "Criteria",

      "RuleList": [{
         "CriteriaID": "",
         "cname": "SCORE VALUE",
         "Outcome": "Queue",
         "remark": "SCORE VALUE IS QUEUED ",
         "rules": [
            {
               "val1": "",
               "exp1": "",
               "fieldname": "BDS_RESPONSE$score$CD_ONLINE$scoreValue",
               "displayname": "SCORE_VALUE",
               "exp2": "<",
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
                     "fieldname": "BDS_RESPONSE$score$CD_ONLINE$scoreValue",
                     "displayname": "SCORE_VALUE",
                     "exp2": ">",
                     "val2": "2",
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

export default Number_BDSResponse_ScoreValue_Queue_Lessthan_AND_GreaterthanOperatorpolicy;
