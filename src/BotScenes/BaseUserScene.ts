import { MyContext, MyWizardSession } from "../app";
import { Scenes, Telegraf, session, Context, Composer, Markup } from "telegraf";
import { BaseScene, Stage, WizardScene } from "telegraf/scenes";
import { InlineKeyboardButton, Update } from "telegraf/types";
import { alertMsg } from "../constant";
import { GenerateBotScamLink } from "../ScamBase";
import { GenerateCertificate } from "../cert";
import { file } from "bun";
import fs from "fs";
export const BaseUserScene = new BaseScene<MyContext>("BaseUserScene");
BaseUserScene.enter(
  async (cxt, next) => {
    cxt.replyWithChatAction("typing");

    cxt.reply(
      "-",
      Markup.keyboard(
        [
          { text: "Scan File 📂", hide: false },
          { text: "Scan Link 🔗", hide: false },
          { text: "Share ⏩", hide: false },
          { text: "Check for new Course 🎓", hide: false },
          { text: "Change language ⚙️", hide: false },
          { text: "Send Feedback 💬", hide: false },
          { text: " 👨🏻‍💻Hire the Developer 📞", hide: false },

        ],
        {
          columns: 3,
        }
      ).resize(true)
    );

    return await next()
    // cxt.({ "inline_keyboard": [[{ "text": "Continue and learn More ->", "callback_data": "next" }]] });
    // return cxt.scene.enter("enrolledUserScene");
  }
);

BaseUserScene.hears("Scan Files", async (cxt, next) => {

});
BaseUserScene.hears("Scan Link", () => { });
BaseUserScene.hears("Change Language", () => { });
BaseUserScene.hears("Next", async (cxt, next) => {
  cxt.scene.enter("enrolledUserScene");
  await next()
})
BaseUserScene.hears("Share ⏩", async (cxt, next) => {
  await cxt.scene.enter("OneQuestionscene", { "Caller": "share" });
  return await next();
});
BaseUserScene.hears("Send Feedback", () => { });
BaseUserScene.hears("Hire the Developer", () => { });
BaseUserScene.hears("Check for new Course", () => { });
BaseUserScene.on("callback_query", async (cxt, next) => {
  if (cxt.callbackQuery.data === "Next") {
    cxt.answerCbQuery();
    cxt.scene.enter("enrolledUserScene");
  }
  return await next();
})
// BaseUserScene.on("message", async (cxt, next) => {
//   cxt.replyWithChatAction("typing");
//   cxt.reply(
//     "-",
//     Markup.keyboard(
//       [
//         { text: "Scan File 📂", hide: false },
//         { text: "Scan Link 🔗", hide: false },
//         { text: "Share ⏩", hide: false },
//         { text: "Check for new Course 🎓", hide: false },
//         { text: "Change language ⚙️", hide: false },
//         { text: "Send Feedback 💬", hide: false },
//         { text: " 👨🏻‍💻Hire the Developer 📞", hide: false },
//       ],
//       {
//         columns: 3,
//       }
//     ).resize(true)
//   );
//   return await next();
// });
