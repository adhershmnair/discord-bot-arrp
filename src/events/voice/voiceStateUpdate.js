const { EmbedBuilder } = require('discord.js');

module.exports = async (oldState, newState) => {
    const STAFF_ROLE_ID = '1337647317473562665'; // Replace with your staff role ID
    const TEXT_CHANNEL_ID = '1337647499674124289'; // Replace with the text channel ID where the bot sends messages
	const FRP_HANDLER_ROLE_ID = '1337647311702065213';
    const FRP_WAITING = '1337647463661834331';

    // Define voice channels with corresponding colors
    const VOICE_CHANNELS = {
        '1337647445034668033': '#3498db',
        '1337647442358829137': '#ffff00',
        '1337647463661834331': '#e74c3c'
    };

    // Check if the user joins one of the target voice channels
    if (newState.channelId && VOICE_CHANNELS[newState.channelId] && oldState.channelId !== newState.channelId) {
        const guild = newState.guild;
        const textChannel = guild.channels.cache.get(TEXT_CHANNEL_ID);
        const embedColor = VOICE_CHANNELS[newState.channelId] || '#ffffff'; // Default to white if no color is found

        let mention = STAFF_ROLE_ID;
        if (FRP_WAITING == newState.channelId) {
            mention = FRP_HANDLER_ROLE_ID;
        }

        if (textChannel) {
            const embed = new EmbedBuilder()
                .setColor(embedColor) // Use the color defined for the voice channel
                .setTitle('Waiting...') // Staff role mention as title
                .setDescription(`👤 **User:** <@${newState.member.id}> (${newState.member.user.tag})\n📢 **Joined Channel:** <#${newState.channelId}>`)
                .setFooter({ text: 'Alternate Reality' }) // Custom footer
                .setTimestamp();

            await textChannel.send({ content: `<@&${mention}>`, embeds: [embed] });
        }
    }
};
