const pdfParse = require("pdf-parse");
const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const pdf = require("pdf-parse");

function parseLocaL() {
  let dataBuffer = fs.readFileSync("./static/pdf/sample.pdf");
  // https://www.npmjs.com/package/pdf-parse
  pdf(dataBuffer).then(function (data) {
    // check https://mozilla.github.io/pdf.js/getting_started/
    console.log(data.text);
  });
}

fetch("https://github.com/xxxsjan/pdf-server/raw/main/static/pdf/test2.pdf")
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    pdf(buffer).then(function (data) {
      console.log(data.text);
    });
  });
