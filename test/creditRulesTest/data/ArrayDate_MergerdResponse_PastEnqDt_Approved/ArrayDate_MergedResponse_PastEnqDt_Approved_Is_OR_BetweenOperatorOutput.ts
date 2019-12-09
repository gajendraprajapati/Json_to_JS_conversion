export var ArrayDate_MergedResponse_PastEnqDt_Approved_Is_OR_BetweenOperator_PositiveOutput={  "DECISION_RESPONSE": {
    "RuleID": 52,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "PAST ENQ DATE",
            "Outcome": "Approved",
            "Remark": "enquiry date should follow the selected range",
            "Exp": " ( ( PAST_ENQ_DT is 01:06:2018 ) || ( ( 01:01:2016 <= PAST_ENQ_DT ) && ( PAST_ENQ_DT < 01:07:2017 ) )  ) ",
            "Values": {
                "PAST_ENQ_DT": "[01:06:2018, 01:01:2016, 31:06:2017]"
            }
        }
    ]
}}


export var ArrayDate_MergedResponse_PastEnqDt_Approved_Is_OR_BetweenOperator_NegativeOutput={ "DECISION_RESPONSE": {
    "RuleID": 52,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "PAST ENQ DATE",
            "Outcome": " ",
            "Remark": "No Rule Match",
            "Exp": " ( ( PAST_ENQ_DT is 01:06:2018 ) || ( ( 01:01:2016 <= PAST_ENQ_DT ) && ( PAST_ENQ_DT < 01:07:2017 ) )  ) ",
            "Values": {
                "PAST_ENQ_DT": "[01:05:2018, 01:01:2015, 01:07:2017]"
            }
        }
    ]
}}

