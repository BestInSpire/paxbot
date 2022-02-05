import { SlashCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { BaseCommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { dataModels } from "../../Structures/database";
import humanizeDuration from "humanize-duration";
import ms from "ms";

export default (client: ClientType) =>
  new SlashCommands({
    props: new SlashCommandBuilder()
      .setName("mute")
      .setDescription("Bir kullanıcıyı susturursunuz!")
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
      const data = await dataModels.mute.findOne({
        user: fetchedUser?.id,
      });

      if (data)
        return interaction.reply({
          content: "Bu kullanıcı zaten susturulmuş durumda!",
        });
      await new dataModels.mute({
        member: fetchedUser?.id,
        time: `${Date.now() + fetchedTime}`,
      })
        .save()
        .then(() => {
          interaction.reply({
            content: "Kullanıcı başarıyla susturuldu!",
          });
          client.users.cache.get(`${fetchedUser?.id}`)?.send({
            embeds: [
              new MessageEmbed()
                .setAuthor("X Sunucusunda Susturuldun")
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
                .addField("Susturan Yetkili", `${interaction.user}`)
                .setColor("#fbbd08"),
            ],
          });
        });
    },
  });
