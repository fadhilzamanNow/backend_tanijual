const express = require("express");
const router = express.Router();
const CouponCode = require("../model/couponCode");
const Shop = require("../model/shop");
const { isSeller } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");


// buat kupon 
router.post("/create-coupon-code", isSeller, catchAsyncErrors(async(req,res,next) => {
    try{
        const isCouponCodeExists = await CouponCode.find({name : req.body.name})
        console.log("nama kupon : ", req.body.name)
        if(isCouponCodeExists.length !== 0){
            return next(new ErrorHandler("Coupon Code sudah pernah dibuat",400))
        }

        const couponCode = await CouponCode.create(req.body);

        res.status(201).json({
            success : true,
            couponCode,
        });
    }
    catch(error){
        return next(new ErrorHandler(error,500))
    }
}))


//ngetest end point

router.get("/test", (req,res,next) => {
    res.status(201).json({
        messages : "Selamat kamu berhasil mengkases end point ini"
    })
})


// get all product 

router.get("/get-coupon/:id",isSeller, catchAsyncErrors(async(req,res,next) => {
    try{
        const couponCodes = await CouponCode.find({ shopId : req.seller.id })

        res.status(201).json({
            success : true,
            couponCodes,
        })
    }
    catch(error){
        return next(new ErrorHandler(error,500))
    }
}))


module.exports = router;