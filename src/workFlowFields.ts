/**
 * This file is still in development phase once that is finished
 * it will be removed 
 */
// const getNumOfTimes30CIBIL = (paymentHistory1, paymentHistory2) => {
//     let counter = 0;
//     if (!_.isEmpty(paymentHistory1)) {
//         let ph1Len = paymentHistory1.length;
//         for (let i = 0; i < ph1Len; i += 3) {
//             let dpdStr = paymentHistory1.substring(paymentHistory1, i, i + 3);
//             let assetClass = "";
//             let dpd = 0;
//             dpd = Number(dpdStr);
//             if (dpd == NaN) {
//                 assetClass = dpdStr;
//             }
//             let assetClassArr = ["SUB", "DBT", "LSS"];
//             if (!_.isEmpty(assetClass)) {
//                 if (assetClassArr.includes(assetClass)) {
//                     counter++;
//                 }
//             } else {
//                 if (dpd >= 30) {
//                     counter++;
//                 }
//             }
//         }
//     }
//     if (!_.isEmpty(paymentHistory2)) {
//         let ph1Len = paymentHistory2.length;
//         for (let i = 0; i < ph1Len; i += 3) {
//             let dpdStr = paymentHistory2.substring(paymentHistory1, i, i + 3);
//             let assetClass = "";
//             let dpd = 0;
//             dpd = Number(dpdStr);
//             if (dpd == NaN) {
//                 assetClass = dpdStr;
//             }
//             let assetClassArr = ["SUB", "DBT", "LSS"];
//             if (!_.isEmpty(assetClass)) {
//                 if (assetClassArr.includes(assetClass)) {
//                     counter++;
//                 }
//             } else {
//                 if (dpd >= 30) {
//                     counter++;
//                 }
//             }
//         }
//     }
//     return counter;
// };
// const pmt = (r, nper, pv, fv, type) => {
//     let pmt = -r * (pv * Math.pow(1 + r, nper) + fv) / ((1 + r * type) * (Math.pow(1 + r, nper) - 1));
//     return pmt;
// };
// const calculateAvailableIncomeFOIR = (percentFOIR, totalIncomeConsidered, currentEmi) => {
//     let result = Math.round((((percentFOIR / 100) * totalIncomeConsidered) - currentEmi));
//     return (result > 0 ? result : 0);
// };

// const calculateAvailableIncomeINSR = (percentINSR, netIncome, currentEmi) => {
//     let result = Math.round((((percentINSR / 100) * netIncome) - currentEmi));
//     return (result > 0 ? result : 0);
// };

// const calculateIncomeAvailableTowardsLoanRepayment = (availableIncomeFOIR, availableIncomeINSR, affordableEMIByCustomer) => {

//     let result = affordableEMIByCustomer;

//     if (availableIncomeFOIR < availableIncomeINSR) {
//         result = availableIncomeFOIR;
//     } else {
//         result = availableIncomeINSR;
//     }
//     result = affordableEMIByCustomer;
//     return Math.round(result);

// };

// const calculateEMIPerLacs = (rateOfInterest, loanTenure) => {
//     let result = Math.round(pmt(((rateOfInterest / 100) / 12), loanTenure, (-100000), 0, 0));
//     return (result > 0 ? result : 0);
// };
// const calculateEligibleLoanAmount = (incomeAvailableTowardsLoanRepay, emiPerLakhs) => {
//     let result = (incomeAvailableTowardsLoanRepay / emiPerLakhs);
//     return (result > 0 ? result : 0);

// };

// const calculateActualEmi = (eligibleLoanAmount, emiPerLakh) => {
//     let result = Math.round((eligibleLoanAmount * emiPerLakh));
//     return (result > 0 ? result : 0);
// };
// const calculateActualFOIR = (calculatedLoanEmi, existingLoanEmi, totalIncomeConsidered, percentFOIRSlab) => {
//     let actualFOIR = ((calculatedLoanEmi + existingLoanEmi) / totalIncomeConsidered) * 100.0;
//     return Math.round(((actualFOIR < percentFOIRSlab && actualFOIR > 0) ? actualFOIR : percentFOIRSlab));
// };

