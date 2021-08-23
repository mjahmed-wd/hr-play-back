const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const yup = require("yup");
const csvtojsonV2 = require("csvtojson/v2");

//
// -> { value: { username: 'abc', birth_year: 1994 } }

// schema.validate({});

//

const csvFilePath = "./hr.csv";
const csv = require("csvtojson");

const port = 5000;
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
let formattedCSVtoJSON;
csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    formattedCSVtoJSON = jsonObj.map((item) =>
      Object.assign({
        firstName: Object.entries(item)[0][1],
        secondName: Object.entries(item)[1][1],
        email: Object.entries(item)[2][1],
        ...item,
      })
    );
  });
app.get("/csv", (req, res) => {
  res.json(formattedCSVtoJSON);
});
app.get("/errors", (req, res) => {
  let validData = [];
  let invalidDataMsg = [];
  formattedCSVtoJSON.forEach((element) => {
    //  name error
    let error = [];
    if (!element?.firstName.match(/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i)) {
      //  result.push({message: `${element?.firstName} has to be a name`})
      error = [...error, `first name`];
    }
    if (!element?.secondName.match(/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i)) {
      //  result.push({message: `${element?.secondName} has to be a name`})
      error = [...error, `second name`];
    }
    if (
      !element?.email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      // result.push({message: element?.email })
      error = [...error, `email`];
    }
    if (error.length > 0) {
      error = `Row no ${formattedCSVtoJSON.indexOf(element) + 1} has ${
        error.length > 1 ? "errors" : "error"
      } on ${error.join(", ")}.`;
      invalidDataMsg.push(error);
    } else {
      validData.push(element);
    }
  });
  res.json({ validData, invalidDataMsg });
});

app.listen(process.env.PORT || port);
