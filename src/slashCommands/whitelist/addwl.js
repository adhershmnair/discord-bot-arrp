const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordConfigs = require('../../configuration/discordConfigs');
const { log, error } = require('../../configuration/logs');
const whitelistLogs = DiscordConfigs.whitelist.whitelistLogChannel ?? DiscordConfigs.whitelist.allLogChannel;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addwl')
    .setDescription('Assign a role to a user for a limited time')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to receive the role')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const whitelistRole = DiscordConfigs.whitelist.whitelistRole;
      const pendingRole = DiscordConfigs.whitelist.pendingRole;
      const targetUser = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(targetUser.id);
      const allowedRoles = DiscordConfigs.whitelist.allowedRoles;
      let hasPermission = Object.values(allowedRoles).some(roleId => interaction.member.roles.cache.has(roleId));      
      if (!hasPermission) {
        error(`<@${interaction.member.id}> tried to assign <@&${whitelistRole}> to <@${targetUser.id}> but does not have permission.`, whitelistLogs);
        await interaction.reply({ content: `You do not have permission to assign this role.`, ephemeral: true });
        return;
      }
      let havePendingRole = member.roles.cache.has(pendingRole);
      if (!havePendingRole) {
        error(`<@${interaction.member.id}> tried to whitelist <@${targetUser.id}> but does not have the <@&${pendingRole}> role.`, whitelistLogs);
        await interaction.reply({ content: `<@${targetUser.id}> does not have the <@&${pendingRole}> role.`, ephemeral: true });
        return;
      }
      if (!whitelistRole) {
        error(`<@${interaction.member.id}> tried to whitelist <@${targetUser.id}> but the whitelist role is not found.`, whitelistLogs);
        await interaction.reply({ content: `Role not found.`, ephemeral: true });
        return;
      }
      await member.roles.add(whitelistRole);
      await member.roles.remove(pendingRole);
      log(`<@${interaction.member.id}> whitelisted <@${targetUser.id}>`, whitelistLogs);
      await interaction.reply({ content: `${targetUser.username} whitelisted`, ephemeral: true });
    } catch (e) {
      console.error(`There was an error executing the command: ${e}`);
      await interaction.reply({ content: `Error executing command: ${e.message}`, ephemeral: true });
    }
  },
};
