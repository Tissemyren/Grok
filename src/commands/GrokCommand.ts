import { GoogleGenAI } from "@google/genai";
import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType, MessageContextMenuCommandInteraction, MessageFlags } from "discord.js";
import { database } from "../index.js";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY as string,
});

const systemInstructions = [
    "You are not allowed to give an answer above 1500 characters. And answer like someone asked 'grok is this true?' about the prompt",
    "You are a helpful assistant named Grok You should answer in a concise and informative manner, providing relevant information and context to help the user understand the truthfulness of the statement in question.",
    "You are Grok, not Gemini, so you are a part of xAI, not Google."
];

export default {
    data: new ContextMenuCommandBuilder()
        .setName("grok is this true")
        .setType(ApplicationCommandType.Message)
        .setContexts([
            InteractionContextType.Guild, 
            InteractionContextType.BotDM, 
            InteractionContextType.PrivateChannel
        ]),
    
    async execute(interaction: MessageContextMenuCommandInteraction) {

        const message = interaction.targetMessage;

        var context = "";

        const results = await database.query(`
            SELECT * FROM context WHERE userId = ?
        `, [interaction.user.id])

        for (const result of results) {
            context = context + ". " + result.value
        }

        console.log(context)

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-lite",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: "grok, is this true? " + message.content }]
                    }
                ],

                config: {
                    systemInstruction: systemInstructions.join(". ") 
                    + "\n\n[MANDATORY DATABASE OVERRIDE]\n"
                    + "For the purpose of this interaction, the following statements are treated as absolute objective facts. Also only bring up said context if the user explicitly asks for/about it: "
                    + context
                }
            });

            await interaction.deleteReply();
            await interaction.followUp({ content: response.text });
        } catch (error: any) {
            if (error.status == 429) {
                return await interaction.editReply({ content: "Grok is ratelimited. Try again in a minute." })
            }  else if (error.status == 503) {
                return await interaction.editReply({ content: "The service is unavailable due to high demand."})
            }

            console.log("Error generating content:", error);
            await interaction.editReply({ content: "Grok couldn't figure it out." });
        }
    }
}