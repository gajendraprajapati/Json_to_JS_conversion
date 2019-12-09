var pastenqamt_minimumpolicy = {  
    "FILE_ID":1,
    "FIELD_NAME":"TEST3",
    "DISPLAY_NAME":"TEST3",
    "FIELD_TYPE":"S",
    "LEVEL":"Summary",
    "RULES":[  
       {  
          "Condition":[  
             {  
                "val1":"",
                "exp1":"",
                "fieldname":"CIBIL_RESPONSE$name$name1",
                "displayname":"CONSUMER_NAME_FIELD1",
                "exp2":"is",
                "val2":"IRP$oReq$oApplicant$oApplName$sFirstName",
                "operator":"",
                "DType":"S",
                "AFSpec":"",
                "FType":"IFF STRUCTURE",
                "ExpType":"Field",
                "outOperator":"",
                "ref":[  
 
                ]
             }
          ],
          "Outcome":{  
             "TYPE":"Field",
             "OUTCM_VALUE":"",
             "BASE_FIELD":"MERGED_RESPONSE$pastEnquiry$amount",
             "BASE_FNAME":"PAST_ENQ_AMT",
             "BASE_FTYPE":"IFF STRUCTURE",
             "BASE_DTYPE":"N",
             "AGGR_OPRTR":"MINIMUM",
             "AGGR_TYPE":"",
             "COMPR_FIELD":"",
             "COMPR_FNAME":"",
             "COMPR_FTYPE":"",
             "COMPR_VALUE":""
          }
       }
    ],
    "DEFAULT_VALUE":{  
       "TYPE":"Value",
       "OUTCM_VALUE":"1001"
    },
    "OCCURENCE":1,
    "createdby":"Demo Sober",
    "CType":"CREATE",
    "isSimulator":false,
    "INSTITUTION_ID":4045,
    "User":"Demo Sober",
    "makerChecker":"N"
 }

 export default pastenqamt_minimumpolicy;
