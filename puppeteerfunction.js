const fs = require('fs');
const puppeteer = require('puppeteer');

async function puppeteerFunction() {
  try {
    // Carrega o arquivo JSON com os dados dos telefones
    const data = fs.readFileSync('companies.json', 'utf8');
    const companies = JSON.parse(data);
    
    const companiesList = companies.map((company) => {
        return {
            nome: company.nome,
            telefone: company.telefone,
        };
    });
    
    const browser = await puppeteer.launch({ headless: false });
    
    for (const company of companiesList) {
        const page = await browser.newPage();
        try {
            await page.goto(`https://web.whatsapp.com/send?phone=5527${company.telefone}&text=ola${company.nome}`);

            // espera a página carregar completamente
            await page.waitForSelector("#main > footer > div._2lSWV._3cjY2.copyable-area > div > span:nth-child(2) > div > div._1VZX7 > div._2xy_p._3XKXx > button");

            // localiza o botão enviar e clica nele
            await page.click("#main > footer > div._2lSWV._3cjY2.copyable-area > div > span:nth-child(2) > div > div._1VZX7 > div._2xy_p._3XKXx > button");
            console.log(`Mensagem enviada para ${company.nome}`);

        } catch (err) {
            console.error(`Erro ao enviar mensagem para ${company.nome}: ${err}`);
        } finally {
            // fecha a página após enviar ou falhar
            await page.close();
        }
    }

    await browser.close();
  } catch (err) {
    console.error(err);
  }
}

module.exports = puppeteerFunction;
