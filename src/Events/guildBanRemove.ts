"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { dataModels } from "../Structures/database";
import { Guild, Message, MessageEmbed, User } from "discord.js";

export default (client: ClientType) =>
  new EventStructure({
    on: "guildBanRemove",
    execute: async (guild: Guild, user: User) => {
      const data = await dataModels.modlog.findOne({
        guild: guild?.id,
      });
      if (!data) return;

      var audit = await guild.fetchAuditLogs();
      let auditLog: any;
      try {
        auditLog = audit.entries.first();
      } catch {
        auditLog =
          "```diff\n-Denetim kaydına erişirken bir sorun oluştu! Lütfen onu görüntülemeye iznim olduğuna emin olun.\n```";
      }

      var ch = client.guilds.cache
        .get(guild?.id)
        ?.channels.cache.get(data.channel);
      const _Embed = new MessageEmbed()
        .setAuthor({ name: "Bir kullanıcının yasağı kaldırıldı!" })
        .addField("Yasağı kaldırılan kullanıcı:", `${user.tag}`, true)
        .addField(
          "Yasağı kaldıran yetkili:",
          `<@${auditLog?.executor?.id}>`,
          true
        )
        .setColor(`#${process.env.EMBEDCOLOR}`);
      //@ts-ignore
      ch?.send({ embeds: [_Embed] });
    },
  });
