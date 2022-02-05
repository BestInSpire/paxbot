import { CustomCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { Message, MessageEmbed } from "discord.js";
import { giveawaysManager } from "../../Structures/giveaways";
import { Giveaway } from "discord-giveaways";

export default (client: ClientType) =>
  new CustomCommands({
    props: {
      name: "çekiliş-yeniden",
      aliases: ["giveaway-reroll", "çekilişyeniden", "giveawayreroll"],
      category: "Çekiliş",
      description: "Bitmiş bir çekiliş için yeni kazanan(lar) seçersiniz!",
      usage: "!çekiliş-yeniden",
      enabled: true,
      owner: false,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["ADMINISTRATOR"] },
      cooldown: 10000,
    },
    execute: (message: Message, args: string[]) => {
      if (!args[0])
        return message.reply({
          content: "Kaç kişinin yeniden seçileceğini rakamlarla yazmalısın!",
        });

      if (isNaN(parseInt(args[0])))
        return message.reply({
          content: "Kaç kişinin yeniden seçileceğini rakamlarla yazmalısın!",
        });

      if (!args[1])
        return message.reply({
          content:
            "Yeni kazanan seçilecek olan çekilişin ödülünü veya mesaj ID'sini girmelisin!",
        });

      let giveaway: Giveaway | undefined =
        giveawaysManager.giveaways.find(
          (g) => g.prize === args.slice(1).join(" ")
        ) || giveawaysManager.giveaways.find((g) => g.messageId === args[1]);

      if (!giveaway)
        return message.reply({
          content: "Bu çekiliş bulunamadı!",
        });

      giveawaysManager
        .reroll(`${giveaway.messageId}`, {
          winnerCount: parseInt(args[0]),
          messages: {
            congrat:
              ":tada: Yeni kazanal(lar): {winners}! Tebrikler, ödülü **{this.prize}** olan çekilişi kazandınız!\n{this.messageURL}",
            error: "Seçilebilecek yeni kazanan bulunamadı!",
          },
        })
        .then(() =>
          message.reply({
            content: "Yeni kazanan(lar) başarıyla seçildi!",
          })
        )
        .catch((e) => {
          if (
            e.startsWith(
              `Giveaway with message ID ${giveaway?.messageId} is not ended.`
            )
          )
            return message.reply({
              content: "Bu çekiliş henüz sona ermemiş!",
            });
          else {
            console.error(e);
            return message.reply({
              content: "Bir hata oluştu!",
            });
          }
        });
    },
  });
