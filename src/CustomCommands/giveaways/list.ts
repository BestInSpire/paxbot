import { CustomCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { Message, MessageEmbed } from "discord.js";
import { giveawaysManager } from "../../Structures/giveaways";
import { Giveaway } from "discord-giveaways";

export default (client: ClientType) =>
  new CustomCommands({
    props: {
      name: "çekiliş-liste",
      aliases: [
        "giveaway-lists",
        "çekiliş-listesi",
        "çekilişliste",
        "çekilişlistesi",
      ],
      category: "Çekiliş",
      description: "Sunucuda devam eden tüm çekilişleri listeler!",
      usage: "!çekiliş-liste",
      enabled: true,
      owner: false,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["ADMINISTRATOR"] },
      cooldown: 10000,
    },
    execute: (message: Message, args: string[]) => {
      let giveaways: string[] = [];
      const giveaways1 = giveawaysManager.giveaways.filter(
        (g) => g.guildId === message.guild?.id
      );
      const giveaways2 = giveaways1.filter((g) => !g.ended);
      giveaways2.forEach((thisGiveaway: Giveaway, i: number) => {
        giveaways.push(
          `\`${i + 1}.\` <#${thisGiveaway.channelId}> | **${
            thisGiveaway.winnerCount
          }** Kazanan | Ödül **${
            thisGiveaway.prize
          }** | [Gitmek için tıkla!](https://discord.com/channels/${
            message.guild?.id
          }/${thisGiveaway.channelId}/${thisGiveaway.messageId})`
        );
      });
      const embed = new MessageEmbed()
        .setColor(`#${process.env.EMBEDCOLOR}`)
        .setTitle("Devam Eden Çekilişler")
        .setDescription(
          giveaways.join("\n") || "Devam eden çekiliş bulunamadı!"
        )
        .setThumbnail(
          `${message.guild?.iconURL({
            format: "png",
            size: 512,
            dynamic: true,
          })}`
        );
      message.reply({
        embeds: [embed],
      });
    },
  });
