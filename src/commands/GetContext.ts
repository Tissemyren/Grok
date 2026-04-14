import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { database } from "../index.js";

export default {
    data: new SlashCommandBuilder()
        .setName("context")
        .setDescription("See what context you have added to Grok"),

    async execute(interaction: ChatInputCommandInteraction) {
        console.log(1)
        const results = await database.query(`
            SELECT * FROM context WHERE userId = ?
        `, [interaction.user.id])

        const embed = new EmbedBuilder()
        embed.setTitle("Context you added")
        embed.setColor("Blue")

        //@ts-ignore
        const contextArray = results.map(row => row.value);
        embed.setDescription(contextArray.length > 0 ? "> " + contextArray.join("\n> ") : "No context")

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
    }
}