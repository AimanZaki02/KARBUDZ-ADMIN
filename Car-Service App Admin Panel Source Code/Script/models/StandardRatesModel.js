const mongoose = require("mongoose");
const StandardRateSchema = new mongoose.Schema ({
    
    tax_name:{
        type: String,
        required: true
    },
    country_code:{
        type: String,
        required: true
    },
    tax_rate:{
        type: String,
        required: true
    },
    
},

{ timestamps: true });

module.exports = mongoose.model('StandardRate',StandardRateSchema);