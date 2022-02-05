import { SlashCommandBuilder } from "@discordjs/builders";

export interface CustomCommands {
  props: {
    name: string;
    aliases: string[];
    category: string;
    description: string;
    usage: string;
    enabled: boolean;
    owner: boolean;
    nsfw: boolean;
    permissions: { bot: string[]; user: string[] };
    cooldown: number;
  };
  execute: any;
}
export interface SlashCommandsType {
  props: SlashCommandBuilder;
  execute: any;
  data: {
    permissions: { bot: string[]; member: string[] };
    userType: string;
    enabled: boolean;
    cooldown: number;
    nsfwChannel: boolean;
  };
}
export class CustomCommands implements CustomCommands {
  constructor(args: {
    props: CustomCommands["props"];
    execute: CustomCommands["execute"];
  }) {
    this.props = args.props;
    this.execute = args.execute;
  }
}
export class SlashCommands implements SlashCommandsType {
  constructor(args: {
    props: SlashCommandsType["props"] | any;
    execute: SlashCommandsType["execute"];
    data: SlashCommandsType["data"];
  }) {
    this.props = args.props;
    this.execute = args.execute;
    this.data = args.data;
  }
  props: SlashCommandBuilder;
  execute: any;
  data: {
    permissions: { bot: string[]; member: string[] };
    userType: string;
    enabled: boolean;
    cooldown: number;
    nsfwChannel: boolean;
  };
}
