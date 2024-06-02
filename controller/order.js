const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Order = require("../model/order")
const { isAuthenticated, isSeller } = require("../middleware/auth");
const Product = require("../model/product");
const product = require("../model/product");


// membuat sebuah order
router.post("/create-order", isAuthenticated, catchAsyncErrors(async ( req,res,next) => {
    try{
        const {cart, alamat, user, totalPrice, paymentInfo} = req.body;

        //group cart items by shopId

        const shopItemsMap = new Map();

        for(const item of cart){
            const shopId = item.shopId
            if(!shopItemsMap.has(shopId)){
                shopItemsMap.set(shopId,[])
            }
            shopItemsMap.get(shopId).push(item);
        }

        const orders = [];

        for (const [shopId,items] of shopItemsMap){
            const order = await Order.create({cart : items, alamat, user, totalPrice, paymentInfo})
            orders.push(order);
        } 

        res.status(201).json({
            success : true,
            orders,
        })
    }
    catch(error){
        return next(new ErrorHandler(error,400))
    }
}))


// narik order dari  user tertentu
router.get("/get-all-orders/:userId",catchAsyncErrors(async(req,res,next) => {
    try{
        const orders = await Order.find({"user._id" : req.params.userId}).sort({
            createdAt: -1,
        })

        res.status(201).json({
            success : true,
            orders
        })
    }
    catch(error){
        return next(new ErrorHandler(error,400))
    }
}))


// narik order dari shop tertentu
router.get("/get-seller-all-orders/:shopId", catchAsyncErrors(async (req,res,next)=> {
    try{
        const orders = await Order.find({"cart.shopId" : req.params.shopId}).sort({
            createdAt : -1
        });

        res.status(201).json({
            success : true,
            orders
        })
    }catch(error){
        return next(new ErrorHandler(error,400))
    }
}))


// update status order hanya untuk penjual 
router.put("/update-order-status/:id", isSeller, catchAsyncErrors(async(req,res,next) =>{
    try{
        const order = await Order.findById(req.params.id)
        console.log("status : ", req.body.status);

        if(!order){
            res.status(400).json({
                success : false,
                message : "Tidak ditemukan order ini"
            })
            return next(new ErrorHandler('Order tidak ditemukan',400))
        }

        if(req.body.status === "Diserahkan ke kurir"){
            order.cart.forEach(async(o) => {
                await updateProduct(o._id,o.qty);
            })

        }


        order.status = req.body.status;

        if(req.body.status === "Diserahkan ke kurir"){
            order.deliveredAt = Date.now();
            order.paymentInfo.status = "Succeeded";
        }


        await order.save({validateBeforeSave : false});

        res.status(201).json({
            success : true,
            order,
        })


        async function updateProduct(id,qty){
            const product = await Product.findById(id);

            product.stock -= qty ;
            product.sold_out += qty;

            await product.save({validateBeforeSave: false})
        }

    }
    catch(error){

    }
}))

// buat refund
router.put("/order-refund/:id", catchAsyncErrors(async(req,res,next) =>{
    try{
        const order = await Order.findById(req.params.id)
        console.log("status : ", req.body.status);

        if(!order){
            res.status(400).json({
                success : false,
                message : "Tidak ditemukan order ini"
            })
            return next(new ErrorHandler('Order tidak ditemukan',400))
        }

        console.log("status update :", req.body.status)
        order.status = req.body.status;


        await order.save({validateBeforeSave : false});

        res.status(201).json({
            success : true,
            order,
            message : "Proses Refund Berhasil"
        })


       
    }
    catch(error){
        return next(new ErrorHandler(error,400));
    }
}))



module.exports = router;