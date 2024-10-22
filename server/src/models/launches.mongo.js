const mongoose = require("mongoose")

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    mission: {
        type: String,
        required: true
    },
    rocket: {
        type: String,
        required: true
    },
    launchDate: {
        type: Date,
        required: true
    },
    target: {
        // type: mongoose.ObjectId,
        // ref: 'Planet'
        type: String,
        // required: true
    },
    customers: [String],
    upcoming: {
        type: Boolean,
        required: true,
        default: true
    },
    success: {
        type: Boolean,
        required: true,
        default: true
    }
})


module.exports = mongoose.model('Launch', launchesSchema) // The first is collection name. Mongo will take it in lower case then make it plural and talk to collection with lowercase plural name. In this case launches
// For the above, this statement is called compiling the model