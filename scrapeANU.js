const cheerio = require("cheerio");
const { default: puppeteer } = require("puppeteer");

const header = "https://jobs.anu.edu.au/jobs";
const urls = [header + "/search", header + "/search?page=2"];

const scrapePage = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      timeout: 180000,
      waitUntil: "networkidle2",
    });

    // Wait for the elements to appear
    await page.waitForSelector('[id^="link_job_title_2_"]', {
      timeout: 10000,
    });

    // Extract the links and their titles
    const jobsMap = await page.evaluate(() => {
      const jobs = {};
      const links = document.querySelectorAll('[id^="link_job_title_2_"]');
      links.forEach((link) => {
        const title = link.textContent.trim();
        const href = link.getAttribute("href");
        if (title && href) {
          jobs[title] = href;
        }
      });
      return jobs;
    });

    await browser.close();
    return jobsMap;
  } catch (error) {
    console.error(`Error fetching or parsing the webpage at ${url}:`, error);
    await browser.close();
    return {};
  }
};

const scrapeAllPages = async (urls) => {
  let allJobs = {};

  for (const url of urls) {
    const jobs = await scrapePage(url);
    allJobs = { ...allJobs, ...jobs };
  }

  return allJobs;
};

scrapeAllPages(urls).then((result) => {
  console.log(result);
});
