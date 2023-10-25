import { MyContext, MyWizardSession } from "../app";
import { Scenes, Telegraf, session, Context, Composer, Markup } from "telegraf";
import { BaseScene, Stage, WizardScene } from "telegraf/scenes";
import { InlineKeyboardButton, Update } from "telegraf/types";
import { alertMsg } from "../constant";
import { GenerateBotScamLink } from "../ScamBase";
import { GenerateCertificate } from "../cert";
import { file } from "bun";
import fs from "fs";
import { SendFeedBack } from "../BotFunctions";
import { ButtonType } from "./DynamicWizardScene";
import { getAllCourses } from "../CourseFunctions";
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

BaseUserScene.hears("Scan File 📂", async (cxt, next) => {
  await next();
});
BaseUserScene.hears("Scan Link 🔗", async (cxt, next) => {
  await cxt.replyWithMarkdownV2("``` Paste the Url to Scan```");
  await next();
});
BaseUserScene.hears("Change Language", () => { });
BaseUserScene.hears("Next", async (cxt, next) => {
  cxt.scene.enter("enrolledUserScene");
  await next()
})
BaseUserScene.hears("Share ⏩", async (cxt, next) => {
  await cxt.scene.enter("OneQuestionscene", { "Caller": "share" });
  return await next();
});
BaseUserScene.hears("Send Feedback", (cxt, next) => {
  cxt.scene.enter("OneQuestionscene", { question: "Send Your Fedback -" })
  SendFeedBack(cxt.session.userAnswer);
  next();
});

BaseUserScene.hears("Hire the Developer", () => { });
BaseUserScene.hears("Check for new Course 🎓", async (cxt, next) => {
  const courses = await getAllCourses();
  let button: ButtonType = [{ text: "", callback_data: "0", hide: false }];
  let inlinekeyboard = courses.forEach((item, index) => {
    return button.push({
      text: item.title,
      callback_data: item.id.toString(),
      hide: false,
    });
  });

  await cxt.replyWithMarkdown(
    "``` - Available Courses -```\n",
    Markup.inlineKeyboard(button, { "columns": 1 }));
})

BaseUserScene.on("callback_query", async (cxt, next) => {
  console.log(cxt.update.callback_query.data);
  if (cxt.callbackQuery.data === "Next") {
    cxt.answerCbQuery("Continued");
    cxt.scene.enter("enrolledUserScene");
  }
  else {
    let course = await getAllCourses();
    course.forEach((item, index) => {
      if (cxt.callbackQuery.data === item.id) {
        if (item.content.length > 0) {
          cxt.session.courseId = item.id;
          cxt.session.courseIndex = index;
          cxt.session.courseTitle = item.title;
          cxt.session.newCourse = true;
          cxt.session.lessonTitle = item.content[0].title;
          cxt.session.lessonIndex = 0;
          cxt.answerCbQuery(`starting - ${item.title}`);
          return cxt.scene.enter("LessonScene");
        } else cxt.answerCbQuery("Course Comming Soon!");
      }
    });

  }


})
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

