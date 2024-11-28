const Package = require("../models/PackageModel");
const Service = require("../models/ServiceModel");
const Admin = require("../models/AdminModel");
const functions = require("../functions/deleteImage");
const path = require('path');

// Load Package
module.exports.loadPackage = async (req, res) => {
    try {
        const id = req.query.id;
        const editpackage = await Service.findById({ _id: id });
        res.render('addPackages', { editpackage: editpackage,id:id });
    } catch (error) {
        console.log(error.message);
    }
}

// Add Package
module.exports.addPackage = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const PackageData = new Package({
                        title: req.body.title,
                        image: req.files.find(file => file.fieldname === 'image') ? req.files.find(file => file.fieldname === 'image').filename : null,
                        //image:req.file.filename,
                        price: req.body.price,
                        description: req.body.description,
                        gallery_images: req.files.filter(file => file.fieldname === 'gallery_images').map(file => file.filename),
                        serviceId: req.body.serviceId,
                        is_active: req.body.is_active == "on" ? 1 : 0 
                    });
                    const savePackage = await PackageData.save();
                    if (savePackage) {
                        res.redirect(`/view-package?id=${PackageData.serviceId}`);
                    }
                    else {
                        res.render('addPackages', { message: 'Package Not Added' });
                    }
                } else {
                    req.flash('error', 'You have no access to add package , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}

// View Package
module.exports.viewPackage = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const id = req.query.id;
        const editData = await Service.findById({ _id: id });
        const allPackages = await Package.find({ serviceId: id }).populate('serviceId');
        if (allPackages) {
            res.render('viewPackages', { package: allPackages, editData: editData,loginData:loginData });
        }
        else {
            console.log(error.message);
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Edit Package
module.exports.editPackage = async (req, res) => {
    try {
        const id = req.query.id;
        const editData = await Package.findById({ _id: id }).populate('serviceId');
        if (editData) {
            res.render('editPackage', { package: editData });
        }
        else {
            res.render('editPackage', { message: 'Package Not Added' });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Update Package
module.exports.UpdatePackage = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const id = req.body.packageId;
                    const serviceId = req.body.serviceId;
                    const packages = await Package.findById({_id:id});
                    packages.title = req.body.title;
                    packages.price= req.body.price,
                    packages.description = req.body.description;
                    if(req.file){
                        await functions.deleteImage(packages.image);
                        packages.image = req.file.filename;
                    }
                    await packages.save();
                    res.redirect(`/view-package?id=${serviceId}`);
            }
            else {
                req.flash('error', 'You have no access to update package , You are not super admin !! *');
                return res.redirect('back');
            }
        }
    }

} catch (error) {
        console.log(error.message);
    }
}

// Active status
module.exports.activeStatus = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const packages = await Package.findById({_id: req.params.id});
                    packages.is_active = packages.is_active == 1 ? 0 : 1;
                    await packages.save();
                    res.redirect("/view-package");
                    return;
                } else {
                    req.flash('error', 'You have no access to change status of Package, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Delete Package
module.exports.deletepacakge = async (req, res) => {
    try {
        const id = req.query.id;
        const packages = await Package.findById(req.query.id);
        if (packages) {
            await functions.deleteImage(packages.image);
        }
        const delPackage = await Package.deleteOne({ _id: id });
        return res.redirect('back');
    } catch (error) {
        console.log(error.message);
    }
}

// View Gallery
module.exports.viewGallery = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    let gallery = await Package.findOne({ _id: req.query.id });
                    res.render("viewGallery", { gallery });
                } else {
                    req.flash('error', 'You have no access to view Gallery Images, You are not super admin !!*');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Edit Gallery
module.exports.editGallery = async (req, res) => {
    try {
        let loginData = await Admin.find({});
            for (let i in loginData) {
                if (String(loginData[i]._id) === req.session.user_id) {
                    if (loginData[i].is_admin == 1) {
                    const id = req.query.id;
                    const img = req.query.img;
                    const oldImg = await Package.findById({ _id: id});
                    res.render('editImage', { oldImg: oldImg, img: img });
                } else {
                    req.flash('error', 'You have no access to edit Gallery Images, You are not super admin !!*');
                    return res.redirect('back');
                }
            }
        }               

    } catch (error) {
        console.log(error.message);
    }
}

// Replace Image
module.exports.replaceImg = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("id", id);
        const oldImg = req.query.img;
        console.log("oldImg", oldImg);
        if (req.file) {
            const newImg = req.file.filename;
            const result = await Package.updateOne(
                { _id: id },
                { $set: { "gallery_images.$[element]": newImg } },
                { arrayFilters: [{ "element": { $eq: oldImg } }] }
            );

            return res.redirect(`/view-package-gallery?id=${id}`);
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Delete Image
module.exports.deleteImage = async (req, res) => {
    try {
        const galimgId = req.query.img;
        const id = req.query.id;
        const result = await Package.findByIdAndUpdate(id, {
            $pull: { gallery_images: galimgId }
        });
        return res.redirect('back');
    } catch (error) {
        console.log(error.message);
    }
}

// Add New Image
module.exports.addNewImage = async (req, res) => {
    try {
        //const galimgId = req.files['gallery_images'].map(file => file.filename);
        const galimgId = req.files.filter(file => file.fieldname === 'gallery_images').map(file => file.filename)
        const id = req.query.id;
        const result = await Package.findByIdAndUpdate(id, {$push: { gallery_images: { $each: galimgId } }});
        return res.redirect('back');
    } catch (error) {
        console.log(error.message);
    }
}