const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    cart : {
        type : Array,
        required : true,
    },
    alamat : {
        type : Object,
        required : true,
    },
    user : {
        type : Object,
        required : true,
    },
    totalPrice : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        default : "Dalam proses Pembayaran"
    },
    paymentInfo : {
        id : {
            type : String,
        },
        status : {
            type : String,
        },
        type : {
            type : String,
        }
    },
    paidAt : {
        type : Date,
        default : Date.now(),
    },
    deliveredAt : {
        type : Date,
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },

})

module.exports = mongoose.model("Order", orderSchema);