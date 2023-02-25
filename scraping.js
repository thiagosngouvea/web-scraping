const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

async function scrapePage() {

  console.log('Iniciando o scraping');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://gregoimoveisprime.com.br/comprar-alugar/imoveis?typeArea=total_area&floorComparision=equals&sort=-created_at%2Cid&offset=1&limit=10');
  
    // esperar a nova página carregar
    await page.waitForSelector('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty');
  
    const propertyLinks = await page.$$eval('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty', cards => {
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
  
      await newPage.waitForSelector('.sc-1oa9ufk-1.cmAgWZ');
  
      const propertyData = await newPage.evaluate(async () => {
        const title = document.querySelector('.sc-de9h1g-0.cAbJFe').textContent.trim();
        const price = document.querySelector('.sc-3hj0n0-0.kPSlSy').textContent.trim().replace(/\/\s/g, '').replace(/VENDA|ALUGUEL/g, '').replace(/\s/g, '');
        const status = document.querySelector('.sc-1lj1a6-0.fgUzYm').textContent.trim().replace(/\/\s/g, '').replace(/\s/g, '');
  
        const detalhesDiv = document.querySelector('.sc-1alta1m-1.ecpoTK');
        const detalhesSpans = detalhesDiv.querySelectorAll('span');
        const detalhes = Array.from(detalhesSpans).map(span => span.textContent.trim()).join(', ');

        const detailsSections = document.querySelectorAll('.sc-1gfn7xh-0.fxLMbR');
 
        const details = {};

        for (const section of detailsSections) {
          const sectionTitle = section.querySelector('h3').textContent.trim();
          const sectionSpans = section.querySelectorAll('span');
          const sectionData = Array.from(sectionSpans).map(span => span.textContent.trim()).join(', ');
          details[sectionTitle] = sectionData;
        }

        //pegar o link da imagem
        // const image = document.querySelector('.sc-1alta1m-0.kqZQZ').src;
        
        return { title, price, status, detalhes, details};
        
      });
  
      worksheet.addRow(propertyData);
      data.push(propertyData);
      await newPage.close();
    }
  
    await workbook.xlsx.writeFile('imoveis.xlsx');
    await browser.close();
    console.log('Done scraping', data);
    return data;
  }

module.exports = scrapePage;