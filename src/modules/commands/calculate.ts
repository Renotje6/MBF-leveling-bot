import type { BotCommand } from '../../types/bot.types';
import {ApplicationCommandOptionType} from "discord.js";

export default {
    enabled: true,
    name: 'calculate',
    description: 'Returns the bots ping',
    options: [
        {
            name: 'input',
            type: ApplicationCommandOptionType.String,
            description: 'Expression you want to calculate',
            required: true
        }
    ],
    autocomplete: (interaction) => {},
    run: async (client, interaction, options) => {
        if(!interaction.deferred) await interaction.deferReply();

        const expression = options.getString("input");

        if(!expression) return interaction.editReply("Please provide a calculation")

        try {
            const result = safeCalculate(expression)
            const formattedResult = formatWithSuffix(result);

            return interaction.editReply({
                content: `${expression.replace(/\*/g, '\\*')} = ${formattedResult} \`(${result})\``
            });
        } catch (e: unknown) {
            if (e instanceof Error)
            return interaction.editReply({
                content: e.message
            })
            else {
                console.error(e)
                return interaction.editReply({
                    content: "Something went wrong."
                })
            }
        }

    },
} satisfies BotCommand;

function hasBalancedParentheses(expr: string): boolean {
    let count = 0;
    for (const char of expr) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false; // Closing parenthesis before opening
    }
    return count === 0;
}

function safeCalculate(expr: string): number {
    // Remove all whitespace from the expression
    let cleanedExpr = expr.replace(/\s+/g, '');

    // Convert suffixed numbers (e.g. 2.4k, 3m, 1.2b) to actual numbers
    cleanedExpr = cleanedExpr.replace(/(\d+(\.\d+)?)([kmb])/gi, (_a, numStr, _b, suffix) => {
        const num = parseFloat(numStr);
        // @ts-ignore
        const multiplier = {
            k: 1e3,
            m: 1e6,
            b: 1e9
        }[suffix.toLowerCase()];
        return (num * multiplier).toString();
    });

    // Validate allowed characters
    if (!/^[\d+\-*/().]+$/.test(cleanedExpr)) {
        throw new Error("Invalid characters in expression");
    }

    // Validate parentheses balance
    if (!hasBalancedParentheses(cleanedExpr)) {
        throw new Error("Unbalanced parentheses");
    }

    // Validate expression structure
    if (/^[\d.]*$/.test(cleanedExpr)) {
        return parseFloat(cleanedExpr); // Handle simple numbers
    }

    try {
        // Use Function constructor for safer evaluation
        return new Function(`"use strict"; return (${cleanedExpr})`)();
    } catch (error) {
        throw new Error("Invalid mathematical expression");
    }
}

function formatWithSuffix(num: number): string {
    const absNum = Math.abs(num);
    const formatter = (val: number, suffix: string) =>
        `${(val).toFixed(2).replace(/\.?0+$/, '')}${suffix}`;

    if (absNum >= 1e9) return formatter(num / 1e9, 'b');
    if (absNum >= 1e6) return formatter(num / 1e6, 'm');
    if (absNum >= 1e3) return formatter(num / 1e3, 'k');
    return num.toString();
}