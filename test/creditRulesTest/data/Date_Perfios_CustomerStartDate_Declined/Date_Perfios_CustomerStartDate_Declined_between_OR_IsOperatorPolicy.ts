var Date_Perfios_CustomerStartDate_Declined_Between_OR_IsOperatorPolicy =
{
    "creditRule": [{
        "RuleID": 44,
        "type": "Criteria",
        "RuleList": [{
            "CriteriaID": "",

            "cname": "CUSTOMER START AND END DATE",
            "Outcome": "Declined",
            "remark": "Documents are not cleared so keeping on hold for this customer as of now",
            "rules": [
                {
                    "val1": "01:05:2019",
                    "exp1": "<=",
                    "fieldname": "PERFIOS$oResponse$oCustomerInfo$sStartDate",
                    "displayname": "CUSTOMER_START_DATE",
                    "exp2": "<",
                    "val2": "31:05:2019",
                    "operator": "||",
                    "DType": "D",
                    "AFSpec": "",
                    "FType": "IFF STRUCTURE",
                    "ExpType": "Value",
                    "outOperator": "&&",
                    "ref": [
                        {
                            "val1": "",
                            "exp1": "",
                            "fieldname": "PERFIOS$oResponse$oCustomerInfo$sStartDate",
                            "displayname": "CUSTOMER_START_DATE",
                            "exp2": "is",
                            "val2": "21:06:2019",
                            "operator": "",
                            "DType": "D",
                            "AFSpec": "",
                            "FType": "IFF STRUCTURE",
                            "ExpType": "Value"
                        }
                    ]
                },
                {
                    "val1": "22:06:2019",
                    "exp1": "<=",
                    "fieldname": "PERFIOS$oResponse$oCustomerInfo$sEndDate",
                    "displayname": "CUSTOMER_END_DATE",
                    "exp2": "<",
                    "val2": "25:06:2019",
                    "operator": "",
                    "DType": "D",
                    "AFSpec": "",
                    "FType": "IFF STRUCTURE",
                    "ExpType": "Value",
                    "outOperator": "",
                    "ref": [

                    ]
                }
            ]
        }]
    }]
}

export default Date_Perfios_CustomerStartDate_Declined_Between_OR_IsOperatorPolicy;

