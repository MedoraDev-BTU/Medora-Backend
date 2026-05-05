const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const { type } = require("os");


const UserSchema=new Schema ({
    ad_soyad:{
        type:String,
        required:[true,"Please provide a name"]
    },
    eposta:{
        type:String,
        required:[true,"please provide a e-mail"],
        unique:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    sifre_hash:{
        type:String,
        minlength:[6,"Please provide a password with minlength:6"],
        required:[true,"Please provide a password"],
        select:false
    },
    telefon:{
        type:String,
        required:[true,"Please provide a telephone number"],
    },
    sehir:{
        type:String,
        required:[true,"Please provide a city"],
    },
    ilce:{
        type:String,
        required:[true,"Please provide a district"],
    },
    olusturma_tarihi:{
        type:Date,
        default:Date.now
    }
    
})
module.exports=mongoose.model("User",UserSchema);

/*
UserSchema.methods.generateJwtFromUser=function(){
    const{JWT_SECRET_KEY,JWT_EXPIRE}=process.env;
    const payload={
        id:this._id,
        name:this.name
    };

    const token=jwt.sign(payload,JWT_SECRET_KEY,{
        expiresIn:JWT_EXPIRE
    });
    return token;
}

UserSchema.methods.getResetPasswordTokenFromUser=function(){
    const randomHexString=crypto.randomBytes(15).toString("hex");
    const{RESET_PASSWORD_EXPIRE}=process.env;
    const resetPasswordToken=crypto
    .createHash("SHA256")
    .update(randomHexString)
    .digest("hex");

    this.resetPasswordToken=resetPasswordToken;
    this.resetPasswordExpire=Date.now()+ parseInt(RESET_PASSWORD_EXPIRE);

    return resetPasswordToken;
};

UserSchema.pre("save", function(next
) {
    if (this._skipPasswordHash) return next(); //gecici bayragin kullanim yeri
    if(!this.isModified("password")){
        return next(); //kullanici sifre haric baska ozellik degistirdiginde tekrardan kaydedecek bu sekilde tekrardan hashalenmeyi onleyecegiz
    }
    bcrypt.genSalt(10,(err,salt) =>{
        if(err) next(err);
        bcrypt.hash(this.password,salt,(err,hash)=>{
          if(err) next(err); 
          this.password=hash;
          next();
    })
    })
});

UserSchema.post("deleteOne",{document: true, query: false },async function(next){
    await Question.deleteMany({
        user:this._id
    });
});*/


