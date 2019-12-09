export var Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperator_PositiveOutput = 
{  "DECISION_RESPONSE": {
    "RuleID": 42,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "IDISSUEDATERANGE",
            "Outcome": "Approved",
            "remark": "matching issue date range",
            "Exp": " ( ( ( 01:06:2019 >= ID_ISSUE_DT ) && ( ID_ISSUE_DT > 20:06:2019 ) ) && ( ID_ISSUE_DT is not 01:12:2018 )  ) ",
            "Values": {
                "ID_ISSUE_DT": "[01:12:2017]"
            }
        }
    ]
}}

export var Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperator_NegativeOutput = 
  {  "DECISION_RESPONSE": {
    "RuleID": 42,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "IDISSUEDATERANGE",
            "Outcome": " ",
            "Remark": "No Rule Match",
            "Exp": " ( ( ( 01:06:2019 >= ID_ISSUE_DT ) && ( ID_ISSUE_DT > 20:06:2019 ) ) && ( ID_ISSUE_DT is not 01:12:2018 )  ) ",
            "Values": {
                "ID_ISSUE_DT": "[01:12:2018]"
            }
        }
    ]
}}


export var Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperator_NegativeOutput1 =
{  "DECISION_RESPONSE": {
    "RuleID": 42,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "IDISSUEDATERANGE",
            "Outcome": " ",
            "Remark": "No Rule Match",
            "Exp": " ( ( ( 01:06:2019 >= ID_ISSUE_DT ) && ( ID_ISSUE_DT > 20:06:2019 ) ) && ( ID_ISSUE_DT is not 01:12:2018 )  ) ",
            "Values": {
                "ID_ISSUE_DT": "[01:06:2019]"
            }
        }
    ]
}}
export var Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperator_NegativeOutput2 =
{  "DECISION_RESPONSE": {
    "RuleID": 42,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "IDISSUEDATERANGE",
            "Outcome": " ",
            "Remark": "No Rule Match",
            "Exp": " ( ( ( 01:06:2019 >= ID_ISSUE_DT ) && ( ID_ISSUE_DT > 20:06:2019 ) ) && ( ID_ISSUE_DT is not 01:12:2018 )  ) ",
            "Values": {
                "ID_ISSUE_DT": "[20:06:2019]"
            }
        }
    ]
}}
export var Cibil_IdIssueDate_Date_Approved_NotBetween_And_IsNotOperator_NegativeOutput3 =
{  "DECISION_RESPONSE": {
    "RuleID": 42,
    "Decision": "Approved",
    "Details": [
        {
            "CriteriaID": 1,
            "RuleName": "IDISSUEDATERANGE",
            "Outcome": " ",
            "Remark": "No Rule Match",
            "Exp": " ( ( ( 01:06:2019 >= ID_ISSUE_DT ) && ( ID_ISSUE_DT > 20:06:2019 ) ) && ( ID_ISSUE_DT is not 01:12:2018 )  ) ",
            "Values": {
                "ID_ISSUE_DT": "[18:06:2019]"
            }
        }
    ]
}}
