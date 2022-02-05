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

      const spoilersData = await dataModels.automode.findOne({
        guild: message.guild?.id,
      });
      if (spoilersData ? spoilersData.spoilers : false) {
        const check = isInviteURL(message.content);
        if (check) {
          message.delete();
          message.channel
            .send({
              content: `${message.author}, Spoilers!`,
            })
            .then((msg) =>
              setTimeout(() => {
                msg.delete();
              }, 2000)
            );
        }
      }
    },
  });

const isInviteURL = (text: string) => {
  if (text.match(spoilerReg)) return true;
  else false;
};
