const _ = require("lodash");
export const strMatchOld = (leftStr, rightStr) => {
    leftStr = leftStr.toUpperCase();
    rightStr = rightStr.toUpperCase();
    const possibility = leftStr.length + rightStr.length - 2; // _.includes('abcd', 'bc');
    let hits = 0;
    let counter = leftStr.length - 1;
    let result;

    while (counter > 0) {
        const subStr = leftStr.substring(counter - 1, counter + 1);
        if (_.includes(rightStr, subStr)) {

            hits++;
        }
        counter--;
    }

    counter = rightStr.length - 1;
    while (counter > 0) {
        const subStr = rightStr.substring(counter - 1, counter + 1);
        if (_.includes(leftStr, subStr)) {
            hits++;
        }
        counter--;
    }
    result = hits / possibility * 100;

    return _.round(result, 2);
};

export const strMatchNew = (fst, snd) => {
    fst = fst.toUpperCase();
    snd = snd.toUpperCase();
    if (fst.length < 2) {
        return 0;
    }

    const map = {};
    for (let i = 0; i <= fst.length - 2; i++) {
        const sub = fst.substr(i, 2);
        if (map[sub]) {
            map[sub] = map[sub] + 1;
        } else {
            map[sub] = 1;
        }
    }
    let match = 0;
    let result;
    for (let i = 0; i <= snd.length - 2; i++) {

        const sub = snd.substr(i, 2);
        if (map[sub] >= 0) {
            match = match + 1 + map[sub];
            map[sub] = 0;
            // map[sub] = map[sub] - 1;
        }
    }
    result = 100 * match / (fst.length + snd.length - 2);
    return _.round(result, 2);
};