// const calculateActualINSR = (calculatedLoanEmi, existingLoanEmi, netIncome, percentINSRSlab) => {
//     let actualINSR = ((calculatedLoanEmi + existingLoanEmi) / netIncome) * 100.0;
//     return Math.round(((actualINSR < percentINSRSlab && actualINSR > 0) ? actualINSR : percentINSRSlab));
// };

// const calculateActualNOR = (calculatedLoanEmi, existingLoanEmi, netIncome) => {
//     let actualNOR = ((calculatedLoanEmi + existingLoanEmi) / netIncome) * 100.0;
//     return Math.round(actualNOR) > 0 ? Math.round(actualNOR) : 0;
// };

// const calculateLTV = (loanEligibleAmount, marketValue, percentLTVSlab) => {
//     let ltv = (loanEligibleAmount / marketValue) * 100.0;
//     return Math.round(((ltv < percentLTVSlab && ltv > 0) ? ltv : percentLTVSlab));
// };

// const calculateLCR = (loanEligibleAmount, marketVal, percentLCRSlab) => {
//     let lcr = (loanEligibleAmount / marketVal) * 100.0;
//     return Math.round((lcr < percentLCRSlab && lcr > 0) ? lcr : percentLCRSlab);
// };
// const calculateLoanTenure = (maxAge, applicantAge, applicantLoanTenure) => {
//     let remRetirementAge = maxAge - applicantAge;
//     let maxLoanTenure = 0;

//     if (remRetirementAge < applicantAge && remRetirementAge > 0) {
//         //multiply by 12 remRetirementAge id in years need to convert in to months
//         maxLoanTenure = remRetirementAge * 12;
//     } else if (applicantAge < remRetirementAge) {
//         maxLoanTenure = 0;
//     } else {
//         maxLoanTenure = applicantAge;
//     }

//     if (applicantLoanTenure < maxLoanTenure && applicantLoanTenure > 0)
//         maxLoanTenure = applicantLoanTenure;

//     return maxLoanTenure;
// };
// const getLiabilitiesFromLoanDetails = (loanDetails) => {
//     let emiSum = 0;
//     if (loanDetails) {

//         for (let i = 0; i < loanDetails.length; i++) {

//             let loanDetail = loanDetails[i];

//             let obligate = loanDetail.sOblgt;

//             if (loanDetail != null && obligate.toUpperCase() === "YES") {
//                 emiSum += loanDetail.dEmiAmt || 0;
//             }
//         }
//     }
//     return emiSum;
// };

// const isCoApplcntEarning = (coApplicantObject) => {
//     let coAppEarning = false;
//     if (coApplicantObject && coApplicantObject.bEarning) {
//         let bEarning = coApplicantObject && coApplicantObject.bEarning;
//         coAppEarning = bEarning.toUpperCase() === "YES" ? true : false;
//     }
//     return coAppEarning;
// };


// const WORKFLOW_FIELDS_salariedGrossIncome = () => {
//     let salariedGrossIncome = 0;
//     let employmentType = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aEmpl[0].sEmplType", "");
//     let modeOfPayment = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aEmpl[0].sModePayment", "");
//     if (employmentType.toUpperCase() === "SALARIED") {
//         salariedGrossIncome = _.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dGrssIncm", 0);
//     } else {
//         let sepSenpArray = _.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.aSenpPflIncm", []);
//         let netProfit = 0;
//         //Consider 2 years income in case of Regular ITR filing.
//         let consideredYearsCount = 2;
//         //Consider 1 year's income in case of Assessed Income.
//         if (modeOfPayment.toUpperCase() === "ASSESSED INCOME") {
//             consideredYearsCount = 1;
//         }
//         for (let i = 0; i < sepSenpArray.length; i++) {
//             let sepSenpArr = sepSenpArray[i];

