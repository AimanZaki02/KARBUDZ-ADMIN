const mongoose = require("mongoose");
const vehicleTypeSchema = new mongoose.Schema ({
    vehicle_type:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    is_active:{
        type:Number,
        default:0
    }
},
{ timestamps: true });
module.exports = mongoose.model('VehicleType',vehicleTypeSchema);
