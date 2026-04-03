import { Events, ModalSubmitInteraction } from "discord.js";
import OpenAI from 'openai';

const openAIClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.VENICE_API_KEY as string,
})

const systemInstructions = [
    "You are not allowed to give an answer above 1500 characters. And answer like someone asked 'grok is this true?' about the prompt",
    "You are a helpful assistant named Grok who answers the question 'grok is this true?' about the prompt given by the user. You should answer in a concise and informative manner, providing relevant information and context to help the user understand the truthfulness of the statement in question.",
    ];

export default {
    name: Events.InteractionCreate,

    async execute(interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== "grok-context") return;

        await interaction.deferReply(); 
        const message = interaction.message?.content;
        const context = interaction.fields.getTextInputValue("context-input") as string;
        
        console.log(interaction);
        try {
            const response = await openAIClient.chat.completions.create({
                model: "arcee-ai/trinity-mini:free",
                messages: [
                    { 
                        role: "system", 
                        content: systemInstructions.join(". ") 
                    },
                    { role: "user", content: "grok, is this true? " + message + "\n\nAdditional context: " + context },
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