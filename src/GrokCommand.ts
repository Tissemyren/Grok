import { GoogleGenAI } from "@google/genai";
import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "discord.js";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY as string,
});

export default {
    data: new ContextMenuCommandBuilder()
        .setName("grok is this true")
        .setType(ApplicationCommandType.Message),
    
    async execute(interaction: MessageContextMenuCommandInteraction) {

        await interaction.deferReply();
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: "grok is this true?: " + interaction.targetMessage.content + " (You are in no way allowed to go above 1500 characters)"  }]
                    }
                ],
            });
            
            await interaction.editReply({ content: response.text });
        } catch (error) {
            console.log("Error generating content:", error);
            await interaction.editReply({ content: "grok couldn't figure it out, sowy." });
        }
    }
}