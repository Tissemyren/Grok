import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    InteractionContextType,
    LabelBuilder,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle }
from "discord.js";

import * as tempData from "../util/tempUserData.js";

export default {
    data: new ContextMenuCommandBuilder()
        .setName("grok is this true (context)")
        .setType(ApplicationCommandType.Message)
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
    
    async execute(interaction: MessageContextMenuCommandInteraction) {

        const modal = new ModalBuilder().setCustomId('grok-context').setTitle('Provide context for Grok');

        const contextOption = new TextInputBuilder()
            .setCustomId('context-input')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

        const contextOptionLabel = new LabelBuilder()
            .setLabel('Context')
            .setTextInputComponent(contextOption)

        const display = new TextDisplayBuilder()
            .setId(1)
            .setContent(interaction.targetMessage.content)
        
        modal.addTextDisplayComponents(display);
        modal.addLabelComponents(contextOptionLabel);

        await interaction.showModal(modal);

        tempData.storeContextForUser(interaction.user.id, interaction.targetMessage.content);
    }
}