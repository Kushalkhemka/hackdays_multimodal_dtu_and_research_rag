const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
let sendTelegram = require("./telegram");
const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false,
});

let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
(async () => {
  while (true) {
    try {
      let send = false;
      let messages = {};

      try {
        let response = await axios.get("http://www.dtu.ac.in/", {
          timeout: 10000,
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
          let list = $(`#tab${tabIndex} > div.latest_tab > ul`).find("li");
          let notices = [];
          for (let i = 0; i < 25; i++) {
            let links = $(list[i]).find("a");
            let title = $(links[0]).text().trim();
            let link = relativeLink($(links[0]).attr("href"));
            let children = [];
            for (let j = 1; j < links.length; j++) {
              children.push({
                title: $(links[j]).text().trim(),
                link: relativeLink($(links[j]).attr("href")),
              });
            }
            if (title != "") notices.push({ title, link, children });
          }

          let oldNotices = JSON.parse(fs.readFileSync(`cache/${tab}.json`));
          let newNotices = [];
          for (let notice of notices) {
            let found = false;
            for (let oldNotice of oldNotices) {
              if (notice.title == oldNotice.title) {
                found = true;
                break;
              }
            }
            if (!found) {
              newNotices.push(notice);
            }
          }

          if (newNotices.length > 0) {
            send = true;
            messages[tab] = newNotices;
            fs.writeFileSync(
              `cache/${tab}.json`,
              JSON.stringify(notices, null, 2)
            );
          }
        }
        console.log(
          "Successfully checked main website at",
          new Date().toLocaleString()
        );
      } catch (errorMain) {
        console.log(errorMain);
        console.log(
          "Error fetching main website at",
          new Date().toLocaleString(),
          errorMain.code
        );
      }

      try {
        let examResponse = await axios.get("http://exam.dtu.ac.in/result.htm", {
          timeout: 10000,
          httpsAgent: agent,
        });
        let e$ = cheerio.load(examResponse.data);
        let examNotices = [];
        e$("a").map((i, el) => {
          let link = el.attribs.href;
          if (link.endsWith(".pdf")) {
            examNotices.push({
              link: relativeLink(link, "exam.dtu.ac.in"),
              title: link.split("/").pop().split(".")[0],
            });
          }
        });

        let oldExamNotices = JSON.parse(fs.readFileSync(`cache/Exams.json`));
        let newExamNotices = [];
        for (let notice of examNotices) {
          let found = false;
          for (let oldNotice of oldExamNotices) {
            if (notice.title == oldNotice.title) {
              found = true;
              break;
            }
          }
          if (!found) {
            newExamNotices.push(notice);
          }
        }

        if (newExamNotices.length > 0) {
          send = true;
          messages["Exams"] = newExamNotices;
          fs.writeFileSync(
            `cache/Exams.json`,
            JSON.stringify(examNotices, null, 2)
          );
        }
        console.log(
          "Successfully checked exam website at",
          new Date().toLocaleString()
        );
      } catch (errorExam) {
        console.log(
          "Error fetching exam website at",
          new Date().toLocaleString(),
          errorExam.code
        );
      }

      if (send) {
        console.log("New Notices", messages);
        await sendTelegram(messages);
      }

      console.log("--- Successfully checked ---", new Date().toLocaleString());
    } catch (error) {
      console.log(
        "Error at",
        new Date().toLocaleString(),
        error.code,
        error.config?.url
      );
    }
    await delay(1 * 60 * 1000);
  }
})();

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