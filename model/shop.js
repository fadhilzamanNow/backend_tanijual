const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Masukkan nama Tokomu"],
  },
  email: {
    type: String,
    required: [true, "Masukkan alamat Emailmu"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password harus lebih dari 6 karakter"],
    select: false,
  },
  address: {
    type: String,
  },
  phoneNumber : {
    type : Number,
    required : true,
  },
  role: {
    type: String,
    default: "seller",
  },
  avatar: {
    public_id : {
      type: String,
      required: true,
    },
    url : {
      type: String,
      required: true,
    }
  },
  description : {
    type : String,
  }, 
  zipCode : {
    type : Number,
    required : true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
 
});

// Hash password
shopSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 10);
  });
  
  // jwt token
  shopSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  };
  
  // comapre password
  shopSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

module.exports = mongoose.model("Shop", shopSchema);
