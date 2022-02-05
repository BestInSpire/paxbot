"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { dataModels } from "../Structures/database";
import { Message, Snowflake, Collection } from "discord.js";

export default (client: ClientType) =>
  new EventStructure({
    on: "messageDeleteBulk",
    execute: async (messages: Collection<Snowflake, Message>) => {
      const data = await dataModels.modlog.findOne({
        guild: messages.first()?.guild?.id,
      });
      if (!data) return;

      var messagesAr = messages.map(
        (m) =>
          `${m.author.tag} (${m.id}): ${m.content} | "Ek(ler)"${m.attachments
            .map((g: any) => g.url)
            .join(", ")}`
      );
      var messageBuf =
        `\`\`\`diff\nEtiket (Mesaj ID): İçerik | Ek(ler): [Varsa ek(ler)deki bağlantı]\`\`\`\r\n\n\n` +
        messagesAr.join("\r\n\n");
      var buf = Buffer.from(messageBuf, "utf8");

      const logChannel = await client.channels.fetch(data.channel);
      /** @ts-ignore */
      logChannel?.send({
        content:
          "```diff\n-Toplu mesaj silindi! Silinen Mesajları alttaki dosyadan görüntüleyebilirsin!\n```",
        files: [{ attachment: buf, name: "log.txt" }],
      });
    },
  });
