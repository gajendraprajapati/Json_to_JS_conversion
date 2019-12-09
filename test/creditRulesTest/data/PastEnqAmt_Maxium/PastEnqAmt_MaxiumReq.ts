export const PastEnqAmt_Maximum_PositiveReq = {
    "CIBIL_RESPONSE": {
        "enquiryList": {
            "reportingMemberShortName": "notblank"
        },
        "accountList": {
            "dateClosed": null,
            "accountType": 12,
            "enquiryPurpose": 123,
        }
    },

    "MERGED_RESPONSE": {
        "pastEnquiry": [
        {  "amount": 1000
        },
        {  "amount": 1500
        },
        {  "amount": 2000
    }]
} 
}

export const PastEnqAmt_Maximum_NegativeReq = {
    "CIBIL_RESPONSE": {
        "enquiryList": {
            "reportingMemberShortName": " "
        },
        "accountList": {
            "dateClosed": " ",
            "accountType": 12,
            "enquiryPurpose": 123,
        }
    }
}




