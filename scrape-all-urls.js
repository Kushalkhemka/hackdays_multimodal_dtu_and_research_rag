const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const https = require("https");

const agent = new https.Agent({
  rejectUnauthorized: false,
});

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Turn "/about" or "./about" into "http://dtu.ac.in/about"
function relativeLink(link, domain = "www.dtu.ac.in") {
  if (!link) return null;
  if (link.startsWith("http")) {
    return link;
  } else if (link.startsWith("/")) {
    return `http://${domain}${link}`;
  } else if (link.startsWith(".")) {
    return `http://${domain}${link.slice(1)}`;
  }
  return `http://${domain}/${link}`;
}

// Extract all URLs from a notice object
function extractUrls(notice) {
  const urls = [];
  if (notice.link) {
    urls.push(notice.link);
  }
  if (notice.children && notice.children.length > 0) {
    notice.children.forEach((child) => {
      if (child.link) {
        urls.push(child.link);
      }
    });
  }
  return urls;
}

(async () => {
  const allNotices = {};
  const allUrls = new Set(); // Use Set to avoid duplicates
  const urlDetails = []; // Store URL with metadata

  try {
    console.log("Starting to scrape all notices...\n");

    // Scrape main website
    console.log("Scraping main website (www.dtu.ac.in)...");
    try {
      let response = await axios.get("http://www.dtu.ac.in/", {
        timeout: 30000,
        httpsAgent: agent,
      });

      let $ = cheerio.load(response.data);
      let tabs = {
        1: "Notices",
        2: "Jobs",
        3: "Tenders",
        4: "Latest News",
        5: "Forthcoming Events",
        8: "1st Year Notices",
      };

      for (let tabIndex in tabs) {
        let tab = tabs[tabIndex];
        console.log(`  Processing ${tab}...`);
        let list = $(`#tab${tabIndex} > div.latest_tab > ul`).find("li");
        let notices = [];
        
        // Dynamically get all list items instead of hardcoded 25
        list.each((i, el) => {
          try {
            let links = $(el).find("a");
            if (links.length === 0) return;

            let title = $(links[0]).text().trim();
            let link = relativeLink($(links[0]).attr("href"));
            let children = [];

            for (let j = 1; j < links.length; j++) {
              let childLink = relativeLink($(links[j]).attr("href"));
              if (childLink) {
                children.push({
                  title: $(links[j]).text().trim(),
                  link: childLink,
                });
              }
            }

            if (title !== "") {
              notices.push({ title, link, children });
              
              // Collect URLs
              const urls = extractUrls({ title, link, children });
              urls.forEach((url) => {
                if (url) {
                  allUrls.add(url);
                  urlDetails.push({
                    url: url,
                    category: tab,
                    noticeTitle: title,
                    type: url === link ? "main" : "attachment",
                  });
                }
              });
            }
          } catch (err) {
            console.error(`    Error processing item ${i} in ${tab}:`, err.message);
          }
        });

        allNotices[tab] = notices;
        console.log(`    Found ${notices.length} notices in ${tab}`);
      }

      console.log("✓ Main website scraping completed\n");
    } catch (errorMain) {
      console.error("✗ Error fetching main website:", errorMain.message);
    }

    // Scrape exam website
    console.log("Scraping exam website (exam.dtu.ac.in)...");
    try {
      let examResponse = await axios.get("http://exam.dtu.ac.in/result.htm", {
        timeout: 30000,
        httpsAgent: agent,
      });
      let e$ = cheerio.load(examResponse.data);
      let examNotices = [];

      e$("a").each((i, el) => {
        try {
          let link = el.attribs?.href;
          if (link && link.endsWith(".pdf")) {
            const fullLink = relativeLink(link, "exam.dtu.ac.in");
            if (fullLink) {
              examNotices.push({
                link: fullLink,
                title: link.split("/").pop().split(".")[0] || "Untitled",
              });

              // Collect URLs
              allUrls.add(fullLink);
              urlDetails.push({
                url: fullLink,
                category: "Exams",
                noticeTitle: link.split("/").pop().split(".")[0] || "Untitled",
                type: "main",
              });
            }
          }
        } catch (err) {
          // Skip invalid links
        }
      });

      allNotices["Exams"] = examNotices;
      console.log(`    Found ${examNotices.length} exam notices`);
      console.log("✓ Exam website scraping completed\n");
    } catch (errorExam) {
      console.error("✗ Error fetching exam website:", errorExam.message);
    }

    // Prepare output data
    const outputData = {
      scrapedAt: new Date().toISOString(),
      totalNotices: Object.values(allNotices).reduce(
        (sum, notices) => sum + notices.length,
        0
      ),
      totalUniqueUrls: allUrls.size,
      noticesByCategory: allNotices,
      allUrls: Array.from(allUrls).sort(),
      urlDetails: urlDetails.sort((a, b) => a.url.localeCompare(b.url)),
    };

    // Ensure output directory exists
    ensureDirectoryExists("output");

    // Save structured data
    const outputPath = path.join(__dirname, "output", "all-notices.json");
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`✓ Saved all notices to: ${outputPath}`);

    // Save simple URL list
    const urlListPath = path.join(__dirname, "output", "all-urls.txt");
    fs.writeFileSync(
      urlListPath,
      Array.from(allUrls).sort().join("\n") + "\n"
    );
    console.log(`✓ Saved URL list to: ${urlListPath}`);

    // Save URLs by category
    const urlsByCategory = {};
    urlDetails.forEach((detail) => {
      if (!urlsByCategory[detail.category]) {
        urlsByCategory[detail.category] = [];
      }
      if (!urlsByCategory[detail.category].includes(detail.url)) {
        urlsByCategory[detail.category].push(detail.url);
      }
    });

    const categoryPath = path.join(__dirname, "output", "urls-by-category.json");
    fs.writeFileSync(
      categoryPath,
      JSON.stringify(urlsByCategory, null, 2)
    );
    console.log(`✓ Saved URLs by category to: ${categoryPath}`);

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("SCRAPING SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total Categories: ${Object.keys(allNotices).length}`);
    Object.keys(allNotices).forEach((category) => {
      console.log(`  ${category}: ${allNotices[category].length} notices`);
    });
    console.log(`Total Unique URLs: ${allUrls.size}`);
    console.log(`Total Notices: ${outputData.totalNotices}`);
    console.log("=".repeat(50));
    console.log("\n✓ Scraping completed successfully!");

  } catch (error) {
    console.error("Fatal error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();


