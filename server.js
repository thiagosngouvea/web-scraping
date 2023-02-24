const express = require('express');
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
    const data = await scrapePage();
    res.json(data);
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
