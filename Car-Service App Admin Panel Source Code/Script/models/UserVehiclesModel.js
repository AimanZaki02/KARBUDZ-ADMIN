const mongoose = require("mongoose");
const UserVehiclesSchema = new mongoose.Schema ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    vehicle_name:{
        type:String,
        required:true,
        trim:true
    },
    vehicle_number:{
        type:String,
        required:true,
        trim:true
    },
    vehicleTypeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleType'
    },
    is_default:{
        type:Boolean,
        default:true
    },
},
{ timestamps: true });
module.exports = mongoose.model('UserVehicle',UserVehiclesSchema);
