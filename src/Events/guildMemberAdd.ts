"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { GuildMember, MessageEmbed } from "discord.js";
import { dataModels } from "../Structures/database";
import moment from "moment";
export default (client: ClientType) =>
  new EventStructure({
    on: "guildMemberAdd",
    execute: async (member: GuildMember) => {
      const muteData = await dataModels.mute.findOne({
        member: member.id,
      });
      if (muteData && muteData.time > Date.now()) {
        member.roles.add("");
      }

      const otorolData = await dataModels.otorol.findOne({
        guild: member.guild?.id,
      });

      if (otorolData) member.roles.add(otorolData.role);

      const warnData = await dataModels.warn.findOne({
        user: member.id,
      });

      if (warnData && warnData.warns.length >= 1) {
        const roles = {
          first: "901122638439677973",
          second: "901122788084043777",
          three: "901122846737170523",
        };
        if (warnData.warns.length == 1) member.roles.add(roles.first);
        if (warnData.warns.length == 2) member.roles.add(roles.second);
        if (warnData.warns.length >= 3) member.roles.add(roles.three);
      }

      const data = await dataModels.modlog.findOne({
        guild: member.guild?.id,
      });
      if (!data) return;
      await import("moment-duration-format");
      const Embed = new MessageEmbed()
        .setColor(`#${process.env.EMBEDCOLOR}`)
        .setAuthor({
          name: "Bir kullanıcı sunucuya katıldı!",
          iconURL: `${member.user.avatarURL({ dynamic: true, size: 512 })}`,
        })
        .addField("Katılan üye:", `<@${member.user.id}>`)
        .addField(
          "Discord kayıt tarihi:",
          moment(member.user.createdAt).format("DD/MM/YYYY HH:mm:ss"),
          true
        )
        .addField(
          "Sunucuya katıldığı tarih:",
          moment(member.joinedAt).format("DD/MM/YYYY HH:mm:ss"),
          true
        )
        .addField(
          "Yeni mevcut üye sayısı:",
          `${
            member.guild.memberCount -
            member.guild.members.cache.filter((x) => x.user.bot).size
          }`,
          true
        );
      //@ts-ignore
      client.channels.cache.get(data.channel).send({
        content: null,
        embeds: [Embed],
      });
    },
  });
