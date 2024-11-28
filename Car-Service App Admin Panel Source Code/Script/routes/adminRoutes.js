// Initialize express router
const express = require("express");
const admin_route = express();
const notifier = require('node-notifier');

// Load Admin Login Page
const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// Set View Engine
const path = require('path');
admin_route.set('view engine', 'ejs');
admin_route.set('views', [path.join('./', '/views/admin/'), path.join('./', '/views/layouts/')]);

// Public and Uploads Folder for Static Files
admin_route.use(express.static('public'));
admin_route.use(express.static('uploads'));

// multer for file upload
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

// Middleware for Authentication
const auth = require("../middleware/auth");

// Admin Controller and Routes
const AdminController = require("../controllers/AdminController");
admin_route.get('/', auth.isLogout, AdminController.adminLogin);
// Route to create an admin
admin_route.post('/create-admin', async (req, res) => {
  console.log("Received request to /create-admin", req.body);

  const { secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_CREATION_SECRET) {
      console.log("Unauthorized access: Invalid secret key");
      return res.status(403).json({ success: 0, message: "Unauthorized access" });
  }

  await AdminController.createAdmin(req, res);
});


admin_route.get('/login', auth.isLogout, AdminController.adminLogin);
admin_route.post('/login', AdminController.VerifyAdmin);
admin_route.get('/dashboard', auth.isLogin, AdminController.loadDashboard);
admin_route.get('/profile', auth.isLogin, AdminController.adminProfile);
admin_route.post('/profile', upload.single('image'), AdminController.editProfile);
admin_route.get('/change-password', auth.isLogin, AdminController.changePassword);
admin_route.post('/change-password', auth.isLogin, AdminController.resetAdminPassword);
admin_route.get('/users',auth.isLogin,AdminController.viewUsers);
admin_route.post('/users/:id/toggle',AdminController.userStatus);
admin_route.get('/logout', auth.isLogin, AdminController.adminLogout);

// Currency Controller and Routes
const CurrencyController = require("../controllers/CurrencyController");
admin_route.get('/currency',auth.isLogin, CurrencyController.loadCurrency);
admin_route.post('/currency', CurrencyController.addCurrency);

// Intro Controller and Routes
const IntroController = require("../controllers/IntroController");
admin_route.get('/add-intro', auth.isLogin, IntroController.loadIntro);
admin_route.post('/add-intro', upload.single('image'), IntroController.addIntro);
admin_route.get('/view-intro', auth.isLogin, IntroController.viewIntro);
admin_route.get('/edit-intro', auth.isLogin, IntroController.editIntro);
admin_route.post('/edit-intro', upload.single('image'), IntroController.updateIntro);
admin_route.post('/intro-is-active/:id/toggle', IntroController.activeStatus);
admin_route.get('/delete-intro', auth.isLogin, IntroController.deleteIntro);

// Vehicle Type Controller and Routes
const VehicleTypeController = require("../controllers/VehicleTypeController");
admin_route.get('/add-vehicle-type', auth.isLogin, VehicleTypeController.loadVehicleType);
admin_route.post('/add-vehicle-type', upload.single('image'),VehicleTypeController.addVehicleType);
admin_route.get('/view-vehicle-type', auth.isLogin, VehicleTypeController.viewVehicleType);
admin_route.get('/edit-vehicle-type', auth.isLogin, VehicleTypeController.editVehicleType);
admin_route.post('/edit-vehicle-type', upload.single('image'), VehicleTypeController.updateVehicleType);
admin_route.post('/vehicle-type-is-active/:id/toggle', VehicleTypeController.activeStatus);
admin_route.get('/delete-vehicle-type', auth.isLogin, VehicleTypeController.deleteVehicleType);

// Service Controller and Routes
const ServiceController = require("../controllers/ServiceController");
admin_route.get('/add-service', auth.isLogin, ServiceController.serviceLoad);
admin_route.post('/add-service', upload.single('image'), ServiceController.addService);
admin_route.get('/view-service', auth.isLogin, ServiceController.viewService);
admin_route.get('/edit-service', auth.isLogin, ServiceController.editService);
admin_route.post('/edit-service', upload.single('image'), ServiceController.updateService);
admin_route.post('/service-is-active/:id/toggle', ServiceController.activeStatus);
admin_route.get('/delete-service', auth.isLogin, ServiceController.deleteService);

