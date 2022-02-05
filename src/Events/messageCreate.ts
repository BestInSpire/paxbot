"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType, commands, developers } from "..";
import {
  BitField,
  Message,
  PermissionString,
  RecursiveReadonlyArray,
  MessageEmbed,
} from "discord.js";
import humanizeDuration from "humanize-duration";
import { dataModels } from "../Structures/database";
let commandCooldown: any = {};

export default (client: ClientType) =>
  new EventStructure({
    on: "messageCreate",
    execute: async (message: Message) => {
      if (
        ![
          "720690676978810992",
          "914929854980427788",
          "838458558290329671",
        ].includes(`${message.guild?.id}`)
      )
        return;
      const prefix: string = `${process.env.PREFIX}`;
      const args = message.content.split(" ").slice(1);
      if (message.content.startsWith(prefix)) {
        let commandName: string = message.content
          .split(" ")[0]
          .slice(prefix.length);
        let command: any =
          //@ts-ignore
          commands.get(commandName) ||
          commands.find((argss: any) => {
            if (argss.props.aliases.includes(commandName)) return argss;
          });

        if (command) {
          if (!command.props.enabled && !developers.includes(message.author.id))
            return message.reply(
              "Bu komut geçici olarak devredışı bırakılmış!"
            );
          if (command.props.owner && !developers.includes(message.author.id))
            return message.reply(
              "Bu komutu kullanmak için bot geliştiricisi olmalısın!"
            );
          //@ts-ignore
          if (command.props.nsfw && !message.channel.nsfw)
            return message.reply("Bu komut NSFW kanalı dışında kullanılamaz!");
          if (
            message.guild &&
            command.props.permissions.user.length !== 0 &&
            !command.props.permissions.user.every(
              (
                perm:
                  | string
                  | bigint
                  | Readonly<BitField<PermissionString, bigint>>
                  | RecursiveReadonlyArray<
                      | bigint
                      | PermissionString
                      | `${bigint}`
                      | Readonly<BitField<PermissionString, bigint>>
                    >
                //@ts-ignore
              ) => message.member?.permissions.has(perm)
            )
          ) {
            const asdasd = command.props.permissions.user.map(
              (
                x:
                  | string
                  | bigint
                  | Readonly<BitField<PermissionString, bigint>>
                  | RecursiveReadonlyArray<
                      | bigint
                      | PermissionString
                      | `${bigint}`
                      | Readonly<BitField<PermissionString, bigint>>
                    >
              ) =>
                //@ts-ignore
                (message.member.permissions.has(x) ? "✅" : "❌") + ` ${x}`
            );
            const userPermissionsEmbed = new MessageEmbed()
              .setDescription(
                `**Bu komutu kullanmak için gereken yetkilere sahip değilsin!**\nGereken yetkiler:\n${asdasd.join(
                  "\n"
                )}`
              )
              .setColor(`#${process.env.EMBEDCOLOR}`);
            return message.reply({
              embeds: [userPermissionsEmbed],
            });
          }
          if (
            message.guild &&
            command.props.permissions.bot.length !== 0 &&
            !command.props.permissions.bot.every(
              (
                perm:
                  | string
                  | bigint
                  | Readonly<BitField<PermissionString, bigint>>
                  | RecursiveReadonlyArray<
                      | bigint
                      | PermissionString
                      | Readonly<BitField<PermissionString, bigint>>
                      | `${bigint}`
                    >
                //@ts-ignore
              ) => message.guild.me.permissions.has(perm)
            )
          ) {
            const asdasda = command.props.permissions.bot.map(
              (
                x:
                  | string
                  | bigint
                  | Readonly<BitField<PermissionString, bigint>>
                  | RecursiveReadonlyArray<
                      | bigint
                      | PermissionString
                      | Readonly<BitField<PermissionString, bigint>>
                      | `${bigint}`
                    >
              ) =>
                //@ts-ignore
                (message.guild.me.permissions.has(x) ? "✅ " : "❌ ") + ` ${x}`
            );
            const botPermissionsEmbed = new MessageEmbed()
              .setDescription(
                `**${"Bu komutu yürütebilmem için gereken yetkilere sahip değilim"}**\nGereken yetkiler:\n${asdasda.join(
                  "\n"
                )}`
              )
              .setColor(`#${process.env.EMBEDCOLOR}`);
            return message.reply({ embeds: [botPermissionsEmbed] });
          }
          let userCooldown = commandCooldown[message.author.id];
          if (userCooldown && !developers.includes(message.author.id)) {
            const time = userCooldown[command.props.name] || 0;
            if (time && time > Date.now()) {
              return message.reply(
                "Bu komutu tekrar kullanabilmek için **{time}** beklemelisin".replace(
                  "{time}",
                  humanizeDuration(time - Date.now(), {
                    language: "tr",
                    round: true,
                  })
                )
              );
            }
          }
          try {
            command.execute(message, args);
            commandCooldown[message.author.id] = {};
            commandCooldown[message.author.id][command.props.name] =
              Date.now() + command.props.cooldown;
          } catch (err) {
            console.error(err);
          }
        }
      }

      const data = await dataModels.customCommands.findOne({
        name: message.content,
      });

      if (data)
        message.reply({
          content: data.description,
        });
    },
  });
