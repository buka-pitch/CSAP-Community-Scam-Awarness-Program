import { MyContext, MyWizardSession, bot } from "../app";
import { Scenes, Telegraf, session, Context, Composer, Markup } from "telegraf";
import { BaseScene, Stage, WizardScene } from "telegraf/scenes";
import { InlineKeyboardButton, Update } from "telegraf/types";
import { CreateCourse } from "../CourseFunctions";
import { GenerateBotScamLink } from "../ScamBase";
import { Question } from "@prisma/client";


export const CreateCourseScene = new WizardScene<MyContext>(
  "CreateCourseScene", async (cxt, next) => {
    await cxt.sendMessage("Course Title ? ");
    return cxt.wizard.next();
  }, async (cxt, next) => {
    if (cxt?.message?.text) {
      cxt.scene.state.course = {};
      cxt.scene.state.course.title = cxt.message.text;

      await cxt.sendMessage("Description of the course ?");
      return cxt.wizard.next();
    } else {
      return cxt.wizard.back();
    }
  }, async (cxt, next) => {
    if (cxt?.message?.text) {
      cxt.scene.state.course.description = cxt.message.text;
      const createdCourse = await CreateCourse(cxt.scene.state.course.title, cxt.scene.state.course.description)
        .then(async (res) => {
          await cxt.sendMessage(res);
          if (res === "Couldn't create the Course") {
            cxt.sendMessage("Couldn't create the Course");
          }
        })
      return cxt.scene.leave();

    }
    else {
      return cxt.wizard.back();
    }
  }
);

export const OneQuestionscene = new WizardScene<MyContext>("OneQuestionscene", async (cxt, next) => {
  if (cxt.scene.session.state?.question) {
    cxt.sendMessage(await cxt.scene.session.state.question);
  } else {
    cxt.replyWithMarkdown("When Sharing to Friends you can customize the label of the link \n the lebel should be and text that you know your friends will fall for to trick them and get the full experiance on scam.\n something like `Get free Gift`\n what should be the label for the link ?");
  }
  cxt.wizard.next();
}, async (cxt, next) => {
  if (cxt?.message?.text) {
    cxt.session.userAnswer = cxt.message.text;
    cxt.reply(cxt.message.text);
  }
  else {
    cxt.wizard.back()
  }

  if (cxt.scene.session.state.Caller === "share") {
    let botUsername = await bot.telegram.getMe();
    let mybotUsername = botUsername.username;
    let link = await GenerateBotScamLink(cxt.session.userAnswer, mybotUsername);
    await cxt.sendMessage(cxt.session.userAnswer, { "parse_mode": "Markdown", "allow_sending_without_reply": true, reply_markup: { inline_keyboard: [[{ "text": cxt.session.userAnswer, "callback_data": "shared", "url": link }]] } },);
  }

})


//______________________ Render question ________________________


export const RenderQuestionScene = new WizardScene<MyContext>("RenderQuestionScene", async (cxt, next) => {
  if (cxt.session.questions) {

    let index = cxt.session.questionIndex | 0;

    let questions: Question[] = cxt.session.questions;
    let currentQuestion = questions[index];
    let correct_answer = currentQuestion.choice.indexOf(currentQuestion.answer);

    cxt.session.questionIndex = index + 1;
    await cxt.sendQuiz(currentQuestion.question, currentQuestion.choice, {
      "explanation": currentQuestion.question + "\n" + currentQuestion.answer,
      "allows_multiple_answers": false,
      "is_anonymous": false,
      "correct_option_id": correct_answer,
      "reply_markup": { inline_keyboard: [[{ "text": "->", "callback_data": "->" }]] },
      "allow_sending_without_reply": false
    });

  }
}, async (cxt, next) => {
  return cxt.wizard.back();
});

RenderQuestionScene.on("poll_answer", async (cxt, next) => {
  let index = cxt.session.questionIndex - 1;
  let question: Question = cxt.session.questions[index];
  let correct_answer = question.choice.indexOf(question.answer);
  if (cxt.pollAnswer.poll_id === correct_answer.toString()) {
    cxt.session.userPoint += 10;
    cxt.replyWithMarkdown("```Great```\t `+10`");
  }
  return cxt.wizard.next()

})
