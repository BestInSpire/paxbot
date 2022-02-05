import { CustomCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import { Message, MessageEmbed } from "discord.js";

export default (client: ClientType) =>
  new CustomCommands({
    props: {
      name: "eval",
      aliases: [],
      category: "Geliştirici",
      description: "Anlık olarak kod yürütmek için kullanılır!",
      usage: "!eval [kod]",
      enabled: true,
      owner: true,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["SEND_MESSAGES"] },
      cooldown: 10000,
    },
    execute: (message: Message, args: string[]) => {
      try {
        var code = args.join(" ");
        var evaled = eval(code);
        let tip = typeof clean(evaled);

        evaled = require("util").inspect(evaled);

        if (evaled.length > 1000) {
          let Embed = new MessageEmbed()
            .addField(`📥 Giriş`, "```js\n" + code + "```")
            .setColor(`#${process.env.EMBEDCOLOR}`)
            .addField(`📤 Çıktı`, "```js\n" + evaled.slice(0, 1000) + "...```")
            .addField("Tip", `\`${tip}\``, true)
            .addField("Uzunluk", `\`${evaled.length}\``, true)
            .addField("Gecikme", ` \`0.0${client.ws.ping} ms\` `, true);

          message.reply({ embeds: [Embed] });
        } else {
          let Embed = new MessageEmbed()
            .addField(`📥 Giriş`, "```js\n" + code + "```")
            .setColor(`#${process.env.EMBEDCOLOR}`)
            .addField(`📤 Çıktı`, "```js\n" + clean(evaled) + "```")
            .addField("Type", `\`${tip}\``, true)
            .addField("Length", `\`${evaled.length}\``, true)
            .addField("Delay", ` \`0.0${client.ws.ping} ms\` `, true);

          message.reply({ embeds: [Embed] });
        }
      } catch (err) {
        message.reply(`\`HATA\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }

      function clean(text: unknown) {
        if (typeof text === "string")
          return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
        else return text;
      }
    },
  });
