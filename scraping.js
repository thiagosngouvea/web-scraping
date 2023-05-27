const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

async function scrapePage() {
    const browser = await puppeteer.launch({
      headless: false,
    });
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
  
      await newPage.waitForSelector('.sc-138hwir-8.duDyhb');
      await newPage.waitForSelector('.sc-e1j81b-1.jAXpzS');
      await newPage.click('.sc-e1j81b-1.jAXpzS');
      await newPage.waitForTimeout(3000);
      // await newPage.waitForSelector('.sc-e1j81b-1.jAXpzS');
      // await newPage.waitForTimeout(1000);
      // await newPage.waitForSelector('.sc-e1j81b-1.jAXpzS');
      // await newPage.click('.sc-e1j81b-1.jAXpzS');
      // await newPage.waitForTimeout(2000);
      // await newPage.waitForSelector('.sc-q0jucq-4.gDuWtB');
      
      const propertyData = await newPage.evaluate(async () => {
        const title = document.querySelector('.sc-de9h1g-0.cAbJFe').textContent.trim();
        const price = (document.querySelector('.sc-3hj0n0-0.kPSlSy') ?? document.querySelector('.sc-3hj0n0-0.bqODGa')).textContent.trim().replace(/\/\s/g, '').replace(/VENDA|ALUGUEL/g, '').replace(/\s/g, '');
        const status = document.querySelector('.sc-1lj1a6-0.fgUzYm').textContent.trim().replace(/\/\s/g, '').replace(/\s/g, '');
        const url = window.location.href;

        const detailsSections = document.querySelectorAll('.sc-1gfn7xh-0.fxLMbR');

        //preciso pegar toda a tag html e não só o texto o span completo com todos os detalhes e escrever para mandar na api
        const details = {};

        for (const section of detailsSections) {
          let sectionTitle = section.querySelector('h3').textContent.trim();
          sectionTitle = sectionTitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
          const sectionSpans = section.querySelectorAll('span');
          let sectionData = Array.from(sectionSpans).map(span => span.textContent.trim()).join(', ');

          if (sectionTitle === 'localizacao') {
            sectionData = sectionData.replace('+− LeafletPara aplicar o zoom no mapa, segure a tecla Ctrl', '');
            sectionData = sectionData.replace('+, −,', '');
            sectionData = sectionData.split(',').map(item => item.trim()).join(', ');

            //se o primeiro item e o segundo item forem iguais, remove o segundo item
            const sectionDataArray = sectionData.split(', ');
            if (sectionDataArray[0] === sectionDataArray[1]) {
              sectionDataArray.splice(1, 1);
            }

            sectionData = sectionDataArray.join(', ');

          }

          details[sectionTitle] = sectionData;
        }

        const fichaSection = document.querySelectorAll('.sc-vhku1u-0.hzRhgA');

        const ficha = {};

        //preciso pegar com o cheerio uma section com a classe .sc-vhku1u-0.hzRhgA , porem tem que ter um h3


        for (const section of fichaSection) {
          const sectionTitle = section.querySelector('h3').textContent.trim();
          const sectionSpans = section.querySelectorAll('span');
          const sectionData = Array.from(sectionSpans).map(span => span.textContent.trim()).join(', ');

          ficha[sectionTitle] = sectionData;
        }        

        const section = document.querySelector('.sc-1gfn7xh-0.fxLMbR');
        const pTags = Array.from(section.getElementsByTagName('p'));

        const pArray = pTags.map(tag => tag.innerHTML);

        const imagens = document.querySelectorAll('.sc-q0jucq-5.ggaTVx');

        const imagensArray = [];

        for (const imagem of imagens) {
          const imagemUrl = imagem.querySelector('img').src;
          imagensArray.push(imagemUrl);
        }

        details['imagens'] = imagensArray;

        //details.comodos separar por virgula e espaço, se depois do espaço tiver um 'sendo' não separa e passa pra proxima, colocar tudo dentro de um array 

        const comodosArray = details['comodos']?.split(',');

        const condominiosArray = details['condominio']?.split(',');

        const proximidadesArray = details['proximidades']?.split(',');

        //se tiver 'sendo' no comodo, junta com o anterior comodo

        for (let i = 0; i < comodosArray?.length; i++) {
          if (comodosArray[i].includes('sendo')) {
            comodosArray[i - 1] = comodosArray[i - 1] + ', ' + comodosArray[i];
            comodosArray.splice(i, 1);
          }

          if(comodosArray[i].charAt(0) === ' ') {
            comodosArray[i] = comodosArray[i].substring(1);
          }

          if (comodosArray[i].charAt(comodosArray[i].length - 1) === ' ') {
            comodosArray[i] = comodosArray[i].slice(0, -1);
          }

          if (comodosArray[i] === ""){
            comodosArray.splice(i, 1);
          }
        }

        for (let i = 0; i < condominiosArray?.length; i++) {

          if (condominiosArray[i].charAt(0) === ' ') {
            condominiosArray[i] = condominiosArray[i].substring(1);
          }

          if (condominiosArray[i].charAt(condominiosArray[i].length - 1) === ' ') {
            condominiosArray[i] = condominiosArray[i].slice(0, -1);
          }

          if (condominiosArray[i] === ""){
            condominiosArray.splice(i, 1);
          }
        }

        for (let i = 0; i < proximidadesArray?.length; i++) {
          if (proximidadesArray[i].charAt(0) === ' ') {
            proximidadesArray[i] = proximidadesArray[i].substring(1);
          }

          if (proximidadesArray[i].charAt(proximidadesArray[i].length - 1) === ' ') {
            proximidadesArray[i] = proximidadesArray[i].slice(0, -1);
          }

          if (proximidadesArray[i] === ""){
            proximidadesArray.splice(i, 1);
          }
        }

        details['comodos'] = comodosArray;
        details['condominio'] = condominiosArray;
        details['proximidades'] = proximidadesArray;
        
        return { title, price, status, details, url };
        
      });
  
      data.push(propertyData);
      await newPage.close();
    }
    
    await browser.close();
    return data;
  }

module.exports = scrapePage;