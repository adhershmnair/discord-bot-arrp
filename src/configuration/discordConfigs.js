const DiscordConfigs = {
    allLogChannel: '1265554858241560637', // Channel ID where all logs will be sent
    colors: {
        log: '#FFA500',
        error: '#FF0000',
        success: '#00FF00'
    },
    give: {
        giveLogChannel: '1265555314414190602', // Channel ID where the logs will be sent
        rolePermissions: {
            '1249398551138533404': // 'ARPD | Chief of Police' can only add 'ARPD | Deputy Chief of Police' and 'ARPD'
                [
                  '1249398551138533402', // ARPD | Deputy Chief of Police
                  '1249398551138533405' // ARPD
                ],

            '1249398551138533402': // 'ARPD | Deputy Chief of Police' can only add 'ARPD'
                [
                  '1249398551138533405' // ARPD
                ],

            '1249398551088201812': // 'ARRT | Head' can only add 'ARRT | Supervisor' and 'ARRT'
                [
                  '1249398551088201811', // ARRT | Supervisor
                  '1249398551088201813' // ARRT
                ],

            '1249398551088201811': // 'ARRT | Supervisor' can only add 'ARRT'
                [
                    '1249398551088201813' // ARRT
                ]
          }
    },
    leave: {
        leaveLogChannel: '1265555456407896074', // Channel ID where the logs will be sent
        leaveRole: '1249398551176544273', // Role ID of the leave role - Leave of Absence
        rolePermissions: {
            '1249398551138533404': // 'ARPD | Chief of Police' can only add leave to following roles
                [
                  //'1264118356852609044', // ARPD | Deputy Chief of Police
                  '1249398551138533405' // ARPD
                ],
            '1264118356852609044': [ // 'ARPD | Deputy Chief of Police' can only add leave to following roles
                '1249398551138533405' // ARPD
                ],
            '1264127897115820032': // 'ARRT | Head' can only add 'ARRT | Supervisor' and 'ARRT'
                [
                  '1249398551088201811', // ARRT | Supervisor
                  '1249398551088201813' // ARRT
                ]
        }
    },
    whitelist: {
        whitelistLogChannel: '1265555650407174206', // Channel ID where the logs will be sent
        whitelistRole: '1249398551080075316', // Whitelisted role - ARRP Citizen
        pendingRole: '1249982866222223391', // Pending role - ARRP Pending Citizen
        revokedRole: '1249398551176544274', // Revoked role - Blacklist
        allowedRoles: [ // Which roles can add whitelist.
            '1249412216349003857', // 'Whitelist Head - ARRP Moderator'
           // '1249411798839590943', // 'Whitelist Head - ARRP Administrator'
        ]
    }
}

module.exports = DiscordConfigs;