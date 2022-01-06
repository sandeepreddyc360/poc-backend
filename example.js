const xlsx = require('xlsx');
const fs = require("fs");


const wb = xlsx.readFile('./customer.xlsx')

// console.log(wb.SheetNames)

const ws =wb.Sheets["Customers"]
// console.log(ws)
const data=xlsx.utils.sheet_to_json(ws)
console.log(data)