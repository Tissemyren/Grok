import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType, MessageContextMenuCommandInteraction, MessageFlags } from "discord.js";
import { database } from "../index.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("grok, save this!")
        .setType(ApplicationCommandType.Message)
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),

    async execute(interaction: MessageContextMenuCommandInteraction) {
        const message = interaction.targetMessage;
        const messageArray = message.content.split("\n")

        const results = await database.query(`
            SELECT * FROM context WHERE userId = ?
        `, [interaction.user.id])

        if (results.length >= 2) {
            return await interaction.reply({ content: "Can't upload more than 2 context strings per user.", flags: MessageFlags.Ephemeral });
        }

        await database.query(`
            INSERT INTO context (userId, value)
            VALUES (?, ?)
        `, [interaction.user.id, message.content])

        await interaction.reply({ content: "You uploaded context to Grok!\n> " + messageArray.join("\n> "), flags: MessageFlags.Ephemeral })
    }
}