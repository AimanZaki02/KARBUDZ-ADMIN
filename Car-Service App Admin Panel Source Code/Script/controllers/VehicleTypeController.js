const Admin = require("../models/AdminModel");
const VehicleType = require("../models/VehicleTypeModel");
const functions = require("../functions/deleteImage");

// Load VehicleType page
module.exports.loadVehicleType = async (req, res) => {
    try {
        res.render("addVehicleType");
    } catch (error) {
        console.error(error);
    }
};

// Add VehicleType
module.exports.addVehicleType = async (req, res) => {
    try {
        // Retrieve admin login data
        let loginData = await Admin.find({});

        for (let i in loginData) {
            // Check if the current user is logged in
            if (String(loginData[i]._id) === req.session.user_id) {
                // Verify if the user is a super admin
                if (loginData[i].is_admin == 1) {
                    // Create a new vehicle type
                    const VehicleTypes = new VehicleType({
                        vehicle_type: req.body.vehicle_type,
                        image: req.file ? req.file.filename : null, // Handle case where image is optional
                        is_active: req.body.is_active === "on" ? 1 : 0 // Convert 'on' checkbox value to boolean
                    });

                    // Save the new vehicle type to the database
                    await VehicleTypes.save();

                    // Redirect to the view page after successful save
                    res.redirect("/view-vehicle-type");
                    return;
                } else {
                    // Flash error message if the user is not a super admin
                    req.flash(
                        "error",
                        "You have no access to add Vehicle Type. You are not a super admin !! *"
                    );
                    return res.redirect("back");
                }
            }
        }

        // If no matching user found in loginData
        req.flash("error", "User session invalid or not found.");
        return res.redirect("back");
    } catch (error) {
        // Handle errors and log them
        console.error(error);
        req.flash("error", "An error occurred while adding the vehicle type.");
        return res.redirect("back");
    }
};

// View VehicleType
module.exports.viewVehicleType = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        const VehicleTypes = await VehicleType.find({}).sort({ updatedAt: -1 });
        if(VehicleTypes){
            res.render("viewVehicleType", { VehicleTypes, loginData });
        }
        else {
            console.log(error.message);
        }   
    } catch (error) {
        console.error(error);
    }
};

// Edit VehicleType
module.exports.editVehicleType = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const vehicles = await VehicleType.findById({_id: req.query.id});
                    res.render("editVehicleType", { vehicles , loginData });
                    return;
                } else {
                    req.flash('error', 'You have no access to edit Vehicle type, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Update VehicleType
module.exports.updateVehicleType = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const VehicleTypes = await VehicleType.findById({_id: req.body.id});
                    VehicleTypes.vehicle_type = req.body.vehicle_type;
                    if(req.file){
                        await functions.deleteImage(VehicleTypes.image);
                        VehicleTypes.image = req.file.filename;
                    }
                    await VehicleTypes.save();
                    res.redirect("/view-vehicle-type");
                    return;
                } else {
                    req.flash('error', 'You have no access to update VehicleType, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Active status
module.exports.activeStatus = async(req,res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    const VehicleTypes = await VehicleType.findById({_id: req.params.id});
                    VehicleTypes.is_active = VehicleTypes.is_active == 1 ? 0 : 1;
                    await VehicleTypes.save();
                    res.redirect("/view-VehicleType");
                } else {
                    req.flash('error', 'You have no access to change status of VehicleType, You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Delete VehicleType
module.exports.deleteVehicleType = async(req,res) => {
    try {
        const VehicleTypes = await VehicleType.findById(req.query.id);
        if (VehicleTypes) {
            await functions.deleteImage(VehicleTypes.image);
        }
        const deleteVehicleType = await VehicleType.deleteOne({_id: req.query.id});
        res.redirect("/view-vehicle-type");
    } catch (error) {
        console.error(error);
    }
}