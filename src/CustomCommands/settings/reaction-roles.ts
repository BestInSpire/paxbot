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
      name: "tepki-rol",
      aliases: [],
      category: "Ayarlar",
      description: "Sunucu için tepki rol ekler, listeler veya silersiniz!",
      usage: "!otorol @rol",
      enabled: true,
      owner: false,
      nsfw: false,
      permissions: { bot: ["SEND_MESSAGES"], user: ["ADMINISTRATOR"] },
      cooldown: 10000,
    },
    execute: async (message: Message, args: string[]) => {
      const buttonsRow = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("add")
          .setLabel("Ekle")
          .setStyle("SUCCESS"),
        new MessageButton()
          .setCustomId("delete")
          .setLabel("Sil")
          .setStyle("DANGER"),
        new MessageButton()
          .setCustomId("list")
          .setLabel("Listele")
          .setStyle("PRIMARY")
      );

      message
        .reply({
          content: "Gerçekleştirmek istediğin işlemi butonlardan seç!",
          components: [buttonsRow],
        })
        .then(async (msg: Message<boolean>) => {
          const filter = (i: any) =>
            i.deferUpdate() && i.user.id === message.author.id;

          const buttonsCollector = msg.createMessageComponentCollector({
            filter,
            componentType: "BUTTON",
            time: 2 * 60 * 1000,
          });
          buttonsCollector.on("collect", async (i) => {
            if (i.customId == "add") {
              msg
                .edit({
                  content: null,
                  components: [],
                  embeds: [
                    embedCreator("Tepki Rol'ün bulunacağı kanalı etiketle!"),
                  ],
                })
                .then(() => {
                  const awaitMessageFilter = (m: any) =>
                    m.author.id == message.author.id;
                  msg.channel
                    .awaitMessages({
                      filter: awaitMessageFilter,
                      max: 1,
                      time: 2 * 60 * 1000,
                    })
                    .then(async (channelAnswer) => {
                      await channelAnswer.first()?.delete();
                      const channel = channelAnswer
                        .first()
                        ?.mentions.channels.first();

                      msg
                        .edit({
                          content: null,
                          components: [],
                          embeds: [
                            embedCreator(
                              "Tepki Rol'ün ayarlanacağı rolü etiketle!"
                            ),
                          ],
                        })
                        .then(() => {
                          const awaitMessageFilter = (m: any) =>
                            m.author.id == message.author.id;
                          msg.channel
                            .awaitMessages({
                              filter: awaitMessageFilter,
                              max: 1,
                              time: 2 * 60 * 1000,
                            })
                            .then(async (roleAnswer) => {
                              await roleAnswer.first()?.delete();
                              const role = roleAnswer
                                .first()
                                ?.mentions.roles.first();

                              msg
                                .edit({
                                  content: null,
                                  components: [],
                                  embeds: [
                                    embedCreator(
                                      "Tepki Rol'ün ayarlanacağı emojiyi yaz!"
                                    ),
                                  ],
                                })
                                .then(() => {
                                  const awaitMessageFilter = (m: any) =>
                                    m.author.id == message.author.id;
                                  msg.channel
                                    .awaitMessages({
                                      filter: awaitMessageFilter,
                                      max: 1,
                                      time: 2 * 60 * 1000,
                                    })
                                    .then(async (emojiAnswer) => {
                                      await emojiAnswer.first()?.delete();
                                      const emoji =
                                        emojiAnswer.first()?.content;

                                      msg
                                        .edit({
                                          content: null,
                                          components: [],
                                          embeds: [
                                            embedCreator(
                                              "Tepki Rol'ün ayarlanacağı mesajın ID'sini yaz!"
                                            ),
                                          ],
                                        })
                                        .then(() => {
                                          const awaitMessageFilter = (m: any) =>
                                            m.author.id == message.author.id;
                                          msg.channel
                                            .awaitMessages({
                                              filter: awaitMessageFilter,
                                              max: 1,
                                              time: 2 * 60 * 1000,
                                            })
                                            .then(async (messageidAnswer) => {
                                              await messageidAnswer
                                                .first()
                                                ?.delete();
                                              const messageId =
                                                messageidAnswer.first()
                                                  ?.content;
                                              client.channels.cache
                                                .get(`${channel?.id}`)
                                                //@ts-ignore
                                                ?.messages.fetch(`${messageId}`)
                                                .then(
                                                  async (
                                                    fetchedMessage: any
                                                  ) => {
                                                    if (
                                                      isCustomEmoji(`${emoji}`)
                                                    ) {
                                                      const emojiName =
                                                        emoji?.split(":")[1];

                                                      const searchEmoji =
                                                        message.guild?.emojis.cache.find(
                                                          (x) =>
                                                            x.name == emojiName
                                                        );
                                                      const isData =
                                                        await dataModels.reactionRole.findOne(
                                                          {
                                                            channel:
                                                              channel?.id,
                                                            message:
                                                              fetchedMessage.id,
                                                            role: role?.id,
                                                            emoji:
                                                              searchEmoji?.name,
                                                          }
                                                        );

                                                      if (isData)
                                                        return msg.edit({
                                                          content:
                                                            "Bu bilgilere sahip bir Tepki Rol zaten mevcut!",
                                                          components: [],
                                                          embeds: [],
                                                        });
                                                      else {
                                                        new dataModels.reactionRole(
                                                          {
                                                            channel:
                                                              channel?.id,
                                                            message:
                                                              fetchedMessage.id,
                                                            role: role?.id,
                                                            emoji:
                                                              searchEmoji?.name,
                                                            guild:
                                                              message.guild?.id,
                                                          }
                                                        )
                                                          .save()
                                                          .then(async () => {
                                                            await fetchedMessage.react(
                                                              searchEmoji?.id
                                                            );
                                                            msg.edit({
                                                              content:
                                                                "Başarıyla ayarlandı!",
                                                              components: [],
                                                              embeds: [],
                                                            });
                                                          })
                                                          .catch((error: any) =>
                                                            console.error(error)
                                                          );
                                                      }
                                                    } else {
                                                      const isData =
                                                        await dataModels.reactionRole.findOne(
                                                          {
                                                            channel:
                                                              channel?.id,
                                                            message:
                                                              fetchedMessage.id,
                                                            role: role?.id,
                                                            emoji: emoji,
                                                          }
                                                        );

                                                      if (isData)
                                                        return msg.edit({
                                                          content:
                                                            "Bu bilgilere sahip bir Tepki Rol zaten mevcut!",
                                                          components: [],
                                                          embeds: [],
                                                        });
                                                      else {
                                                        new dataModels.reactionRole(
                                                          {
                                                            channel:
                                                              channel?.id,
                                                            message:
                                                              fetchedMessage.id,
                                                            role: role?.id,
                                                            emoji: emoji,
                                                            guild:
                                                              message.guild?.id,
                                                          }
                                                        )
                                                          .save()
                                                          .then(async () => {
                                                            await fetchedMessage.react(
                                                              emoji
                                                            );
                                                            msg.edit({
                                                              content:
                                                                "Başarıyla ayarlandı!",
                                                              components: [],
                                                              embeds: [],
                                                            });
                                                          })
                                                          .catch((error: any) =>
                                                            console.error(error)
                                                          );
                                                      }
                                                    }
                                                  }
                                                );
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            } else if (i.customId == "delete") {
              let data: any = [];
              await dataModels.reactionRole
                .find({
                  guild: message.guild?.id,
                })
                .then((x) => {
                  for (const dataObject of x) {
                    data.push(dataObject);
                  }
                  const content = data.map(
                    (
                      x: {
                        channel: string;
                        message: string;
                        role: string;
                        emoji: string;
                      },
                      i: number
                    ) => {
                      const searchedEmoji = message.guild?.emojis.cache.find(
                        (a) => a.name == x.emoji
                      );
                      return `[ **${i + 1}**. ] - ${
                        searchedEmoji ? searchedEmoji : x.emoji
                      } => <@&${
                        x.role
                      }>  ([Mesaja Git!](https://canary.discord.com/channels/${
                        message.guild?.id
                      }/${x.channel}/${x.message}))\n`;
                    }
                  );
                  const ListEmbed = new MessageEmbed()
                    .setColor(`#${process.env.EMBEDCOLOR}`)
                    .setDescription(`${content.join("\n")}`)
                    .setThumbnail(
                      `${message.guild?.iconURL({
                        dynamic: true,
                        format: "png",
                        size: 512,
                      })}`
                    )
                    .setFooter({
                      text: `Silmek istediğiniz Tepki Rol'ün numarasını sayı olarak yaz! Cevaplamak için 2 dakikan var!`,
                    });
                  data.length < 1
                    ? msg.edit({
                        content: "Eklenmiş bir Tepki Rol bulunamadı!",
                        components: [],
                        embeds: [],
                      })
                    : msg
                        .edit({
                          content: null,
                          components: [],
                          embeds: [ListEmbed],
                        })
                        .then(async (msgxd) => {
                          const filter = (i: any) =>
                            i.author.id == message.author.id;
                          msgxd.channel
                            .awaitMessages({
                              filter,
                              max: 1,
                              time: 2 * 60 * 1000,
                            })
                            .then(async (answer) => {
                              const selected =
                                data[
                                  parseInt(`${answer.first()?.content}`) - 1
                                ];
                              dataModels.reactionRole
                                .findOneAndDelete({
                                  channel: selected.channel,
                                  message: selected.message,
                                  role: selected.role,
                                  emoji: selected.emoji,
                                })
                                .then(() => {
                                  msg.edit({
                                    content: "Başarıyla silindi!",
                                    components: [],
                                    embeds: [],
                                  });
                                });
                            });
                        });
                });
            } else if (i.customId == "list") {
              let data: any = [];
              await dataModels.reactionRole
                .find({
                  guild: message.guild?.id,
                })
                .then((x) => {
                  for (const dataObject of x) {
                    data.push(dataObject);
                  }
                  const content = data.map(
                    (
                      x: {
                        channel: string;
                        message: string;
                        role: string;
                        emoji: string;
                        guild: string;
                      },
                      i: number
                    ) => {
                      const searchedEmoji = message.guild?.emojis.cache.find(
                        (a) => a.name == x.emoji
                      );
                      return `[ **${i + 1}**. ] - ${
                        searchedEmoji ? searchedEmoji : x.emoji
                      } => <@&${
                        x.role
                      }>  ([Mesaja Git!](https://canary.discord.com/channels/${
                        message.guild?.id
                      }/${x.channel}/${x.message}))\n`;
                    }
                  );
                  const ListEmbed = new MessageEmbed()
                    .setColor(`#${process.env.EMBEDCOLOR}`)
                    .setDescription(`${content.join("\n")}`)
                    .setThumbnail(
                      `${message.guild?.iconURL({
                        dynamic: true,
                        format: "png",
                        size: 512,
                      })}`
                    );
                  data.length < 1
                    ? msg.edit({
                        content: "Eklenmiş bir Tepki Rol bulunamadı!",
                        components: [],
                        embeds: [],
                      })
                    : msg.edit({
                        content: null,
                        components: [],
                        embeds: [ListEmbed],
                      });
                });
            } else return;
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

const isCustomEmoji = (emoji: string) => {
  return emoji.split(":").length == 1 ? false : true;
};
