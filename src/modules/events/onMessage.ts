import {type Client, Events, Message} from 'discord.js';
import type { BotEvent } from '../../types/bot.types';
import bot from "../../bot";

export default {
    enabled: true,
    name: 'give_xp',
    type: Events.MessageCreate,
    once: true,

    run: async (message: Message) => {
        console.log("hello");
        console.log(message);

        let user = await bot.db.select("users").where("users.id", message.author.id);
        if (!user) {
            await bot.db.insert({
                id: message.author.id,
                xp: 0,
                level: 0
            })

            user = await bot.db.select("users").where("users.id", message.author.id);
        }

        console.log(user)
    },
} satisfies BotEvent;
