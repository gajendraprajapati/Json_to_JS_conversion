const lodash = require("lodash");
const SCORE_DATA = "SCORE-DATA";
const expression = "expression";
const value = "value";

export const simplifyStr = (str) => {
    if(!isNaN(str)){
        return Number(str);
    }
    if(!str) {
        return str;
    }
    return JSON.stringify(str).replace(/-|\.|:|\[|\]|,|\(|\)|\"|\\| |\//g, "").toLowerCase().split("null").join("");
};

export const modifyObject = (testd:any) => {
    // START: Not need for compare
    delete testd.coverageobj;
    delete testd.HEADER["RESPONSE-DATETIME"];
    delete testd["SCORING-REF-ID"];
    delete testd["executionTime"];
    // END

    // START: Convert FINAL_SCORE to int from string
    if (testd[SCORE_DATA] ) {
        testd[SCORE_DATA].FINAL_SCORE = Number(testd[SCORE_DATA].FINAL_SCORE);
        testd[SCORE_DATA].SCORE_VALUE = Number(testd[SCORE_DATA].SCORE_VALUE);

        for (const key in testd[SCORE_DATA].SCORE_DETAILS) {
            for (const k1 in testd[SCORE_DATA].SCORE_DETAILS[key]) {
                for (const k2 in testd[SCORE_DATA].SCORE_DETAILS[key][k1]) {
                    for (const k3 in testd[SCORE_DATA].SCORE_DETAILS[key][k1][k2]) {
                        if (k3 == expression || k3 == value) {
                            if (k3 == expression) {
                                testd[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3] = simplifyStr(testd[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3]);
                            } else if (k3 == value) {
                                for (const k in testd[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3]) {
                                    testd[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3][k] = simplifyStr(testd[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3][k]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    testd.ADDITIONAL_SCORECARDS && testd.ADDITIONAL_SCORECARDS.forEach((curScore) => {
        if (curScore[SCORE_DATA] && curScore[SCORE_DATA].FINAL_SCORE) {
            curScore[SCORE_DATA].FINAL_SCORE = Number(curScore[SCORE_DATA].FINAL_SCORE);
            curScore[SCORE_DATA].SCORE_VALUE = Number(curScore[SCORE_DATA].SCORE_VALUE);
            if (!curScore[SCORE_DATA].FINAL_BAND || curScore[SCORE_DATA].FINAL_BAND.length == 0) {
                delete curScore[SCORE_DATA].FINAL_BAND;
            }

            for (const key in curScore[SCORE_DATA].SCORE_DETAILS) {
                for (const k1 in curScore[SCORE_DATA].SCORE_DETAILS[key]) {
                    for (const k2 in curScore[SCORE_DATA].SCORE_DETAILS[key][k1]) {
                        for (const k3 in curScore[SCORE_DATA].SCORE_DETAILS[key][k1][k2]) {
                            if (k3 == expression || k3 == value) {
                                if (k3 == expression) {
                                    curScore[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3] = simplifyStr(curScore[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3]);
                                } else if (k3 == value) {
                                    for (const k in curScore[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3]) {
                                        curScore[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3][k] = simplifyStr(curScore[SCORE_DATA].SCORE_DETAILS[key][k1][k2][k3][k]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    });

    // END

    if (testd.SCORE_TREE) {
        if (testd.SCORE_TREE.Scores) {
            testd.SCORE_TREE.Scores = lodash.sortBy(testd.SCORE_TREE.Scores, ["name"]);

            for (let i = 0; i < testd.SCORE_TREE.Scores.length; i ++) {
                const plans = testd.SCORE_TREE.Scores[i].Plans;
                plans[0] = lodash.sortBy(plans[0], ["name"]);
            }

        }

        if (!testd.SCORE_TREE.FINAL_BAND || testd.SCORE_TREE.FINAL_BAND.length == 0) {
            delete testd.SCORE_TREE.FINAL_BAND;
        }

        for (const key in testd.SCORE_TREE.masterMap) {
            for (const k1 in testd.SCORE_TREE.masterMap[key]) {
                for (const k2 in testd.SCORE_TREE.masterMap[key][k1]) {
                    for (const k3 in testd.SCORE_TREE.masterMap[key][k1][k2]) {
                        if (k3 == expression || k3 == value) {
                            if (k3 == expression) {
                                testd.SCORE_TREE.masterMap[key][k1][k2][k3] = simplifyStr(testd.SCORE_TREE.masterMap[key][k1][k2][k3]);
                            } else if (k3 == value) {
                                for (const k in testd.SCORE_TREE.masterMap[key][k1][k2][k3]) {
                                    testd.SCORE_TREE.masterMap[key][k1][k2][k3][k] = simplifyStr(testd.SCORE_TREE.masterMap[key][k1][k2][k3][k]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (testd.ADDITIONAL_SCORECARDS) {
        testd.ADDITIONAL_SCORECARDS.forEach((curScore) => {
            if (curScore.SCORE_TREE) {
                if (curScore.SCORE_TREE.Scores) {
                    curScore.SCORE_TREE.Scores = lodash.sortBy(curScore.SCORE_TREE.Scores, ["name"]);

                    for (let i = 0; i < curScore.SCORE_TREE.Scores.length; i ++) {
                        const plans = curScore.SCORE_TREE.Scores[i].Plans;
                        plans[0] = lodash.sortBy(plans[0], ["name"]);
                    }

                }

                if (!curScore.SCORE_TREE.FINAL_BAND || curScore.SCORE_TREE.FINAL_BAND.length == 0) {
                    delete curScore.SCORE_TREE.FINAL_BAND;
                }

                for (const key in curScore.SCORE_TREE.masterMap) {
                    for (const k1 in curScore.SCORE_TREE.masterMap[key]) {
                        for (const k2 in curScore.SCORE_TREE.masterMap[key][k1]) {
                            for (const k3 in curScore.SCORE_TREE.masterMap[key][k1][k2]) {
                                if (k3 == expression || k3 == value) {
                                    if (k3 == expression) {
                                        curScore.SCORE_TREE.masterMap[key][k1][k2][k3] = simplifyStr(curScore.SCORE_TREE.masterMap[key][k1][k2][k3]);
                                    } else if (k3 == value) {
                                        for (const k in curScore.SCORE_TREE.masterMap[key][k1][k2][k3]) {
                                            curScore.SCORE_TREE.masterMap[key][k1][k2][k3][k] = simplifyStr(curScore.SCORE_TREE.masterMap[key][k1][k2][k3][k]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // START: This will remove empty `DECISION_RESPONSE` from comparism objects
    if (testd.DECISION_RESPONSE && Object.keys(testd.DECISION_RESPONSE).length == 0) {
        delete testd.DECISION_RESPONSE;
    }
    // END

    if (testd.ELIGIBILITY_RESPONSE) {
        if(testd.ELIGIBILITY_RESPONSE.GRID_EXP) {
            testd.ELIGIBILITY_RESPONSE.GRID_EXP = simplifyStr(testd.ELIGIBILITY_RESPONSE.GRID_EXP);
        }

        for(const k in testd.ELIGIBILITY_RESPONSE.VALUES) {
            testd.ELIGIBILITY_RESPONSE.VALUES[k] = simplifyStr(testd.ELIGIBILITY_RESPONSE.VALUES[k]);
        }
    }

    // START: This will remove empty `MATCHED_ELIGIBILITY` from comparism objects
    if (testd.ELIGIBILITY_RESPONSE && testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY && testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY.length == 0) {
        delete testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY;
    } else if (testd.ELIGIBILITY_RESPONSE && testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY && testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY.length > 0) {
        for (let i = 0 ;i<testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY.length; i++) {
            const x = testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY[i];
            if(x.GRID_EXP) {
                x.GRID_EXP = simplifyStr(x.GRID_EXP);
            }
            for(const k in x.VALUES) {
                x.VALUES[k] = simplifyStr(x.VALUES[k]);
            }
            delete x.ADDITIONAL_FIELDS;
            delete x.MAX_AMOUNT;
            delete x.MIN_AMOUNT;
            delete x.APPROVED_AMOUNT;
            delete x.MAX_TENOR;
        }
        testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY = lodash.sortBy(testd.ELIGIBILITY_RESPONSE.MATCHED_ELIGIBILITY, ["GridID", "COMPUTED_AMOUNT", "ELIGIBILITY_AMOUNT"]);
    }

    if(testd.ADDITIONAL_ELIGIBILITY) {
        testd.ADDITIONAL_ELIGIBILITY = lodash.sortBy(testd.ADDITIONAL_ELIGIBILITY, ["ElgbltyID", "GridID", "COMPUTED_AMOUNT", "APPROVED_AMOUNT"]);
        for(let i = 0; i < testd.ADDITIONAL_ELIGIBILITY.length; i++) {
            const addlEligibility = testd.ADDITIONAL_ELIGIBILITY[i];
            if(addlEligibility.GRID_EXP) {
                addlEligibility["GRID_EXP"] = simplifyStr(addlEligibility.GRID_EXP);
            }

            for(const k in addlEligibility.VALUES) {
                addlEligibility.VALUES[k] = simplifyStr(addlEligibility.VALUES[k]);
            }

            if (addlEligibility && addlEligibility.MATCHED_ELIGIBILITY && addlEligibility.MATCHED_ELIGIBILITY.length == 0) {
                delete addlEligibility.MATCHED_ELIGIBILITY;
            } else if (addlEligibility && addlEligibility.MATCHED_ELIGIBILITY && addlEligibility.MATCHED_ELIGIBILITY.length > 0) {
                for (let j = 0 ;j<addlEligibility.MATCHED_ELIGIBILITY.length; j++) {
                    const x = addlEligibility.MATCHED_ELIGIBILITY[j];
                    if(x.GRID_EXP) {
                        x.GRID_EXP = simplifyStr(x.GRID_EXP);
                    }
                    for(const k in x.VALUES) {
                        x.VALUES[k] = simplifyStr(x.VALUES[k]);
                    }
                    delete x.ADDITIONAL_FIELDS;
                    delete x.MAX_AMOUNT;
                    delete x.MIN_AMOUNT;
                    delete x.APPROVED_AMOUNT;
                    delete x.MAX_TENOR;
                }
            }
            addlEligibility["MATCHED_ELIGIBILITY"] = lodash.sortBy(addlEligibility.MATCHED_ELIGIBILITY, ["GridID", "COMPUTED_AMOUNT", "ELIGIBILITY_AMOUNT"]);
        }
    }

    // START: This will remove special characters and spaces from `Exp`
    testd.DECISION_RESPONSE && testd.DECISION_RESPONSE.Details && testd.DECISION_RESPONSE.Details.forEach((x) => {
        x.Exp = simplifyStr(x.Exp);
        for(const k in x.Values) {
            x.Values[k] = simplifyStr(x.Values[k]);
        }
    });
    testd.ADDITIONAL_CREDITRULES && testd.ADDITIONAL_CREDITRULES.forEach((x) => {
        x.Details && x.Details.forEach((y) => {
            y.Exp = simplifyStr(y.Exp);
            for(const k in y.Values) {
                y.Values[k] = simplifyStr(y.Values[k]);
            }
        });
    });
    // END

    // START: This will remove special characters and spaces from `Exp`
    testd.DEVIATION_RESPONSE && testd.DEVIATION_RESPONSE.Details && testd.DEVIATION_RESPONSE.Details.forEach((x) => {
        delete x.Exp;   //   Delete Deviation Exp  as  is is treated as =,  contains is treadted as ?
        for(const k in x.Values) {
            x.Values[k] = simplifyStr(x.Values[k]);
        }
    });
    // END
};