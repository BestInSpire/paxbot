"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { Message, Collection } from "discord.js";
import { dataModels } from "../Structures/database";
const userMap = new Collection();

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
      const args = message.content.split(" ").slice(1);
      if (client.emojis.cache.get(args.filter((x) => x.includes("<:"))[0]))
        return;

      const fastMessageSpamData = await dataModels.automode.findOne({
        guild: message.guild?.id,
      });
      if (fastMessageSpamData ? fastMessageSpamData.messageSpam : false) {
        const userData: any = userMap.get(message.author?.id);
        if (userData && parseInt(`${userData.messageCount}`) + 1 >= 5) {
          //@ts-ignore
          message.channel.bulkDelete(5).then(() => {
            message.channel
              .send({
                content: `${message.author}, Fast Message Spam!`,
              })
              .then((msg) =>
                setTimeout(() => {
                  msg.delete();
                }, 2000)
              );
          });
        } else {
          if (userMap.get(message.author?.id)) {
            userMap.set(`${message.author?.id}`, {
              //@ts-ignore
              messageCount: userMap.get(message.author?.id).messageCount + 1,
            });
          } else {
            userMap.set(`${message.author?.id}`, { messageCount: 1 });
          }

          setTimeout(() => {
            userMap.set(`${message.author?.id}`, {
              //@ts-ignore
              messageCount: userMap.get(message.author?.id).messageCount - 1,
            });
          }, 5000);
        }
      }
    },
  });
