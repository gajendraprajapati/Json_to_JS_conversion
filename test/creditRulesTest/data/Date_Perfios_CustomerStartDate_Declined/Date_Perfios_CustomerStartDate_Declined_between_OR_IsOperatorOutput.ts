export var Date_Perfios_CustomerStartDate_Declined_between_OR_IsOperator_PositiveOutput =
{
    "DECISION_RESPONSE": {
        "RuleID": 44,
        "Decision": "Declined",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "CUSTOMER START AND END DATE",
                "Outcome": "Declined",
                "Remark": "Documents are not cleared so keeping on hold for this customer as of now",
                "Exp": " ( ( ( 01:05:2019 <= CUSTOMER_START_DATE ) && ( CUSTOMER_START_DATE < 31:05:2019 ) ) || ( CUSTOMER_START_DATE is 21:06:2019 )  )  && ( ( 22:06:2019 <= CUSTOMER_END_DATE ) && ( CUSTOMER_END_DATE < 25:06:2019 ) )",
                "Values": {
                    "CUSTOMER_END_DATE": "22:06:2019",
                    "CUSTOMER_START_DATE": "21:06:2019"
                }
            }
        ]
    }
}


export var Date_Perfios_CustomerStartDate_Declined_between_OR_IsOperator_PositiveOutput2 =
{

    "DECISION_RESPONSE": {
        "RuleID": 44,
        "Decision": "Declined",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "CUSTOMER START AND END DATE",
                "Outcome": "Declined",
                "Remark": "Documents are not cleared so keeping on hold for this customer as of now",
                "Exp": " ( ( ( 01:05:2019 <= CUSTOMER_START_DATE ) && ( CUSTOMER_START_DATE < 31:05:2019 ) ) || ( CUSTOMER_START_DATE is 21:06:2019 )  )  && ( ( 22:06:2019 <= CUSTOMER_END_DATE ) && ( CUSTOMER_END_DATE < 25:06:2019 ) )",
                "Values": {
                    "CUSTOMER_END_DATE": "24:06:2019",
                    "CUSTOMER_START_DATE": "01:05:2019"
                }
            }
        ]
    }
}
export var Date_Perfios_CustomerStartDate_Declined_between_OR_IsOperator_NegativeOutput2 =
{
    "DECISION_RESPONSE": {
        "RuleID": 44,
        "Decision": "Approved",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "CUSTOMER START AND END DATE",
                "Outcome": " ",
                "Remark": "No Rule Match",
                "Exp": " ( ( ( 01:05:2019 <= CUSTOMER_START_DATE ) && ( CUSTOMER_START_DATE < 31:05:2019 ) ) || ( CUSTOMER_START_DATE is 21:06:2019 )  )  && ( ( 22:06:2019 <= CUSTOMER_END_DATE ) && ( CUSTOMER_END_DATE < 25:06:2019 ) )",
                "Values": {
                    "CUSTOMER_END_DATE": "25:06:2019",
                    "CUSTOMER_START_DATE": "02:05:2019"
                }
            }
        ]
    }
}
export var Date_Perfios_CustomerStartDate_Declined_between_OR_IsOperator_NegativeOutput3 =
{
    "DECISION_RESPONSE": {
        "RuleID": 44,
        "Decision": "Approved",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "CUSTOMER START AND END DATE",
                "Outcome": " ",
                "Remark": "No Rule Match",
                "Exp": " ( ( ( 01:05:2019 <= CUSTOMER_START_DATE ) && ( CUSTOMER_START_DATE < 31:05:2019 ) ) || ( CUSTOMER_START_DATE is 21:06:2019 )  )  && ( ( 22:06:2019 <= CUSTOMER_END_DATE ) && ( CUSTOMER_END_DATE < 25:06:2019 ) )",
                "Values": {
                    "CUSTOMER_END_DATE": "27:06:2019",
                    "CUSTOMER_START_DATE": "02:06:2019"
                }
            }
        ]
    }
}

export var Date_Perfios_CustomerStartDate_Declined_between_OR_IsOperator_NegativeOutput4 =
{
    "DECISION_RESPONSE": {
        "RuleID": 44,
        "Decision": "Approved",
        "Details": [
            {
                "CriteriaID": 1,
                "RuleName": "CUSTOMER START AND END DATE",
                "Outcome": " ",
                "Remark": "No Rule Match",
                "Exp": " ( ( ( 01:05:2019 <= CUSTOMER_START_DATE ) && ( CUSTOMER_START_DATE < 31:05:2019 ) ) || ( CUSTOMER_START_DATE is 21:06:2019 )  )  && ( ( 22:06:2019 <= CUSTOMER_END_DATE ) && ( CUSTOMER_END_DATE < 25:06:2019 ) )",
                "Values": {
                    "CUSTOMER_END_DATE": " ",
                    "CUSTOMER_START_DATE": " "
                }
            }
        ]
    }



}