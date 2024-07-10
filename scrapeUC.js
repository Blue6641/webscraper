const cheerio = require("cheerio");
const { default: puppeteer } = require("puppeteer");

const header = "https://uctalent.canberra.edu.au";
const url = header + "/en/listing/";

const generateJobsMap = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      timeout: 180000,
      waitUntil: "networkidle2",
    });

    // Wait for the expand button to appear
    await page.waitForSelector(".more-link.button", { timeout: 10000 });

    // Trigger a native click event on the expand link
    await page.evaluate(() => {
      document.querySelector(".more-link.button").click();
    });

    // Wait for new content to load after clicking
    await page.waitForSelector(".job-link", { timeout: 10000 });

    // Simulate wait using setTimeout in page.evaluate
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 3000))
    );

    const response = await page.content();
    const $ = cheerio.load(response);

    const jobsMap = {};

    // Select all anchor tags and extract href attributes
    $(".job-link").each((index, element) => {
      const title = $(element).text().trim();
      const link = $(element).attr("href");
      // Make sure the href attribute exists and is not empty
      if (title && link && link.trim() !== "") {
        jobsMap[title] = header + link;
      }
    });

    await browser.close();
    return jobsMap;
  } catch (error) {
    console.error("Error fetching or parsing the webpage:", error);
    await browser.close();
    return {};
  }
};

generateJobsMap(url).then((result) => {
  console.log(result);
});
