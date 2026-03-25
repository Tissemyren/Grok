import 'dotenv/config';
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

declare module "discord.js" {
    interface Client {
        commands: Collection<string, any>;
        buttons: Collection<string, any>;
    }
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
})
client.commands = new Collection();
client.buttons = new Collection();

(async () => {
    const commands: any = [];
    const grokCommand = (await import("./GrokCommand.ts")).default;

    client.commands.set(grokCommand.data.name, grokCommand);

    commands.push(grokCommand.data.toJSON());

    const interactionEvent = (await import("./interactionCreateUser.ts")).default;

    client.on(Events.InteractionCreate, async (interaction) => {
        await interactionEvent.execute(interaction);
    });
    
    client.on(Events.ClientReady, async () => {
        await client.application?.commands.set(commands);

        console.log("Ready!")
    });

    client.login(process.env.BOT_TOKEN as string);   
})();

export { client };