//             netProfit += Number(sepSenpArr && sepSenpArr.dNtPrfit);

//             //Break if count reached consideredYearsCount.
//             if (i == consideredYearsCount)
//                 break;
//         }
//         if (modeOfPayment.toUpperCase() === "ASSESSED INCOME") {
//             salariedGrossIncome = netProfit;
//         } else {
//             salariedGrossIncome = ((netProfit) / consideredYearsCount) / 12;
//         }

//         let requestObject = loanReqObj && loanReqObj.REQUEST && loanReqObj.REQUEST.oReq;
//         if (requestObject && requestObject.aCoApplicant && requestObject.aCoApplicant.length && requestObject.aCoApplicant.length > 0) {
//             let coApplicants = requestObject.aCoApplicant;

//             for (let i = 0; i < coApplicants.length; i++) {

//                 let coApplicantObject = coApplicants[i];

//                 let coAppEarning = isCoApplcntEarning(coApplicantObject);

//                 if (coAppEarning) {
//                     let coApplicantEmplDetails = coApplicantObject.aEmpl[0];

//                     let coApplicantIncmDetails = coApplicantObject.oIncomeDetails;

//                     let coApplicantEmploymentType = coApplicantEmplDetails.sEmplType;

//                     let coApplicantModeOfPayment = coApplicantEmplDetails.sModePayment;

//                     if (coApplicantEmploymentType.toUpperCase() === "SALARIED") {
//                         let coApplicantGrossSal = _.get(coApplicantIncmDetails, "oSalriedDtl.dGrssIncm", 0);
//                         salariedGrossIncome += coApplicantGrossSal;

//                     } else {
//                         let coAppSepArray = coApplicantIncmDetails.aSenpPflIncm;

//                         let netProfit = 0;
//                         let consideredYearsCount = 2;
//                         if (coApplicantModeOfPayment.toUpperCase() === "ASSESSED INCOME") {
//                             consideredYearsCount = 1;
//                         }

//                         for (let j = 0; j < coAppSepArray.length; j++) {
//                             netProfit += coAppSepArray[j].dNtPrfit
//                             if (j == consideredYearsCount)
//                                 break;
//                         }

//                         let coApplicantNetSepIncm = 0;
//                         if (coApplicantModeOfPayment.toUpperCase() === "ASSESSED INCOME") {
//                             coApplicantNetSepIncm = netProfit;
//                         } else {
//                             coApplicantNetSepIncm = ((netProfit) / consideredYearsCount) / 12;
//                         }

//                         salariedGrossIncome += coApplicantNetSepIncm;
//                     }
//                 }
//             }
//         }
//     }
//     return salariedGrossIncome;
// };

// const WORKFLOW_FIELDS_incentive = () => {
//     let incentive = 0;
//     let employmentType = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aEmpl[0].sEmplType", "");
//     if (employmentType.toUpperCase() === "SALARIED") {
//         incentive = _.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dInctv", 0);
//     }
//     let requestObject = loanReqObj && loanReqObj.REQUEST && loanReqObj.REQUEST.oReq;
//     if (requestObject && requestObject.aCoApplicant && requestObject.aCoApplicant.length > 0) {
//         let coApplicants = requestObject.aCoApplicant;

//         for (let i = 0; i < coApplicants.length; i++) {
//             let coApplicantObject = coApplicants[i];
//             let coAppEarning = isCoApplcntEarning(coApplicantObject);
//             let coApplicantEmploymentType = _.get(coApplicantObject,"aEmpl[0].sEmplType", "");
//             if (coAppEarning) {
//                 if (coApplicantEmploymentType.toUpperCase() === "SALARIED") {

//                     let coApplicantObject = coApplicants[i];
//                     let coApplicantIncmDetails = coApplicantObject.oIncomeDetails;
//                     let coAppIncentive = _.get(coApplicantIncmDetails, "oSalriedDtl.dInctv", 0);
//                     incentive += coAppIncentive;

//                 }
//             }
//         }
//     }
//     return incentive;
// };

