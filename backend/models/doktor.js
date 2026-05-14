const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const { type } = require("os");
const jwt = require("jsonwebtoken");

const dayScheduleSchema = new Schema(
  {
    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    breakStart: {
      type: String,
      required: true,
    },

    breakEnd: {
      type: String,
      required: true,
    },
  },
  { _id: false } //daySchedule için bir id değeri tutulmasına gerek yok burada sadece saat bilgisi alıyoruz...
)

  /*id: string
  ad_soyad: string
  uzmanlik: string
  telefon: string
  eposta: string
  workingDays: string[]
  workingStartTime: string
  workingEndTime: string
  daySchedule?: Record<string, DaySchedule>
  status: DoctorStatus*/


const doktorSchema=new Schema ({
    klinik_id:{
        type:String
    },
    ad_soyad:{
        type:String,
        required:[true,"Please provide a name"]
    },
    uzmanlik:{
        type:String
    },
    telefon:{
        type:String,
        required:[true,"Please provide a telephone number"],
    },
    eposta:{
        type:String,
        required:[true,"please provide a e-mail"],
        unique:true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    olusturma_tarihi:{
        type:Date,
        default:Date.now
    },
      workingDays: [
    {
      type: String,
    },
  ],

  workingStartTime: {
    type: String,
  },

  workingEndTime: {
    type: String,
  },

  daySchedule: {
    type: Map,
    of: dayScheduleSchema,
    default: {},
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  } 
})
module.exports=mongoose.model("doktor",doktorSchema);