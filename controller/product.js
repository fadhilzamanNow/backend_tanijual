const express = require("express");
const router = express.Router();

const Product = require("../model/product");
const Shop = require("../model/shop")
const Order = require("../model/order")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { upload } = require("../multer");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const fs = require("fs")
const cloudinary = require('cloudinary')
// create Product di shop 
router.post("/create-product", catchAsyncErrors(async(req,res,next) => {
    try{
        const shopId = req.body.shopId
        const shop = await Shop.findById(shopId);
        if(!shop){
            return next(new ErrorHandler("Shop ID tidak valid", 400))
        }else{
            let images = []

            if(typeof req.body.images === "string"){
                images.push(req.body.images)
            }else{
                images = req.body.images
            }

            const imageLinks = [];

            for(let i = 0; i < images.length; i++){
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder : "products"
                })

                imageLinks.push({
                    public_id : result.public_id,
                    url : result.secure_url
                })


                
                
            }

            const productData = req.body;
            productData.images = imageLinks;
            productData.shop = shop
            const product = await Product.create(productData)

           /*  const files = req.files;
            const imageUrls = files.map((file) => `${file.filename}`);
            const productData = req.body;
            productData.images = imageUrls;
            productData.shop = shop; 

            const product = await Product.create(productData); */

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


// get all product dari semua shop yang ada di jual tani

router.get("/get-all-products", catchAsyncErrors(async (req,res,next) => {
    try{
        const products = await Product.find();

        res.status(201).json({
            message : "success",
            products
        })
    }
    catch(error){
        return next(new ErrorHandler(error,400))
    }
}))


//review buat user
router.put("/create-new-review",isAuthenticated, catchAsyncErrors(async (req, res, next) => {
    try{
        const {user, rating , comment , productId, orderId} = req.body;
        //console.log("req masuk ", req.body);
       /*  console.log("req masuk productId", productId);
        console.log("req masuk comment", comment);
        console.log("req masuk user", user);
        console.log("req masuk rating", rating);
        console.log("req user id : ", req.user._id); */
        const review = {
            user,
            rating,
            comment,
            productId
        };

        const product = await Product.findById(productId)
       

        
        const isReviewed = product.reviews.find(
            (rev) => rev.user._id === req.user.id
        )
        
       

        if(isReviewed){
            product.reviews.forEach((rev) => {
                if(rev.user._id === req.user.id){
                    (rev.rating = rating), (rev.comment = comment), (rev.user = user)
                }
            });
        }else{
            product.reviews.push(review);
        }


        let avg = 0 ;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        })

        product.ratings = avg / product.reviews.length;


        await product.save({validateBeforeSave : false});

        await Order.findByIdAndUpdate(orderId, {$set : {"cart.$[elem].isReviewed" : true }}, 
            {arrayFilters : [ {"elem._id" : productId}], new : true}
        );

        res.status(200).json({
            success : true,
            message : "Reviewed Success"
        })
    }
    catch(error){
        console.log("error",error);
    }
}))

module.exports = router;