const axios = require("axios");
const moment = require("moment");
const mongoose = require("mongoose");
const schedule = require("node-schedule");

let url = ''; //Enter the api url for fetching the price.

async function main() {
  await mongoose.connect("mongodb://localhost:27017/pineapple");
}
main().catch((err) => console.log(err));

const priceSchema = new mongoose.Schema({
  tdate: Date,
  year: String,
  month: String,
  ripe: String,
  green: String,
  special_green: String,
});
const Price = mongoose.model("Price", priceSchema);

let limit = 30;
let i = 0;
function getPineappleData(tdate) {
  
  if(url == '') {
    console.log("Please enter the url")
    return;
  }
  axios
    .post(url, {
      start: tdate,
    })
    .then((res) => {
      console.log(tdate);
      console.log(res.data);
      let year = moment(tdate, "YYYY-MM-DD").year();
      let month = moment(tdate, "YYYY-MM-DD").month();
      const pine = new Price({
        tdate: tdate,
        year: year,
        month: month + 1,
        ripe: res.data.result.ripe,
        green: res.data.result.green,
        special_green: res.data.result.special_green,
      });
      pine.save();
      i++;
      if (i < limit) {
        // getPineappleData(tmrw);
        setTimeout(() => {
          let tmrw = moment(tdate, "YYYY-MM-DD")
            .add(1, "days")
            .format("YYYY-MM-DD");
          getPineappleData(tmrw);
        }, 2000);
      } else {
        took = process.hrtime(before);
        console.log("Total time took for " + i + " records: " + took);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

async function startScript() {
  before = process.hrtime();
  i = 0;
  const maxD = await Price.find({})
    .sort({ tdate: -1 })
    .limit(1)
    .then((price) => {
      let max;
      if (price.length > 0) max = price[0].tdate;
      else max = moment("2006-02-01", "YYYY-MM-DD");
      return max;
    });
  let startD = moment(maxD, "YYYY-MM-DD").add(1, "days").format("YYYY-MM-DD");
  getPineappleData(startD);
}
startScript();
const job = schedule.scheduleJob("*/3 * * * *", function (fireDate) {
  console.log("Cron initiated " + fireDate);
  startScript();
});

