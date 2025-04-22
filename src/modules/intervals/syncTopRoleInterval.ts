import type { BotInterval } from '../../types/bot.types';
import {Logger} from "../../lib/utils";
import {syncRole} from "../../lib/leveling/assignTopRoles";

export default {
    enabled: true,
    name: 'sync_top_roles',
    immediate: true,
    interval: 3 * 60 * 1000,

    run: async (client) => {
        Logger({ message: "Syncing roles...", level: "INFO", module: "LEVELING"})
        await syncRole()
    },
} satisfies BotInterval;
