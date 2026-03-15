import * as cheerio from 'cheerio';
async function run() {
  const url = 'https://voicemod.softonic.kr/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('--- DT Labels ---');
  $('dt').each((i, el) => {
    console.log(`[${i}] ${$(el).text().trim()}`);
  });
  
  console.log('\n--- H1 Title ---');
  console.log($('h1').text().trim());

  console.log('\n--- Developer Link Check ---');
  $('dt').each((i, el) => {
    const text = $(el).text().trim();
    if (text === '개발자' || text === 'Developer') {
      const dd = $(el).next('dd');
      console.log('DD content:', dd.html());
      dd.find('a').each((j, a) => {
        console.log(`Link [${j}]: ${$(a).attr('href')} text: ${$(a).text()}`);
      });
    }
  });
}
run();
