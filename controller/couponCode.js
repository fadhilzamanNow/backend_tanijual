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

router.post("/test/:name", (req,res,next) => {
    if(req.params.name){
        res.status(201).json({
            messages : "Selamat kamu memasukkan nama"
        })
        
    }
    else{
        res.status(404).json({
            message : "Gagal"
        })
    }
    
})


// get all coupon 

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


// delete coupon 
router.delete("/delete-coupon/:id", isSeller, catchAsyncErrors(async (req,res,next) => {
    try{
        const cariCoupon = await CouponCode.findByIdAndDelete( req.params.id )

        if (!cariCoupon){
            return next(new ErrorHandler("Kupon yang ingin dihapus tidak ditemukan", 400))
        }
        res.status(201).json({
            message : "Sukses untuk menghapus kupon",
            cariCoupon
        })

    }
    catch(error){
        return next(new ErrorHandler(error,400))
    }
}))

// 
router.get("/get-coupon-value/:name", catchAsyncErrors(async (req,res,next) => {
    try{
        const couponCode = await CouponCode.findOne({name : req.params.name})

        res.status(200).json({
            success : true,
            couponCode
        })
    }
    catch(error){
        return next(new ErrorHandler(error,400));
    }
}))

module.exports = router;