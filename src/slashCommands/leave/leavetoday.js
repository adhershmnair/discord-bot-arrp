const { SlashCommandBuilder } = require('@discordjs/builders');
const { dbConnect } = require('../../configuration/db');
const { log, logFields } = require('../../configuration/logs');
const DiscordConfigs = require('../../configuration/discordConfigs');
const leaveLogChannel = DiscordConfigs.leave.leaveLogChannel ?? DiscordConfigs.leave.allLogChannel;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leavetoday')
    .setDescription('Get leaves for today'),
  async execute(interaction) {
    try {
        const leaveData = await dbConnect.retrieveLeaveToday();
        if (leaveData.length === 0) {
            return interaction.reply({ content: 'No leave data found for today.', ephemeral: true });
        }
        const leaveDates = leaveData.map(leave => {
            return {
                discord_id: leave.discord_id,
                start: new Date(leave.leave_start).toDateString(),
                end: new Date(leave.leave_till).toDateString(),
                active: leave.is_active ? 'Active' : 'Expired',
                remaining: Math.ceil((new Date(leave.leave_till) - new Date()) / (1000 * 60 * 60 * 24)),
            };
        });
        const leaveDatesString = leaveDates.map(leave => {
            let string = `<@${leave.discord_id}> : ` + leave.start + ' - ' + leave.end + ' (' + leave.active + ')';
            string += (leave.remaining > 0 && leave.active === 'Active') ? ' : ' + leave.remaining + ' days' : '';
            return string
        }
        ).join('\n');
        const leaveSummary = [
            { name: 'Leave Dates', value: leaveDatesString },
        ];
        log(`Got leave summary for today by <@${interaction.member.id}>`, leaveLogChannel);
        logFields(leaveSummary, leaveLogChannel);
        interaction.reply({ content: 'Todays Leave', ephemeral: true, embeds: [{ fields: leaveSummary }] });
        return true;
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to execute that command.', ephemeral: true });
    }
  }
};

