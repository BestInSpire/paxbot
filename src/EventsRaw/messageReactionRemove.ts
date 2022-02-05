"use strict";
import { EventStructure } from "../Base/Events";
import { ClientType } from "..";
import { dataModels } from "../Structures/database";

export default (client: ClientType) =>
  new EventStructure({
    on: "messageReactionRemove",
    execute: async (data: any) => {
      const findData = await dataModels.reactionRole.findOne({
        message: `${data.d.message_id}`,
        emoji: `${data.d.emoji.name}`,
      });
      client.guilds.cache
        .get(data.d.guild_id)
        ?.members.cache.get(data.d.user_id)
        ?.roles.remove(findData.role);
    },
  });
