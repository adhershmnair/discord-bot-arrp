const { SlashCommandBuilder } = require('@discordjs/builders');
const { dbConnect } = require('../../configuration/db');
const DiscordConfigs = require('../../configuration/discordConfigs');
const { error, log } = require('../../configuration/logs');
const leaveLogChannel = DiscordConfigs.leave.leaveLogChannel ?? DiscordConfigs.leave.allLogChannel;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeleave')
    .setDescription('Remove leave for a user')
    .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to assign leave to')
          .setRequired(true))
    .addStringOption(option =>
        option.setName('comments')
          .setDescription('Comments for cancelling leave')
          .setRequired(false)),


  async execute(interaction) {
    try {
        // Remove the role of the user
        const leaveRoleId = DiscordConfigs.leave.leaveRole;
        const targetUser = interaction.options.getUser('user');
        const comments = interaction.options.getString('comments');
        const user = await interaction.guild.members.fetch(targetUser.id);
        const executingMemberId = interaction.member.id;
        
        // Remove the role from the member
        user.roles.remove(leaveRoleId)
            .then(() => console.log(`Removed the role from the member.`))
            .catch(console.error);
        log(`<@${interaction.member.id}> removed the <@&${leaveRoleId}> from <@${targetUser.id}>`, leaveLogChannel);
        await dbConnect.retrieveLeaveData(targetUser.id, 'activeonly').then((leaveData) => {
          if (!leaveData) {
            error(`No leave data found for ${targetUser.id}`, leaveLogChannel);
            return interaction.reply({ content: 'No leave data found for this user.', ephemeral: true });
          }
          return leaveData;
        })

        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const removeLeave = {
          discord_id: targetUser.id,
          is_active: true,
          cancelled_by: executingMemberId,
          leave_cancelled: today,
          comments
        };

        // Remove the leave data from the database
        try {
          await dbConnect.removeLeaveData(removeLeave);
          log(`Removed leave data for <@${targetUser.id}> by <@${executingMemberId}>`, leaveLogChannel);
          console.log(`Removed leave data for ${targetUser.id}`);
        } catch (dbError) {
          console.error(dbError);
          // Optionally, handle database-specific errors differently
        }

        return interaction.reply({ content: `All leave removed for <@${targetUser.id}> by <@${executingMemberId}>`, ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to execute that command.', ephemeral: true });
    }
  }
};

