const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

async function scrapePageOlx() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.olx.com.br/perfil/karolyne272-179c0a45');

    await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
  
    // esperar a nova página carregar
    await page.waitForSelector('.AdSection__StyledGridContainer-sc-6r4grx-3.dgJQxv.sc-jTzLTM.iwtnNi');
  
    const propertyLinks = await page.$$eval('.AdCard__Wrapper-sc-1n5af7l-0.dQVjzf', cards => {
      return cards.map(card => card.querySelector('a').href);
    });
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Imóveis');
  
    worksheet.columns = [
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Preço', key: 'price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Detalhes', key: 'detalhes', width: 30 },
    ];
  
    const data = [];
  
    for (const link of propertyLinks) {
      const newPage = await browser.newPage();
      await newPage.goto(link, { waitUntil: 'networkidle2' });
  
      await newPage.waitForSelector('.ad__duvuxf-0.ad__h3us20-0.eCUDNu');
  
      const propertyData = await newPage.evaluate(async () => {
        const title = document.querySelector('.ad__sc-45jt43-0.fAoUhe.sc-cooIXK.kMRyJF').textContent.trim();

        const price = document.querySelector('.ad__sc-1wimjbb-1.hoHpcC.sc-cooIXK.cXlgiS').textContent.trim();
        

        const titleAll = document.querySelectorAll('.sc-bwzfXH.ad__h3us20-0.ikHgMx')

        const details = {}

        for (const titleDt of titleAll) {
          console.log(titleDt.textContent.trim())
        }

        
        return { title, price, details };
      });
  
      worksheet.addRow(propertyData);
      data.push(propertyData);
      await newPage.close();
    }
  
    await workbook.xlsx.writeFile('imoveis.xlsx');
    await browser.close();
    return data;
  }

module.exports = scrapePageOlx;