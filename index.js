const { Builder, By, Key, until } = require("selenium-webdriver");

async function scrapeData() {
  let data = [];

  // Cria a instância do driver do selenium
  let driver = await new Builder().forBrowser("chrome").build();

  // Navega até o site
  await driver.get(
    "https://gregoimoveisprime.com.br/comprar-alugar/imoveis?sort=-created_at%2Cid&offset=1&limit=10&typeArea=total_area&floorComparision=equals"
  );

  // Encontra todos os cards com informações
  let cards = await driver.findElements(
    By.css(".src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty")
  );

  //dar um click para abrir o card
  // await driver.findElement(By.css(".src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty")).click();

  for (const card of cards) {
    let info = {};

    // Get the information from the opened page
    let title = await card.findElement(By.css(".sc-hlcmlc-15.NQNSX")).getText();
    let url = await card
    .findElement(By.css(".sc-y8ewrg-0.gDmoGr.sc-hlcmlc-5.bDPWoB"))
    .getAttribute("href");


    info.title = title;
    info.url = url;


    data.push(info);


  }

  // Fecha o driver do selenium
  await driver.quit();

  // Retorna os dados coletados
  return data;
}

// Executa a função de scraping de dados
scrapeData().then(async (data) => {
  let driver = await new Builder().forBrowser("chrome").build();

  let data2 = [];

  console.log(`data`,data);

  data.map(async (item) => {
    await driver.get(item.url);

    let title = await driver
      .findElement(By.css(".sc-de9h1g-0.cAbJFe"))
      .getText();


    data2.push({
      title: title,
    });

    // implementa a função de pegar as informações
  });

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
