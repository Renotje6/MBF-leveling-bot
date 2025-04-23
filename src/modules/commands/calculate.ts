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
            const formattedResult = Number.isInteger(result) ?
                result.toString() :
                result.toFixed(4).replace(/\.?0+$/, '');
            return interaction.editReply({
                content: `${expression.replace(/\*/g, '\\*')} = ${formattedResult}`
            })
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
    const cleanedExpr = expr.replace(/\s+/g, '');

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