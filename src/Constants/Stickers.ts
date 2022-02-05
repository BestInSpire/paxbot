"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { Message } from "discord.js";
import { dataModels } from "../Structures/database";
const spoilerReg: RegExp = /\|\|/g;

export default (client: ClientType) =>
  new EventStructure({
    on: "messageCreate",
    execute: async (message: Message) => {
      if (message.author.bot) return;
      if (
        message.member?.permissions.has("MANAGE_MESSAGES") ||
        message.member?.permissions.has("ADMINISTRATOR")
      )
        return;
      if (message.stickers.size <= 0) return;
      const stickersData = await dataModels.automode.findOne({
        guild: message.guild?.id,
      });
      if (stickersData ? stickersData.stickers : false) {
        message.delete();
        message.channel
          .send({
            content: `${message.author}, Stickers!`,
          })
          .then((msg) =>
            setTimeout(() => {
              msg.delete();
            }, 2000)
          );
      }
    },
  });
