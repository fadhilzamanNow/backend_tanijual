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
const cloudinary = require("cloudinary")


router.post("/create-shop", async(req,res,next) => {
  console.log("berhasil masuk");
    try{
        const {
          name,
          email,
          password,
          avatar,
          zipCode,
          adress,
          phoneNumber,
        } = req.body;

        if(!name || !email || !password || !avatar || !zipCode || !adress | !phoneNumber){
          return next(new ErrorHandler("Informasi yang kamu masukkan belum lengkap", 400))
        }


        if(!email.includes("@")){
          return next(new ErrorHandler("Email yang kamu masukkan tidak valid", 400))
        }

        if(password.length < 6){
          return next(new ErrorHandler("Passwordmu kurang dari 6 karakter", 400))
        }
        const sellerEmail = await Shop.findOne({email})
        if(sellerEmail){
            return next(new ErrorHandler("Email Toko sudah pernah digunakan", 400))   
        }

        

        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder : "avatars"
        })
    
    
        const seller = {
            name : name,
            email : email,
            password : password,
            avatar : {
              public_id : myCloud.public_id,
              url : myCloud.secure_url
            },
            address : adress,
            phoneNumber : phoneNumber,
            zipCode : zipCode
        };

        const activationToken = createActivationToken(seller);

        const activationUrl = `https://frontend-tanijual.vercel.app/seller/activation/${activationToken}` ;
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
        console.log("isi :", req.body)
        const newSeller = jwt.verify(
          activation_token,
          process.env.ACTIVATION_SECRET
        );
        console.log("decrypt : ", newSeller)
        if (!newSeller) {
          return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar, phoneNumber, zipCode, address } = newSeller;
        
  
        let seller = await Shop.findOne({ email });
  
        if (seller) {
          return next(new ErrorHandler("Toko sudah pernah dibuat", 400));
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
            return next(new ErrorHandler("Informasi yang dimasukkan belum lengkap !", 400))
        }

        if(password.length() < 6){
            return next(new ErrorHandler("Passwordmu kurang dari 6 karakter", 400))
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
          sameSite: "none",
          secure : true
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

  // informasi shop
  router.get("/get-shop-info/:id", catchAsyncErrors(async (req,res,next) => {
    try{
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success : true,
        shop
      })
    }
    catch(error){
      return next(new ErrorHandler(error,400))
    }
  }))

  //ubah foto toko
  router.put("/update-shop-avatar",isSeller, catchAsyncErrors(async(req,res,next) => {
    try{

      const {avatar} = req.body
      const carishop = await Shop.findById(req.seller._id);
      console.log("ok")
      if(avatar !== "") {
        console.log("ok2")
        const imageId = carishop.avatar.public_id
        
        await cloudinary.v2.uploader.destroy(imageId)

        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder : "avatars"
        })

        carishop.avatar = {
          public_id : myCloud.public_id,
          url : myCloud.secure_url
        }


        await carishop.save()

        res.status(201).json({
          success : true,
          seller : carishop
        })
      }

      
    }
    catch(error){
      return next(new ErrorHandler(error,400))
    }
  }))

  //ubah informasi toko

  router.put("/update-seller-info", isSeller, catchAsyncErrors(async(req,res,next) => {
    try{
      const {name, description, address, phoneNumber, zipCode } = req.body

      const toko = await Shop.findOne(req.seller._id)

      if(!toko) {
        return next(new ErrorHandler("Toko yang pengen diupdate tidak ada", 400))
      }

      toko.name = name;
      toko.description = description;
      toko.address = address;
      toko.phoneNumber = phoneNumber;
      toko.zipCode = zipCode;

      await toko.save();

      res.status(201).json({
        success : true,
        toko
      })
    }
    catch(error){
      return next(new ErrorHandler(error,400))
    }
  }))


module.exports = router;

