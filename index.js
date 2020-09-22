const puppeteer = require('puppeteer')
const fs = require('fs')
const isUrl = require('is-url')
// https://www.linovelib.com/novel/2139/catalog

const MENU_URL = 'https://www.linovelib.com/novel/2139/catalog'
const server = async () => {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(MENU_URL)
    const hrefList = await page.$$eval('.volume-list .col-4 > a', list => list.map(a => a.href))
    for (let i = 0; i < hrefList.length; i++) {
      const url = hrefList[i]
      if (!isUrl(url)) continue
      await page.goto(url, { timeout: 0 })
      let content = await page.$eval('#mlfy_main_text', div => div.innerText)
      const nextUrl = await page.$eval('.mlfy_page a:last-child', a => a.href)
      if (content.indexOf('（本章未完）') >= 0) {
        hrefList.splice(i + 1, 0, nextUrl)
      }
      content = content.replace(/（本章未完）/g, '')
      await fs.appendFileSync('./Re.txt', content)
      const title = content.split('\n')[0]
      console.log(`${title}加载完成！`)
    }
    await browser.close()
  } catch (e) {
    console.log({ e })
  }
}

server()
