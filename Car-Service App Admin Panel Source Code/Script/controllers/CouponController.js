const Admin = require("../models/AdminModel"); 
const Coupon =  require("../models/CouponModel");

// Load coupon page
module.exports.loadCoupon = async (req, res) => {
    try {
        res.render('addCoupon');
    } catch (error) {
        console.log(error.message);
    }
}

// Add coupon
module.exports.addCoupon = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const couponData = new Coupon({
                        name: req.body.name,
                        coupon_code: req.body.coupon_code,
                        coupon_type: req.body.coupon_type,
                        coupon_amount: req.body.coupon_amount,
                        start_date: req.body.start_date,
                        expiry_date: req.body.expiry_date,
                        minimum_spend:req.body.minimum_spend,
                        maximum_spend:req.body.maximum_spend,
                        usage_limit_per_coupon:req.body.usage_limit_per_coupon,
                        usage_limit_per_user:req.body.usage_limit_per_user,
                    });
                    const savecoupon = await couponData.save();
                    if (savecoupon) {
                        res.render('addCoupon', { message: "Coupon added successfully..!!" });
                    }
                    else {
                        res.render('addCoupon', { message: "Coupon not added..!!*" });
                    }
                }
                else {
                    req.flash('error', 'You have no access to add coupon , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

// View coupon
module.exports.viewCoupon = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const allCoupon = await Coupon.find({}).sort({ updatedAt: -1 });
        if (allCoupon) {
            res.render('coupon', { coupon: allCoupon, loginData: loginData});
        }
        else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Edit coupon
module.exports.editCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        const editData = await Coupon.findById({ _id: id });
        if (editData) {
            res.render('editCoupon', { coupon: editData });
        }
        else {
            res.render('editCoupon', { message: "coupon not updated..!!*" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Update coupon
module.exports.updateCoupon = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const id = req.body.id;
                    const UpdateData = await Coupon.findByIdAndUpdate({ _id: id },
                        {
                            $set: {
                                name: req.body.name,
                                coupon_code: req.body.coupon_code,
                                coupon_type: req.body.coupon_type,
                                coupon_amount: req.body.coupon_amount,
                                start_date: req.body.start_date,
                                expiry_date: req.body.expiry_date,
                                minimum_spend:req.body.minimum_spend,
                                maximum_spend:req.body.maximum_spend,
                                usage_limit_per_coupon:req.body.usage_limit_per_coupon,
                                usage_limit_per_user:req.body.usage_limit_per_user,
                            }
                        });
                    res.redirect('/view-coupon');
                }
                else {
                    req.flash('error', 'You have no access to edit coupon , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }


    } catch (error) {
        console.log(error.message);
    }
}

// Delete coupon
module.exports.deleteCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        const deleteCoupon = await Coupon.deleteOne({ _id: id });
        res.redirect('/view-coupon');
    } catch (error) {
        console.log(error.message);
    }
}
