const puppeteer = require('puppeteer');

async function scrapePageOsvaldo() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  let propertyLinks = [];

  for (let i = 1; i <= 1; i++) {
    const url = `https://www.osvaldofilho.com.br/imoveis/a-venda?&pagina=${i}`;
    await page.goto(url);

    await page.waitForSelector('.container-card.imovel-item.simple-imovel-item.imoveis-list-card.lighter-bg');

    const linksOnPage = await page.$$eval('.container-card.imovel-item.simple-imovel-item.imoveis-list-card.lighter-bg', cards => {
      return cards.map(card => card.querySelector('a').href);
    });

    propertyLinks = [...propertyLinks, ...linksOnPage];
  }

  const data = [];
  console.log(propertyLinks);

  for(const link of propertyLinks) {
    const newPage = await browser.newPage();
    await newPage.goto(link, { waitUntil: 'networkidle2' });

    await newPage.setViewport({ width: 1920, height: 1080 });

    const propertyData = await newPage.evaluate(async () => {
        const title = document.querySelector('.imovel-title')?.textContent ?? 'Sem título';

        const infoBox = document.querySelector('.imovel-info-box-content.notranslate'); 
        const paragraphs = infoBox.querySelectorAll('p, strong');

        let informations = {};

        if(paragraphs[2]?.querySelector('strong')?.textContent) {
            informations.reference = paragraphs[0]?.textContent;
            informations.address = paragraphs[1]?.textContent;
            informations.neighborhood = paragraphs[2]?.querySelector('strong')?.textContent;
            informations.cityState = paragraphs[3]?.textContent;
        } else {
            informations.address = paragraphs[0]?.textContent;
            informations.neighborhood = paragraphs[1]?.textContent;
            informations.cityState = paragraphs[2]?.textContent;
        }

        const propertyCharacteristics = {};

        document.querySelectorAll('.imovel-header-item.imovel-header-icon').forEach(prop => {
            const name = prop.querySelector('small.text')?.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
            const value = prop.querySelector('strong.text')?.textContent;

            //replace em name para remover os espaços e caracteres especiais e deixar tudo em minúsculo no lugar do espaco colocar um _
            
            propertyCharacteristics[name] = value;
          });

        
        const quantidadeDeImagens = document.querySelector('div.izi-gallery-label')?.textContent ?? 'Sem imagens';

        //pegar o numero depois da / e depois do espaço em branco , exemplo: 1/ 10 pegar o numero 10
        const quantidadeDeImagensRegex = Number(quantidadeDeImagens.match(/\/\s(\d+)/)[1]);

        let imageLinks = [];

        const quantidadeDeImagensElement = document.querySelector('div.izi-gallery-label');
        if (quantidadeDeImagensElement) {
            // quantidadeDeImagensRegex = Number(quantidadeDeImagensElement.textContent.match(/\/\s(\d+)/)[1]);
            let i = 0;
            while (i < quantidadeDeImagensRegex) {
            const currentImage = document.querySelector('div.media img');
            imageLinks.push(currentImage?.src);
            const nextButton = document.querySelector('.izi-gallery-next');
            nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            i++;
            }
        } else {
            const images = document.querySelectorAll('div.media img');
            images.forEach(image => {
            imageLinks.push(image?.src);
            });
        }

        return { title, informations, propertyCharacteristics, imageLinks};

    });

    data.push(propertyData);
    await newPage.close();
    }


  await browser.close();
  return data
}

module.exports = scrapePageOsvaldo;
