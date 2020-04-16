const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios").default;
const cheerio = require('cheerio')
const csv = require("csvtojson");

let BASE = "https://consultaremedios.com.br/";

async function consultaRemedios(fileWithProducts) {
    let products = await csv({ delimiter: ';' }).fromFile(fileWithProducts);
    let results = []
    let counter = 0;
    let foundCounter = 0;
  
    let lastIndex = restartIndex(products, "7896641810367") || 0;
    // let lastIndex = 0
    console.log("lastIndex: ", lastIndex);
    for (let product of products.slice(lastIndex)) {
        for (let char in product.ean) {
            // console.log("char: ", product.ean[char])
            if (product.ean[char] != "0") {
                product.ean = product.ean.slice(char)
                break;
            }
        }
      console.log("Product EAN: ", product.ean);
      try {
        let response = await axios.get(`${BASE}b/${product.ean}`)
        let $ = cheerio.load(response.data)
        const groups = $("#ofertas .js-offer-set")
        groups.each((i, group)=>{
            const productEan = $(group).data("ean")
            if (productEan == product.ean){
                foundCounter++;
            }
            const productName = $(group).find(".presentation-offer-info__description").text()
            // console.log("EAN: ",ean)
            // console.log("Product Name: ", productName)
            const storeProducts = $(group).find(".presentation-offer__item .offer")
            if (storeProducts.length){
                storeProducts.each((i, product)=>{
                    const storeName = $(product).find(".offer__store-logo-wrapper > span.hidden").text()
                    const storePrice = $(product).find(".offer__price .offer__price-value").text()
                    result = {ean:productEan, name:productName, store:storeName, price: storePrice, created: new Date().toUTCString()}
                    console.log("Result: ", result)
                    results.push(result)
                })
                
            }
        })
                  
        if (counter % 50 == 0 && counter != 0) {
          console.log(`*******************************************`)
          console.log(`*********** IT'S REPORT TIME!!! ***********`)
          console.log(`*******************************************`)
          console.log(`* Number of products searched: ${counter}`)
          console.log(`* Number of products found: ${foundCounter}`)
          console.log(`* BreakDown Percentage: ${((1 - (foundCounter / counter)) * 100).toFixed(2)}%`)
          console.log(`*******************************************`)
        }
        if (counter % 200 && counter != 0){
            fs.writeFileSync("./results/partial-result-remedios-4.json", JSON.stringify(results))
        }
      } catch (error) {
        if (error.response && error.response.status == 404){
            console.log("Product not found: ", product.description)
        }else{
            console.log("Got some error here: ", error);
            fs.writeFileSync("./results/partial-errored-remedios-4.json", JSON.stringify(results))
        }
      }
      counter++;
      await timeoutPromise(500); // throttle
    }
    fs.writeFileSync("./results/remedios.json",JSON.stringify(results))
    // await mongoose.connection.close()
}

function formatJsonToCSV(jsonArray){
    jsonArray = jsonArray.filter((result)=> result != null)
    let columns = Object.keys(jsonArray[0]);
    // console.log(columns);
    let result = columns.join(",");
    result += "\n";
    // console.log(result)
    for (let el of jsonArray){
        //console.log("El: ",el);
        let row = ""
        for (let col of columns){
            //console.log("el[col]: ",el[col])
            if (el.hasOwnProperty(col)){
                row +=`"${el[col]}",`
            }else{
                row += ','
            }
            
        }
        //console.log("bef: ",row)
        row = row.substring(0,row.length - 1);
        //console.log("row: ",row);
        result += row + '\n';
    }
    //console.log("result: ",result);
    return result;
}
