export var Number_BDSResponse_ScoreValue_Queue_Lessthan_AND_GreaterthanOperator_PositiveOutput1 =
{
    "DECISION_RESPONSE": {
    "RuleID": 48,
    "Decision": "Queue",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "SCORE VALUE",
            "Outcome": "Queue",
            "Remark": "SCORE VALUE IS QUEUED ",
            "Exp": " ( ( SCORE_VALUE < 5 ) && ( SCORE_VALUE > 2 )  ) ",
            "Values": {
                "SCORE_VALUE": "3.0"
            }
        }
    ]
}
}

export var Number_BDSResponse_ScoreValue_Queue_Lessthan_AND_GreaterthanOperator_PositiveOutput2 ={

    "DECISION_RESPONSE": {
        "RuleID": 48,
        "Decision": "Queue",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "SCORE VALUE",
                "Outcome": "Queue",
                "Remark": "SCORE VALUE IS QUEUED ",
                "Exp": " ( ( SCORE_VALUE < 5 ) && ( SCORE_VALUE > 2 )  ) ",
                "Values": {
                    "SCORE_VALUE": "4.0"
                }
            }
        ]
    }
}

export var Number_BDSResponse_ScoreValue_Queue_Lessthan_AND_GreaterthanOperator_NegativeOutput3 ={
    "DECISION_RESPONSE": {
        "RuleID": 48,
        "Decision": "Approved",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "SCORE VALUE",
                "Outcome": " ",
                "Remark": "No Rule Match",
                "Exp": " ( ( SCORE_VALUE < 5 ) && ( SCORE_VALUE > 2 )  ) ",
                "Values": {
                    "SCORE_VALUE": "2.0"
                }
            }
        ]
    }
}

export var Number_BDSResponse_ScoreValue_Queue_Lessthan_AND_GreaterthanOperator_NegativeOutput4 ={

    "DECISION_RESPONSE": {
        "RuleID": 48,
        "Decision": "Approved",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "SCORE VALUE",
                "Outcome": " ",
                "Remark": "No Rule Match",
                "Exp": " ( ( SCORE_VALUE < 5 ) && ( SCORE_VALUE > 2 )  ) ",
                "Values": {
                    "SCORE_VALUE": "5.0"
                }
            }
        ]
    }
}
