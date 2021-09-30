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

	if (cmd === prefix + "question") {
		msg.delete();
		if(!args) {
			msg.channel.send(`${author}, this is a multi-part command, please refer to the help command.`);
		} else {
			if (args === "create") {
				if(!args2) {
					msg.channel.send(`Question cannot be empty`);
				} else {
					if (args2.includes(",")) {
						let split = args2.split(",");
						let question = split[0];
						let answer = split[1];
						let sql = DB.prepare(`INSERT OR IGNORE INTO QuestionTable (question, answer) VALUES ('${question}','${answer}')`);
						sql.run();
						let questionQuery = DB.prepare(`SELECT questionId FROM 'QuestionTable' WHERE question = '${question}'`);
						let questionId = questionQuery.get().questionId;
						msg.channel.send(`Created the question "${question}" with the answer of "${answer}" and assigned an id of "${questionId}"`);
					} else {
						msg.channel.send(`Please seperate the question and answer with a ,`);
					}
				}
			}
			if (args === "delete") {
				if(!args2) {
					msg.channel.send(`Please specify a message id to delete`);
				} else {
					if (isNaN(args2)) {
						msg.channel.send(`That is not a valid question id!`);
					} else {
						let sql = DB.prepare(`DELETE FROM QuestionTable WHERE questionId = ${args2}`);
						sql.run();
						msg.channel.send(`Question ${args2} Deleted`);
					}
				}
			}
			if (args === "view") {
				if(!args2) {
					msg.channel.send(`Please give a valid question id`);
				} else {
					if (isNaN(args2)) {
						msg.channel.send(`That is not a valid question id!`);
					} else {
						let sql = DB.prepare(`SELECT * FROM 'QuestionTable' WHERE questionId = ${args2}`);
						let question = sql.get().question;
						let answer = sql.get().answer;
						msg.channel.send(`Question ${sql.get().questionId}: ${question}, ${answer}`);
					}
				}
			}
		}
	}

	// Role Handling
		// Teacher
			if (cmd === prefix + "addteacher") {
				if(!msg.member.permissions.has("ADMINISTRATOR")) {
					msg.channel.send(`${author}, this is a admin only command!`);
				} else {
					if(!msg.mentions.users.first()) {
						msg.channel.send(`${author}, you didn't specify a new teacher!`);
					} else {
						let teacherRoleQuery = DB.prepare(`SELECT teacherRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
						let teacherRoleDB = teacherRoleQuery.get().teacherRole;
						let teacherRole = msg.guild.roles.cache.find(role => role.name === teacherRoleDB);
						let newTeacher = msg.guild.members.cache.get(msg.mentions.users.first().id);
						newTeacher.roles.add(teacherRole).catch(err => console.log(err));
					}
				}
			}

			if (cmd === prefix + "deleteteacher") {
				if(!msg.member.permissions.has("ADMINISTRATOR")) {
					msg.channel.send(`${author}, this is an admin only command!`);
				} else {
					if(!msg.mentions.users.first()) {
						msg.channel.send(`${author}, you didn't specify a teacher to delete`);
					} else {
						let teacherRoleQuery = DB.prepare(`SELECT teacherRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
						let teacherRoleDB = teacherRoleQuery.get().teacherRole;
						let teacherRole = msg.guild.roles.cache.find(role => role.name === teacherRoleDB);
						let teacher = msg.guild.members.cache.get(msg.mentions.users.first().id);
						teacher.roles.remove(teacherRole).catch(err => console.log(err));
					}
				}
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
						newStudent.roles.add(studentRole).catch(err => console.log(err));
						let sql = DB.prepare(`INSERT OR IGNORE INTO StudentTable (tag) VALUES ('${msg.mentions.users.first().username}#${msg.mentions.users.first().discriminator}')`);
						sql.run();
					}
				}
			}

			if (cmd === prefix + "deletestudent") {
				if(!msg.member.permissions.has("MANAGE_MESSAGES")) {
					msg.channel.send(`${author}, this is a teacher+ command!`);
				} else {
					if(!msg.mentions.users.first()) {
						msg.channel.send(`${author}, you didn't specify a student to delete!`);
					} else {
						if (args2 === "confirm") {
							let studentRoleQuery = DB.prepare(`SELECT studentRole FROM 'GuildConfig' WHERE guildId = ${msg.guild.id}`);
							let studentRoleDB = studentRoleQuery.get().studentRole;
							let studentRole = msg.guild.roles.cache.find(role => role.name === studentRoleDB);
							let student = msg.guild.members.cache.get(msg.mentions.users.first().id);
							student.roles.remove(studentRole).catch(err => console.log(err));
							let sql = DB.prepare(`DELETE FROM StudentTable WHERE tag = '${msg.mentions.users.first().username}#${msg.mentions.users.first().discriminator}'`);
							sql.run();
						} else {
							msg.channel.send(`${author}, this is a powerful command! Confirm what you are doing by typing the comamnd like this ${prefix}deletestudent <@mention> confirm`);
						}
					}
				}
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

client.on("guildDelete", guild => { // When bot is kicked or leaves a server
	// Delete server entry from database
	const deleteQuery = DB.prepare(`DELETE FROM GuildConfig WHERE guildId = ${guild.id}`);
	deleteQuery.run();
});

client.login(botconfig.token);