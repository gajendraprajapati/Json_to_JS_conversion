import * as assert from "assert";

const NOT_DISCLOSED = "NOT DISCLOSED";
const PERSONAL_LOAN = "PERSONAL LOAN";
const MAY_1_2016 = "May 1, 2016 12:00:00 AM";
const APRIL_1_2011 = "Apr 1, 2011 12:00:00 AM";

const dbdBreJson = [
    {
        template: "FOR_EACH",
        expressions: [
            {
                template: "STATEMENT",
                operator: "=",
                operands: [
                    {
                        operand: "outputObjIterator.modifiedActiveTradelines",
                        operandType: "field",
                        operandDataType: "array",
                    },
                    {
                        template: "ARRAY_OPERATION",
                        operator: "filter",
                        operands: [
                            {
                                template: "ARRAY_THREE_DIGIT_NUMERIC_STRING_TO_NUMBERS_OPERATION",
                                operator: "",
                                operands: [
                                    {
                                        operand: "loanReqObj.BUREAU_RESPONSE.activeTradelines",
                                        operandType: "field",
                                        operandDataType: "array",
                                    },
                                    {
                                        operand: "paymentHistory",
                                        operandType: "field",
                                        operandDataType: "string",
                                    },
                                    {
                                        operand: 12,
                                        operandType: "value",
                                        operandDataType: "string",
                                    },
                                ],
                            },
                            {
                                template: "STATEMENT",
                                operator: "&&",
                                operands: [
                                    {
                                        template: "STATEMENT",
                                        operator: ">=",
                                        operands: [
                                            {
                                                template: "ARRAY_OPERATION",
                                                operator: "max",
                                                operands: [
                                                    {
                                                        operand: "obj.paymentHistory",
                                                        operandType: "field",
                                                        operandDataType: "array",
                                                    },
                                                ],
                                            },
                                            {
                                                operandType: "value",
                                                operand: 30,
                                                operandDataType: "number",
                                            },
                                        ],
                                    },
                                    {
                                        template: "STATEMENT",
                                        operator: "!=",
                                        operands: [
                                            {
                                                operand: "obj.creditInstitution",
                                                operandType: "field",
                                                operandDataType: "string",
                                            },
                                            {
                                                operandType: "value",
                                                operand: "SCB",
                                                operandDataType: "string",
                                            },
                                        ],
                                    },
                                    {
                                        template: "STATEMENT",
                                        operator: "<=",
                                        operands: [
                                            {
                                                template: "ARRAY_OPERATION",
                                                operator: "max",
                                                operands: [
                                                    {
                                                        operand: "obj.paymentHistory",
                                                        operandType: "field",
                                                        operandDataType: "array",
                                                    },
                                                ],
                                            },
                                            {
                                                operandType: "value",
                                                operand: 60,
                                                operandDataType: "number",
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                template: "IF_COND",
                outputAlias: {
                    trueCase: {
                        template: "STATEMENT",
                        operator: "=",
                        operands: [
                            {
                                operand: "loanResObj.abc",
                                operandType: "field",
                                operandDataType: "number",
                            },
                            {
                                template: "ARRAY_OPERATION",
                                operator: "sumBy",
                                operands: [
                                    {
                                        operand: "outputObjIterator.modifiedActiveTradelines",
                                        operandType: "field",
                                        operandDataType: "array",
                                    },
                                    {
                                        operand: "obj.currentBalance",
                                        operandType: "field",
                                        operandDataType: "number",
                                    },
                                ],
                            },
                        ],
                    },
                    falseCase: {
                        template: "STATEMENT",
                        operator: "=",
                        operands: [
                            {
                                operand: "loanResObj.abc",
                                operandType: "field",
                                operandDataType: "number",
                            },
                            {
                                operand: "0",
                                operandType: "value",
                                operandDataType: "number",
                            },
                        ],
                    },
                },
                expression: {
                    template: "STATEMENT",
                    operator: ">",
                    operands: [
                        {
                            operand: "outputObjIterator.modifiedActiveTradelines.length",
                            operandType: "field",
                            operandDataType: "number",
                        },
                        {
                            operandType: "value",
                            operand: 0,
                            operandDataType: "number",
                        },
                    ],
                },
            },
        ],
    },
];

const application = {
    HEADER: {
        "APPLICATION-ID": "123",
        "CUSTOMER-ID": "123",
        "INSTITUTION-ID": "4046",
        "REQUEST-TIME": "Jun 13, 2019 5:00:46 PM",
        "REQUEST-TYPE": "REQUEST",
        "APP-TYPE": "SCB",
    },
    REQUEST: {
        loanType: "PL",
    },
    BUREAU_RESPONSE: {
        issuedDate: "31072017",
        issuedDateInMonth: "Sep 1, 2017 12:00:00 AM",
        subjectReturnCode: 1,
        refNumber: "167393439",
        bureauReported: "CIBIL (TU)",
        secSummary: {
            openAccount: 1,
            balance: 203525,
            payments: 0,
            overdueAmount: 0,
            days30Overdue: 0,
            days60Overdue: 0,
            days90Overdue: 0,
            percentageUsed: 0,
        },
        unSecSummary: {
            openAccount: 0,
            balance: 0,
            payments: 0,
            overdueAmount: 0,
            days30Overdue: 0,
            days60Overdue: 0,
            days90Overdue: 0,
            percentageUsed: 0,
        },
        revcSummary: {
            openAccount: 0,
            balance: 0,
            payments: 0,
            overdueAmount: 0,
            days30Overdue: 0,
            days60Overdue: 0,
            days90Overdue: 0,
            percentageUsed: 0,
        },
        totalNumCreditLines: "2",
        totalNumEnquiries: "10",
        disparateCredentials: {
            emailList: [],
        },
        bureauFeeds: {
            cibilScore: [
                {
                    status: "SUCCESS",
                    score: "836",
                    scoringFactor: [],
                },
            ],
        },
        activeTradelines: [
            {
                accountType: "AUTO LOAN",
                accountOpenDate: "May 29, 2016 12:00:00 AM",
                accountOpenDateInMonth: MAY_1_2016,
                reportedBureaus: "TU",
                creditInstitution: NOT_DISCLOSED,
                sanctionedAmount: "13625",
                reportedDate: "31102017",
                reportedDateInMonth: "31092017",
                monthlyInstallmentAmount: "5213.49",
                customMontlyInstallmentAmount: "5213.49",
                lastPaymentDate: "Jul 3, 2017 12:00:00 AM",
                currentBalance: 203525,
                overdueAmount: "0",
                ownership: "INDIVIDUAL",
                paymentHistoryStartDate: "01072017",
                paymentHistoryEndDate: "01072019",
                paymentHistory: "060031060060000000000000000000000000000",
                customPaymentHistory: "030000000000000000000000000000000000000",
                monthlyPaymentHistory: "030000000000000000000000000000000000000",
                secured: "SECURED",
                active: true,
                bureauName: "CIBIL",
                imputedIncomeHl: 5656.25,
                imputedEMIPL: 5656.25,
                imputedEMICC: 20853.96,
                imputedIncomeFrAutoLoan: 20853.96,
                imputedIncomeFrBIL: 20853.96,
                imputedIncomeFrConsumerLoan: 20853.96,
                imputedIncomeFrPL: 20853.96,
                imputedIncomeEMICC: 20352.5,
                maxOfHighSantionedOrCurrentBalance: 203625.0,
                maxOfOverdueOrCurrentBalance: 203525.0,
                maxOfHighSantionedOverdueOrCurrentBalance: 203625.0,
                monthsPeriodReportedDateVsdateProcessd: 2.0,
                vintage: 16.0,
                ownershipCode4CurrentBalance: "203525.0",
                ownershipCode4HighOrSanAmt: "203625",
                customEmiForEstComm: "5213.49",
                sumOfCurrBalOverDueBal: "203525.0",
            },
            {
                accountType: PERSONAL_LOAN,
                accountOpenDate: "May 29, 2016 12:00:00 AM",
                accountOpenDateInMonth: MAY_1_2016,
                reportedBureaus: "TU",
                creditInstitution: NOT_DISCLOSED,
                sanctionedAmount: "203625",
                reportedDate: "31102017",
                reportedDateInMonth: "31092017",
                monthlyInstallmentAmount: "5213.49",
                customMontlyInstallmentAmount: "5213.49",
                lastPaymentDate: "Jul 3, 2017 12:00:00 AM",
                currentBalance: 203525,
                overdueAmount: "0",
                ownership: "INDIVIDUAL",
                paymentHistoryStartDate: "01072017",
                paymentHistoryEndDate: "01072019",
                paymentHistory: "060031060060000000000000000000000000000",
                customPaymentHistory: "030000000000000000000000000000000000000",
                monthlyPaymentHistory: "030000000000000000000000000000000000000",
                secured: "SECURED",
                active: true,
                bureauName: "CIBIL",
                imputedIncomeHl: 5656.25,
                imputedEMIPL: 5656.25,
                imputedEMICC: 20853.96,
                imputedIncomeFrAutoLoan: 20853.96,
                imputedIncomeFrBIL: 20853.96,
                imputedIncomeFrConsumerLoan: 20853.96,
                imputedIncomeFrPL: 20853.96,
                imputedIncomeEMICC: 20352.5,
                maxOfHighSantionedOrCurrentBalance: 203625.0,
                maxOfOverdueOrCurrentBalance: 203525.0,
                maxOfHighSantionedOverdueOrCurrentBalance: 203625.0,
                monthsPeriodReportedDateVsdateProcessd: 2.0,
                vintage: 16.0,
                ownershipCode4CurrentBalance: "203525.0",
                ownershipCode4HighOrSanAmt: "203625",
                customEmiForEstComm: "5213.49",
                sumOfCurrBalOverDueBal: "203525.0",
            },
        ],
        pastEnquiry: [
            {
                enquiryDate: "Mar 25, 2017 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "100000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-25032017-100000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-25032017-NOT DISCLOSED",
                enquiryDateInMonth: "Mar 1, 2017 12:00:00 AM",
            },
            {
                enquiryDate: "Mar 22, 2017 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "100000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-22032017-100000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-22032017-NOT DISCLOSED",
                enquiryDateInMonth: "Mar 1, 2017 12:00:00 AM",
            },
            {
                enquiryDate: "May 25, 2016 12:00:00 AM",
                enquiryReason: "AUTO LOAN",
                amount: "200000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "AUTO LOAN-25052016-200000",
                uniqueEnqOnRsnDateEnqBy: "AUTO LOAN-25052016-NOT DISCLOSED",
                enquiryDateInMonth: MAY_1_2016,
            },
            {
                enquiryDate: "May 24, 2016 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "151000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-24052016-151000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-24052016-NOT DISCLOSED",
                enquiryDateInMonth: MAY_1_2016,
            },
            {
                enquiryDate: "Apr 25, 2011 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "200000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-25042011-200000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-25042011-NOT DISCLOSED",
                enquiryDateInMonth: APRIL_1_2011,
            },
            {
                enquiryDate: "Apr 21, 2011 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "200000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-21042011-200000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-21042011-NOT DISCLOSED",
                enquiryDateInMonth: APRIL_1_2011,
            },
            {
                enquiryDate: "Apr 21, 2011 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "200000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-21042011-200000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-21042011-NOT DISCLOSED",
                enquiryDateInMonth: APRIL_1_2011,
            },
            {
                enquiryDate: "Apr 6, 2011 12:00:00 AM",
                enquiryReason: PERSONAL_LOAN,
                amount: "150000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "PERSONAL LOAN-06042011-150000",
                uniqueEnqOnRsnDateEnqBy: "PERSONAL LOAN-06042011-NOT DISCLOSED",
                enquiryDateInMonth: APRIL_1_2011,
            },
            {
                enquiryDate: "Oct 28, 2010 12:00:00 AM",
                enquiryReason: "HOUSING LOAN",
                amount: "1800000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "HOUSING LOAN-28102010-1800000",
                uniqueEnqOnRsnDateEnqBy: "HOUSING LOAN-28102010-NOT DISCLOSED",
                enquiryDateInMonth: "Oct 1, 2010 12:00:00 AM",
            },
            {
                enquiryDate: "Sep 22, 2010 12:00:00 AM",
                enquiryReason: "HOUSING LOAN",
                amount: "2100000",
                enquiryBy: NOT_DISCLOSED,
                bureuReported: "TU",
                uniqueEnquiry: "HOUSING LOAN-22092010-2100000",
                uniqueEnqOnRsnDateEnqBy: "HOUSING LOAN-22092010-NOT DISCLOSED",
                enquiryDateInMonth: "Sep 1, 2010 12:00:00 AM",
            },
        ],
        employementlist: [
            {
                occupationcode: "SALARIED",
            },
        ],
    },
    BATCH_ID: "123",
};

import { generateAndExecute } from "../src/generatePolicyProd";

describe("Checking credit rules generation ", function() {
    it.only("should return output generated string", function() {
        const output = generateAndExecute(dbdBreJson, null);
        // console.log(JSON.stringify(output, null, 2));
        console.log(output);
    });
});
