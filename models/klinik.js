const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const { type } = require("os");


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
    olusturma_tarihi:{
        type:Date,
        default:Date.now
    }
    
})
module.exports=mongoose.model("klinik",klinikSchema);