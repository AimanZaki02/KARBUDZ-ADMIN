const fs = require("fs");
const path = require('path');
const images = path.join(__dirname, '../uploads/images/');

// Delete image
module.exports.deleteImage = async (imageName) => {
    try {
        if (fs.existsSync(images + imageName)) {
            fs.unlinkSync(images + imageName);
            console.log('Image deleted successfully.');
        }
    } catch (error) {
        console.log('Error deleting image:', error.message);
    }
}