// const WORKFLOW_FIELDS_deduction = () => {
//     let deduction = 0;
//     let employmentType = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aEmpl[0].sEmplType", "");

//     if (employmentType.toUpperCase() === "SALARIED") {
//         deduction = _.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dPF", 0);
//         deduction += Number(_.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dPrfTax", 0));
//         deduction += Number(_.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dLIC", 0));
//         deduction += Number(_.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dESI", 0));
//         deduction += Number(_.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dOthrDdctn", 0));
//     }
//     let requestObject = loanReqObj && loanReqObj.REQUEST && loanReqObj.REQUEST.oReq;
//     if (requestObject && requestObject.aCoApplicant && requestObject.aCoApplicant.length > 0) {
//         let coApplicants = requestObject.aCoApplicant;
//         for (let i = 0; i < coApplicants.length; i++) {
//             let coApplicantObject = coApplicants[i];
//             let coAppEarning = isCoApplcntEarning(coApplicantObject);
//             let coApplicantEmploymentType = _.get( coApplicantObject, "aEmpl[0].sEmplType", "");
//             if (coAppEarning) {
//                 if (coApplicantEmploymentType.toUpperCase() === "SALARIED") {
//                     let coApplicantObject = coApplicants[i];
//                     let coApplicantIncmDetails = coApplicantObject.oIncomeDetails;
//                     let coAppdeduction = Number(_.get(coApplicantIncmDetails, "oSalriedDtl.dPF", 0));
//                     coAppdeduction += Number(_.get(coApplicantIncmDetails, "oSalriedDtl.dPrfTax", 0));
//                     coAppdeduction += Number(_.get(coApplicantIncmDetails, "oSalriedDtl.dLIC", 0));
//                     coAppdeduction += Number(_.get(coApplicantIncmDetails, "oSalriedDtl.dESI", 0));
//                     coAppdeduction += Number(_.get(coApplicantIncmDetails, "oSalriedDtl.dOthrDdctn", 0));
//                     deduction += coAppdeduction;
//                 }
//             }
//         }
//     }
//     return deduction;
// };

// const WORKFLOW_FIELDS_existingEmi = () => {

//     let loanDetails = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aLoanDetails", []);
//     let existingEmi = getLiabilitiesFromLoanDetails(loanDetails);
//     let requestObject = loanReqObj && loanReqObj.REQUEST && loanReqObj.REQUEST.oReq;
//     if (requestObject && requestObject.aCoApplicant && requestObject.aCoApplicant.length > 0) {
//         let coApplicants = requestObject.aCoApplicant;

//         for (let i = 0; i < coApplicants.length; i++) {

//             let coApplicantObject = coApplicants[i];
//             let coAppEarning = isCoApplcntEarning(coApplicantObject);
//             if (coAppEarning) {
//                 let coAppLoanDetails = coApplicantObject.aLoanDetails;
//                 existingEmi += getLiabilitiesFromLoanDetails(coAppLoanDetails);

//             }

//         }
//     }
//     return existingEmi;


// };

// const WORKFLOW_FIELDS_houseHoldExpense = () => {
//     let houseHoldExpense = Number(_.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dObligtn", 0));
//     return houseHoldExpense;
// };

// const WORKFLOW_FIELDS_otherIncome = () => {
//     let otherIncome = 0;
//     let employmentType = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aEmpl[0].sEmplType", "");
//     if (employmentType.toUpperCase() === "SALARIED") {
//         otherIncome = Number(_.get(loanReqObj, "REQUEST.oReq.oApplicant.oIncomeDetails.oSalriedDtl.dOthr"));
//     }
//     let requestObject = loanReqObj && loanReqObj.REQUEST && loanReqObj.REQUEST.oReq;
//     if (requestObject && requestObject.aCoApplicant && requestObject.aCoApplicant.length > 0) {
//         let coApplicants = requestObject.aCoApplicant;
//         for (let i = 0; i < coApplicants.length; i++) {
//             let coApplicantObject = coApplicants[i];
//             let coAppEarning = isCoApplcntEarning(coApplicantObject);
//             if (coAppEarning) {
//                 let coApplicantIncmDetails = coApplicantObject.oIncomeDetails;
//                 let coApplicantEmploymentType = _.get(coApplicantObject, "aEmpl[0].coApplicantObject.aEmpl[0].sEmplType","");
//                 if (coApplicantEmploymentType.toUpperCase() === "SALARIED") {
//                     let coAppOtherIncome = _.get(coApplicantIncmDetails, "oSalriedDtl.dOthr", 0);
//                     otherIncome += coAppOtherIncome;
//                 }
//             }
//         }
//     }
//     return otherIncome;
// };

