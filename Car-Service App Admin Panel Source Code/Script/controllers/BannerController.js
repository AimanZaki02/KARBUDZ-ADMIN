const functions = require("../functions/deleteImage");
const Banner = require("../models/BannerModel");
const Service = require("../models/ServiceModel");
const Admin = require("../models/AdminModel");

// Load Banner Page
module.exports.loadBanner = async (req, res) => {
    try {
        const service = await Service.find({});
        res.render('addBanner', { service : service});
    } catch (error) {
        console.log(error.message);
    }
}

// Add Banner
module.exports.addBanner = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                const bannerData = new Banner({
                    title: req.body.title,
                    image:req.file.filename,
                    serviceId: req.body.serviceId,
                    is_active: req.body.is_active ? 1 : 0
                });
                const saveBanner = await bannerData.save();
                    res.redirect('/view-banner');
                }
            else {
                req.flash('error', 'You have no access to add banner , You are not super admin !! *');
                return res.redirect('back');
            }
        }
    }
    
    } catch (error) {
        console.log(error.message);
    }
}

// View Banner
module.exports.viewBanner = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const allService = await Service.find({});
        const allBanner = await Banner.find({}).populate('serviceId').sort({updatedAt: -1});
        if (allBanner) {
            res.render('viewBanner', { banners: allBanner, loginData:loginData, service: allService});
        }
        else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Edit Banner
module.exports.editBanner = async (req, res) => {
    try {
        const id = req.query.id;
        const bannerData = await Banner.findById({ _id: id }).populate('serviceId');
        const serviceData = await Service.find();
        if (bannerData && serviceData) {
            res.render('editBanner', { banner: bannerData, service: serviceData  });
        }
        else {
            res.render('editBanner', { message: 'Banner Not Added' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Update Banner
module.exports.UpdateBanner = async(req,res)=>{
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const id = req.body.id;
                        const banner = await Banner.findById({_id: id});
                        banner.title = req.body.title;
                        banner.serviceId = req.body.serviceId;
                        if(req.file){
                            await functions.deleteImage(banner.image);
                            banner.image = req.file.filename;
                        }
                        await banner.save();
                        res.redirect('/view-banner');
                        return;
                }
                else {
                    req.flash('error', 'You have no access to edit banner , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Delete Banner
module.exports.deleteBanner = async(req,res)=>{
    try {
        const id = req.query.id;
        const banner = await Banner.findById(req.query.id);
        if (banner) {
            await functions.deleteImage(banner.image);
        }
        const delBanner = await Banner.deleteOne({ _id: id });
        res.redirect('/view-banner');
    } catch (error) {
        console.log(error.message);
    }
}

// Active Status
module.exports.activeStatus = async(req,res)=>{
    try {
        const { id } = req.params;
        const status = await Banner.findById(id);
        const is_active = req.body.is_active ? req.body.is_active : "false";
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_active = !status.is_active;
        console.log(status.is_active);
        await status.save();
        res.redirect('/view-banner');

    } catch (err) {
        console.error(err);
        res.sendStatus(500);

    }
}
