const puppeteer = require('puppeteer');

async function scrapePageAci() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.acimoveiscaruaru.com.br/imobiliaria/imoveis/0/1');
  
    // esperar a nova página carregar
    await page.waitForSelector('.c49mod-properties-list');
  
    const propertyLinks = await page.$$eval('.card.c49-property-card', cards => {
      return cards.map(card => card.querySelector('a').href);
    });

    console.log(propertyLinks.length);
  
    const data = [];
  
    for (const link of propertyLinks) {
      const newPage = await browser.newPage();
      await newPage.goto(link, { waitUntil: 'networkidle2' });

      await newPage.setViewport({ width: 1920, height: 1080 });
 
      const propertyData = await newPage.evaluate(async () => {
        const title = document.querySelector('.property-title.m-b-20')?.textContent ?? 'Sem título';
        const description = document.querySelector('.property-description.p-b-20')?.textContent ?? 'Sem descrição';

        const rows = document.querySelectorAll('.table-row');

        const informations = {};
    
        rows.forEach(row => {
          const title = row.querySelector('div:nth-child(1)').textContent.trim();
          const value = row.querySelector('div:nth-child(2)').textContent.trim();
    
          informations[title] = value;
        });

        const propertyCharacteristics = [];

        document.querySelectorAll('.table-col div').forEach(div => {
          propertyCharacteristics.push(div.textContent.trim());
        });

        const imageLinks = [];

        document.querySelectorAll('#photos-property-carousel li').forEach(li => {
        const imageUrl = li.style.backgroundImage.match(/url\((.*?)\)/)[1].replace(/"/g, '');
        const imageUrlWithoutMini = imageUrl.replace('/mini', '');
        imageLinks.push(imageUrlWithoutMini);
        });

  
        return { title, description, informations, propertyCharacteristics, imageLinks };
        
      });
  
      data.push(propertyData);
      await newPage.close();
    }
    
    await browser.close();
    return data;
  }

module.exports = scrapePageAci;