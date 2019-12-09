export var Number_Perfios_LogTaxId_Approved_Between_OR_NotBetweenOperator_PositiveOutput1=

{    "DECISION_RESPONSE": {
    "RuleID": 46,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "LOG TAX ID",
            "Outcome": "Approved",
            "Remark": "valid log tax id and sobre score",
            "Exp": " ( ( ( 11 <= LOG_TXN_ID ) && ( LOG_TXN_ID < 20 ) ) || ( ( 500 >= SOBRE_SCORE ) && ( SOBRE_SCORE > 201 ) )  ) ",
            "Values": {
                "LOG_TXN_ID": "11.0",
                "SOBRE_SCORE": "202.0"
            }
        }
    ]
}}

export var Number_Perfios_LogTaxId_Approved_Between_OR_NotBetweenOperator_PositiveOutput2=
{"DECISION_RESPONSE": {
    "RuleID": 46,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "LOG TAX ID",
            "Outcome": "Approved",
            "Remark": "valid log tax id and sobre score",
            "Exp": " ( ( ( 11 <= LOG_TXN_ID ) && ( LOG_TXN_ID < 20 ) ) || ( ( 500 >= SOBRE_SCORE ) && ( SOBRE_SCORE > 201 ) )  ) ",
            "Values": {
                "LOG_TXN_ID": "10.0",
                "SOBRE_SCORE": "500.0"
            }
        }
    ]
}}

export var Number_Perfios_LogTaxId_Approved_Between_OR_NotBetweenOperator_PositiveOutput3=
{ "DECISION_RESPONSE": {
    "RuleID": 46,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "LOG TAX ID",
            "Outcome": "Approved",
            "Remark": "valid log tax id and sobre score",
            "Exp": " ( ( ( 11 <= LOG_TXN_ID ) && ( LOG_TXN_ID < 20 ) ) || ( ( 500 >= SOBRE_SCORE ) && ( SOBRE_SCORE > 201 ) )  ) ",
            "Values": {
                "LOG_TXN_ID": "19.0",
                "SOBRE_SCORE": "100.0"
            }
        }
    ]
}}
export var Number_Perfios_LogTaxId_Approved_Between_OR_NotBetweenOperator_NegativeOutput4=
{"DECISION_RESPONSE": {
    "RuleID": 46,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "LOG TAX ID",
            "Outcome": " ",
            "Remark": "No Rule Match",
            "Exp": " ( ( ( 11 <= LOG_TXN_ID ) && ( LOG_TXN_ID < 20 ) ) || ( ( 500 >= SOBRE_SCORE ) && ( SOBRE_SCORE > 201 ) )  ) ",
            "Values": {
                "LOG_TXN_ID": "21.0",
                "SOBRE_SCORE": "601.0"
            }
        }
    ]
}}