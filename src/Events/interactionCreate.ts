"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType, developers, slashCommands } from "..";
import {
  BitField,
  Interaction,
  MessageEmbed,
  PermissionString,
  RecursiveReadonlyArray,
} from "discord.js";
import humanizeDuration from "humanize-duration";
let commandCooldown: any = {};

export default (client: ClientType) =>
  new EventStructure({
    on: "interactionCreate",
    execute: (interaction: Interaction) => {
      if (
        ![
          "720690676978810992",
          "914929854980427788",
          "838458558290329671",
        ].includes(`${interaction.guild?.id}`)
      )
        return;
      if (!interaction.isCommand()) return;
      const CommandName = interaction.commandName;
      //@ts-ignore
      let command: SlashCommandsType = slashCommands.get(CommandName);
      if (!command) return interaction.reply({ content: "Bir hata oluştu!" });
      if (command) {
        if (
          command.data.userType == "developers" &&
          !developers.includes(interaction.user.id)
        )
          return interaction.reply({
            content: "Bu komutu sadece geliştiriciler kullanabilir!",
          });

        if (
          command.data.userType == "premium" &&
          !developers.includes(interaction.user.id)
        )
          return interaction.reply({
            content: "Bu komut premium kullanıcılar için!",
          });

        if (
          command.data.userType == "voting" &&
          !developers.includes(interaction.user.id)
        )
          return interaction.reply({
            content: "Bu komutu kullanabilmek için oy vermelisin!",
          });

        if (!command.data.enabled && !developers.includes(interaction.user.id))
          return interaction.reply({
            content: "Bu komut kullanıma kapalı!",
          });

        if (
          !command.data.permissions.member.every(
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
            ) =>
              // @ts-ignore
              interaction.memberPermissions.has(perm)
          )
        ) {
          const asdasda = command.data.permissions.member.map(
            (/**@type {any} */ x: any) =>
              (interaction.memberPermissions?.has(x) ? "✅ " : "❌ ") + x
          );
          const memberPermissionsEmbed = new MessageEmbed().setDescription(
            `**Bu komutu kullanmak için gereken yetkilere sahip değilsin!**\n\n${asdasda.join(
              "\n"
            )}`
          );
          return interaction.reply({ embeds: [memberPermissionsEmbed] });
        }
        if (
          !command.data.permissions.bot.every(
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
            ) =>
              //@ts-ignore
              interaction.guild.me?.permissions.has(perm)
          )
        ) {
          const asdasda = command.data.permissions.bot.map(
            (
              /**@type {any} */ x:
                | string
                | number
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
              (interaction.guild.me.permissions.has(x) ? "✅ " : "❌ ") + x
          );
          const botPermissionsEmbed = new MessageEmbed().setDescription(
            `**Bu komutu yürütebilmem için gereken yetkilere sahip değilim!**\n\n${asdasda.join(
              "\n"
            )}`
          );
          return interaction.reply({ embeds: [botPermissionsEmbed] });
        }

        let userCooldown = commandCooldown[interaction.user.id];
        if (userCooldown && !developers.includes(interaction.user.id)) {
          const time = userCooldown[command.props.name] || 0;
          if (time && time > Date.now()) {
            return interaction.reply(
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
      }
      /**@ts-ignore */
      if (command.data.nsfwChannel && !interaction.channel?.nsfw)
        return interaction.reply({
          content: "Bu komut NSFW kanalı dışında kullanılamaz!",
        });
      try {
        command.execute(interaction);
        commandCooldown[interaction.user.id] = {};
        commandCooldown[interaction.user.id][command.props.name] =
          Date.now() + command.data.cooldown;
      } catch (error) {
        console.error(error);
      }
    },
  });
