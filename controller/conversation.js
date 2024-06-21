const Conversation = require("../model/conversation")
const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const express = require("express");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const router = express.Router();

router.post("/create-new-conversation", catchAsyncErrors(async(req,res,next) => {
    console.log("shopID : ",req.body.sellerId);

    try{
        const {groupTitle, userId, sellerId} = req.body;
        console.log("group Title", groupTitle)
        const isConversationExist = await Conversation.findOne({groupTitle})
        console.log("apakah ada", isConversationExist)
        if(isConversationExist){
            const conversation = isConversationExist
            res.status(201).json({
                success : true,
                conversation
            })
        }else{
            const conversation = await Conversation.create({
                members : [userId,sellerId],
                groupTitle : groupTitle
            })
            res.status(201).json({
                success : true,
                conversation
            })
        }


       
    }
    catch(error){
        return next(new ErrorHandler("ada masalah",400))
    }
}))


//melihat semua percakapan toko

router.get("/get-all-conversation-seller/:id", isSeller, catchAsyncErrors(async(req,res,next) => {
    console.log(req.params.id)
    try{
        const conversations = await Conversation.find({
            members : {
                $in : [req.params.id]
            }
        }).sort({updatedAt : -1, createdAt : -1});

        res.status(201).json({
            success : true,
            conversations
        })
    }



    catch(error){
        return next(new ErrorHandler(error.response.message,500))
    }
}))

router.get("/get-all-conversation-user/:id", isAuthenticated, catchAsyncErrors(async(req,res,next) => {
    console.log(req.params.id)
    try{
        const conversations = await Conversation.find({
            members : {
                $in : [req.params.id]
            }
        }).sort({updatedAt : -1, createdAt : -1});

        res.status(201).json({
            success : true,
            conversations
        })
    }



    catch(error){
        return next(new ErrorHandler(error.response.message,500))
    }
}))

router.get("/test", async(req,res,next) => {
    res.status(201).json({
        message : "Berhasil"
    })
})


//update pesan terakhir
router.put("/update-last-message/:id", catchAsyncErrors(async(req,res,next) => {
    try {
        console.log("isi : ", req.body)
        const {lastMessage,lastMessageId} = req.body;

        const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
            lastMessage,
            lastMessageId
        });

        res.status(201).json({
            success : true,
            conversation
        })
    }
    catch(error){
        return next(new ErrorHandler(error,500))
    }
}))

module.exports = router;




