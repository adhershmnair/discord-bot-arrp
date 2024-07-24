const { SlashCommandBuilder } = require('@discordjs/builders');
const { dbConnect } = require('../../configuration/db');
const DiscordConfigs = require('../../configuration/discordConfigs');
const { log, logFields, error } = require('../../configuration/logs');
const leaveLogChannel = DiscordConfigs.leave.leaveLogChannel ?? DiscordConfigs.allLogChannel;
const allLogChannelId = DiscordConfigs.allLogChannel;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('infoleave')
    .setDescription('Get information about the leave for a user. Limited to latest maximum 3')
    .addUserOption(option =>
        option.setName('user')
          .setDescription('The user to assign leave to')
          .setRequired(true))
    .addStringOption(option =>
        option.setName('leave_type')
          .setChoices(
            { name: 'Show Active only', value: 'activeonly'},
            { name: 'Show InActive only', value: 'inactiveonly'},
            { name: 'Show history (Last 3 leave)', value: 'history'},
            { name: 'Show Summary (Last 10 leave)', value: 'summary'}
          )
          .setDescription('Get Leaves applied by the user. Default is activeonly')),

  async execute(interaction) {
    try {

        const targetUser = interaction.options.getUser('user');
        const leaveType = interaction.options.getString('leave_type') ?? 'activeonly';

        let leaveTitle = 'Active Leaves';
        if (leaveType === 'inactiveonly') {
          leaveTitle = 'InActive Leaves';
        }
        else if (leaveType === 'history') {
          leaveTitle = 'Leave History (Limited to 3 Leaves)';
        }
        else if (leaveType === 'summary') {
          leaveTitle = 'Leave Summary';
        }

        const leaveData = await dbConnect.retrieveLeaveData(targetUser.id, leaveType);
        if (leaveData.length === 0) {
          error(`<@${interaction.member.id}> tried to get leave data for <@${targetUser.id}> but no data found.`, allLogChannelId);
          return interaction.reply({ content: 'No leave data found for this user.', ephemeral: true });
        }

        if (leaveType === 'summary') {
          const activeLeaves = leaveData.filter(leave => leave.is_active).length;
          const inactiveLeaves = leaveData.filter(leave => !leave.is_active).length;
          const leaveDates = leaveData.map(leave => {
            return {
              start: new Date(leave.leave_start).toDateString(),
              end: new Date(leave.leave_till).toDateString(),
              active: leave.is_active ? 'Active' : 'Expired',
              remaining: Math.ceil((new Date(leave.leave_till) - new Date()) / (1000 * 60 * 60 * 24)),
            };
          }
          );
          const leaveDatesString = leaveDates.map(leave => {
            let string = leave.start + ' - ' + leave.end + ' (' + leave.active + ')';
            string += (leave.remaining > 0 && leave.active === 'Active') ? ' : ' + leave.remaining + ' days' : '';
            return string
          }).join('\n');
          const leaveSummary = [
            { name: 'User', value: '<@' + targetUser.id + '>' },
            { name: 'Active Leaves', value: activeLeaves, inline: true },
            { name: 'Expired Leaves', value: inactiveLeaves, inline: true },
            { name: 'Leave Dates', value: leaveDatesString },
          ];
          const allLogChannelId = DiscordConfigs.allLogChannel;
          log(`<@${interaction.member.id}> viewed leave summary for <@${targetUser.id}>`, allLogChannelId);
          logFields(leaveSummary, leaveLogChannel);
          interaction.reply({ content: leaveTitle, ephemeral: true, embeds: [{ fields: leaveSummary }] });
          return true;
        }

        const fields = leaveData.map(leave => {
          const expiryDate = new Date(leave.leave_till).toDateString();
          const startDate = new Date(leave.leave_start).toDateString();
          const approvedBy = leave.approved_by;
          let remainingDays = Math.ceil((new Date(leave.leave_till) - new Date()) / (1000 * 60 * 60 * 24));
          if (remainingDays < 0) {
            remainingDays = 'Expired';
          }
          else if (!leave.is_active) {
            remainingDays = 'Closed';
          }

          const msg = [
            { name: 'User', value: '<@' + targetUser.id + '>' },
            { name: 'Expire Date', value: expiryDate, inline: true },
            { name: 'Applied Date', value: startDate, inline: true },
            { name: 'Approved By', value: '<@' + approvedBy + '>', inline: true },
            { name: 'Remaining Days', value: remainingDays.toString(), inline: true },
          ];
          if (leave.cancelled_by) {
            const cancelledDate = new Date(leave.leave_cancelled).toDateString()
            msg.push({ name: 'Cancelled By', value: '<@' + leave.cancelled_by + '> on ' + cancelledDate, inline: true })
          }
          else {
            msg.push({ name: 'Active', value: leave.is_active ? "**Yes**" : "No", inline: true })
          }
          msg.push({ name: '\u200B', value: '\u200B' })
          return msg;
        }).flat();
        interaction.reply({ content: leaveTitle, ephemeral: true, embeds: [{ fields }] });
        log(`<@${interaction.member.id}> viewed leave data for <@${targetUser.id}>`, allLogChannelId);
        logFields(fields, leaveLogChannel);

        return true;
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to execute that command.', ephemeral: true });
    }
  }
};

