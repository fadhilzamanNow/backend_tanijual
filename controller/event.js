const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { upload } = require("../multer");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const Product = require("../model/product")
const router = express.Router();
const Event = require("../model/event");
const { isSeller } = require("../middleware/auth");
const fs = require("fs")


// buat create event
router.post("/create-event", upload.array("images"), catchAsyncErrors(async(req,res,next) => {
    try{
        const shopId = req.body.shopId
        const shop = await Shop.findById(shopId);
        if(!shop){
            return next(new ErrorHandler("Shop ID tidak valid", 400))
        }else{
            const files = req.files;
            const imageUrls = files.map((file) => `${file.filename}`);
            const eventData = req.body;
            eventData.images = imageUrls;
            eventData.shop = shop; 

            const product = await Event.create(eventData);

            res.status(201).json({
                success : true,
                product,
            })
        }

    }
    catch(e) {
        return next(new ErrorHandler(error,400))
    }
}))

// get semua events
router.get("/get-all-events/:id", catchAsyncErrors(async(req,res,next) => {
    try{
        const events = await Event.find({shopId : req.params.id});

        res.status(201).json({
            success : true,
            events
        })
    }
    catch(error) {
        return next(new ErrorHandler(error,400))
    }
}))

// delete events

router.delete("/delete-shop-event/:id", isSeller, catchAsyncErrors(async(req,res,next) => {
    try{
       const productId = req.params.id;
       const eventData = await Event.findById(productId)

       if(!eventData) {
           return next(new ErrorHandler("Event tidak ditemukan dengan id itu"),500)
       }

        //const filename = req.file.filename;

        eventData.images.forEach((imageUrl) => {
            const filename = imageUrl;
            const filePath = `uploads/${filename}`;

            fs.unlink(filePath, (err) => {
                if(err){
                    console.log(err)
                }
            })
        })
        
        const event = await Event.findByIdAndDelete(productId)

        if(!event){
            return next(new ErrorHandler("event yang ingin dihapus tidak ditemukan"),500)
        }
        /* fs.unlink(filePath, (err) => {
            if(err){
                console.log(err);
                req.status(500).json({message : "Error deleting file"})
            }
        }) */

       res.status(201).json({
           success : true,
           message : "Event berhasil untuk dihapus"
       })
    }
    catch(error){
       return next(new ErrorHandler(error,400))
    }
}))

// get semua event

router.get("/get-all-events", async(req,res,next) => {
    try{
        const events = await Event.find()
        res.status(201).json({
            success : true,
            events,
        })
    }catch(error){
        return next(new ErrorHandler(error,400))
    }
})

module.exports = router;