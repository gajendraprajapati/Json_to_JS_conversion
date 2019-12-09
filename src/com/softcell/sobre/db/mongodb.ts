import { Db, MongoClient, MongoClientOptions } from "mongodb";
import { Config } from "../config/config";

export abstract class MongoConnection {


    public static connectDB(done) {
        if (this._db) { return done(); }
        MongoClient.connect(Config.mongoConnStr, this.options, (err, client) => {
            if (err) { return done(err); }
            this._db = client.db(Config.dbName);
            this._connection = client;
            done();
        });
    }
    public static disconnectDB(force?: boolean) {
        return this._connection.close(force);
    }

    public static getDB(): Db {
        return this._db;
    }

    public static getConnection(): MongoClient {
        return this._connection;
    }
    private static _db: Db;
    private static _connection: MongoClient;

    private static options: MongoClientOptions = {
        numberOfRetries: Config.numberOfRetries,
        autoReconnect: true,
        poolSize: Config.poolSize,
        socketOptions: {
            connectTimeoutMS: 500,
        },
        replicaSet: "",
    };

}
