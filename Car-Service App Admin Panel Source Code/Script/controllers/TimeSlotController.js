const Admin = require("../models/AdminModel");
const TimeSlot = require("../models/TimeSlotModel");
const functions = require("../functions/deleteImage");

// Load time slot page
module.exports.loadTimeSlot = async (req, res) => {
    try {
        const timeSlot = await TimeSlot.findOne({});
        res.render("TimeSlot", { timeSlot });
    } catch (error) {
        console.error(error);
    }
};


// Add time slot
module.exports.addTimeslot = async (req, res) => {
    try {
        let loginData = await Admin.find({});
        for (let i in loginData) {
            if (String(loginData[i]._id) === req.session.user_id) {
                if (loginData[i].is_admin == 1) {
                    // Check if time slot already exists
                    const findSlot = await TimeSlot.find({});
                        if (findSlot.length > 0) {
                            const slotData = await TimeSlot.findOneAndUpdate({
                            slot_duration: req.body.slot_duration,
                            working_days: req.body.working_days,
                            timings: req.body.opening_closing_time,
                            week_off_days: req.body.week_off_days
                        });
                            const saveslotData = await slotData.save();
                            if (saveslotData) {
                                res.redirect('back');
                            }
                            else {
                                res.render('TimeSlot', { message: 'Time Slot not Added..!!' });
                            }
                        } else {
                            // If time slot does not exist
                            const slotData = new TimeSlot({
                                slot_duration: req.body.slot_duration,
                                working_days: req.body.working_days,
                                timings: req.body.opening_closing_time,
                                week_off_days: req.body.week_off_days
                            });
                                const saveslotData = await slotData.save();
                                if (saveslotData) {
                                    res.redirect('back');
                                }
                                else {
                                    res.render('TimeSlot', { message: 'Time Slot not Added..!!' });
                                }
                        }
                }   else   {
                    req.flash('error', 'You have no access to add time slot , You are not super admin !! *');
                    return res.redirect('back');
                }
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}