const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const DiscordConfigs = require('../../configuration/discordConfigs');
const { log, error } = require('../../configuration/logs');
const allLogs = DiscordConfigs.allLogChannel;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getinventory')
    .setDescription('Fetch inventory details of a user from FiveM using IBAN')
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

        const rolePermissions = DiscordConfigs.fivempermissions.getinventory;
        let hasPermission = rolePermissions.some(role => interaction.member.roles.cache.has(role));

        if (!hasPermission) {
            await interaction.reply({ content: `You do not have permission to check the FiveM details.`, ephemeral: true });
            error(`<@${interaction.member.id}> tried to get inventory with IBAN "${iban}", but lacks permission.`, allLogs);
            return;
        }
    } catch (e) {
        console.error(`Error checking permissions: ${e}`);
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
        'SELECT identifier, firstname, lastname, inventory FROM users WHERE iban = ?',
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
        let inventory;
        try {
          inventory = JSON.parse(user.inventory);
          if (!Array.isArray(inventory)) inventory = [];
        } catch (parseError) {
          console.error('Failed to parse inventory JSON:', parseError);
          inventory = [];
        }

        let inventoryDescription = inventory.length > 0 ?
          inventory.map(item => `**${item.name}** - Count: ${item.count}, Slot: ${item.slot}${item.metadata?.serial ? `, Serial: ${item.metadata.serial}` : ''}`).join('\n') :
          'No items in inventory';

        const userEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${user.firstname} ${user.lastname}'s Inventory`)
          .addFields(
            { name: 'Identifier', value: `||${user.identifier}||`, inline: false },
            { name: 'IBAN', value: `||${iban}||`, inline: false },
            { name: 'Inventory', value: inventoryDescription, inline: false }
          )
          .setFooter({ text: 'Requested by ' + interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
          .setTimestamp();

        await interaction.reply({ embeds: [userEmbed], ephemeral: false });
        log(`<@${interaction.member.id}> fetched inventory details of ${iban} - ${user.firstname} ${user.lastname}`, allLogs);
      }
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('Error')
        .setDescription('An error occurred while fetching inventory data.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    } finally {
      await connection.end();
    }
  }
};