// const WORKFLOW_FIELDS_totalConsiderIncome = () => {
//     let considerVariableIncome = 0;
//     let totalConsiderIncome = WORKFLOW_FIELDS_salariedGrossIncome() + considerVariableIncome;
//     return totalConsiderIncome;

// };
// const WORKFLOW_FIELDS_netConsiderIncome = () => {
//     let netConsiderIncome;
//     netConsiderIncome = WORKFLOW_FIELDS_totalConsiderIncome() - WORKFLOW_FIELDS_deduction();
//     return netConsiderIncome;

// };

// const WORKFLOW_FIELDS_netEstimatedIncome = () => {
//     let netEstimatedIncome;
//     netEstimatedIncome = WORKFLOW_FIELDS_netConsiderIncome() - WORKFLOW_FIELDS_houseHoldExpense();
//     return netEstimatedIncome;
// };

// const WORKFLOW_FIELDS_finalEstimatedIncome = () => {
//     let finalEstimatedIncome;
//     finalEstimatedIncome = WORKFLOW_FIELDS_netEstimatedIncome() - WORKFLOW_FIELDS_existingEmi();
//     return finalEstimatedIncome;
// };
// const WORKFLOW_FIELDS_mobileMatchCivil = () => {
//     let isMobileMatched = null;
//     const requestList = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aPhone", []);
//     const cibilList = _.get(loanReqObj, "CIBIL_RESPONSE.phoneList", []);

//     requestList.forEach((curList) => {
//         if (curList.sPhoneType.toUpperCase() == "PERSONAL_MOBILE") {
//             const requestMobile = curList && curList.sPhoneNumber;
//             if (requestMobile) {
//                 const cibilFilter = _.filter(cibilList, (curCibil) => {
//                     if ((requestMobile.includes(curCibil.telephoneNumber) || curCibil.telephoneNumber.includes(requestMobile)) && _.isEmpty(curCibil.enrichEnquiryForPhone)) {
//                         return true;
//                     }
//                 });

//                 if (cibilFilter.length > 0) {
//                     isMobileMatched = true;
//                 }

//             }

//         }

//     });
//     return isMobileMatched;



// };

// const WORKFLOW_FIELDS_maxMob = () => {
//     let maxMob = 0;
//     let acctAge = 0;
//     const cibilResAccountListArr = _.get(loanReqObj, "CIBIL_RESPONSE.accountList", []);
//     cibilResAccountListArr.length > 0 && cibilResAccountListArr.forEach((curAccount) => {
//         let highCredit = 0;
//         if (!_.isEmpty(curAccount.highCreditOrSanctionedAmount)) {
//             highCredit = curAccount.highCreditOrSanctionedAmount;
//         }
//         if (!_.isEmpty(curAccount)) {
//             acctAge = _.dateDiffMonth(_.stringToDate(_.get(loanReqObj, "CIBIL_RESPONSE.header.dateProceed"), "DDMMYYYY"), _.stringToDate(curAccount.dateOpenedOrDisbursed, "DDMMYYYY"));
//             if (acctAge > maxMob && highCredit > 100000) {
//                 maxMob = acctAge;
//             }

//         }
//     });
//     return maxMob;
// };

