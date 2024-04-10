const puppeteer = require("puppeteer");

async function run() {
  // First, we must launch a browser instance
  const browser = await puppeteer.launch({
    // Headless option allows us to disable visible GUI, so the browser runs in the "background"
    // for development lets keep this to true so we can see what's going on but in
    // on a server we must set this to true
    headless: false,
    // This setting allows us to scrape non-https websites easier
    ignoreHTTPSErrors: true,
  });
  // then we need to start a browser tab
  let page = await browser.newPage();
  // and tell it to go to some URL
  await page.goto("https://www.pcso.gov.ph/SearchLottoResult.aspx", {
    waitUntil: "domcontentloaded",
  });
  // print html content of the website
  // console.log(await page.content());

  // Extract table data
  const tableData = await page.evaluate(() => {
    const tableRows = Array.from(
      document.querySelectorAll("table.Grid.search-lotto-result-table tbody tr")
    );
    const data = tableRows.map((row) => {
      const columns = Array.from(row.querySelectorAll("td, th"));
      return columns.map((column) => column.textContent.trim());
    });
    return data;
  });

  // close everything
  await page.close();
  await browser.close();

  // Convert the table data into JSON format
  const jsonResult = tableData.map((row) => {
    return {
      lottoGame: row[0],
      combinations: row[1],
      drawDate: row[2],
      jackpot: row[3],
      winners: row[4],
    };
  });

  console.log(jsonResult);
}

run();
