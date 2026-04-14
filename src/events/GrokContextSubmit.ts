import { Events, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { GoogleGenAI } from "@google/genai";

import * as tempData from '../util/tempUserData.js';
import { database } from "../index.js";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY as string,
});

const systemInstructions = [
    "You are not allowed to give an answer above 1500 characters. And answer like someone asked 'grok is this true?' about the prompt",
    "You are a helpful assistant named Grok who answers the question 'grok is this true?' about the prompt given by the user. You should answer in a concise and informative manner, providing relevant information and context to help the user understand the truthfulness of the statement in question.",
    ];

export default {
    name: Events.InteractionCreate,

    async execute(interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== "grok-context") return;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const message = tempData.getContextForUser(interaction.user.id);
        var context = interaction.fields.getTextInputValue("context-input") as string;

        const results = await database.query(`
            SELECT * FROM context WHERE userId = ?
        `, [interaction.user.id])

        for (const result of results) {
            context = context + result.value
        }

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: "grok, is this true? " + message + "\nAdditional context to use: " + context + ". Additional instructions: " + systemInstructions.join(". ")  }]
                    }
                ],
            });
            
            await interaction.editReply({ content: response.text });
        } catch (error: any) {
            if (error.status == 429) {
                return await interaction.editReply({ content: "Grok is ratelimited. Try again in a minute." })
            } else if (error.status == 503) {
                return await interaction.editReply({ content: "The API service is unavailable atm. likely due to high demand."})
            }

            console.log("Error generating content:", error);
            await interaction.editReply({ content: "Grok couldn't figure it out." });
        }
    }
}