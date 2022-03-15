



var mongoose = require('mongoose');

var excelSchema = new mongoose.Schema({
    Order_No: {
        type: String
    },
    ContLP_No: {
        type: String
    },
    CONS_ID: {
        type: String
    },
    SEQ_NO: {
        type: Number
    },
    total_Carton: {
        type: Number
    },
    Coruier: {
        type: String
    },
    Pck_Weight_in_KG: {
        type: Number
    },
    Mode: {
        type: String
    },
    Pin_Code: {
        type: Number
    },
    process: {
        type: Boolean,
        default: false
    },
    awbs: {
        type: Array
    },
    package_numbers: {
        type: Array,

    },
    total_boxes: {
        type: Number,
    }


},
    { timestamps: true }
);

module.exports = mongoose.model('datamodel', excelSchema); 