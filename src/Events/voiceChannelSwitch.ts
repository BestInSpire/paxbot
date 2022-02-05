"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { GuildMember, MessageEmbed, VoiceChannel } from "discord.js";
import { dataModels } from "../Structures/database";

export default (client: ClientType) =>
  new EventStructure({
    on: "voiceChannelSwitch",
    execute: async (
      member: GuildMember,
      oldChannel: VoiceChannel,
      newChannel: VoiceChannel
    ) => {
      const data = await dataModels.modlog.findOne({
        guild: member.guild?.id,
      });
      if (!data) return;
      if (newChannel == undefined) return;
      const embed = new MessageEmbed()
        .setColor(`#${process.env.EMBEDCOLOR}`)
        .setAuthor({
          name: "Bir kullanıcı sesli kanalını değiştirdi!",
          iconURL: `${member.displayAvatarURL()}`,
        })
        .addField(
          "Sesli kanalını değiştiren kullanıcı:",
          `${member.user}`,
          true
        )
        .addField("Eski kanalı:", `${oldChannel}`, true)
        .addField("Yeni katıldığı kanal:", `${newChannel}`, true);

      //@ts-ignore
      client.channels?.cache.get(`${data.channel}`)?.send({
        content: null,
        embeds: [embed],
      });
    },
  });
