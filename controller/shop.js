const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs")
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated, isSeller } = require("../middleware/auth");
const Shop = require("../model/shop")
const {upload} = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");


router.post("/create-shop", upload.single("file"), async(req,res,next) => {
    try{
        const {email} = req.body;
        const sellerEmail = await Shop.findOne({email})
        if(sellerEmail){
            const filename = req.file.filename;
            const filePath = `uploads/${filename}`
            fs.unlink(filePath, (err) => {
                if(err){
                    console.log(err);
                    req.status(500).json({message : "Error deleting file"})
                }
            })
            return next(new ErrorHandler("Email yang kamu masukkan sudah pernah digunakan", 400))
            
        }

        const filename = req.file.filename;
        const fileUrl = path.join(filename);
    
    
        const seller = {
            name : req.body.name,
            email : email,
            password : req.body.password,
            avatar : fileUrl,
            address : req.body.address,
            phoneNumber : req.body.phoneNumber,
            zipCode : req.body.zipCode
        };

        const activationToken = createActivationToken(seller);

        const activationUrl = `http://localhost:3000/seller/activation/${activationToken}` ;
        try{
            await sendMail({
                email: seller.email,
                subject: "Activate your account",
                message: `Hello ${seller.name}, please click on the link to activate your account: ${activationUrl}`,
            })
            res.status(201).json({
                success: true,
                message: `Pendaftaran Berhasil, Aktifkan akunmu pada emailmu, yaitu ${seller.email} `, 
            })
        }
        catch(error){
            return next(new ErrorHandler(error.message,500))
        }
    }
    catch(error){
        return next(new ErrorHandler(error.message,400))
    }
})

//buat activation token

const createActivationToken = (seller) => {
    return jwt.sign(seller,process.env.ACTIVATION_SECRET,{
        expiresIn : "5m",
    })
}

//activate seller

router.post(
    "/activation",
    catchAsyncErrors(async (req, res, next) => {
        //console.log("berhasil kesini")

      try {
        const { activation_token } = req.body;
        const newSeller = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET
        );
  
        if (!newSeller) {
          return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar, phoneNumber, zipCode, address } = newSeller;
  
        let seller = await Shop.findOne({ email });
  
        if (seller) {
          return next(new ErrorHandler("User already exists", 400));
        }
        seller = await Shop.create({
          name,
          email,
          avatar,
          password,
          zipCode,
          address,
          phoneNumber
        });
  
        sendShopToken(seller, 201, res);
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );

  //coba

  router.post("/coba",(req,res) => {
    try{
    const {name,email,avatar,password,zipCode,address, phoneNumber} = req.body

    res.status(201).json({
        message :"success",
        hasil : {
            name,email,avatar,password,zipCode,address,phoneNumber
        }
    })
    }
    catch(e){
        res.status(400).json({
            message : "failed",
            asalan : `Karena kamu gagal di bagian ${e}`
        })
    }
  })


//login shop 
router.post("/login-shop", catchAsyncErrors(async(req,res,next) => {
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return next(new ErrorHandler("Please provide the all fields !", 400))
        }

        const user = await Shop.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHandler("Email yang kamu masukkan tidak terdaftar", 400));
        }

        const isPasswordValid = await user.comparePassword(password);

        if(!isPasswordValid){
            return next(new ErrorHandler("Password yang kamu masukkan salah",400))
        }

        sendShopToken(user,201,res)
    }catch(error){
        return next(new ErrorHandler(error.message,500))
    }
  }))

  // load shop
  router.get("/getSeller", isSeller, catchAsyncErrors( async(req,res, next) => {
    try{
        //console.log(req.seller)
        const seller = await Shop.findById(req.seller._id);
        if(!seller){
            return next(new ErrorHandler("User doesnt exists", 400));
        }

        res.status(200).json({
            success: true,
            seller
        })
        
    }catch(e){
       return next(new ErrorHandler(error.message, 500))
    }
  }))

  //logout seller
  router.get(
    "/logout",
    catchAsyncErrors(async (req, res, next) => {
      try {
        res.cookie("seller_token",null, {
          expires: new Date(Date.now()),
          httpOnly: true,
        });
        res.status(201).json({
          success: true,
          message: "Logout Berhasil",
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    })
  );


module.exports = router;

