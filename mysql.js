const axios = require('axios');
const moment = require('moment');
const { Sequelize, DataTypes } = require('sequelize');
const schedule = require('node-schedule');

const sequelize = new Sequelize('mysql://jiby:jijo123@localhost:3306/jiby');

let url = 'https://vazhakulampineapple.in/get_data.php'; // Enter the API URL for fetching the price.

async function main() {
  await sequelize.authenticate();
  console.log('Connection to MySQL has been established successfully.');
}
main().catch((err) => console.log(err));

const Price = sequelize.define('Price', {
  tdate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  year: {
    type: DataTypes.STRING,
    allowNull: false
  },
  month: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ripe: {
    type: DataTypes.STRING,
    allowNull: true
  },
  green: {
    type: DataTypes.STRING,
    allowNull: true
  },
  special_green: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

let limit = 30;
let i = 0;

function getPineappleData(tdate) {
  if (url === '') {
    console.log('Please enter the URL');
    return;
  }
  axios
    .post(url, {
      start: tdate,
    })
    .then((response) => {
      console.log(tdate);
      console.log(response.data);
      let year = moment(tdate, 'YYYY-MM-DD').year();
      let month = moment(tdate, 'YYYY-MM-DD').month();
      return Price.create({
        tdate: tdate,
        year: year,
        month: month + 1,
        ripe: response.data.result.ripe,
        green: response.data.result.green,
        special_green: response.data.result.special_green,
      });
    })
    .then(() => {
      i++;
      if (i < limit) {
        setTimeout(() => {
          let tmrw = moment(tdate, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
          getPineappleData(tmrw);
        }, 2000);
      } else {
        took = process.hrtime(before);
        console.log('Total time took for ' + i + ' records: ' + took);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

async function startScript() {
  before = process.hrtime();
  i = 0;
  const maxD = await Price.findOne({
    order: [['tdate', 'DESC']]
  }).then((price) => {
    let max;
    if (price) max = price.tdate;
    else max = moment('2006-02-01', 'YYYY-MM-DD');
    return max;
  });
  let startD = moment(maxD, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
  getPineappleData(startD);
}
startScript();

const job = schedule.scheduleJob('*/3 * * * *', function (fireDate) {
  console.log('Cron initiated ' + fireDate);
  startScript();
});
