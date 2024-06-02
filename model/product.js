const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Tolong Masukkan Nama Produkmu !"]
    },
    description : {
        type : String,
        required : [true, "Tolong masukkan Nama Deskripsimu !"]
    },
    category : {
        type : String,
        required : [true, "Tolong masukkan nama kategori produkmu !"]
    },
    tags : {
        type : String,
        required : [true, "Tolong masukkan Tag Produkmu !"]
    },
    originalPrice : {
        type : Number   
    },
    discountPrice : {
        type : Number,
        required : [true, "Tolong masukkan harga final produkmu"]
    },
    reviews : [
        {
            user : {
                type : Object
            },
            rating : {
                type : Number 
            },
            comment : {
                type : String,
            },
            productId : {
                type : String,
             }
        }
    ],
    ratings : {
        type : Number,
    },
    stock : {
        type : Number,
        required : [true, "TOlong masukkan stok produkmu"]
    },
    images  : [
        {
            type : String
        }
    ],
    shopId : {
        type : String,
        required : true
    },
    shop : {
        type : Object,
        required : true 
    },
    sold_out : {
        type : Number,
        default : 0,
    },
    createdAt : {
        type : Date,
        default : Date.now(),
    }
})

module.exports = mongoose.model("Product", productSchema)