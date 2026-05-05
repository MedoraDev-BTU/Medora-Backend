const User = require('../models/user');
const bcrypt = require("bcryptjs");
const asyncErrorWrapper = require('express-async-handler');

// Kullanıcı kayıt işlemi
const register = asyncErrorWrapper(async (req, res, next) => {
    const {
        ad_soyad,
        eposta,
        sifre_hash,
        telefon,
        sehir,
        ilce
    } = req.body;

    // Kullanıcı kayıt olurken bütün bilgileri eksiksiz olarak girdi mi?
     if (!ad_soyad || !eposta || !sifre_hash || !telefon || !sehir || !ilce) {
        return res.status(400).json({
            success: false,
            message: "Lütfen gerekli alanları doldurunuz"
        });
    }

    const existingUser = await User.findOne({ eposta });
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"Bu e-posta hesabı kullanılıyor..."
        })
    }
    const salt = await bcrypt.genSalt(10); //sifre aynı olsa bile farklı hash şifresi oluşur 
    const hashedPassword = await bcrypt.hash(sifre_hash,salt) 

    const user = await User.create({
        ad_soyad,
        eposta,
        sifre_hash: hashedPassword,
        telefon,
        sehir,
        ilce
    });

    res.status(201).json({
        success: true,
        message: "Kullanıcı başarıyla oluşturuldu",
        data: user
    });
});

module.exports = {
    register
};

/*
const login=asyncErrorWrapper(async(req,res,next)=>{
    const {email,password}=req.body;
    if (!email || !password) {
       return next(new CustomError("Please provide email and password", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next (new CustomError("User not found"),400);
    }
    if(!comparePassword(password,user.password)){
        return next(new CustomError("Please check your password"),400); 
    }
    sendJwtToClient(user, res);
});

const logout=asyncErrorWrapper(async(req,res,next)=>{
    const {NODE_ENV}=process.env;

    return res.status(200)
    .cookie("access_token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
        secure:NODE_ENV === "development"?false:true
    }).json({
        success:true,
        message:"Logout Successfull"
    });

});

const getUser=(req,res,next)=>{ //loggedinprofile
    res.json({
        success:true,
        data:{
            id:req.user.id,
            name:req.user.name
        }
    })
};

const imageUpload=asyncErrorWrapper (async(req,res,next)=>{
    const user=await User.findByIdAndUpdate(req.user.id,{
        "profile_image":req.savedProfileImage
    },{
        new:true,
        runValidators:true
    });
    res.status(200)
    .json({
        success:true,
        message:"image is upload",
        data:user
    })
});

const forgotPassword=asyncErrorWrapper(async(req,res,next)=>{

    const resetEmail=req.body.email;
    console.log(req.body.email);
    const user=await User.findOne({email:resetEmail});

    if(!user){
        return next(new CustomError("There is no user with that email"),400);
    }

    const resetPasswordToken=user.getResetPasswordTokenFromUser();
    await user.save();

    const resetPasswordUrl=`http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${resetPasswordToken}`;
    const emailTemplate=`
    <h3>Reset Your Password</h3>
    <p>This <a href='${resetPasswordUrl}' target='_blank' >link</a> will expire in 1 hour </p> 
    `;

    try{
        await sendEmail({
            from:process.env.SMTP_USER,
            to:resetEmail,
            subject:"Reset Your Password",
            html:emailTemplate
        });
        return res
        .status(200)
        .json({
            success:true,
            html:emailTemplate,
            message:"Token Sent To Your Email"
        });
    }
    catch(err){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        return next(new CustomError("Email Could Not Be Send"),500);  
    }
})

const resetPassword= asyncErrorWrapper(async(req,res,next)=>{
    const {resetPasswordToken}=req.query;
    const {password}=req.body;

    if(!resetPasswordToken){
        return next(new CustomError("Please provide a valid token",400));
    }
    let user=await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}   //expire degeri su andan buyukse kontrolunu yapar
    });
    if(!user){
        return next(new CustomError("Invalid Token or Session Expired",400));
    }

    user.password=password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();
    return res
    .status(200)
    .json({
        success:true,
        message:"Reset Password Process Successful "
    });
     
});

const editDetails=asyncErrorWrapper(async(req,res,next)=>{
    const editInformation=req.body;
    const userId=await User.findById(req.user.id);
    if(userId.role==="user" && editInformation.hasOwnProperty("role")){
         if (editInformation.role) { //body kisminda rol degistirilemez
            return next(new CustomError("You are not authorized to change role", 403));
    }}
    const user=await User.findByIdAndUpdate(req.user.id,editInformation,{
        new:true,
        runValidators:true
    });
    return res
    .status(200)
    .json({
        success:true,
        data:user
    });
});

module.exports={
    register,
    login,
    logout,
    getUser,
    imageUpload,
    forgotPassword,
    resetPassword,
    editDetails
}; */