const mongoDb = require("../db/mongodb");

/**
 * This method returns IFF data structure given the institutionID
 * @returns {any}
 * @param institutionId
 */
export const loadIFFData = (institutionId) => {
    const soberdb = mongoDb.getDB().db("soberdb");
    const iffFilesCollection = soberdb.collection("IFF_FILES");

    return iffFilesCollection.find({INSTITUTION_ID: institutionId}).toArray();
};
