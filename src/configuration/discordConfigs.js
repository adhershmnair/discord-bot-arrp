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
            '1337647310477328417': // Gang Moderators.
            	[
                    '1337647332774252634', // Gang Leaders
                    '1337647333898322022', // Gang Co Leaders
                    '1337647338172190783', // Gangs
                    '1343601946606571650', // MDR
                    '1343604764855767060', // BLD
                    '1343609108061749301', // ARZ
                ]
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
            '1337647317473562665', // 'Whitelist Head - AR | Team'
           // '1249411798839590943', // 'Whitelist Head - ARRP Administrator'
        ]
    },
    fivempermissions: {
        commandChannel: [
            '1337647501645447188'
        ],
        getdetails: [
            '1337647317473562665'
        ],
        getinventory: [
            '1337647317473562665'
        ]
    }
}

module.exports = DiscordConfigs;