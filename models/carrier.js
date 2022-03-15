var mongoose = require("mongoose")

var carrier = new mongoose.Schema({
    carrier: {
        type: String
    },
    awbs: {
        type: Array
    },
    package_numbers: {
        type: Array
    },
    used: {
        type: Array
    },
    service_type: {
        type: String
    },
    unUsed_awbs: {
        type: Number
    }

})
module.exports = mongoose.model("carrier", carrier)