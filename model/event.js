const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Tolong Masukkan Nama Event Produkmu !"]
    },
    description : {
        type : String,
        required : [true, "Tolong masukkan Nama Event Deskripsimu !"]
    },
    category : {
        type : String,
        required : [true, "Tolong masukkan nama Event kategori produkmu !"]
    },
    start_Date : {
        type : Date,
        required : true
    },
    Finish_Date : {
        type : Date,
        required : true,
    },
    status : {
        type : String,
        default : "Sedang Berjalan"
    },
    tags : {
        type : String,
        required : [true, "Tolong masukkan Event Tag Produkmu !"]
    },
    originalPrice : {
        type : Number   
    },
    discountPrice : {
        type : Number,
        required : [true, "Tolong masukkan Event harga final produkmu"]
    },
    stock : {
        type : Number,
        required : [true, "TOlong masukkan Event stok produkmu"]
    },
    images  : [
        {
            public_id : {
                type : String,
                required : true
            },
            url : {
                type : String,
                required : true
            }
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

module.exports = mongoose.model("Event", eventSchema)