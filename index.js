const puppeteer = require('puppeteer');
const fs = require('fs');
const puppeteerFunction = require('./puppeteerFunction');

const estado = 'ES';
const cidade = '3205309';
const termo = 'logistica';

async function getCompaniesData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    `https://portaldatransparencia.gov.br/pessoa-juridica/busca/lista?termo=${termo}&pagina=1&tamanhoPagina=10&ufPessoaJuridica=${estado}&municipio=${cidade}&`
  );

  let companies = [];

  while (true) {
    const result = await page.evaluate(() => {
      const results = [];
      const elements = document.querySelectorAll('#resultados > li > h3 > a');
      for (const element of elements) {
        results.push(element.getAttribute('href'));
      }
      return results;
    });

    for (const link of result) {
      await page.goto(`https://portaldatransparencia.gov.br${link}`);
      await page.waitForSelector(
        'body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(1) > div.col-xs-12.col-sm-2 > span'
      );

      const number = await page.evaluate(() => {
        return document.querySelector(
          'body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(1) > div.col-xs-12.col-sm-2 > span'
        ).innerHTML;
      });

      const name = await page.evaluate(() => {
        return document.querySelector(
          'body > main > div:nth-child(3) > section.dados-tabelados > div:nth-child(3) > div:nth-child(1) > span'
        ).innerHTML;
      });

      const formatedNumber = number.slice(-9);

      companies.push({
        telefone: formatedNumber,
        nome: name,
      });
    }

    const nextButton = await page.$('#paginacao > ul > li.next > a');

    if (nextButton === null) {
      break;
    } else {
      await nextButton.click();
      await page.waitForNavigation();
    }
  }

  await browser.close();

  return companies;
}

(async () => {
  const companies = await getCompaniesData();

  fs.writeFile('companies.json', JSON.stringify(companies), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Telefones salvos com sucesso!');
    puppeteerFunction();
  });
})();
