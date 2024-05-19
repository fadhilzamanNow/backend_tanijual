const express = require("express");
const router = express.Router();

const Product = require("../model/product");
const Shop = require("../model/shop")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const { isSeller } = require("../middleware/auth");
const fs = require("fs")

// create Product di shop 
router.post("/create-product", upload.array("images"), catchAsyncErrors(async(req,res,next) => {
    try{
        const shopId = req.body.shopId
        const shop = await Shop.findById(shopId);
        if(!shop){
            return next(new ErrorHandler("Shop ID tidak valid", 400))
        }else{
            const files = req.files;
            const imageUrls = files.map((file) => `${file.filename}`);
            const productData = req.body;
            productData.images = imageUrls;
            productData.shop = shop; 

            const product = await Product.create(productData);

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

//get all product dari shop

router.get("/get-all-products-shop/:id", catchAsyncErrors(async(req,res,next) => {
    try{
        const products = await Product.find({shopId : req.params.id});

        res.status(201).json({
            success : true,
            products
        })
    }
    catch(error) {
        return next(new ErrorHandler(error,400))
    }
}))

//delete product dari shop
router.delete("/delete-shop-product/:id", isSeller, catchAsyncErrors(async(req,res,next) => {
     try{
        const productId = req.params.id;

        const productData = await Product.findById(productId)

        if(!productData){
            return next(new ErrorHandler("Id Produk tidak ditemukan", 500))
        }

        productData.images.forEach((imageUrl) => {
            const filename = imageUrl
            const filePath = `uploads/${filename}`

            fs.unlink(filePath,(err) => {
                if(err){
                    console.log(err)
                }
            })
        })




        const product = await Product.findByIdAndDelete(productId)

        if(!product) {
            return next(new ErrorHandler("Product tidak ditemukan dengan id itu"),500)
        }

        res.status(201).json({
            success : true,
            message : "Produk berhasil untuk dihapus"
        })
     }
     catch(error){
        return next(new ErrorHandler(error,400))
     }
}))

module.exports = router;