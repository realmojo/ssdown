import * as cheerio from 'cheerio';
async function run() {
  const url = 'https://voicemod.softonic.kr/';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  console.log('HTML Length:', html.length);
  console.log('Contains "개발자"?:', html.includes('개발자'));
  console.log('Sample HTML (1000-2000):', html.slice(1000, 2000));
}
run();
