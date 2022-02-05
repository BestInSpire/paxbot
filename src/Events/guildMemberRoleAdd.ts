"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { GuildMember, MessageEmbed, Role } from "discord.js";
import { dataModels } from "../Structures/database";

export default (client: ClientType) =>
  new EventStructure({
    on: "guildMemberRoleAdd",
    execute: async (member: GuildMember, role: Role) => {
      const data = await dataModels.modlog.findOne({
        guild: member.guild?.id,
      });
      if (!data) return;

      const embed = new MessageEmbed()
        .setColor(`#${process.env.EMBEDCOLOR}`)
        .setAuthor({
          name: "Bir üyeye rol eklendi!",
          iconURL: `${member?.displayAvatarURL()}`,
        })
        .addField("Rolleri güncellenen üye:", `${member.user}`, true)
        .addField("Eklenen Rol", `${role}`, true);
      //@ts-ignore
      client.channels?.cache.get(`${data.channel}`)?.send({
        content: null,
        embeds: [embed],
      });
    },
  });
