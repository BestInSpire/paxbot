import { SlashCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { BaseCommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default (client: ClientType) =>
  new SlashCommands({
    props: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Anlık api gecikmesini gösterir!"),
    data: {
      permissions: {
        bot: ["SEND_MESSAGES", "EMBED_LINKS"],
        member: ["SEND_MESSAGES"],
      },
      userType: "all",
      enabled: true,
      cooldown: 10000,
      nsfwChannel: false,
    },

    execute: async (interaction: BaseCommandInteraction) => {
        interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor(`#${process.env.EMBEDCOLOR}`)
                .setDescription(
                  `Api Gecikmesi: **${client.ws.ping}ms**\nMesaj Gecikmesi: **${
                    Date.now() - interaction.createdTimestamp
                  }ms**`
                )
                .setTimestamp(),
            ],
          });
    },
  });
