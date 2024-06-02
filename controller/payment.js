const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const router = express.Router();

const stripe = require("stripe")("sk_test_51PJn452MeiywFZ9xqbCYHf73dZ44xjiFL8o2c0IdyFm0mGk2HnNjr6rQXQxGcocHsBcw1wGfEdHQ9uIJZ9uVuVEH00ABJ5PdV2")

router.post("/process", catchAsyncErrors(async(req,res,next) => {
    console.log(req.body.amount);
    const myPayment = await stripe.paymentIntents.create({
        amount : req.body.amount,
        currency : "idr",
        metadata : {
            company : "TaniJual"
        },
    });
    res.status(201).json({
        success : true,
        client_secret : myPayment.client_secret
    })
})
)


router.get("/stripeapikey", catchAsyncErrors(async(req,res,next) => {
    res.status(200).json({stripeApikey : process.env.STRIPE_API_KEY});
}))

module.exports = router
