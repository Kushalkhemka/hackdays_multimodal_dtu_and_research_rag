const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const https = require("https");

async function sendTelegram(notifications) {
  const BOT_TOKEN = "use your toke";
  const CHANNEL_USERNAME = "@DTUSAARTHI";
  const sendMessageUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const sendDocumentUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  for (let category in notifications) {
    let notices = notifications[category];
    for (let notice of notices) {
      let files = [];
      let message = `New Notice in *${category}* at *${new Date().toLocaleString()}*\n\n`;
      message += `Title: *${notice.title}*\n`;

      if (notice.link) {
        const fixedLink = notice.link.replace("www.dtu.ac.in", "dtu.ac.in");
        message += `*Link*: *${fixedLink}*\n`;
        if (fixedLink.endsWith(".pdf")) {
          files.push(fixedLink);
        }
      }

      if (notice.children?.length) {
        message += `\n*Attachments*\n`;
        for (let child of notice.children) {
          const fixedChildLink = child.link.replace(
            "www.dtu.ac.in",
            "dtu.ac.in"
          );
          message += `    - *${child.title}*: ${fixedChildLink}\n`;
          if (fixedChildLink.endsWith(".pdf")) {
            files.push(fixedChildLink);
          }
        }
      }

      message += `\nBrought to you by DTU Saathi!`;

      try {
        const originalMessage = await axios.post(sendMessageUrl, {
          chat_id: CHANNEL_USERNAME,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });

        if (originalMessage.data.ok) {
          console.log(`Notification sent successfully for "${notice.title}"!`);
        } else {
          console.error(
            `Failed to send notification for "${notice.title}":`,
            originalMessage.data.description
          );
        }

        for (let link of files) {
          try {
            let filePath = path.join(
              __dirname,
              "attachments",
              link.split("/").pop()
            );
            const response = await axios.get(link, {
              responseType: "arraybuffer",
              timeout: 15000,
              httpsAgent: httpsAgent,
            });
            fs.writeFileSync(filePath, response.data);

            const form = new FormData();
            form.append(
              "reply_to_message_id",
              originalMessage.data.result.message_id
            );
            form.append("chat_id", CHANNEL_USERNAME);
            form.append("document", fs.createReadStream(filePath), {
              filename: "[DTU Saathi] " + link.split("/").pop(),
            });

            const documentResponse = await axios.post(sendDocumentUrl, form, {
              headers: form.getHeaders(),
            });

            if (documentResponse.data.ok) {
              console.log(`Document sent successfully: ${link}`);
            } else {
              console.error(
                `Failed to send document: ${link}`,
                documentResponse.data.description
              );
            }
          } catch (e) {
            console.error("Error in sending PDF: ", link, e.message);
          }
        }
      } catch (error) {
        console.error(
          `Error sending notification for "${notice.title}":`,
          error.message
        );
      }
    }
  }
}

module.exports = sendTelegram;