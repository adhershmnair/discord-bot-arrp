const { SlashCommandBuilder } = require('@discordjs/builders');
const DiscordConfigs = require('../../configuration/discordConfigs');
const { dbConnect } = require('../../configuration/db');
const { log, error } = require('../../configuration/logs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Assign a leave role to a user for a specified duration')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to assign leave to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('The duration of the leave in days')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('comments')
        .setDescription('Comments for the leave')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('remove_old_leaves')
        .setChoices(
          { name: 'Yes', value: 'yes' },
          { name: 'No', value: 'no' })
        .setDescription('Remove old leaves for this user')
        .setRequired(false)),

  async execute(interaction) {
    try {
      const targetUser = interaction.options.getUser('user');
      const days = interaction.options.getInteger('days');
      const remove_old_leaves = interaction.options.getString('remove_old_leaves') ?? 'yes';
      const comments = interaction.options.getString('comments');
      const member = await interaction.guild.members.fetch(targetUser.id);
      const rolePermissions = DiscordConfigs.leave.rolePermissions;
      const leaveRoleId = DiscordConfigs.leave.leaveRole;
      const executingMemberRoles = interaction.member.roles.cache;
      const executingMemberId = interaction.member.id;

      // Check if the user executing the command has the required role to add the specified role
      let hasPermission = executingMemberRoles.some(role => {
        if (rolePermissions[role.id]) { // Check if the role ID exists in rolePermissions
          // Get manageable roles by this role's ID
          const manageableRoles = rolePermissions[role.id];
          return member.roles.cache.some(userRole => {
            return manageableRoles.includes(userRole.id); // Check if manageableRoles includes this userRole's ID
          });
        }
        return false;
      });

      if (!hasPermission) {
        error(`<@${executingMemberId}> tried to assign leave to <@${targetUser.id}> but does not have permission.`, DiscordConfigs.leave.allLogChannel);
        return interaction.reply({ content: 'You do not have permission to set leave for this user.', ephemeral: true });
      }

      // Assuming a role named "On Leave" is to be assigned
      const leaveRole = interaction.guild.roles.cache.get(leaveRoleId);
      await member.roles.add(leaveRole);

      // Calculate expiry date
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(currentDate.getDate() + days); // Add 'days' to the current date

      // Store the expiry date somewhere, e.g., a database

      const leaveData = {
        discord_id: targetUser.id,
        approved_by: executingMemberId,
        leave_till: expiryDate,
        leave_start: currentDate,
        isActive: true,
        comments,
        remove_old_leaves: remove_old_leaves === 'yes' ? true : false,
      } 
      dbConnect.storeLeaveData(leaveData);

      log(`<@${executingMemberId}> assigned leave to <@${targetUser.id}> for ${days} days.`, DiscordConfigs.leave.allLogChannel);
      return interaction.reply({ content: `<@${targetUser.id}> has been put on leave for ${days} days by <@${executingMemberId}>.\n Leave starts on: ${currentDate.toDateString()} \n Leave expires on: ${expiryDate.toDateString()}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to execute that command.', ephemeral: true });
    }
  }
};

