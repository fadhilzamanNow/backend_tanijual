const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");
app = require("./app");


// handling uncaught Exception 

process.on("uncaughtException", (err) => {
    console.log(`Error : ${err.message}`);
    console.log(`Shutting Down The Server for Handling Exception`);
})


//config 
if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config({
        path:"backend/config/.env"
    })
}
// connect db
connectDatabase();

console.log("name :", process.env.CLOUDINARY_NAME)
console.log("api key :", process.env.CLOUDINARY_API_KEY)
console.log("api secret :", process.env.CLOUDINARY_API_SECRET)

//nyimpen data pakai cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

//create server 

const server = app.listen(process.env.PORT, () => {
    console.log(`Servers is running on https://localhost:${process.env.PORT}`)
})


// unhandled promise rejection 
process.on("unhandledRejection", (err) => {
    console.log(`Shutting Down the server for ${err.message}`)
    console.log(`Shutting down the server for unhandle Promise Rejection`)

    server.close(() => {
        process.exit(1);
    }) 
})

