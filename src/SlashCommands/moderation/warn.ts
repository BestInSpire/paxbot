import { SlashCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { BaseCommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { dataModels } from "../../Structures/database";
import humanizeDuration from "humanize-duration";
/** @ts-ignore */
import TrDate from "tr-date";
import ms from "ms";

export default (client: ClientType) =>
  new SlashCommands({
    props: new SlashCommandBuilder()
      .setName("uyar")
      .setDescription("Bir kullanıcıyı uyarırsınız!")
      .addUserOption((option) =>
        option
          .setName("üye")
          .setDescription("Uyarmak istediğin kullanıcıyı belirt!")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("süre")
          .setDescription("Süreyi belirt! Örn: 15m => 15 dakika!")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("sebep").setDescription("Sebep gir!")
      ),

    data: {
      permissions: {
        bot: ["SEND_MESSAGES", "EMBED_LINKS"],
        member: ["ADMINISTRATOR"],
      },
      userType: "all",
      enabled: true,
      cooldown: 10000,
      nsfwChannel: false,
    },

    execute: async (interaction: BaseCommandInteraction) => {
      const fetchedUser = interaction.options.getUser("üye");
      const fetchedTime = ms(`${interaction.options.get("süre")?.value}`);
      const fetchedReason = interaction.options.get("sebep");
      const data = await dataModels.warn.findOne({
        user: fetchedUser?.id,
      });
      if (data) {
        data.warns.push({
          user: fetchedUser?.id,
          member: fetchedUser?.id,
          reason: fetchedReason ? fetchedReason?.value : "Sebep belirtilmemiş!",
          moderator: interaction.user.id,
          time: Date.now() + fetchedTime,
          date: new TrDate().getTime(),
          timeStamp: humanizeDuration(fetchedTime, {
            language: "tr",
            round: true,
          }),
        });
        data.save().then(() => {
          interaction.reply({
            content: "Kullanıcı başarıyla uyarıldı!",
          });
          client.users.cache.get(`${fetchedUser?.id}`)?.send({
            embeds: [
              new MessageEmbed()
                .setAuthor("X Sunucusunda Uyarıldın")
                .addField(
                  "Sebep:",
                  fetchedReason
                    ? `${fetchedReason?.value}`
                    : "Sebep belirtilmemiş!"
                )
                .addField(
                  "Süre",
                  humanizeDuration(fetchedTime, { language: "tr", round: true })
                )
                .addField("Uyaran Yetkili", `${interaction.member}`)
                .setFooter(
                  "Kalan süreyi öğrenmek için sunucuda !uyarılar komutunu kullanabilirsin!"
                )
                .setColor("#fbbd08"),
            ],
          });
        });
      } else {
        await new dataModels.warn({
          user: fetchedUser?.id,
          warns: [
            {
              member: fetchedUser?.id,
              reason: fetchedReason
                ? `${fetchedReason?.value}`
                : "Sebep belirtilmemiş!",
              moderator: interaction.user?.id,
              time: Date.now() + fetchedTime,
              date: new TrDate().getTime(),
              timeStamp: humanizeDuration(fetchedTime, {
                language: "tr",
                round: true,
              }),
            },
          ],
        })
          .save()
          .then(() => {
            interaction.reply({
              content: "Kullanıcı başarıyla uyarıldı!",
            });
            client.users.cache.get(`${fetchedUser?.id}`)?.send({
              embeds: [
                new MessageEmbed()
                  .setAuthor("X Sunucusunda Uyarıldın")
                  .addField(
                    "Sebep:",
                    fetchedReason
                      ? `${fetchedReason?.value}`
                      : "Sebep belirtilmemiş!"
                  )
                  .addField(
                    "Süre",
                    humanizeDuration(fetchedTime, {
                      language: "tr",
                      round: true,
                    })
                  )
                  .addField("Uyaran Yetkili", `${interaction.user}`)
                  .setColor("#fbbd08")
                  .setFooter(
                    "Kalan süreyi öğrenmek için sunucuda !uyarılar komutunu kullanabilirsin!"
                  ),
              ],
            });
          });
      }
    },
  });
