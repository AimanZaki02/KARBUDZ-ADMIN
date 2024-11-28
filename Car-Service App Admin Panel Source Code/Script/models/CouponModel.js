const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema ({
    
    name:{
        type:String,
        required:true
    },
    coupon_code:{
        type:String,
        required:true
    },
    coupon_type:{
        type:String,
        required:true
    },
    coupon_amount:{
        type:Number,
        required:true
    },
    start_date:{
        type:String,
        required:true
    },
    expiry_date:{
        type:String,
        required:true
    },
    minimum_spend:{
        type:Number,
    },
    maximum_spend:{
        type:Number,
    },
    usage_limit_per_coupon:{
        type:Number,
    },
    usage_limit_per_user:{
        type:Number,
        required:true
    },

    
},

{ timestamps: true });

module.exports = mongoose.model('Coupon',couponSchema);