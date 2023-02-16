const puppeteer = require('puppeteer');

async function scrapePage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://gregoimoveisprime.com.br/comprar-alugar/imoveis?typeArea=total_area&floorComparision=equals&sort=-created_at%2Cid&offset=1&limit=10');

  // esperar a nova página carregar
  await page.waitForSelector('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty');

  const propertyLinks = await page.$$eval('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty', cards => {
    return cards.map(card => card.querySelector('a').href);
  });

  const data = [];

  for (const link of propertyLinks) {
    const newPage = await browser.newPage();
    await newPage.goto(link, { waitUntil: 'networkidle2' });

    await newPage.waitForSelector('.sc-1oa9ufk-1.cmAgWZ');

    const propertyData = await newPage.evaluate(() => {
      const title = document.querySelector('.sc-de9h1g-0.cAbJFe').textContent.trim();
      const price = document.querySelector('.sc-3hj0n0-0.kPSlSy').textContent.trim().replace(/\/\s/g, '');


      // const area = document.querySelector('span[property="value"]').textContent.trim();
      // const description = document.querySelector('p[property="description"]').textContent.trim();

      return { title, priceWithoutCurrency };
    });

    data.push(propertyData);
    await newPage.close();
  }

  await browser.close();
  return data;
}

scrapePage().then(data => console.log(data));