 var ArrayDate_MergedResponse_PastEnqDt_Approved_Is_OR_BetweenOPeratorPolicy = {

 "creditRule": [{  
    "RuleID":52,
    "type":"Criteria",

    "RuleList":[{
    "CriteriaID":"",
     "cname":"PAST ENQ DATE",
    "Outcome":"Approved",
    "remark":"enquiry date should follow the selected range",
    "rules":[  
       {  
          "val1":"",
          "exp1":"",
          "fieldname":"MERGED_RESPONSE$pastEnquiry$enquiryDate",
          "displayname":"PAST_ENQ_DT",
          "exp2":"is",
          "val2":"01:06:2018",
          "operator":"||",
          "DType":"D",
          "AFSpec":"",
          "FType":"IFF STRUCTURE",
          "ExpType":"Value",
          "outOperator":"",
          "ref":[  
             {  
                "val1":"01:01:2016",
                "exp1":"<=",
                "fieldname":"MERGED_RESPONSE$pastEnquiry$enquiryDate",
                "displayname":"PAST_ENQ_DT",
                "exp2":"<",
                "val2":"01:07:2017",
                "operator":"",
                "DType":"D",
                "AFSpec":"",
                "FType":"IFF STRUCTURE",
                "ExpType":"Value"
             }
          ]
       }
    ]}]}]
 }

 export default ArrayDate_MergedResponse_PastEnqDt_Approved_Is_OR_BetweenOPeratorPolicy;