const Discord = require("discord.js");
const {MessageEmbed,MessageAttachment,Permissions} = require("discord.js");
const fs = require("fs");
const https = require("https");
const Database = require("better-sqlite3");
// Files
const botconfig = require("./botconfig.json");
const pconfig = require("./package.json");

const client = new Discord.Client({intents:["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"]});

let prefix = botconfig.prefix;
let botver = pconfig.version;
let bothost = botconfig.host;
let statuses = botconfig.statuses;

client.on("ready", () => {
	console.log(`Icebot (${botver}) is online in ${client.guilds.cache.size} servers`);
});

client.on("messageCreate", async (msg) => {
  if(!msg.author.bot) {
	
	// Config Handling
	const DB = new Database("DATABASE NAME GOES HERE") // Replace this  	
	let sql = DB.prepare(`INSERT OR IGNORE INTO GuildConfig (guildId) VALUES (${msg.guild.id});`);
	sql.run();

	let prefixQuery = DB.prepare(`SELECT prefix FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
	prefix = prefixQuery.get().prefix;

	let author = msg.author;
	let messageArray = msg.content.split(" ");
	let cmd = messageArray[0].toLowerCase();
	let args = messageArray[1];
	let args2 = msg.content.split(" ").slice(2).join(" ");

	// Basic 

		/*
		if (cmd === prefix + "help" || cmd === "*help") {

		}
		*/

		if (cmd === prefix + "ping") {
			msg.channel.send("Pinging...").then(ping => {
				let pingCalc = ping.createdTimestamp - msg.createdTimestamp;
				ping.delete();
				msg.channel.send(`Pong!(${pingCalc}ms)`);
			});
		}
  }
});

client.login(botconfig.token);