const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const { type } = require("os");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const klinikSchema=new Schema ({
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
        select:false  //sifre bilgisi tablolara yansımayacak
    },
    telefon:{
        type:String,
        required:[true,"Please provide a telephone number"],
    },
    adres:{
        type:String,
        required:[true,"Please provide a address"]
    },
    sehir:{
        type:String,
        required:[true,"Please provide a city"],
    },
    ilce:{
        type:String,
        required:[true,"Please provide a district"],
    },
    role:{
        type:String
    },
    olusturma_tarihi:{
        type:Date,
        default:Date.now
    }
    
})

klinikSchema.methods.generateJwtFromKlinik = function(){

    const {JWT_SECRET_KEY, JWT_EXPIRE} = process.env;

    const payload = {
        id: this._id,
        ad_soyad: this.ad_soyad,
        role: this.role
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRE
    });

    return token;
};

klinikSchema.methods.comparePassword = async function(sifre_hash){

    return await bcrypt.compare(sifre_hash, this.sifre_hash);

}
module.exports=mongoose.model("klinik",klinikSchema);