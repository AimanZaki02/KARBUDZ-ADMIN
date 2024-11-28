const mongoose = require("mongoose");

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    vehicleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserVehicle'
    },
    vehicle_name: {
        type: String,
        required: true
    },
    vehicle_number: {
        type: String,
        required: true
    }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
    serviceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

// Slot Booking Schema
const slotBookingSchema = new mongoose.Schema ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookingId:{
        type: mongoose.Schema.Types.ObjectId,
        required: 'VehicleBooking'
    },
    vehicle:{
        type:vehicleSchema,
        required:true
    },
    service:{
        type:serviceSchema,
        required:true
    },
    bookingDate:{
        type:String,
        required:true
    },
    bookingTime:{
        type:String,
        required:true
    }
},

{ timestamps: true });

module.exports = mongoose.model('SlotBooking',slotBookingSchema);
