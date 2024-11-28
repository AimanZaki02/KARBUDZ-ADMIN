const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email:{
        type: String
    },
});

// Address Schema
const addressSchema = new mongoose.Schema({
    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAddress',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    vehicleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserVehicle',
        required: true
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
        ref: 'Service',
        required: true
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

// Package Schema
const packageSchema = new mongoose.Schema({
    packageId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

// Vehicle Booking Schema
const VehicleBookingSchema = new mongoose.Schema ({
    orderNo:{
        type:String,
        required:true
    },
    user:{
        type:userSchema,
        required:true
    },
    address:{
        type:addressSchema,
        required:true
    },
    vehicle:{
        type:vehicleSchema,
        required:true
    },
    service:{
        type:serviceSchema,
        required:true
    },
    package:{
        type:packageSchema,
        required:true
    },
    bookingDate:{
        type:String,
        required:true,
        trim:true
    },
    bookingTime:{
        type:String,
        required:true,
        trim:true
    },
    paymentMode: {
        type: String,
        required: true,
        trim:true
    },
    transactionId: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true,
        trim:true
    },
    orderStatus:{
        type: String,
        required: true,
        trim:true
    },
    subTotal:{
        type:Number,
        required:true
    },
    coupon_code:{
        type:String
    },
    coupon_type:{
        type:String
    },
    coupon_amount:{
        type:Number
    },
    VAT:{
        type:Number,
        required:true
    },
    Total:{
        type:Number,
        required:true
    }
},
{ timestamps: true });

module.exports = mongoose.model('VehicleBooking',VehicleBookingSchema);