// const WORKFLOW_FIELDS_aadharMatchCibil = () => {
//     let aadharMatch = null;
//     const sKycNumberArray = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aKycDocs", []);
//     const cibilIdListarray = _.get(loanReqObj, "CIBIL_RESPONSE.idList", []);
//     let gngAadhaar = null;
//     if (sKycNumberArray.length > 0 && cibilIdListarray.length > 0) {
//         sKycNumberArray.forEach((curNum) => {
//             if (curNum.sKycName && "AADHAAR" == curNum.sKycName.toUpperCase()) {
//                 gngAadhaar = curNum.sKycNumber;
//             }
//         });
//         cibilIdListarray.forEach((curCibil) => {
//             if ( curCibil.idType && "06" == curCibil.idType.toUpperCase() && gngAadhaar !=null) {
//                 if (curCibil.idValue && curCibil.idValue.toUpperCase() == gngAadhaar.toUpperCase()) {
//                     aadharMatch = true;

//                 } else {
//                     aadharMatch = false;
//                 }
//             }
//         });
//     }
//     return aadharMatch;
// };

// const WORKFLOW_FIELDS_aadharMatchCibilEnrich = () => {
//     const sKycNumberArray = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aKycDocs", []);
//     const cibilIdListarray = _.get(loanReqObj, "CIBIL_RESPONSE.idList", []);
//     let gngAadhaar = null;
//     let aadharMatchEnrich = null;
//     if (sKycNumberArray.length > 0 && cibilIdListarray.length > 0) {
//         sKycNumberArray.forEach((curNum) => {
//             if ( curNum.sKycName && "AADHAAR" == curNum.sKycName.toUpperCase()) {
//                 gngAadhaar = curNum.sKycNumber;
//             }
//         });
//         cibilIdListarray.forEach((curCibil) => {
//             if (curCibil.enrichedThroughtEnquiry && "Y" == curCibil.enrichedThroughtEnquiry.toUpperCase()) {
//                 if (curCibil.idValue.toUpperCase() == gngAadhaar.toUpperCase()) {
//                     aadharMatchEnrich = true;
//                 } else {
//                     aadharMatchEnrich = false;
//                 }
//             }
//         });
//     }
//     return aadharMatchEnrich;
// };

// const WORKFLOW_FIELDS_panMatch = () => {
//     const sKycNumberArray = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aKycDocs", []);
//     const cibilIdListarray = _.get(loanReqObj, "CIBIL_RESPONSE.idList", []);
//     let gngPan = null;
//     let panMatch = null;
//     if (sKycNumberArray.length > 0 && cibilIdListarray.length > 0) {
//         sKycNumberArray.forEach((curNum) => {
//             if ("PAN" == curNum.sKycName.toUpperCase()) {
//                 gngPan = curNum.sKycNumber;
//             }
//         });
//         cibilIdListarray.forEach((curCibil) => {
//             if ("01" == curCibil.idType.toUpperCase() && !_.isEmpty(gngPan)) {
//                 if (curCibil.idValue.toUpperCase() == gngPan.toUpperCase()) {
//                     panMatch = true;
//                 } else {
//                     panMatch = false;
//                 }
//             }
//         });
//     }
//     return panMatch;
// };

// const WORKFLOW_FIELDS_panMatchEnrich = () =>{
//     const sKycNumberArray = _.get(loanReqObj, "REQUEST.oReq.oApplicant.aKycDocs", []);
//     const cibilIdListarray = _.get(loanReqObj, "CIBIL_RESPONSE.idList", []);
//     let gngPan = null;
//     let panMatchEnrich = null;
//     if (sKycNumberArray.length > 0 && cibilIdListarray.length > 0) {
//         sKycNumberArray.forEach((curNum) => {
//             if ("PAN" == curNum.sKycName.toUpperCase()) {
//                 gngPan = curNum.sKycNumber;
//             }
//         });
//         cibilIdListarray.forEach((curCibil) => {
//             if ("01" == curCibil.idType.toUpperCase() && !_.isEmpty(gngPan) && 
//             curCibil.enrichedThroughtEnquiry && curCibil.enrichedThroughtEnquiry.toUpperCase() == "Y") {

