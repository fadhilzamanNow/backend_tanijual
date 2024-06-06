const express = require("express");
const User = require("../model/user");
const router = express.Router();
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");

// create user
router.post("/create-user", async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
    });

    const user = {
      name: name,
      email: email,
      password: password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    };

    const activationToken = createActivationToken(user);

    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `please check your email:- ${user.email} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate user
 //activate user = 
 router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
      console.log("berhasil kesini")

    try {
      const { activation_token } = req.body;
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newUser) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });

      if (user) {
        return next(new ErrorHandler("User sudah ada", 400));
      }
      user = await User.create({
        name,
        email,
        avatar,
        password,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login user
router.post("/login-user", catchAsyncErrors(async(req,res,next) => {
  try{
      const {email,password} = req.body;

      if(!email || !password){
          return next(new ErrorHandler("Please provide the all fields !", 400))
      }

      const user = await User.findOne({email}).select("+password");

      if(!user){
          return next(new ErrorHandler("Email yang kamu masukkan tidak terdaftar", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if(!isPasswordValid){
          return next(new ErrorHandler("Password yang kamu masukkan salah",400))
      }

      sendToken(user,201,res)
  }catch(error){
      return next(new ErrorHandler(error.message,500))
  }
}))


// load user
router.get("/getuser", isAuthenticated, catchAsyncErrors( async(req,res, next) => {
  try{
      
      const user = await User.findById(req.user.id);
      if(!user){
          return next(new ErrorHandler("User doesnt exists", 400));
      }

      res.status(200).json({
          success: true,
          user
      })
      
  }catch(e){
     return next(new ErrorHandler(error.message, 500))
  }
}))


// logout user
router.get(
"/logout",
catchAsyncErrors(async (req, res, next) => {
try {
  res.cookie("token",null, {
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

//update informasi pengguna

router.put("/update-user-info", isAuthenticated, catchAsyncErrors(async(req,res,next) => {
try{
const {email,password,phoneNumber,name} = req.body;
const user = await User.findOne({email}).select("+password");

if(!user){
return next(new ErrorHandler('User tidak ditemukan', 400))
}


const isPasswordValid = await user.comparePassword(password);
if(!isPasswordValid){
return next(new ErrorHandler("Tolong sediakan informasi yang benar", 400))
}

user.name = name
user.email = email
user.phoneNumber = phoneNumber;

await user.save();

res.status(201).json({
success : true,
user,
})
}
catch(error){
return next(new ErrorHandler(error.message,500))
}
})
)

// update foto profil user
router.put("/update-avatar", isAuthenticated,  catchAsyncErrors(async(req,res,next) => {

  const {avatar} = req.body
try{
const existsUser = await User.findById(req.user.id);

if(req.body.avatar !== ""){
  const imageId = existsUser.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);
  console.log("url lama " ,imageId)

  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {folder : "avatars"})

  existsUser.avatar = {
    public_id : myCloud.public_id,
    url : myCloud.secure_url
  }

  console.log("url baru : ", existsUser.avatar)

  await existsUser.save();

  res.status(200).json({
    success : true,
    user : existsUser,
  });


}


 
}
catch(error){
return next(new ErrorHandler(error,400))
}
}))


//update user address
router.put("/update/-user-addresses", isAuthenticated, catchAsyncErrors(async(req,res,next) => {
try{
const user = await User.findById(req.user.id);
const sameTypeAddress = user.addresses.find((address) => address.addressType ===  req.body.addressType)
if(sameTypeAddress){
return next(new ErrorHandler(`${req.body.addressType} sudah ada` ))
}
const existAddress = user.addresses.find(address => address._id === req.body._id)

if(existAddress){
Object.assign(existAddress, req.body)
}else{
user.addresses.push(req.body)
}

await user.save();

res.status(200).json({
success : true,
user
})

}
catch(error){
return next(new ErrorHandler(error,400))
}
}))


//delete user address 
router.delete('/delete-user-address/:id', isAuthenticated, catchAsyncErrors(async(req,res,next) => {
try{
console.log("OK MASUK")
const userId = req.user.id

const addressId = req.params.id

await User.updateOne({
_id : userId
},{$pull : {addresses : {_id : addressId}}})

const user = await User.findById(userId)

res.status(201).json({
success : true,
user
})
}








catch(error){
return next(new ErrorHandler(error,400))
}
}))


//update password user
router.put('/update-password', isAuthenticated , async (req,res,next) => {
try{
const user = await User.findById(req.user.id).select("+password");

const isPasswordMatch = await user.comparePassword(req.body.oldPassword)


if(!isPasswordMatch){
res.status(404).json({
  message : "Pasword lama yang kamu masukkan salah"
})
return next(new ErrorHandler("Password yang kamu masukkan salah"))
};

if(req.body.newPassword !== req.body.confirmPassword){
res.status(404).json({
  message : "Konfirmasi passwordmu tidak sesuai"
})
return next(new ErrorHandler("Password baru yang kamu masukkan tidak sesuai dengan password yang kamu konfirmasikan"))
}

user.password = req.body.newPassword;

await user.save();

res.status(201).json({
success : true,
message : "Selamat, password telah berhasil untuk digantikan"
})
}catch(error){
return next(new ErrorHandler(error,400))
}
})

//cari informasi user
router.get("/user-info/:id", catchAsyncErrors(async(req,res,next) => {
try{
const user= await User.findById(req.params.id)

res.status(201).json({
success : true,
user
})
} 
catch(error){
return next(new ErrorHandler(error,400))
}
}))





module.exports = router;