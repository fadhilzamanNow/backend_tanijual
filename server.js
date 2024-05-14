const connectDatabase = require("./db/Database");

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

