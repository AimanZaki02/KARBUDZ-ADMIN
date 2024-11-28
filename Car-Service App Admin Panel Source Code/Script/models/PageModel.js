const mongoose = require("mongoose");
const pagesSchema = new mongoose.Schema ({
    
    privacy_policy:{
        type:String,
        required:true
    },
    terms_condition:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    help:{
        type:String,
        required:true
    }
},

{ timestamps: true });

module.exports = mongoose.model('Page', pagesSchema);