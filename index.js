require("dotenv").config()
const express = require('express')
var app = express()
var bodyparser = require('body-parser')
var cors = require('cors')
var mongoose = require('mongoose')
app.use(bodyparser.json());
app.use(cors())
app.use(bodyparser.urlencoded({ extended: true }))

const carrierModel = require("./models/carrier")
const dataModel = require("./models/datamodels")


const xlsx = require('xlsx');

const multer = require('multer')
const upload = multer()

mongoose.connect("mongodb+srv://sandeep:sandeep@cluster0.dmtcf.mongodb.net/carton_print?authSource=admin&replicaSet=atlas-pz3gqc-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true", { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
    try {
        console.log("connected to db ")
    }
    catch (e) {
        console.log(err)
    }

})

app.get("/", (req, res) => {
    res.send("api running ......")
})


app.post("/upload", upload.single('file'), (req, res) => {
    // console.log("req.file:", req.file)
    const wb = xlsx.readFile(req.file.originalname)
    const ws = wb.Sheets["Sheet1"]
    const data = xlsx.utils.sheet_to_json(ws)


    dataModel.insertMany(data, (error, resp) => {
        if (error) throw error;
        // console.log(resp)
    })
    res.send(data)
    // console.log(wb.Sheets)
})


app.get("/get", async (req, res) => {

    try {
        const dat = await dataModel.find({});
        // console.log(dat)
        res.send(dat)
    } catch (e) {
        console.log(e)
    }

})

app.post('/post', async (req, res) => {
    try {
        const data = await carrierModel.create(req.body)
        if (data) {
            res.status(200).send(data)
        }
    }
    catch (e) {
        console.log(e)
    }
})

app.post('/allocate', async (request, response) => {
    try {
        const groupedData = await dataModel.aggregate(
            [{ $group: { _id: "$CONS_ID", count: { $sum: { $cond: [{ $eq: ["$process", false] }, 1, 0] } } } }]
        );

        console.log(groupedData)
        const carrierData = await carrierModel.find()
        // console.log(carrierData)

        const data = await dataModel.find({ process: false })


        carrierData.map(async (cd) => {


            groupedData.map(async (index) => {
                if (index.count !== 0) {

                    var Popedawbs = cd.awbs.shift()
                    await dataModel.updateMany({ "CONS_ID": index._id }, { $set: { total_boxes: index.count }, $push: { awbs: Popedawbs } })
                    // await dataModel.updateMany({ "CONS_ID": index._id }, { total_boxes: index.count })

                    await carrierModel.updateMany({ $pop: { awbs: -1 }, $push: { used: Popedawbs } })
                    // await carrierModel.updateMany({ $push: { used: Popedawbs } })
                    console.log("popedAWBS :", Popedawbs)
                }
            })


            data.map(async (i) => {

                var popData = cd.package_numbers.shift()
                // await carrierModel.updateMany({ $push: { used: popData } })
                await dataModel.updateMany({ "ContLP_No": i.ContLP_No }, { $push: { package_numbers: popData }, $set: { process: true } })
                // await dataModel.updateMany({ "ContLP_No": i.ContLP_No }, { process: true })
                await carrierModel.updateMany({ $pop: { package_numbers: -1 }, $push: { used: popData } })

                await carrierModel.updateOne({ unUsed_awbs: cd.awbs.length })
                console.log(cd.awbs.length)
                console.log(`ContLP_No : ${i.ContLP_No}, CONS_ID : ${i.CONS_ID}, poped value : ${popData},`)

            })


        })

        response.send("ok")

    }
    catch (e) {
        console.log(e)
    }
})


app.get('/update', async (req, res) => {
    try {
        // will return data with process = false and count of CONS_ID
        const data = await dataModel.aggregate(
            [{ $group: { _id: "$CONS_ID", count: { $sum: { $cond: [{ $eq: ["$process", false] }, 1, 0] } } } }]
        );
        // console.log(data)

        const userData = await dataModel.find({ process: false })



        const carrierData = await carrierModel.find()
        console.log(carrierData)

        // carrierData.map(async (i) => {
        //     console.log(i.used)
        //     const slicedData = i.awbs.slice(0, 3)

        //     slicedData.map(async (index) => {
        //         await carrierModel.updateMany({ $push: { used: index } })
        //         await dataModel.updateMany({ $push: { awbs: index } })
        //         await carrierModel.updateMany({ $pop: { awbs: -1 } })

        //     })
        //     console.log("sliced Data : ", slicedData)
        // })


        data.map(async (i) => {
            carrierData.map(async (cd) => {
                const slicedData = cd.awbs.slice(0, i.count)
                console.log("slicedata", slicedData, i.count, i._id)
                slicedData.map(async (sd) => {
                    console.log(sd)

                    await carrierModel.updateMany({ $push: { used: sd } })
                    await dataModel.updateMany({ "CONS_ID": i._id }, { $push: { awbs: sd } })
                    await dataModel.updateMany({ process: true })
                    await carrierModel.updateMany({ $pop: { awbs: -1 } })
                })
                for (var x = 0; x < i.count; x++) {
                    var poped = slicedData.shift()
                    var popd = cd.awbs.shift()
                    console.log("poped data", poped, popd)
                }


            })
        })

    }
    catch (e) {
        console.log(e)
    }
})


app.listen(8080, function () {
    console.log("server started on port", process.env.PORT)
})


// 1) can we store 2 awbs number for the same dealer.
// 2) if the user adds the same excel file twice do we need to restrict them.
// 3) at which point i should stop user to upload
// 4) pack_no , awbs in datamodel should be array or only single number

// if user upload diff excel and have  same dealer should we take a new awbs and allocate or previous one