// Gallery Images upload
// var cpUpload = upload.fields([
//   { name: 'image', maxCount: 1 }, 
//   { name: 'gallery_images', maxCount: 30 }
// ]);

// Center Package
const PackageController = require("../controllers/PackageController");
admin_route.get('/add-package',auth.isLogin,PackageController.loadPackage);
admin_route.post('/add-package',upload.any(),PackageController.addPackage);
admin_route.get('/view-package',auth.isLogin,PackageController.viewPackage);
admin_route.get('/edit-package', auth.isLogin,PackageController.editPackage);
admin_route.post('/edit-package', upload.single('image'),PackageController.UpdatePackage);
admin_route.post('/package-is-active/:id/toggle', PackageController.activeStatus);
admin_route.get('/delete-package',auth.isLogin,PackageController.deletepacakge);

// Package Gallery Images
admin_route.get('/view-package-gallery',auth.isLogin,PackageController.viewGallery);
admin_route.get('/edit-image', auth.isLogin, PackageController.editGallery);
admin_route.post('/edit-image',upload.single('image'),PackageController.replaceImg);
admin_route.post('/view-package-gallery',upload.any(),PackageController.addNewImage);
admin_route.get('/delete-image',auth.isLogin,PackageController.deleteImage);

// Banner Controller and Routes
const BannerController = require("../controllers/BannerController");
admin_route.get('/add-banner', auth.isLogin, BannerController.loadBanner);
admin_route.post('/add-banner', upload.single('image'), BannerController.addBanner);
admin_route.get('/view-banner', auth.isLogin, BannerController.viewBanner);
admin_route.get('/edit-banner', auth.isLogin, BannerController.editBanner);
admin_route.post('/edit-banner', upload.single('image'), BannerController.UpdateBanner);
admin_route.post('/banner-is-active/:id/toggle', BannerController.activeStatus);
admin_route.get('/delete-banner', auth.isLogin, BannerController.deleteBanner);

// Coupon Controller and Routes
const CouponController = require("../controllers/CouponController");
admin_route.get('/add-coupon', auth.isLogin, CouponController.loadCoupon);
admin_route.post('/add-coupon', CouponController.addCoupon);
admin_route.get('/view-coupon', auth.isLogin, CouponController.viewCoupon);
admin_route.get('/edit-coupon', auth.isLogin, CouponController.editCoupon);
admin_route.post('/edit-coupon', CouponController.updateCoupon);
admin_route.get('/delete-coupon', auth.isLogin, CouponController.deleteCoupon);

// StandardRate Controller and Routes
// const StandardRateController = require("../controllers/StandardRateController");
// admin_route.get('/standard-rates', auth.isLogin, StandardRateController.loadStandardRate);
// admin_route.post('/standard-rates', StandardRateController.addStandardRate);

// Time Slot Controller and Routes
const TimeSlotController = require("../controllers/TimeSlotController");
admin_route.get('/time-slots', auth.isLogin, TimeSlotController.loadTimeSlot);
admin_route.post('/time-slots', TimeSlotController.addTimeslot);

// SMTP Controller and Routes
const SMTPController = require("../controllers/SMTPController");
admin_route.get('/smtp',auth.isLogin,SMTPController.smtpLoad);
admin_route.post('/smtp',SMTPController.setSMTP);

// Page Controller and Routes
const PageController = require("../controllers/PageController");
admin_route.get('/page',auth.isLogin, PageController.pageLoad);
admin_route.post('/page',auth.isLogin, PageController.addPages);

// Payment Method Routes
const PaymentGatewayController = require("../controllers/PaymentGatewayController");
admin_route.get('/payment-gateway',auth.isLogin,PaymentGatewayController.loadPayment);
admin_route.post('/payment-gateway',PaymentGatewayController.addPaymentMethod);

// Booking Controller and Routes
const BookingController = require("../controllers/BookingController");
admin_route.get('/booking',auth.isLogin,BookingController.loadBooking);
admin_route.get('/edit-booking',auth.isLogin,BookingController.editBooking);
admin_route.post('/edit-booking',upload.single('refunded_screenshot'),BookingController.updateBooking);
admin_route.get('/delete-booking', auth.isLogin, BookingController.deleteBooking);

admin_route.get('*', function (req, res) {
  res.redirect('/');
});

// Export the router
module.exports = admin_route;