import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType, MessageContextMenuCommandInteraction, MessageFlags } from "discord.js";

import { createWorker } from 'tesseract.js';
import translate from 'google-translate-api-next';

export default {
    data: new ContextMenuCommandBuilder()
        .setName("grok translate this")
        .setType(ApplicationCommandType.Message)
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
    
    async execute(interaction: MessageContextMenuCommandInteraction) {

        await interaction.deferReply();

        const languages = ['eng', 'rus', 'spa', 'fra', 'deu', 'chi_sim', 'jpn', 'kor'];
        const worker = await createWorker(languages);

        const images = interaction.targetMessage.attachments.filter(a => a.contentType?.startsWith('image/'));

        if (images.size === 0) {
            return await interaction.editReply({ content: "No images found in the message." });
        }
        
        try {
            let fullReport = "";

            for (const [id, attachment] of images) {
                const { data: { text } } = await worker.recognize(attachment.url);

                if (!text || text.trim().length === 0) continue;

                let cleanedText = text
                    .replace(/Deleted User/gi, '')
                    .replace(/@\S+/g, '')
                    .replace(/\d{2}\.\d{2}\.\d{4}\s\d{1,2}:\d{2}/g, '')
                    .replace(/DOTA/g, '')
                    .trim();

                if (cleanedText.length === 0) continue;

                try {
                    const translation = await translate(cleanedText, { to: "en" });
                    const hasTranslated = translation.text.toLowerCase() !== cleanedText.toLowerCase();

                    if (hasTranslated) {
                        fullReport += `\n> ${translation.text}\n`;
                    } else {
                        fullReport += `\n> Could not translate.\n`;
                    }
                } catch (err) {
                    console.error("Translation error:", err);
                    fullReport += `\n**OCR (Translation Failed):**\n> ${cleanedText}\n`;
                }
            }

            await worker.terminate();
            await interaction.editReply(fullReport || "No text found.");
            
        } catch (error: any) {
            await interaction.editReply({ content: "Could not translate images correctly." })

            return console.log("Error translating images:", error);
        }
    }
}