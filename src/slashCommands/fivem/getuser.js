const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const DiscordConfigs = require('../../configuration/discordConfigs');
const { log, error } = require('../../configuration/logs');
const allLogs = DiscordConfigs.allLogChannel;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('getuser')
    .setDescription('Fetch details about user from FiveM using IBAN')
    .addStringOption(option =>
      option.setName('iban')
        .setDescription('The IBAN to search for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const iban = interaction.options.getString('iban');
    try {

        const commandChannel = DiscordConfigs.fivempermissions.commandChannel;
        if (!commandChannel.includes(interaction.channelId)) {
            await interaction.reply({ content: 'This command can only be used in specific channels.', ephemeral: true });
            error(`<@${interaction.member.id}> tried to get details with iban number "${iban}", in <#${interaction.channelId}>.`, allLogs);
            return;
        }

        const rolePermissions = DiscordConfigs.fivempermissions.getdetails;
        let hasPermission = false;
        for (const value of rolePermissions) {
            if (interaction.member.roles.cache.has(value)) {
                hasPermission = true;
                break;
            }
        }

        if (!hasPermission) {
            await interaction.reply({ content: `You do not have permission to check the fivem details.`, ephemeral: true });
            error(`<@${interaction.member.id}> tried to get details with iban number "${iban}", but does not have permission.`, allLogs);
            return;
        }

    } catch (e) {
        console.error(`There was an error executing the command: ${e}`);
        await interaction.reply({ content: `Error executing command: ${e.message}`, ephemeral: true });
    }


    // Create a MySQL connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });

    try {
      const [rows] = await connection.execute(
        'SELECT identifier, firstname, lastname, phone_number, accounts, job, job_grade FROM users WHERE iban = ?',
        [iban]
      );

      if (rows.length === 0) {
        const noUserEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('User Not Found')
          .setDescription(`No user found with IBAN: **${iban}**`)
          .setTimestamp();

        await interaction.reply({ embeds: [noUserEmbed], ephemeral: true });
      } else {
        const user = rows[0];

        // Parse accounts JSON safely
        let accounts;
        try {
          accounts = JSON.parse(user.accounts);
        } catch (parseError) {
          console.error('Failed to parse accounts JSON:', parseError);
          accounts = { bank: 'N/A', money: 'N/A', black_money: 'N/A' }; // Default fallback
        }

        const userEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${user.firstname} ${user.lastname}`)
          .addFields(
            { name: 'Identifier', value: `||${user.identifier}||`, inline: false },
            { name: 'IBAN', value: `||${iban}||`, inline: false },
            { name: 'Job', value: `${(user.job).toUpperCase()}`, inline: true },
            { name: 'Grade', value: `${user.job_grade}`, inline: true },
            { name: 'Phone Number', value: user.phone_number || 'N/A', inline: false },
            { name: 'Bank', value: accounts.bank?.toString() || 'N/A', inline: true },
            { name: 'Money', value: accounts.money?.toString() || 'N/A', inline: true },
            { name: 'Black Money', value: accounts.black_money?.toString() || 'N/A', inline: true }
          )
          .setFooter({ text: 'Requested by ' + interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();

        await interaction.reply({ embeds: [userEmbed], ephemeral: false });
        log(`<@${interaction.member.id}> fetched details of ${iban} - ${user.firstname} ${user.lastname}`, allLogs);
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Error')
        .setDescription('An error occurred while fetching user data.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } finally {
      await connection.end();
    }
  }
};
