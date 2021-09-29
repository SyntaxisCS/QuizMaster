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
	console.log(`QuizMaster (${botver}) is online in ${client.guilds.cache.size} servers`);
});

client.on("messageCreate", async (msg) => {
  if(!msg.author.bot) {
	
	// Config Handling
	const DB = new Database("QuizMasterDB.sqlite"); // Replace this  	
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

	// Role Handling
		// Teacher
			if (cmd === prefix + "addteacher") {
				// Create teacher with @mention
			}

			if (cmd === prefix + "deleteteacher") {
				// Delete by id
			}

		// Student
			if (cmd === prefix + "addstudent") {
				if(!msg.member.permissions.has("MANAGE_MESSAGES")) {
					msg.channel.send(`${author}, that is a teacher+ command!`);
				} else {
					if(!msg.mentions.users.first()) {
						msg.channel.send(`${author}, you didn't specify a new student!`);
					} else {
						let studentRoleQuery = DB.prepare(`SELECT studentRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
						let studentRoleDB = studentRoleQuery.get().studentRole;
						let studentRole = msg.guild.roles.cache.find(role => role.name === studentRoleDB);
						let newStudent = msg.guild.members.cache.get(msg.mentions.users.first().id);
						// console.log(newStudent)
						newStudent.roles.add(studentRole);
						let sql = DB.prepare(`INSERT OR IGNORE INTO StudentTable (tag) VALUES ('${msg.mentions.users.first().username}#${msg.mentions.users.first().discriminator}')`);
						sql.run();
					}
				}
			}

			if (cmd === prefix + "deletestudent") {
				// Delete by id
			}


	// Moderation

	if (cmd === prefix + "setprefix") {
		msg.delete();
		if (!msg.member.permissions.has("ADMINISTRATOR")) {
			msg.channel.send(`${author}, that is an admin only command!`);
		} else {
			if(!args) {
				msg.channel.send(`Please specify a new prefix to use! This server's prefix is ${prefix}`);
			} else {
				let sql = DB.prepare(`UPDATE GuildConfig SET prefix = '${args}' WHERE guildId = ${msg.guild.id};`);
				sql.run();

				let prefixQuery = DB.prepare(`SELECT prefix FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
				prefix = prefixQuery.get().prefix;
				msg.channel.send(`You have changed the server prefix to ${prefix}`);
			}
		}
	}

	if (cmd === prefix + "admin") {
		msg.delete();
		let adminGetQuery = DB.prepare(`SELECT adminRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
		let adminGet = adminGetQuery.get().adminRole;
		if(!msg.member.permissions.has("ADMINISTRATOR")) {
			msg.channel.send(`${author}, that is an admin only command!`);
		} else {
			if(!args) {
				msg.channel.send(`The current admin role is ${adminGet}. Set a new one with admin set`);
			} else {
				if (args === "set") {
					let sql = DB.prepare(`UPDATE GuildConfig SET adminRole = '${args2}' WHERE guildId = ${msg.guild.id}`);
					sql.run();
				}
			}
		}
	}

	if (cmd === prefix + "teacher") {
		msg.delete();
		let teacherGetQuery = DB.prepare(`SELECT teacherRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
		let teacherGet = teacherGetQuery.get().teacherRole;
		if(!msg.member.permissions.has("ADMINISTRATOR")) {
			msg.channel.send(`${author}, that is an admin only command!`);
		} else {
			if(!args) {
				msg.channel.send(`The current teacher role is ${teacherGet}. Set a new one with teacher set`);
			} else {
				if (args === "set") {
					let sql = DB.prepare(`UPDATE GuildConfig SET teacherRole = '${args2}' WHERE guildId = ${msg.guild.id}`);
					sql.run();
				}
			}
		}
	}

	if (cmd === prefix + "student") {
		msg.delete();
		let studentGetQuery = DB.prepare(`SELECT studentRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
		let studentGet = studentGetQuery.get().studentRole;
		if(!msg.member.permissions.has("ADMINISTRATOR")) {
			msg.channel.send(`${author}, that is an admin only command!`);
		} else {
			if(!args) {
				msg.channel.send(`The current student role is ${studentGet}. Set a new one with student set`);
			} else {
				if (args === "set") {
					let sql = DB.prepare(`UPDATE GuildConfig SET studentRole = '${args2}' WHERE guildId = ${msg.guild.id}`);
					sql.run();
				}
			}
		}
	}

	DB.close();
  }
});

client.login(botconfig.token);