var sanctionedamt_averagepolicy = 
{  
    "FILE_ID":1,
    "FIELD_NAME":"TEST2",
    "DISPLAY_NAME":"TEST2",
    "FIELD_TYPE":"N",
    "LEVEL":"Summary",
    "RULES":[  
       {  
          "Condition":[  
             {  
                "val1":"",
                "exp1":"",
                "fieldname":"CIBIL_RESPONSE$name$dob",
                "displayname":"DT_OF_BIRTH",
                "exp2":"AFTER",
                "val2":"MERGED_RESPONSE$disparateCredentials$nameList$dateReported",
                "operator":"",
                "DType":"D",
                "AFSpec":"",
                "FType":"IFF STRUCTURE",
                "ExpType":"Field",
                "Difference":"",
                "DiffOpr":"",
                "outOperator":"",
                "ref":[  
 
                ]
             }
          ],
          "Outcome":{  
             "TYPE":"Field",
             "OUTCM_VALUE":"",
             "BASE_FIELD":"MERGED_RESPONSE$activeTradelines$sanctionedAmount",
             "BASE_FNAME":"TL_SANCTIONED_AMT",
             "BASE_FTYPE":"IFF STRUCTURE",
             "BASE_DTYPE":"N",
             "AGGR_OPRTR":"AVERAGE",
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
       "OUTCM_VALUE":"0"
    },
    "OCCURENCE":1,
    "createdby":"Demo Sober",
    "CType":"CREATE",
    "isSimulator":false,
    "INSTITUTION_ID":4045,
    "User":"Demo Sober",
    "makerChecker":"N"
 }

 export default sanctionedamt_averagepolicy;