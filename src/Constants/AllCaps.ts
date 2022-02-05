"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { Message } from "discord.js";
import { dataModels } from "../Structures/database";

export default (client: ClientType) =>
  new EventStructure({
    on: "messageCreate",
    execute: async (message: Message) => {
      if (message.author.bot) return;
      if (message.content.length <= 5) return;
      if (
        message.member?.permissions.has("MANAGE_MESSAGES") ||
        message.member?.permissions.has("ADMINISTRATOR")
      )
        return;

      const capsData = await dataModels.automode.findOne({
        guild: message.guild?.id,
      });
      if (capsData ? capsData.caps : false) {
        const matched = message.content.replace(/[^A-Z]/g, "").length;
        const percentData = percent(matched, message.content.length);
        if (Math.round(percentData) > 75) {
          message.delete();
          message.channel
            .send({
              content: `${message.author}, All Caps!`,
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

const percent = (part: number, total: number) => {
  return (100 * part) / total;
};
