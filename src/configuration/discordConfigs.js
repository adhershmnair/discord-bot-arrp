const DiscordConfigs = {
    allLogChannel: '1264162533808410655', // Channel ID where all logs will be sent
    colors: {
        log: '#FFA500',
        error: '#FF0000',
        success: '#00FF00'
    },
    give: {
        giveLogChannel: '1264162586467897417', // Channel ID where the logs will be sent
        rolePermissions: {
            '1264118317090607114': // 'Police Head' can only add 'Police Constable' and 'Police Sub-Inspector'
                [
                  '1264118356852609044', // Police Constable
                  '1264127854170345547' // Police Sub-Inspector
                ],
            '1264127897115820032': // 'EMS Head' can only add 'EMS Doctor' and 'EMS Nurse'
                [
                  '1264127928220909588', // EMS Doctor
                  '1264127976602337356' // EMS Nurse
                ]
          }
    },
    leave: {
        leaveLogChannel: '1264892095316103220', // Channel ID where the logs will be sent
        leaveRole: '1264147825432858715', // Role ID of the leave role, OnLeave
        rolePermissions: {
            '1264118317090607114': // 'Police Head' can only add leave to following roles
                [
                  '1264118356852609044', // Police Constable
                  '1264127854170345547' // Police Sub-Inspector
                ],
            '1264118356852609044': [ // Police Constable can only add leave to following roles
                '1264127854170345547' // Police Sub-Inspector
                ],
            '1264127897115820032': // 'EMS Head' can only add 'EMS Doctor' and 'EMS Nurse'
                [
                  '1264127928220909588', // EMS Doctor
                  '1264127976602337356' // EMS Nurse
                ] 
        }
    },
    whitelist: {
        whitelistLogChannel: '1264888798441898138', // Channel ID where the logs will be sent
        whitelistRole: '1264872922045218859', // Whitelisted role
        pendingRole: '1264872860137295913', // Pending role
        revokedRole: '1264877763920138261', // Revoked role
        allowedRoles: [ // Which roles can add whitelist.
            '1264873159908130878', // 'Whitelist Head'
        ]
    }
}

module.exports = DiscordConfigs;