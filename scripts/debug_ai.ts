import * as cheerio from 'cheerio';
async function run() {
  const url = 'https://aide-dev.softonic.kr/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('H1:', $('h1').text().trim());
  console.log('Title:', $('title').text().trim());
  
  console.log('--- Checking for Developer in AI context ---');
  $(':contains("개발자")').each((i, el) => {
    if ($(el).children().length < 5) console.log(`Tag: ${el.tagName}, Text: ${$(el).text().trim()}`);
  });
  
  console.log('\n--- External Links ---');
  $('a[href^="http"]').each((i, el) => {
    const h = $(el).attr('href');
    if (h && !h.includes('softonic')) console.log(`Link: ${h} Text: ${$(el).text().trim()}`);
  });
}
run();
