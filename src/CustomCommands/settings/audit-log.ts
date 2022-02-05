import { CustomCommands } from "../../Base/Commands";
import { ClientType } from "../..";
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { dataModels } from "../../Structures/database";

export default (client: ClientType) =>
  new CustomCommands({
    props: {
      name: "log",
      aliases: ["audit-log", "modlog"],
      category: "Ayarlar",
      description: "Sunucu için detaylı bir log kanalı ayarlarsınız!",
      usage: "!log",
      enabled: true,
      owner: false,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["ADMINISTRATOR"] },
      cooldown: 10000,
    },
    execute: async (message: Message, args: string[]) => {
      const logData = await dataModels.modlog.findOne({
        guild: message.guild?.id,
      });

      let buttonRow: MessageActionRow;

      if (logData)
        buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("edit")
            .setLabel("Kanalı Değiştir")
            .setStyle("PRIMARY"),
          new MessageButton()
            .setCustomId("remove")
            .setLabel("Devredışı Bırak")
            .setStyle("DANGER")
        );
      else
        buttonRow = new MessageActionRow().addComponents(
          new MessageButton()
            .setCustomId("add")
            .setLabel("Ekle")
            .setStyle("SUCCESS")
        );

      message
        .reply({
          content: "Yapmak istediğiniz işlemi seçin!",
          components: [buttonRow],
          embeds: [],
        })
        .then((msg) => {
          const filter = (i: any) =>
            i.deferUpdate() && i.user.id === message.author.id;
          const collector = msg.createMessageComponentCollector({
            filter,
            time: 2 * 60 * 1000,
            componentType: "BUTTON",
          });

          collector.on("collect", async (data) => {
            if (data.customId === "add") {
              msg
                .edit({
                  content: null,
                  components: [],
                  embeds: [
                    embedCreator("Detaylı denetim kaydı için kanal etiketle!"),
                  ],
                })
                .then((setLog) => {
                  const setLogFilter = (m: any) =>
                    m.author.id === message.author?.id;
                  setLog.channel
                    .awaitMessages({
                      filter: setLogFilter,
                      max: 1,
                      time: 2 * 60 * 1000,
                      errors: ["time"],
                    })
                    .then(async (answer) => {
                      const channel = answer.first()?.mentions.channels.first();
                      await answer.first()?.delete();
                      if (!channel)
                        return msg.edit({
                          content:
                            "Geçerli bir kanal etiketlemediğiniz için işlem iptal edildi!",
                          components: [],
                          embeds: [],
                        });
                      new dataModels.modlog({
                        channel: channel?.id,
                        guild: message.guild?.id,
                      })
                        .save()
                        .then(() =>
                          msg.edit({
                            content: "Başarıyla ayarlandı!",
                            components: [],
                            embeds: [],
                          })
                        );
                    })
                    .catch((error) => {
                      msg.edit({
                        content: "Bir hata oluştu tekrar deneyin!",
                        components: [],
                        embeds: [],
                      });
                      console.error(error);
                    });
                });
            } else if (data.customId === "edit") {
              msg
                .edit({
                  content: null,
                  components: [],
                  embeds: [
                    embedCreator(
                      "Denetim kaydı için ayarlanacak yeni kanalı etiketle!"
                    ),
                  ],
                })
                .then((editLog) => {
                  const setLogFilter = (m: any) =>
                    m.author.id === message.author?.id;
                  editLog.channel
                    .awaitMessages({
                      filter: setLogFilter,
                      max: 1,
                      time: 2 * 60 * 1000,
                      errors: ["time"],
                    })
                    .then(async (answer) => {
                      const channel = answer.first()?.mentions.channels.first();
                      await answer.first()?.delete();
                      if (!channel)
                        return msg.edit({
                          content:
                            "Geçerli bir kanal etiketlemediğiniz için işlem iptal edildi!",
                          components: [],
                          embeds: [],
                        });
                      logData.channel = channel?.id;
                      logData.save().then(() =>
                        msg.edit({
                          content: "Başarıyla değiştirildi!",
                          components: [],
                          embeds: [],
                        })
                      );
                    })
                    .catch((error) => {
                      msg.edit({
                        content: "Bir hata oluştu tekrar deneyin!",
                        components: [],
                        embeds: [],
                      });
                      console.error(error);
                    });
                });
            } else if (data.customId === "remove") {
              await dataModels.modlog
                .findOneAndRemove({
                  guild: message.guild?.id,
                })
                .then(() =>
                  msg.edit({
                    content: "Başarıyla silindi!",
                    components: [],
                    embeds: [],
                  })
                );
            }
          });
        });
    },
  });

const embedCreator = (description: string) => {
  return new MessageEmbed()
    .setColor(`#${process.env.EMBEDCOLOR}`)
    .setDescription(description)
    .setFooter({ text: "Cevaplamak için 2 dakikanız var!" });
};
