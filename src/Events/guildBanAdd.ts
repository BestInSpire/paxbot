"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { dataModels } from "../Structures/database";
import { Guild, Message, MessageEmbed, User } from "discord.js";

export default (client: ClientType) =>
  new EventStructure({
    on: "guildBanAdd",
    execute: async (guild: Guild, user: User) => {
      const data = await dataModels.modlog.findOne({
        guild: guild?.id,
      });
      if (!data) return;

      var row = data.channel;
      let reason = "Sebep belirtilmemiş!";
      var audit = await guild.fetchAuditLogs();

      try {
        var auditLog = audit.entries.first();
      } catch (err) {
        var ch = client.guilds.cache.get(guild?.id)?.channels.cache.get(row);
        const embed = new MessageEmbed()
          .setAuthor({ name: "Bir üye yasaklandı!" })
          .setColor(`#${process.env.EMBEDCOLOR}`)
          .addField("Yasaklanan üye", `${user.tag}`, true)
          .addField("Sebep", `\`\`\`${reason}\`\`\``);
        //@ts-ignore
        return ch?.send({ embeds: [embed] });
      }
      if (auditLog?.reason) {
        reason = auditLog?.reason;
      }

      var ch = client.guilds.cache.get(guild?.id)?.channels.cache.get(row);
      const _embed = new MessageEmbed()
        .setAuthor({ name: "", iconURL: `${user?.displayAvatarURL()}` })
        .addField("Yasaklanan üye", `${user.tag}`, true)
        .addField(
          "Yasaklayan yetkili",
          `<@${auditLog?.executor?.id}> (${auditLog?.executor?.tag})`,
          true
        )
        .addField("Sebep", `\`\`\`${reason}\`\`\``)
        .setColor(`#${process.env.EMBEDCOLOR}`);
      //@ts-ignore
      return ch.send({ embeds: [_embed] });
    },
  });
