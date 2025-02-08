const DiscordConfigs = {
    allLogChannel: '1337806732705009744', // Channel ID where all logs will be sent
    colors: {
        log: '#FFA500',
        error: '#FF0000',
        success: '#00FF00'
    },
    give: {
        giveLogChannel: '1337806732705009744', // Channel ID where the logs will be sent
        rolePermissions: {
            '1337647328286343169': // 'ARPD | DGP' can only add 'ARPD | Deputy Chief of Police' and 'ARPD'
                [
                  // '1249398551138533402', // ARPD | Deputy Chief of Police
                  '1337647329267683341' // ARPD
                ],

            '1337647330781823087': // 'ARRT | CMO' can only add 'ARRT | Supervisor' and 'ARRT'
                [
                  // '1249398551088201811', // ARRT | Supervisor
                  '1337647331780202517' // ARRT
                ],
          }
    },
    leave: {
        leaveLogChannel: '1337806732705009744', // Channel ID where the logs will be sent
        leaveRole: '1337647340068016261', // Role ID of the leave role - Leave of Absence
        rolePermissions: {
            '1337647328286343169': // 'ARPD | DGP' can only add leave to following roles
                [
                  //'1264118356852609044', // ARPD | Deputy Chief of Police
                  '1337647329267683341' // ARPD
                ],
            '1264118356852609044': [ // 'ARPD | Deputy Chief of Police' can only add leave to following roles
                '1249398551138533405' // ARPD
                ],
            '1337647330781823087': // 'ARRT | CMO' can only add 'ARRT | Supervisor' and 'ARRT'
                [
                  // '1249398551088201811', // ARRT | Supervisor
                  '1337647331780202517' // ARRT
                ]
        }
    },
    whitelist: {
        whitelistLogChannel: '1337806732705009744', // Channel ID where the logs will be sent
        whitelistRole: '1337647339170562048', // Whitelisted role - ARRP Citizen
        pendingRole: '1337647346921635900', // Pending role - ARRP Pending Citizen
        revokedRole: '1337647349341753486', // Revoked role - Blacklist
        allowedRoles: [ // Which roles can add whitelist.
            '1337647317473562665', // 'Whitelist Head - ARRP Moderator'
           // '1249411798839590943', // 'Whitelist Head - ARRP Administrator'
        ]
    }
}

module.exports = DiscordConfigs;
