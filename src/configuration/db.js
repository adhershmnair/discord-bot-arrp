const leaveTable = 'leavelist';
const DiscordConfigs = require('./discordConfigs');
const { log } = require('./logs');
const leaveLogs = DiscordConfigs.leave.leaveLogChannel ?? DiscordConfigs.leave.allLogChannel;

const NodeQB = require("nodeqb");
const db = new NodeQB({
  type: "mysql", //database type "mysql|mongo" 
  method: "pool", // preferred use pool method
  defaults: {   //optional
      orderColumn: "createdAt" //for default ordering column -> optional
  },
  config: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 3306,
      database: process.env.DATABASE_NAME || 'db',
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASS || 'root',
      connectionLimit: 10, //increase connection as per your application
  }
})

const dbConnect = {
  async storeLeaveData(leaveData) {
    const data = {
      discord_id : leaveData.discord_id,
      approved_by : leaveData.approved_by,
      leave_till : leaveData.leave_till,
      leave_start : leaveData.leave_start,
      is_active: true,
      comments : leaveData.comments,
    };

    if (leaveData.remove_old_leaves) {
      // Remove old leaves
      const oldLeaves = await db.table(leaveTable).where("discord_id", leaveData.discord_id).where("is_active", true).get();
      if (oldLeaves) {
        oldLeaves.forEach(leave => {
          leave.is_active = false;
          leave.cancelled_by = leaveData.approved_by;
          leave.leave_cancelled = leaveData.leave_start
          db.table(leaveTable).where("id", leave.id).update(leave);
        });
      }
    }

    const leave = await db.table(leaveTable).insert(data, (err, results, fields) => {
      if (results.insertId) {
        log(`Leave data for <@${leaveData.discord_id}> has been added by <@${leaveData.approved_by}> to expire on ${leaveData.leave_till.toDateString()}`, leaveLogs);
        return true
      }
    })

    return leave;
  },
  
  async retrieveLeaveData(userId, activeType) {
    const whereCondition = {
      "discord_id": userId
    };
    if (activeType === 'activeonly') {
      whereCondition["is_active"] = true;
    } else if (activeType === 'inactiveonly') {
      whereCondition["is_active"] = false;
    }
    const limit = activeType === 'summary' ? 10 : 3;
    const leaveData = await db.table(leaveTable).where(whereCondition).limit(limit).orderByDesc('id').get()
    return leaveData ?? null;
  },

  async retrieveLeaveToday() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const expiredLeaveData = await db.table(leaveTable).where("leave_till", '<', formattedDate).where("is_active", 1).get();
    if (expiredLeaveData) {
      expiredLeaveData.forEach(async leave => {
        leave.is_active = false;
        await db.table(leaveTable).where("id", leave.id).update(leave);
      });
      log(`Expired leaves disabled for today`, leaveLogs);
    }
    const leaveData = await db.table(leaveTable).where("leave_till", ">=", formattedDate).where("is_active", 1).get();
    return leaveData ?? null;
  },

  async removeLeaveData(leaveData) {
    const data = {
      discord_id : leaveData.discord_id,
      is_active: true,
    };
    const cancelledData = {
      is_active: false,
      cancelled_by: leaveData.cancelled_by,
      leave_cancelled: leaveData.leave_cancelled,
    };
    if (leaveData.comments) {
      cancelledData.comments = leaveData.comments;
    }
    const oldLeaves = await db.table(leaveTable).where(data).get();
    if (oldLeaves) {
      oldLeaves.forEach(async leave => {
        try {
          await db.table(leaveTable).where(data).update(cancelledData);
        } catch (dbError) {
          console.error(dbError);
        }
      });

      log(`Leaves removed for <@${leaveData.discord_id}> by <@${leaveData.cancelled_by}>`, leaveLogs);
    }
  }
};

module.exports = { dbConnect, db }
