// const axios = require('axios');
// const cheerio = require('cheerio');
// const Excel = require('exceljs');

// async function scrapeData(url) {
//   const response = await axios.get(url);
//   const $ = cheerio.load(response.data);
  
//   console.log(response.data);


//   const data = [];

//     // separar pela div pai e depois cada div filha 
//     $('.sc-hlcmlc-4.gJAafV').each((i, el) => {
//       const item = $(el).text().trim();
//       const titulo = $(el).find('.sc-hlcmlc-15.NQNSX').text();
//       const local = $(el).find('.sc-hlcmlc-1.gQklzn').text();
//       const valor = $(el).find('.sc-hlcmlc-8.loCxKJ').text();
//       const status = $(el).find('.sc-hlcmlc-7.bvfWap').text();
//       data.push({
//         titulo: titulo,
//         local: local,
//         valor: valor,
//         status: status,
//       });
//     });

//   return data;
// }

// async function writeToExcel(data) {
//   const workbook = new Excel.Workbook();
//   const worksheet = workbook.addWorksheet('Sheet1');

//   worksheet.columns = [
//     { header: 'Titulo', key: 'titulo', width: 20 },
//     { header: 'Local', key: 'local', width: 20 },
//     { header: 'Valor', key: 'valor', width: 20 },
//     { header: 'Dados', key: 'dados', width: 20 },
//   ];

//   // fazer um forEach para adicionar os dados no excel e o primeiro parametro e o title o segundo o local e o terceiro o valor
//     data.forEach((item) => {
//     worksheet.addRow({ 
//       titulo: item.title,
//       local: item.location,
//       valor: item.price,
//     });
//     });
    
//   await workbook.xlsx.writeFile('data.xlsx');
// }

// async function main() {
//   const data = await scrapeData('https://gregoimoveisprime.com.br/comprar-alugar/imoveis?sort=-created_at%2Cid&offset=1&limit=10&typeArea=total_area&floorComparision=equals');
//   console.log(data);

//   await writeToExcel(data);
// }

// main();

const { Builder, By, Key, until } = require("selenium-webdriver");

async function scrapeData() {
  let data = [];

  // Cria a instância do driver do selenium
  let driver = await new Builder().forBrowser("chrome").build();

  // Navega até o site
  await driver.get("https://gregoimoveisprime.com.br/comprar-alugar/imoveis?sort=-created_at%2Cid&offset=1&limit=10&typeArea=total_area&floorComparision=equals");

  // Encontra todos os cards com informações
  let cards = await driver.findElements(By.css(".src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty"));

  //dar um click para abrir o card
  // await driver.findElement(By.css(".src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty")).click();

  for (const card of cards) {
    let info = {};

    await card.click();


    // Encontra o título do card
    let title = await driver.findElement(By.css(".sc-1glmiii-0.dpwWkJ")).getText();
    info.title = title;

    

    data.push(info);
  }


  // Fecha o driver do selenium
  await driver.quit();

  // Retorna os dados coletados
  return data;
  
}

// Executa a função de scraping de dados
scrapeData().then(data => {
  console.log(data);
});


// const {Builder, By, Key, until} = require('selenium-webdriver');
// // const {readFromExcel, writeToExcel} = require('./excel-helper');

// (async function example() {
//   let driver = await new Builder().forBrowser('chrome').build();
//   try {
//     await driver.get('https://gregoimoveisprime.com.br/comprar-alugar/imoveis?sort=-created_at%2Cid&offset=1&limit=10&typeArea=total_area&floorComparision=equals');

//     // Get all the cards and click on each one
//     let cards = await driver.findElements(By.css('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.gJlTtq.CardProperty'));

//     let data = []
//     for (let card of cards) {
//       await card.click();

//       // Get the information from the opened page
//       let title = await driver.findElement(By.css('.sc-1glmiii-0.dpwWkJ')).getText();
//       let price = await driver.findElement(By.css('.sc-1glmiii-0.cqPWBC')).getText();
//       let location = await driver.findElement(By.css('.sc-1glmiii-0.dpwWkJ')).getText();
      
//       data.push({
//         title: title,
//         price: price,
//         location: location,
//       });


//       // Write the information to the excel file
//       // writeToExcel({title, price, location});

      
//       // Go back to the main page
//       await driver.navigate().back();
//     }
//     console.log(data);
//   } finally {
//     await driver.quit();
//   }
// })();