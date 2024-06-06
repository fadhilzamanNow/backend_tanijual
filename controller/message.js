const Messages = require("../model/messages")
const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const express = require("express");
const { upload } = require("../multer");
const router = express.Router();
const path = require ("path");
const cloudinary = require("cloudinary")



//buat percakapan baru

router.post("/create-new-message",catchAsyncErrors(async(req,res,next) => {
    try{
        
        const messageData  = req.body
        console.log("body : ", req.body)
        console.log(messageData);
        if (req.body.images) {
            console.log("ada gambar")
            const myCloud = await cloudinary.v2.uploader.upload(req.body.images, {
                folder : "messages",
            })
           
            messageData.images = {
                public_id : myCloud.public_id,
                url : myCloud.secure_url
            }
          }
            messageData.conversationId = req.body.conversationId
            messageData.sender = req.body.sender;
            messageData.text = req.body.text;
        

        const message = new Messages({
            conversationId : messageData.conversationId,
            text : messageData.text ,
            sender : messageData.sender ,
            images : messageData.images ? messageData.images : ""
            
            
        })


        await message.save();
        console.log("berhasil")
        res.status(201).json({
            success :true,
            message
        })
    }
    catch(error){
        console.log("errornya", error);
        return next(new ErrorHandler(error,400))
    }
}))


//mendapatkan seluruh pesan
router.get("/get-all-messages/:id", catchAsyncErrors(async(req,res,next) => {
    try{    
        const messages = await Messages.find({
            conversationId : req.params.id,
        })

        res.status(201).json({
            success : true,
            messages

        })
    }catch(error) {
        return next(new ErrorHandler(error.response.message,500))
    }
}))


module.exports = router