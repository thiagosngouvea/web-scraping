const axios = require('axios');
const cheerio = require('cheerio');
const Excel = require('exceljs');

async function scrapeData(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  
  console.log(response.data);


  const data = [];

    // separar pela div pai e depois cada div filha 
    $('.sc-hlcmlc-4.gJAafV').each((i, el) => {
      const item = $(el).text().trim();
      const titulo = $(el).find('.sc-hlcmlc-15.NQNSX').text();
      const local = $(el).find('.sc-hlcmlc-1.gQklzn').text();
      const valor = $(el).find('.sc-hlcmlc-8.loCxKJ').text();
      const status = $(el).find('.sc-hlcmlc-7.bvfWap').text();
      data.push({
        titulo: titulo,
        local: local,
        valor: valor,
        status: status,
      });
    });

  return data;
}

async function writeToExcel(data) {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  worksheet.columns = [
    { header: 'Titulo', key: 'titulo', width: 20 },
    { header: 'Local', key: 'local', width: 20 },
    { header: 'Valor', key: 'valor', width: 20 },
    { header: 'Dados', key: 'dados', width: 20 },
  ];

  // fazer um forEach para adicionar os dados no excel e o primeiro parametro e o title o segundo o local e o terceiro o valor
    data.forEach((item) => {
    worksheet.addRow({ 
      titulo: item.title,
      local: item.location,
      valor: item.price,
    });
    });
    
  await workbook.xlsx.writeFile('data.xlsx');
}

async function main() {
  const data = await scrapeData('https://gregoimoveisprime.com.br/');
  console.log(data);

  await writeToExcel(data);
}

main();