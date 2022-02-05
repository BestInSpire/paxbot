import { CustomCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { Message, MessageEmbed } from "discord.js";
import { dataModels } from "../../Structures/database";
import ms from "ms";
import humanizeDuration from "humanize-duration";

export default (client: ClientType) =>
  new CustomCommands({
    props: {
      name: "sustur",
      aliases: ["mute"],
      category: "Moderasyon",
      description: "Etiketlediğiniz kullanıcıyı susturursunuz!",
      usage: "!sustur @üye",
      enabled: true,
      owner: false,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["ADMINISTRATOR"] },
      cooldown: 10000,
    },
    execute: async (message: Message, args: string[]) => {
      if (!args[0])
        return message.reply({
          content: "Bir kullanıcıyı etiketlemelisin!",
        });
      if (!args[0].includes("@"))
        return message.reply({
          content: "Geçerli bir kullanıcıyı etiketlemelisin!",
        });
      if (!args[1])
        return message.reply({
          content:
            "Bir süre girmelisin! Örn: `!sustur @kullanıcı 15m [Sebep]` (15 dakika)",
        });
      if (isNaN(ms(args[1])))
        return message.reply({
          content:
            "Geçerli bir süre girmelisin! Örn: `!sustur @kullanıcı 15m [Sebep]` (15 dakika)",
        });
      const data = await dataModels.mute.findOne({
        user: message.mentions.users.first()?.id,
      });

      if (data)
        return message.reply({
          content: "Bu kullanıcı zaten susturulmuş durumda!",
        });
      await new dataModels.mute({
        member: message.mentions.users.first()?.id,
        time: `${Date.now() + ms(args[1])}`,
      })
        .save()
        .then((_x: any) => {
          message.reply({
            content: "Kullanıcı başarıyla susturuldu!",
          });
          client.users.cache
            .get(`${message.mentions.users.first()?.id}`)
            ?.send({
              embeds: [
                new MessageEmbed()
                  .setAuthor({ name: `${message.guild?.name}` })
                  .addField(
                    "Sebep:",
                    args[2] ? args.slice(2).join(" ") : "Sebep belirtilmemiş!"
                  )
                  .addField(
                    "Süre",
                    humanizeDuration(ms(args[1]), {
                      language: "tr",
                      round: true,
                    })
                  )
                  .addField("Susturan Yetkili", `${message.member}`)
                  .setColor("#fbbd08"),
              ],
            });
        });
    },
  });
