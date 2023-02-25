const puppeteer = require('puppeteer');

async function scrapePage() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://gregoimoveisprime.com.br/comprar-alugar/imoveis?typeArea=total_area&floorComparision=equals&sort=-created_at%2Cid&offset=1&limit=1000');
  
    // esperar a nova página carregar
    await page.waitForSelector('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty');
  
    const propertyLinks = await page.$$eval('.src__Box-sc-1sbtrzs-0.sc-hlcmlc-0.jeFFeJ.CardProperty', cards => {
      return cards.map(card => card.querySelector('a').href);
    });
  
    const data = [];
  
    for (const link of propertyLinks) {
      const newPage = await browser.newPage();
      await newPage.goto(link, { waitUntil: 'networkidle2' });

      await newPage.setViewport({ width: 1920, height: 1080 });
  
      await newPage.waitForSelector('.sc-1oa9ufk-1.cmAgWZ');
      await newPage.waitForSelector('.sc-1rjjx2i-7.daJRUc');
      await newPage.click('.sc-1rjjx2i-7.daJRUc');
      await newPage.waitForTimeout(3000);
      await newPage.waitForSelector('.sc-1aidao9-3.jFtNhU');
      await newPage.waitForTimeout(1000);
      await newPage.waitForSelector('.sc-q0jucq-2.kOoUSa');
      await newPage.click('.sc-q0jucq-2.kOoUSa');
      await newPage.waitForTimeout(2000);
      await newPage.waitForSelector('.sc-q0jucq-4.gDuWtB');
      
      const propertyData = await newPage.evaluate(async () => {
        const title = document.querySelector('.sc-de9h1g-0.cAbJFe').textContent.trim();
        const price = (document.querySelector('.sc-3hj0n0-0.kPSlSy') ?? document.querySelector('.sc-3hj0n0-0.bqODGa')).textContent.trim().replace(/\/\s/g, '').replace(/VENDA|ALUGUEL/g, '').replace(/\s/g, '');
        const status = document.querySelector('.sc-1lj1a6-0.fgUzYm').textContent.trim().replace(/\/\s/g, '').replace(/\s/g, '');

        const detailsSections = document.querySelectorAll('.sc-1gfn7xh-0.fxLMbR');
 
        const details = {};

        for (const section of detailsSections) {
          let sectionTitle = section.querySelector('h3').textContent.trim();
          sectionTitle = sectionTitle.replace(/\s+/g, '_');
          sectionTitle = sectionTitle.replace(/[^\w\s]/gi, '');
          sectionTitle = sectionTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          sectionTitle = sectionTitle.toLowerCase();
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

        const imagens = document.querySelectorAll('.sc-q0jucq-5.tIXoK');

        const imagensArray = [];

        for (const imagem of imagens) {
          const imagemUrl = imagem.querySelector('img').src;
          imagensArray.push(imagemUrl);
        }

        details['Imagens'] = imagensArray;


        
        return { title, price, status, details };
        
      });
  
      data.push(propertyData);
      await newPage.close();
    }
    
    await browser.close();
    return data;
  }

module.exports = scrapePage;