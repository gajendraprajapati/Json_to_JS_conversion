/**
 * This method returns minimum of 2 dates
 */
const minDate = (date1, date2) => {
    if (date1 > date2) {
        return date2;
    }
    else {
        return date1;
    }
};

/**
 * This method returns minimum of 2 dates
 */
const maxDate = (date1, date2) => {
    if (date1 > date2) {
        return date1;
    }
    else {
        return date2;
    }
};

module.exports = { maxDate, minDate };
