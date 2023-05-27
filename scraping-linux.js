const puppeteer = require('puppeteer');

async function scrapePageLinux() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setRequestInterception(true);

  let interceptedRequests = [];

  page.on('request', (interceptedRequest) => {
    if (interceptedRequest.resourceType() === 'xhr' || interceptedRequest.resourceType() === 'fetch') {
      interceptedRequests.push(interceptedRequest);
    }
    interceptedRequest.continue();
  });

  await page.goto("https://linuximoveis.com.br/comprar-alugar/imoveis?sort=-created_at%2Cid&offset=1&limit=1000&typeArea=total_area&floorComparision=equals");
  
  const linkGet = "https://api-sites.gerenciarimoveis-cf.com.br/api/properties?custom_query=card&sort=-created_at%2Cid&offset=1&limit=1000&with_grouped_condos=true&filter%5Bby_area%5D%5Bname%5D=total_area&filter%5Bby_area%5D%5Bmeasure%5D=m%C2%B2&include=subtype.type%2Cuser&with_title=true"
  
  await page.waitForTimeout(10000);

  let arrayData = [];

  await Promise.all(interceptedRequests.map(async (interceptedRequest) => {
    const response = await interceptedRequest.response();
    const responseBody = await response.text();

    if (interceptedRequest.url().includes(linkGet)) {
      arrayData.push(JSON.parse(responseBody));
    }
  }));

  await browser.close();
  return arrayData;
}

module.exports = scrapePageLinux;