const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser")
const cors = require("cors");

app.use(cookieParser());
app.use(cors({  
    origin : ["https://frontend-tanijual.vercel.app/","https://frontend-tanijual.vercel.app","http://localhost:3000"],
    credentials : true
}));

/* app.use("/",express.static("uploads")); */

/* app.use("/", (req,res) => {
    res.send("Tes bisa masuk");
}) */
app.use(bodyParser.urlencoded({extended : true, limit : '50mb'}));
app.use(bodyParser.json({limit : '50mb'}));

// For parsing application/json
app.use(express.json({ limit: '50mb' }));

// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '50mb', extended: true }));


 
// config

if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({
        path:"config/.env"
    })
}

//import routes 

const user = require("./controller/user")
const shop = require("./controller/shop")
const product = require("./controller/product")
const event = require("./controller/event");
const coupon = require("./controller/couponCode")

const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/message")

app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon",coupon);

app.use("/api/v2/order",order)
app.use("/api/v2/conversation",conversation)
app.use("/api/v2/message",message)


// untuk errorhandling
app.use(ErrorHandler);

module.exports = app;

