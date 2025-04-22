import bot from "../../bot";
import {User} from "../../types/user";

export async function syncRole() {
    const guild = await bot.guilds.fetch(bot.config.guild_id);
    const members = await guild.members.fetch();

    const topUsers = await bot.db<User>('users')
        .select()
        .orderBy('level', 'desc')
        .orderBy('xp', 'desc')
        .limit(bot.config.number_of_top || 3);

    const topUserIds = topUsers.map(u => u.id);
    const roleId = bot.config.top_role_id;

    const membersWithRole = members.filter(m => m.roles.cache.has(roleId));

    for (const member of membersWithRole.values()) {
        if (!topUserIds.includes(member.id)) {
            await member.roles.remove(roleId).catch(console.error);
        }
    }

    for (const userId of topUserIds) {
        const member = members.get(userId);
        if (member && !member.roles.cache.has(roleId)) {
            await member.roles.add(roleId).catch(console.error);
        }
    }
}
