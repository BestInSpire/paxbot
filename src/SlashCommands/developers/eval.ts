import { SlashCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { BaseCommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default (client: ClientType) =>
  new SlashCommands({
    props: new SlashCommandBuilder()
      .setName("eval")
      .setDescription("Anlık olarak kod denersiniz!")
      .addStringOption((option) =>
        option.setName("kod").setDescription("Kodu gir").setRequired(true)
      ),
    data: {
      permissions: {
        bot: ["SEND_MESSAGES", "EMBED_LINKS"],
        member: ["SEND_MESSAGES"],
      },
      userType: "developers",
      enabled: true,
      cooldown: 10000,
      nsfwChannel: false,
    },

    execute: async (interaction: BaseCommandInteraction) => {
      try {
        //@ts-ignore
        var code = interaction.options._hoistedOptions[0].value;
        var evaled = eval(code);
        let tip = typeof clean(evaled);

        evaled = (await import("util")).inspect(evaled);

        if (evaled.length > 1000) {
          let Embed = new MessageEmbed()
            .addField(`📥 Giriş`, "```js\n" + code + "```")
            .setColor("#fbbd08")
            .addField(`📤 Çıktı`, "```js\n" + evaled.slice(0, 1000) + "...```")
            .addField("Tip", `\`${tip}\``, true)
            .addField("Uzunluk", `\`${evaled.length}\``, true)
            .addField("Gecikme", ` \`0.0${client.ws.ping} ms\` `, true);

          interaction.reply({ embeds: [Embed] });
        } else {
          let Embed = new MessageEmbed()
            .addField(`📥 Giriş`, "```js\n" + code + "```")
            .setColor("#fbbd08")
            .addField(`📤 Çıktı`, "```js\n" + clean(evaled) + "```")
            .addField("Type", `\`${tip}\``, true)
            .addField("Length", `\`${evaled.length}\``, true)
            .addField("Delay", ` \`0.0${client.ws.ping} ms\` `, true);

          interaction.reply({ embeds: [Embed] });
        }
      } catch (err) {
        interaction.reply(`\`HATA\` \`\`\`xl\n${clean(`${err}`)}\n\`\`\``);
      }

      function clean(text: string | any) {
        if (typeof text === "string")
          return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
        else return text;
      }
    },
  });
