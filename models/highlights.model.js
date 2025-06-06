const mongoose = require("mongoose")

const highlightSchema = mongoose.Schema({


    stories : {
       type : Array,
       default : []
    },

     coverphoto : {
        type : String,
        required : [true, "Cover photo is required for creating a Highlights"],

     },

     title : {
        type : String,
        required : [true, "Title is required for creating a Highlights"]
     },

     user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : `user`
     },
     createdAt: {
        type: Date,
        default: Date.now(),
    }

}, {versionKey : false, timeStamps : true})


module.exports = mongoose.model("highlights", highlightSchema)




