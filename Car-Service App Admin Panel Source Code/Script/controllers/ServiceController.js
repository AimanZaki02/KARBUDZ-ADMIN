const functions = require("../functions/deleteImage");
const Service = require("../models/ServiceModel");
const Admin = require("../models/AdminModel");

// Service Load
module.exports.serviceLoad = async(req,res)=>{
    try {
        res.render('addService');
    } catch (error) {
        console.log(error.message);
    }
}

// Add Service
module.exports.addService = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                const serviceData = new Service({
                    name: req.body.name,
                    image:req.file.filename,
                    is_active:req.body.is_active == "on" ? 1 : 0
                });
                const saveservice = await serviceData.save();
                if (saveservice) {
                    res.render('addService', { message: "Service added successfully..!!" });
                }
                else {
                    res.render('addService', { message: "Service not added..!!*" });
                }
            }
            else {
                req.flash('error', 'You have no access to add service , You are not super admin !! *');
                return res.redirect('back');
            }
        }
    }

    } catch (error) {
        console.log(error.message);
    }
}

// View Service
module.exports.viewService = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const services = await Service.find({}).sort({ updatedAt: 1 });
        if(services){
            res.render("viewService", { services, loginData });
        } else {
            console.log(error.message);
        }
    } catch (error) {
        console.error(error);
    }
}

// Edit Service
module.exports.editService = async (req, res) => {
    try {
        const id = req.query.id;
        const editData = await Service.findById({ _id: id });
        if (editData) {
            res.render('editService', { service: editData});
        }
        else {
            res.render('editService', { message: "Service not added..!!*" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

// Update Service
module.exports.updateService = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const service = await Service.findById({_id: req.body.id});
                    service.name = req.body.name;
                    if(req.file){
                        await functions.deleteImage(service.image);
                        service.image = req.file.filename;
                    }
                    await service.save();
                    res.redirect("/view-service");
                    return;
                } else {
                    req.flash('error', 'You have no access to update service, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Active Status
module.exports.activeStatus = async(req,res)=>{
    try {
        const { id } = req.params;
        const status = await Service.findById(id);
        const is_active = req.body.is_active ? req.body.is_active : "false";
        if (!status) {
            return res.sendStatus(404);
        }
        status.is_active = !status.is_active;
        await status.save();
        res.redirect('/view-service');

    } catch (err) {
        res.sendStatus(500);

    }
}

// Delete Service
module.exports.deleteService = async(req,res)=>{
    try {
        const id = req.query.id;
        const currentService = await Service.findById(id);
        if (currentService) {
            await functions.deleteImage(currentService.image);
        }
        const delService = await Service.deleteOne({ _id: id });
        res.redirect('/view-service');
    } catch (error) {
        console.log(error.message);
    }
}
