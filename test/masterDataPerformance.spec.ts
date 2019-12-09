import * as assert from "assert";
import { MongoConnection } from "../src/com/softcell/sobre/db/mongodb";

before(function(done) {
    MongoConnection.connectDB(done);
});

describe("Master table performance benchmarking test.", async () => {
    const masterLookups40k = [
        {
            collectionName: "CORPORATE_MASTER",
            primaryKey: "FINAL_CATEGORY",
            lookupField: "COMPANY_NAME",
        },
        {
            collectionName: "CORPORATE_MASTER1",
            primaryKey: "FINAL_CATEGORY",
            lookupField: "COMPANY_NAME",
        },
        {
            collectionName: "CORPORATE_MASTER2",
            primaryKey: "FINAL_CATEGORY",
            lookupField: "COMPANY_NAME",
        },
        {
            collectionName: "CORPORATE_MASTER3",
            primaryKey: "FINAL_CATEGORY",
            lookupField: "COMPANY_NAME",
        },
        {
            collectionName: "CORPORATE_MASTER4",
            primaryKey: "FINAL_CATEGORY",
            lookupField: "COMPANY_NAME",
        },
        {
            collectionName: "CORPORATE_MASTER5",
            primaryKey: "FINAL_CATEGORY",
            lookupField: "COMPANY_NAME",
        },
    ];
    const masterLookups90k = [];

    it("Fetch from 1 master table on 40k records.", async () => {
        const startTime = new Date().getMilliseconds();
        await createDbCallProm(masterLookups40k[0]);
        const endTime = new Date().getMilliseconds();
        printTime(startTime, endTime);
        assert.equal(true, true);
    });

    it("Sequential call from 5 master table on 40k records average.", async () => {
        const startTime = new Date().getMilliseconds();
        const finalProm = masterLookups40k.reduce((prevProm, cur) => {
            return prevProm.then((x: any) => createDbCallProm(cur));
        }, Promise.resolve());
        await finalProm;
        const endTime = new Date().getMilliseconds();
        printTime(startTime, endTime);
        assert.equal(true, true);
    });

    it("Parallel call from 5 master table on 40k records average.", async () => {
        const promArry = masterLookups40k.map((x) => createDbCallProm(x));
        const startTime = new Date().getMilliseconds();
        await Promise.all(promArry);
        const endTime = new Date().getMilliseconds();
        printTime(startTime, endTime);
        assert.equal(true, true);
    });

    it("Sequential call from 5 master table on 90k records average.", async () => {
        // TODO: need 90k data
        const startTime = new Date().getMilliseconds();
        const endTime = new Date().getMilliseconds();
        printTime(startTime, endTime);
        assert.equal(true, true);
    });

    it("Parallel call from 5 master table on 90k records average.", async () => {
        // TODO: need 90k data
        const startTime = new Date().getMilliseconds();
        const endTime = new Date().getMilliseconds();
        printTime(startTime, endTime);
        assert.equal(true, true);
    });

});

async function createDbCallProm(masterLookup) {
    const db = MongoConnection.getDB();
    const collection = db.collection(masterLookup.collectionName);
    const findDoc = collection.find({ [masterLookup.primaryKey]: "CAT U" });
    const data = await findDoc.toArray();
    return data[0];
}

function printTime(startTime: number, endTime: number) {
    const timeTaken = endTime - startTime;
    console.log("time taken ", timeTaken, "ms");
}

after(function(done) {
    MongoConnection.disconnectDB();
    done();
});
