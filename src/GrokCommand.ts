import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import { ApplicationCommandType, ContextMenuCommandBuilder, InteractionContextType, MessageContextMenuCommandInteraction } from "discord.js";

const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

const openAIClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.VENICE_API_KEY as string,
})

const systemInstructions = [
    "You are not allowed to give an answer above 1500 characters. And answer like someone asked 'grok is this true?' about the prompt",
    "Also, if someone asks about an anticheat etc. it should be in the context of Roblox"
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

        await interaction.deferReply();

        if (message.author.bot) {
            return await interaction.editReply({ content: "grokichan can't read bot messages, sowy." });
        }
        
        try {
            const response = await openAIClient.chat.completions.create({
                model: "arcee-ai/trinity-mini:free",
                messages: [
                    { 
                        role: "system", 
                        content: systemInstructions.join(". ") 
                    },
                    { role: "user", content: "grok, is this true? " + message.content },
                ],
                temperature: 2,
            });
            
            await interaction.editReply({ content: response.choices[0]?.message?.content });
        } catch (error: any) {
            if (error.status == 429) {
                return await interaction.editReply({ content: "grokichan is ratelimited :point_right::point_left:" })
            }

            console.log("Error generating content:", error);
            await interaction.editReply({ content: "grokichan couldn't figure it out, sowy." });
        }
    }
}