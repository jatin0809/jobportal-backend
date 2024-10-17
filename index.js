const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
dotenv.config();

const {incomingRequestLogger} = require("./middlewares/index");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user")
const jobRouter = require("./routes/job");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(incomingRequestLogger);
app.use("/api/v1", indexRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);


app.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port ${process.env.PORT}`);
    mongoose.connect(process.env.MONGODB_URL_STRING);
    mongoose.connection.on("error", (err)=> {
        console.log(err);
    })
});