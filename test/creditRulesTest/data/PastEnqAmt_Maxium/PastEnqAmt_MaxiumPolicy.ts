
var PastEnqAmt_Maxium = 
{  
    "FILE_ID":1,
    "FIELD_NAME":"TEST1",
    "DISPLAY_NAME":"TEST1",
    "FIELD_TYPE":"S",
    "LEVEL":"Summary",
    "RULES":[  
       {  
          "Condition":[  
             {  
                "val1":"",
                "exp1":"",
                "fieldname":"CUSTOM_FIELDS$TOTAL_ENQUIRIES",
                "displayname":"TOTAL_ENQUIRIES",
                "exp2":">",
                "val2":"CUSTOM_FIELDS$TOTAL_OPEN_TRADE",
                "operator":"",
                "DType":"N",
                "AFSpec":"",
                "FType":"CUSTOM",
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
             "AGGR_OPRTR":"MAXIMUM",
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
       "OUTCM_VALUE":"1"
    },
    "OCCURENCE":1,
    "createdby":"Demo Sober",
    "CType":"CREATE",
    "isSimulator":false,
    "INSTITUTION_ID":4045,
    "User":"Demo Sober",
    "makerChecker":"N"
 }

 export default PastEnqAmt_Maxium; 