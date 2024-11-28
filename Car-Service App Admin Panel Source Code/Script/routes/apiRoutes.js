const express = require("express");
const api_route = express.Router();
const apiController = require("../controllers/APIController");
const passportJwt = require('../config/passport');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const path = require('path');

// Multer for file upload
const multer = require("multer");
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});

const upload = multer({ storage: storage });

// User Registration API
api_route.post('/verify_registered_user', apiController.VerifyRegisteredUser);
api_route.post('/sign_up', apiController.SignUp);
api_route.post('/otp_verification', apiController.OTPVerification);
api_route.post('/verify_user', apiController.VerifyUser);
api_route.post('/resend_otp', apiController.ResendOTP);

// User Login API
api_route.post('/sign_in', apiController.SignIn);
api_route.post('/delete_user',passport.authenticate('jwt', { session: false }),apiController.DeleteUser);
api_route.post('/signout',passport.authenticate('jwt', { session: false }),apiController.signOut);

// User Forgot Password
api_route.post('/forgot_password', apiController.ForgotPassword );
api_route.post('/reset_password_verification', apiController.ResetPasswordVerification);
api_route.post('/reset_password', apiController.ResetPassword);

// Edit User Profile , Change Password
api_route.post('/get_user',passport.authenticate('jwt', { session: false }),apiController.GetUser);
api_route.post('/edit_user', passport.authenticate('jwt', { session: false }),upload.single('image'), apiController.EditUser);
api_route.post('/change_password', passport.authenticate('jwt', { session: false }),apiController.ChangePassword);

// User Address API
api_route.post('/add_address',passport.authenticate('jwt', { session: false }), apiController.AddAddress);
api_route.post('/edit_address',passport.authenticate('jwt', { session: false }), apiController.EditAddress);
api_route.post('/delete_address',passport.authenticate('jwt', { session: false }), apiController.DeleteAddress);
api_route.post('/set_default_address',passport.authenticate('jwt', { session: false }), apiController.SetDefaultAddress);
api_route.post('/get_address',passport.authenticate('jwt', { session: false }), apiController.GetAddress);

// Upload Image
api_route.post('/upload_image', passport.authenticate('jwt', { session: false }),upload.single('image'), apiController.UploadImage);

// Intro's API
api_route.post('/intros', apiController.GetIntro);

// Time Slot's API
api_route.post('/time_slots', apiController.GetTimeSlot);

// Vehicle Type's API
api_route.post('/vehicle_types', apiController.GetVehicleType);

// Service's API
api_route.post('/services', apiController.GetService);

// Package's API
api_route.post('/packages', apiController.GetAllPackages);
api_route.post('/packages_by_service', apiController.GetPackage);
api_route.post('/package_details', apiController.GetPackageDetails);
api_route.post('/search_package', apiController.SearchPackage);

// Banner's API
api_route.post('/banners', apiController.GetBanner);
api_route.post('/banners_by_service', apiController.GetBannerByService);

// User vehicle's API
api_route.post('/add_vehicle',passport.authenticate('jwt', { session: false }), apiController.AddVehicle);
api_route.post('/edit_vehicle',passport.authenticate('jwt', { session: false }), apiController.EditVehicle);
api_route.post('/delete_vehicle',passport.authenticate('jwt', { session: false }), apiController.DeleteVehicle);
api_route.post('/set_default_vehicle',passport.authenticate('jwt', { session: false }), apiController.SetDefaultVehicle);
api_route.post('/get_vehicle_list',passport.authenticate('jwt', { session: false }), apiController.VehicleList);

// Book Vehicle Service API
api_route.post('/available_slots',passport.authenticate('jwt', { session: false }), apiController.GetAvailableSlots);
api_route.post('/book_vehicle',passport.authenticate('jwt', { session: false }), apiController.BookVehicle);
api_route.post('/booked_details',passport.authenticate('jwt', { session: false }), apiController.GetBookingDetails);
api_route.post('/ongoing_orders',passport.authenticate('jwt', { session: false }), apiController.OngoingOrders);
api_route.post('/completed_orders',passport.authenticate('jwt', { session: false }), apiController.CompletedOrders);
api_route.post('/cancelled_orders',passport.authenticate('jwt', { session: false }), apiController.CancelledOrders);

// Cancel Order API
api_route.post('/cancel_order',passport.authenticate('jwt', { session: false }), apiController.CancelOrder);

// Refunded Order API
api_route.post('/refunded_order',passport.authenticate('jwt', { session: false }), apiController.RefundOrder);

// Currency, Pages & Payment API's
api_route.post('/currency', apiController.GetCurrency);
api_route.post('/pages',apiController.GetPages);
api_route.post('/payment_gateway',passport.authenticate('jwt', { session: false }),apiController.PaymentMethod);

// Standard rate API 
api_route.post('/standard_rate', apiController.GetStandardRate);

// Coupon API
api_route.post('/coupon', apiController.GetCouponCode);
api_route.post('/apply_coupon',passport.authenticate('jwt', { session: false }), apiController.ApplyCoupon);

// Review API
api_route.post('/add_review',passport.authenticate('jwt', { session: false }), apiController.AddReview);
api_route.post('/get_review',passport.authenticate('jwt', { session: false }), apiController.GetReview);

module.exports = api_route;