const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordConfigs = require('../configuration/discordConfigs');
const { log, error } = require('../configuration/logs');
const giveLogs = DiscordConfigs.give.giveLogChannel ?? DiscordConfigs.give.allLogChannel;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Assign a role to a user for a limited time')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to receive the role')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const roleToAdd = interaction.options.getRole('role');
      const targetUser = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(targetUser.id);
  
      // Define role permissions
      const rolePermissions = DiscordConfigs.give.rolePermissions;
  
      // Check if the user executing the command has the required role to add the specified role
      let hasPermission = false;
      for (const [key, value] of Object.entries(rolePermissions)) {
        if (value.includes(roleToAdd.id) && interaction.member.roles.cache.has(key)) {
          hasPermission = true;
          break;
        }
      }
  
      if (!hasPermission) {
        await interaction.reply({ content: `You do not have permission to assign this role.`, ephemeral: true });
        error(`<@${interaction.member.id}> tried to assign the role "<@&${roleToAdd.id}>" to <@${targetUser.id}> but does not have permission.`, giveLogs);
        return;
      }
  
      if (!roleToAdd) {
        await interaction.reply({ content: `Role not found.`, ephemeral: true });
        error(`<@${interaction.member.id}> tried to assign a role that does not exist.`, giveLogs);
        return;
      }
  
      await member.roles.add(roleToAdd);
      await interaction.reply({ content: `Role "<@&${roleToAdd.id}>" added to <@${targetUser.id}>`, ephemeral: true });
      log(`<@${interaction.member.id}> assigned the role "<@&${roleToAdd.id}>" to <@${targetUser.id}>`, giveLogs);
  
    } catch (e) {
      console.error(`There was an error executing the command: ${e}`);
      await interaction.reply({ content: `Error executing command: ${e.message}`, ephemeral: true });
    }
  },
};