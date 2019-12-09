export {};

const app  = require("express")();
const mongoDb = require("./db/mongodb");
const connectDB = mongoDb.connectDB;

const port = 3000;
connectDB(function(err) {
    app.listen(port, function(err) {
        if (err) {
            throw err;
        }
        console.log("API Up and running on port " + port);
    });
});
