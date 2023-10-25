//TODO
//create a scene for every function to create or manage the program as admin
//create a dynamic scene to render the course lesson and questions
//-->
//

import { MyContext, MyWizardSession } from "../app";
import { Scenes, Telegraf, session, Context, Composer, Markup } from "telegraf";
import { BaseScene, Stage, WizardScene } from "telegraf/scenes";
import { InlineKeyboardButton, Update } from "telegraf/types";
import { LessonType, getAllCourses, getCourse } from "../CourseFunctions";
import { prisma } from "../ScamBase";
import { it } from "test";
import { GenerateCertificate } from "../cert";

export const CompleteLessonScene = new BaseScene<MyContext>(
  "CompleteLessonScene"
);

export type ButtonType = { text: string; callback_data: string; hide: false }[];
CompleteLessonScene.enter(async (cxt, next) => {
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
    "***You have successfuly completed this lesson***\n```You can choose your next Concept to continue.```\n",
    Markup.inlineKeyboard(button, { "columns": 1 })
  );

  let cert = GenerateCertificate(cxt.from.first_name + cxt.from.last_name, cxt.session.courseTitle);
  cxt.sendDocument({ "filename": "csap certificate.pdf", source: cert, }, { "caption": "your csap certificate" });
});

CompleteLessonScene.on("callback_query", async (cxt, next) => {
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
});



export const ViewLesson = new BaseScene<MyContext>("ViewLessonScene");
ViewLesson.enter(async (cxt, next) => {

  if (cxt.session.lessonTitle) {
    let { lessonTitle, lessonIndex, courseId } = await cxt.session;
    const lessons = await prisma.lesson
      .findUnique({
        where: { title: lessonTitle, courseId: courseId },
        include: { Question: true },
      })
      .catch((error) => {
        console.error(error.message);
        console.log("no lesson found with " + lessonTitle);
      });

    cxt.session.lessonIndex = 1;
    await cxt.replyWithMarkdownV2(
      "``` " + lessons?.title + "\n\n" + lessons?.description + " ```",
      Markup.keyboard(["Next", "Quit"]).resize(true).oneTime(true)
    );

    if (lessons?.Question?.length > 0) {
      cxt.session.questions = [];
      lessons?.Question.map(async (question) => {
        cxt.session.questions.push(question)
      });
      // rendering question if any
    }


  } else {
    cxt.scene.leave();
  }
});

ViewLesson.on("callback_query", async (cxt, next) => {
  if (await cxt.update.callback_query.data === "Next") {
    cxt.deleteMessage();
    console.log(`lesson ${cxt.session.lessonTitle}`);
    cxt.scene.enter("LessonScene");
  }
  else {
    console.log(cxt.callbackQuery.data);
  }
});

ViewLesson.hears("Next", async (cxt, next) => {
  cxt.deleteMessage();
  cxt.scene.enter("LessonScene");
});

ViewLesson.hears("Quit", async (cxt, next) => {
  cxt.deleteMessage();
  return cxt.scene.enter("BaseUserScene");
});

export const LessonScene = new WizardScene<MyContext>(
  "LessonScene",
  async (cxt, next) => {

    console.log(`Lesson scene ` + cxt.session.lessonTitle);

    if (cxt.session.lessonTitle) {
      let { lessonTitle, courseIndex, courseId, lessonIndex } = cxt.session;
      let courses = await getAllCourses();
      cxt.session.courseTitle = courses[courseIndex].title;
      let lessonLength = courses[courseIndex].content.length;
      console.log(lessonIndex);
      console.log(lessonLength);
      if (lessonIndex >= lessonLength) {
        if (cxt.session?.questions.length > 0) {

          cxt.scene.enter("RenderQuestionScene");
        } else {
          return cxt.scene.enter("CompleteLessonScene");
        }
      } else {
        // console.log(nextIndex)
        let Ctitle = courses[courseIndex].content[lessonIndex].title;
        // console.log(Ctitle)
        cxt.session.lessonTitle = Ctitle;
        cxt.scene.enter("ViewLessonScene");
      }
    } else {
      let initial = 0;
      if (!cxt.session.lessonTitle) {
        cxt.session.courseIndex = 0;
        let courses = await getAllCourses();
        let CourseId = courses[0].id;
        cxt.session.courseId = CourseId;
        let Ctitle = courses[0].content[0].title;
        cxt.session.lessonTitle = Ctitle;
        cxt.session.lessonIndex = 0;
      } else {
        cxt.session.lessonIndex = 0;
        console.log(cxt.session);
        cxt.scene.leave();
        cxt.scene.enter("ViewLessonScene");
      }
    }
    // cxt.scene.enter("ViewLessonScene", { "lesson": "bukayo", index: 4 });
  }
);

LessonScene.hears("Next ->", async (cxt) => {
  cxt.reply("i can hear you");
  return cxt.wizard.next();
});
