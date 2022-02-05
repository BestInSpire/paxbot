import { CustomCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { Message, MessageEmbed } from "discord.js";
import { dataModels } from "../../Structures/database";
import humanizeDuration from "humanize-duration";

export default (client: ClientType) =>
  new CustomCommands({
    props: {
      name: "uyarılar",
      aliases: [
        "uyarı-listesi",
        "warn-list",
        "uyarı-liste",
        "uyarılistesi",
        "uyarıliste",
        "warnlist",
      ],
      category: "Moderasyon",
      description:
        "Etiketlediğiniz kullanıcının veya kendinizin uyarı listesini görüntülersiniz!",
      usage: "!uyarılar [@üye]",
      enabled: true,
      owner: false,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["SEND_MESSAGES"] },
      cooldown: 10000,
    },
    execute: async (message: Message, args: string[]) => {
      const data = await dataModels.warn.findOne({
        user: message.mentions.users.first()?.id || message.author.id,
      });
      if (data && data.warns.length > 0) {
        const list = data.warns
          .map(
            (x: any, i: any) =>
              `**${i + 1}. Uyarı**\nUyaran yetkili: ${client.users.cache.get(
                x.moderator
              )}\nUyarı sebebi: ${x.reason}\nKalan süre: ${humanizeDuration(
                Date.now() - x.globalTime,
                {
                  language: "tr",
                  round: true,
                }
              )}`
          )
          .join("\n\n");
        const embed = new MessageEmbed()
          .setColor("#fbbd08")
          .setDescription(`${list}`);
        message.reply({
          embeds: [embed],
        });
      } else {
        message.reply({
          content: "Aktif uyarın bulunmuyor!",
        });
      }
    },
  });
