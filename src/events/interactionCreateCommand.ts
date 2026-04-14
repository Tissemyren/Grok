import { BaseInteraction, Events } from "discord.js";

export default {
    name: Events.InteractionCreate,

    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand()) return;
        
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error executing this command!" });
        }
    }
}