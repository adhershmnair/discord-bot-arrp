const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const DiscordConfigs = require('../../configuration/discordConfigs');
const { log, error } = require('../../configuration/logs');
const allLogs = DiscordConfigs.allLogChannel;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getcars')
    .setDescription('Fetch vehicle details of a user from FiveM using IBAN')
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
            error(`<@${interaction.member.id}> tried to get vehicle details with IBAN "${iban}", in <#${interaction.channelId}>.`, allLogs);
            return;
        }

        const rolePermissions = DiscordConfigs.fivempermissions.getcars;
        let hasPermission = rolePermissions.some(role => interaction.member.roles.cache.has(role));

        if (!hasPermission) {
            await interaction.reply({ content: `You do not have permission to check the FiveM vehicle details.`, ephemeral: true });
            error(`<@${interaction.member.id}> tried to get vehicle details with IBAN "${iban}", but does not have permission.`, allLogs);
            return;
        }
    } catch (e) {
        console.error(`There was an error executing the command: ${e}`);
        await interaction.reply({ content: `Error executing command: ${e.message}`, ephemeral: true });
        return;
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
        'SELECT u.identifier, u.firstname, u.lastname, v.plate, v.type, v.garage_id, v.vehiclename, v.trunk FROM users u JOIN owned_vehicles v ON u.identifier = v.owner WHERE u.iban = ?',
        [iban]
      );

      if (rows.length === 0) {
        const noVehicleEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('No Vehicles Found')
          .setDescription(`No vehicles found for IBAN: **${iban}**`)
          .setTimestamp();

        await interaction.reply({ embeds: [noVehicleEmbed], ephemeral: true });
      } else {
        const user = rows[0];
        let vehicleList = rows.map(vehicle => `**${vehicle.vehiclename}** - Plate: ${vehicle.plate}, Type: ${vehicle.type}, Garage: ${vehicle.garage_id}, Trunk: ${vehicle.trunk}`).join('\n');

        const userEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${user.firstname} ${user.lastname}'s Vehicles`)
          .addFields(
            { name: 'Vehicles', value: vehicleList || 'No vehicles found.', inline: false }
          )
          .setFooter({ text: 'Requested by ' + interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();

        await interaction.reply({ embeds: [userEmbed], ephemeral: false });
        log(`<@${interaction.member.id}> fetched vehicle details for IBAN ${iban}`, allLogs);
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Error')
        .setDescription('An error occurred while fetching vehicle data.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } finally {
      await connection.end();
    }
  }
};