//                 if (curCibil.idValue.toUpperCase() == gngPan.toUpperCase()) {
//                     panMatchEnrich = true;
//                 } else {
//                     panMatchEnrich = false;
//                 }
//             }
//         });
//     }
//     return panMatchEnrich;
// }
// if (!loanReqObj.WORKFLOW_FIELDS) {
//     loanReqObj.WORKFLOW_FIELDS = {};
// }


// loanReqObj.WORKFLOW_FIELDS.salariedGrossIncome = WORKFLOW_FIELDS_salariedGrossIncome();
// loanReqObj.WORKFLOW_FIELDS.incentive = WORKFLOW_FIELDS_incentive();
// loanReqObj.WORKFLOW_FIELDS.deduction = WORKFLOW_FIELDS_deduction();
// loanReqObj.WORKFLOW_FIELDS.existingEmi = WORKFLOW_FIELDS_existingEmi();
// loanReqObj.WORKFLOW_FIELDS.houseHoldExpense = WORKFLOW_FIELDS_houseHoldExpense();
// loanReqObj.WORKFLOW_FIELDS.otherIncome = WORKFLOW_FIELDS_otherIncome();
// loanReqObj.WORKFLOW_FIELDS.NET_ESTIMATED_INCOME = WORKFLOW_FIELDS_netEstimatedIncome();
// loanReqObj.WORKFLOW_FIELDS.finalEstimatedIncome = WORKFLOW_FIELDS_finalEstimatedIncome();
// loanReqObj.WORKFLOW_FIELDS.product = _.get(loanReqObj, "REQUEST.oReq.oApplication.oProperty.sPropertyName", "");
// loanReqObj.WORKFLOW_FIELDS.marketValue = _.get(loanReqObj, "REQUEST.oReq.oApplicant.oProperty.sMarketValue", "");
// loanReqObj.WORKFLOW_FIELDS.applicantAge = _.get(loanReqObj, "REQUEST.oReq.oApplicant.iAge", "");
// loanReqObj.WORKFLOW_FIELDS.applicantLoanTenure = _.get(loanReqObj, "REQUEST.oReq.oApplication.iLoanTenor", "");
// loanReqObj.WORKFLOW_FIELDS.totalConsiderIncome = WORKFLOW_FIELDS_totalConsiderIncome();
// loanReqObj.WORKFLOW_FIELDS.netConsiderIncome = WORKFLOW_FIELDS_netConsiderIncome();
// loanReqObj.WORKFLOW_FIELDS.affordableEmiByCustomer = _.get(loanReqObj, "REQUEST.oReq.oApplication.dEmi", "");
// loanReqObj.WORKFLOW_FIELDS.agreementValue = _.get(loanReqObj, "REQUEST.oReq.oApplication.oProperty.sPropertyValue", "");
// loanReqObj.WORKFLOW_FIELDS.MOBILE_MATCH_CIBIL = WORKFLOW_FIELDS_mobileMatchCivil();
// loanReqObj.WORKFLOW_FIELDS.MAX_MOB = WORKFLOW_FIELDS_maxMob();
// loanReqObj.WORKFLOW_FIELDS.MAX_ACCT_AGE = WORKFLOW_FIELDS_maxMob();
// loanReqObj.WORKFLOW_FIELDS.AADHAAR_MATCH_CIBIL = WORKFLOW_FIELDS_aadharMatchCibil();
// loanReqObj.WORKFLOW_FIELDS.AADHAAR_MATCH_CIBIL_ENRICH = WORKFLOW_FIELDS_aadharMatchCibilEnrich();
// loanReqObj.WORKFLOW_FIELDS.PAN_MATCH_CIBIL = WORKFLOW_FIELDS_panMatch();
// loanReqObj.WORKFLOW_FIELDS.PAN_MATCH_CIBIL_ENRICH = WORKFLOW_FIELDS_panMatchEnrich();
