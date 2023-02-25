const express = require('express');
const puppeteer = require('puppeteer');
const chromium = require('chromium');
const ExcelJS = require('exceljs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const scrapePage = require('./scraping');
const scrapePageOlx = require('./scraping-olx');

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/scrape', async (req, res) => {
  try {
    puppeteer.launch().then(async function (browser) {
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

          await newPage.waitForSelector('.sc-1rjjx2i-7.daJRUc');

          await newPage.click('.sc-1rjjx2i-7.daJRUc');

          await newPage.waitForSelector('.ReactModal__Content.ReactModal__Content--after-open');

          console.log('Aguardando 5 segundos...');
      
          const propertyData = await newPage.evaluate(async () => {
            const title = document.querySelector('.sc-de9h1g-0.cAbJFe').textContent.trim();
            const price = (document.querySelector('.sc-3hj0n0-0.kPSlSy') ?? document.querySelector('.sc-3hj0n0-0.bqODGa')).textContent.trim().replace(/\/\s/g, '').replace(/VENDA|ALUGUEL/g, '').replace(/\s/g, '');
            const status = document.querySelector('.sc-1lj1a6-0.fgUzYm').textContent.trim().replace(/\/\s/g, '').replace(/\s/g, '');
    
            const detailsSections = document.querySelectorAll('.sc-1gfn7xh-0.fxLMbR');
     
            const details = {};
    
            for (const section of detailsSections) {
              const sectionTitle = section.querySelector('h3').textContent.trim();
              const sectionSpans = section.querySelectorAll('span');
              const sectionData = Array.from(sectionSpans).map(span => span.textContent.trim()).join(', ');
              details[sectionTitle] = sectionData;
            }

            const fichaSection = document.querySelectorAll('.sc-vhku1u-0.hzRhgA');

            const ficha = {};

            for (const section of fichaSection) {
              const sectionTitle = section.querySelector('h3').textContent.trim();
              const sectionSpans = section.querySelectorAll('span');
              const sectionData = Array.from(sectionSpans).map(span => span.textContent.trim()).join(', ');
              ficha[sectionTitle] = sectionData;
            }

            details['Ficha'] = ficha;
            
            return { title, price, status, details };
            
          });
      
          worksheet.addRow(propertyData);
          data.push(propertyData);
          await newPage.close();
        }
      
        await workbook.xlsx.writeFile('imoveis.xlsx');
        await browser.close();
        res.send(data);
      });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error scraping page');
  }
});

app.get('/api/scrape-olx', async (req, res) => {
  try {
    const data = await scrapePageOlx();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error scraping page');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
