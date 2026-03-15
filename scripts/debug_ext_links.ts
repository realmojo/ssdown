import * as cheerio from 'cheerio';
async function run() {
  const url = 'https://voicemod.softonic.kr/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('--- Matching "개발자" in any tag ---');
  $(':contains("개발자")').each((i, el) => {
    if ($(el).children().length === 0 || $(el).children().length < 5) {
       console.log(`Tag: ${el.tagName}, Text: ${$(el).text().trim()}`);
    }
  });

  console.log('\n--- Checking for all external links ---');
  $('a[href^="http"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && !href.includes('softonic') && !href.includes('sftcdn')) {
       console.log(`Ext Link [${i}]: ${href} Text: ${$(el).text().trim()}`);
    }
  });
}
run();
