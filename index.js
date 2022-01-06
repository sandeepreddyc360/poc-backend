const express = require("express")
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const app = express();
var cors = require('cors')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

const dataModel = require("./models/models")

mongoose.connect("mongodb://localhost:27017/excel", { useNewUrlParser: true, useUnifiedTopology: true }).then(
    (res) => {
        console.log("Connected to database");
    },
    (err) => {
        console.log("Unable to connect to database: ", err)
    }
)


app.get("/",(req,res)=>{
    res.send("api running ......")
})

const xlsx = require('xlsx');

const multer = require('multer')
const upload = multer()



// app.post("/upload", upload.single("file"), async function(req, res, next) {
//     console.log("File:", req.file)
//     res.send(req.file)
//   });

app.post("/upload", upload.single('file'), (req, res) => {
    console.log("req.file:", req.file)
    const wb = xlsx.readFile(req.file.originalname)
    const ws = wb.Sheets["Sheet1"]
    const data = xlsx.utils.sheet_to_json(ws)


    dataModel.insertMany(data, (error, resp) => {
        if (error) throw error;
        console.log(resp)
    })
    res.send(data)
    console.log(wb.Sheets)
})

app.get("/get", async (req, res) => {
    const dat = await dataModel.find({});
    // console.log(dat)
    res.send(dat)
})




app.listen(3000, function () {
    console.log('listening on 3000')
})
