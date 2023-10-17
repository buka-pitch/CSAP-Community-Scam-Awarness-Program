import { Scenes, Telegraf, session, Context, Composer, Markup } from "telegraf";
import { BaseScene, SceneSession, Stage, WizardScene } from "telegraf/scenes";
import {
  InlineKeyboardButton,
  Update,
  InlineKeyboardMarkup,
  KeyboardButton,
} from "telegraf/types";
import { getAllUsersChatId, prisma } from "./ScamBase";
import { bot } from "./app";

type Msg = {
  data: string,
  button: InlineKeyboardMarkup;
};


type SyncSession = {
  scene: string;
  payload: {};
};


export function syncUserSceneSession(command: string, state: SyncSession) {
  //function to set and check user scene ans session data;
  function update() {
    function set() { }

    function check() { }

    switch (command) {
      case "update":
        update();
        break;

      case "set":
        set();
        break;

      case "check":
        check();
        break;

      default:
        break;
    }
  }
}


export async function SendMessageFunction(message: Msg) {
  const ids = await getAllUsersChatId();
  ids.forEach((user) => {
    return bot.telegram.sendMessage(
      user.chatId,
      message.data,
      { reply_markup: message.button }
    );
  });
}


export async function SendMessageXFunction(message: any) {
  const ids = await getAllUsersChatId();
  ids.forEach((user) => {
    return bot.telegram.sendPhoto(
      user.chatId, { "url": "https://www.digitaltveurope.com/files/2022/10/20220201-safaricom-kenya-logo.jpg" },
      { "caption": message.title + "\n" + message.description, reply_markup: message.button });
  });
}



export async function SendFeedBack(message: Msg) {
  const ids = await prisma.admin.findMany();
  ids.forEach(async (item) => {
    return bot.telegram.sendMessage(
      item.chatId,
      message.title + "\n" + message.description,
      { reply_markup: message.button }
    );
  });
}
