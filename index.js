const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const Discord = require("discord.js");
const { channel } = require('node:diagnostics_channel');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

const client = new Client({ intents: [32767] });
const prefix = '+';

client.on("ready", async () => {
    console.log('Bot en ligne !')

    client.user.setActivity(`Préfix +`, {
        type: 'PLAYING',
        url: 'https://www.altoziarp.fr'
    })
    client.guilds.cache.get('1037060381274800169').commands.create(say)
    client.guilds.cache.get('1037060381274800169').commands.create(ban)
    client.guilds.cache.get('1037060381274800169').commands.create(warn)
    client.guilds.cache.get('1037060381274800169').commands.create(recrutement)
    client.guilds.cache.get('1037060381274800169').commands.create(annonce)
    client.guilds.cache.get('1037060381274800169').commands.create(clear)
    client.guilds.cache.get('1037060381274800169').commands.create(serverinfo)
})

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.client) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;
    client.commands.get(command).run(client, message, args)
})

client.on("guildCreate", (guild) => {
    guild.invites.fetch().then(guildInvites => {
        invites.set(guild.id, new Map(guildInvites.map((invite) => [invite.code, invite.uses])));
    })
});

client.on("guildDelete", (guild) => {
    invites.delete(guild.id);
});

const ban = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bannnir un membre.')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Utilisateur à bannir.')
            .setRequired(true))

const annonce = new SlashCommandBuilder()
    .setName('annonce')
    .setDescription('Faire une annonce.')
    .addStringOption(option =>
        option.setName('annonce')
        .setDescription('Votre annonce.')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('titre')
        .setDescription('Titre de l\'annonce.')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('color')
        .setDescription('La couleur de l\'annonce exemple : `RED`, `YELLOW`...')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('footer')
        .setDescription('Bas de page de l\'annonce.')
        .setRequired(true))
    .addStringOption(option =>
        option.setName('ping')
        .setDescription('Ping l\'annonce.')
        .setRequired(true))

const recrutement = new SlashCommandBuilder()
    .setName('recrutement')
    .setDescription('Vous envoie le lien du formulaire de recrutement.')

const serverinfo = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Donne les informations du serveur discord.')

const warn = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un membre.')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Utilisateur à avertir.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Raison de l\'avertissement.')
            .setRequired(false))

const clear = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprimer un des messages.')
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Nombres de messages que vous voulez supprimer.')
            .setRequired(true))         

const say = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Envoyer un message avec le bot.')
    .addStringOption(option =>
        option.setName('message')
        .setDescription('Le message à envoyer.')
        .setRequired(true))

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    if(interaction.commandName === 'say') {
        const wait = require('node:timers/promises').setTimeout;
        if(!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: '❌ | Vous n\'avez pas la permission requise !', ephemeral: true });
        const say = interaction.options.getString('message')

        const embed = new Discord.MessageEmbed()
        .setDescription(say)
        .setColor("RED")

        interaction.deferReply({ ephemeral: true })
        await wait(1000)
        interaction.channel.send({ embeds: [embed] })
        await wait(1000)
        interaction.editReply({ content: `Le message ${say} a été envoyé !`, ephemeral: true })
    }

    if (interaction.commandName === 'clear') {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({ content: '❌ | Vous n\'avez pas la permission requise !', ephemeral: true });

        let number = interaction.options.getInteger('amount')

        if (number >= 1 && number <= 100) {
            interaction.channel.bulkDelete(number)
            interaction.reply({
                content: `:white_check_mark: | ${number} messages ont bien été supprimés !`,
                ephemeral: true
            })
        } else {
            interaction.reply({
                content: '❌ | Le nombre de messages supprimés doit être entre `1 - 100` !',
                ephemeral: true
            })
        }
    }

    if (interaction.commandName === 'warn') {
        if (!interaction.member.permissions.has('KICK_MEMBERS')) return interaction.reply({ content: '❌ | Vous n\'avez pas la permission requise !', ephemeral: true });

        const membre = interaction.options.getMember('user');
        const raison = interaction.options.getString('reason')
        if (!raison) {
            let embed = new Discord.MessageEmbed()
                .setTitle('⚠ Avertissement ! ⚠')
                .setDescription(`⚠ | ${membre} a été averti par ${interaction.member} pour la raison suivante : **pas de raison**.`)
                .setColor('RED')
                .setThumbnail(membre.displayAvatarURL())
                .setFooter({
                    text: '⚠ | Avertissement',
                    iconURL: membre.displayAvatarURL()
                })
            interaction.reply({ embeds: [embed] })

            let warn = new Discord.MessageEmbed()
                .setTitle('⚠ Avertissement ! ⚠')
                .setDescription(`Salut ${membre} tu as été averti sur **${interaction.guild.name}** pour la raison suivante : **pas de raison**.`)
                .setColor('RED')
                .setThumbnail(membre.displayAvatarURL())
                .setFooter({
                    text: '⚠ | Avertissement',
                    iconURL: membre.displayAvatarURL()
                })
            try {
                membre.send({ embeds: [warn] })
            } catch (e) {

            }

        } else {
            let embed = new Discord.MessageEmbed()
                .setTitle('⚠ Avertissement ! ⚠')
                .setDescription(`⚠ | ${membre} a été averti par ${interaction.member} pour la raison suivante : **${raison}**.`)
                .setColor('RED')
                .setThumbnail(membre.displayAvatarURL())
                .setFooter({
                    text: '⚠ | Avertissement',
                    iconURL: membre.displayAvatarURL()
                })
            interaction.reply({ embeds: [embed] })

            let warn = new Discord.MessageEmbed()
                .setTitle('⚠ Avertissement ! ⚠')
                .setDescription(`Salut ${membre} tu as été averti sur **${interaction.guild.name}** pour la raison suivante : **${raison}**.`)
                .setColor('RED')
                .setThumbnail(membre.displayAvatarURL())
                .setFooter({
                    text: '⚠ | Avertissement',
                    iconURL: membre.displayAvatarURL()
                })
            try {
                membre.send({ embeds: [warn] })
            } catch (e) {

            }
        }
    }

    if(interaction.commandName === 'serverinfo') {
        const guild = interaction.guild;
        const explicitContentFilter = {
            "DISABLED" : "Désactivé",
            "MEMBERS_WITHOUT_ROLES" : "Ceux ne possèdant pas de rôle",
            "ALL_MEMBERS" : "Sur tout les membres"
        }
     
        const verificationLevelFilter = {
            "NONE" : "Aucune",
            "LOW" : "Basse",
            "MEDIUM" : "Moyenne",
            "HIGH" : "Élevé",
            "VERY_HIGH" : "Très élevé"
     
        }
        const regions = {
            "europe": "Europe"
        }
        const emojis = guild.emojis.cache.sort((a, b) => b.position - a.position).map(e => e.toString())
        const emojisize = guild.emojis.cache.size
        var emojiList = 0
        if(emojisize > 15) {
            emojiList = `>>> ${emojis.splice(0, 15).join(", ")} & **${emojisize - 15} autres**`
        } else {
            emojiList = `>>> ${emojis.join(", ")}`
        }
    
        const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(r => r.toString())
        const rolesize = guild.roles.cache.size
        var roleList = 0
        if(rolesize > 10) {
            roleList = `>>> ${roles.splice(0, 10).join(", ")} & **${rolesize - 10} autres**`
        } else {
            roleList = `>>> ${roles.join(", ")}`
        }
        
        const onlines = interaction.guild.members.cache.filter(member => member.presence?.status == "online").size
        const dnd = interaction.guild.members.cache.filter(member => member.presence?.status == "dnd").size
        const idle = interaction.guild.members.cache.filter(member => member.presence?.status == "idle").size
        const offline = interaction.guild.members.cache.filter(member => member.presence?.status == "offline").size
        
        function moment(time){
            const createdAt = new Date(time)
        
            return createdAt.toLocaleDateString()
        
        }
        
        const embed = new Discord.MessageEmbed()
        .setAuthor({name: guild.name, iconURL: guild.iconURL()})
        .setColor("RED")
        .setThumbnail(guild.iconURL({size: 1024, dynamic: true}))
        .addField(`👑 Propriétaire :`, `<@702482444753961071>`, true)
        .addField(`💻 ID du serveur :`, `\`${guild.id}\``, true)
        .addField(`🌎 Region :`, `Europe`, true)
        .addField(`📆 Crée le :`, `\`${moment(guild.createdTimestamp)}\``, true)
        .addField(`🔧 Vérification :`, `${verificationLevelFilter[guild.verificationLevel]}`, true)
        .addField(`📛 Filtre de contenu :`, `${explicitContentFilter[guild.explicitContentFilter]}`, true)
        .addField(`📺 Salons : (${interaction.guild.channels.cache.size})`, `\`Textuel(s)\` [»](https://discord.com) ${interaction.guild.channels.cache.filter(channel => channel.type === 'text').size}\n\`Vocaux\` [»](https://discord.com) ${interaction.guild.channels.cache.filter(channel => channel.type === 'voice').size}\n\`Catégories\` [»](https://discord.com) ${interaction.guild.channels.cache.filter(channel => channel.type === 'category').size}`, true)
        .addField(`😴 Salons afk :`, `\`Salon\` [»](https://discord.com) ${guild.afkChannel === null ? "Aucun" : guild.afkChannel}\n\`Temps\` [»](https://discord.com) **${guild.afkTimeout}**`, true)
        .addField(`📂 Rôles :`, `${roleList}`)
        .addField(`🤣 Emojis :`, `${emojiList}`)
        .addField(`⭐ Nitro boost :`, `\`Niveaux\` [»](https://discord.com) **${interaction.guild.premiumTier}**\n\`Nombre de boost\` [»](https://discord.com) **${interaction.guild.premiumSubscriptionCount}**`)
        .addField(`👥 Membres » ${interaction.guild.memberCount}`,
        `> 🟢 En ligne [»](https://discord.com) **${onlines}**
        > 🔴 Ne pas déranger [»](https://discord.com) **${dnd}**
        > 🟡Inactif [»](https://discord.com) **${idle}**
        > ⚫ Hors ligne [»](https://discord.com) **${offline}**
        ────────────
        **${interaction.guild.members.cache.filter(member => !member.user.bot).size}** Humains [»](https://discord.com) **${interaction.guild.members.cache.filter(member => member.user.bot).size}** Robots`)
        
        .setTimestamp()
        .setFooter({text: "🌹 | Server-Info", iconURL: guild.iconURL()})
        
        interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'recrutement') {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel(' | Formulaire de Recrutement')
                    .setURL('non dispo')
                    .setEmoji('💻')
                    .setStyle('LINK')
            )

        let embed = new Discord.MessageEmbed()
            .setTitle('💼 | Recrutement :')
            .setDescription(`
 **Voici les conditions minimum :**            
 ➡️ Minimum 13 ans
 ➡️ Un minimum d'expérience
 ➡️ Être actif
 ➡️ Prêt à s'investir sur du long terme
 ➡️ Bon microphone `)
            .setColor("RED")
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({
                text: "💻 | Recrutement !",
                iconURL: interaction.guild.iconURL()
            })

        interaction.reply({
            embeds: [embed],
            components: [row]
        })
    }

    if (interaction.commandName === 'ban') {
        if (!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({ content: '❌ | Vous n\'avez pas la permission requise !', ephemeral: true });

        const membre = interaction.options.getMember('user');
        if (membre === interaction.member) {
            return interaction.reply({
                content: '❌ | Vous ne pouvez pas vous bannir vous même !',
                ephemeral: true
            });
        } else if (membre === interaction.client) {
            return interaction.reply({
                content: '❌ | Vous ne pouvez pas me bannir !',
                ephemeral: true
            });
        }

        if (membre.id === '975791739119996948') {
            return interaction.reply({
                content: '❌ | Je ne peux pas m\'auto bannir !',
                ephemeral: true
            })
        }

        if (!membre.bannable) return message.reply({ content: `❌ | ${membre} n'est pas bannissable !`, ephemeral: true })

        let embed = new Discord.MessageEmbed()
            .setTitle('Bannissement !')
            .setDescription(`
            Membre banni : ${membre}
            Banni par : ${interaction.member}
            
            Raison : Pas de raison spécifié
            Temps : 7 jours`)
            .setColor("RED")
            .setThumbnail(membre.displayAvatarURL())
            .setFooter({
                text: `Bannissement ! (${membre.user.username})`,
                iconURL: membre.user.displayAvatarURL()
            })

        let reason = `Banni par ${interaction.member}`;

        await membre.ban({ reason: reason, days: 7 })
        interaction.reply({ embeds: [embed] })

        let member = new Discord.MessageEmbed()
            .setTitle('Bannissement !')
            .setDescription(`Salut ${membre}, vous avez été banni par ${interaction.member}, raison : pas de raison spécifié et d'une durée indéfinis de jours !`)
            .setThumbnail(membre.user.displayAvatarURL())
            .setFooter({
                text: `Bannissement (${membre.user.username})`,
                iconURL: membre.user.displayAvatarURL()
            })
            .setColor("RED")

        membre.user.send({ embeds: [member] }).catch(err => { console.log(`Je ne peux pas dm ${membre.user.username} car ses dm sont fermé !`) })
    }

    if(interaction.commandName === 'annonce') {
        if(!interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ content: '❌ | Vous n\'avez pas la permission requise !', ephemeral: true });
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('annonce')
            .setLabel('✅ | Envoyer l\'annonce')
            .setStyle('SUCCESS')
        )

        const annonce = interaction.options.getString('annonce')
        const title = interaction.options.getString('titre')
        const footer = interaction.options.getString('footer')
        const color = interaction.options.getString('color')
        const ping = interaction.options.getString('ping')

        const embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(annonce)
        .setColor(color)
        .setFooter({
            text: footer,
            iconURL: interaction.guild.iconURL()
        })

        interaction.reply({
            content: ping,
            embeds: [embed],
            components: [row],
            ephemeral: true
        })

        client.on("interactionCreate", async interaction => {
            if(interaction.customId === 'annonce') {
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId('annonce')
                    .setLabel('✅ | Envoyer l\'annonce')
                    .setStyle('SUCCESS')
                    .setDisabled(true)
                )
                interaction.update({ content: 'Message envoyé !', components: [row], ephemeral: true, embeds: []})
                interaction.channel.send({content: ping, embeds: [embed] })
            }
        })
    }
})       

client.on("messageCreate", async message => {
    if(message.content.startsWith("+Plainte")) {

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const adapter = new FileSync("report.json")
        const db = low(adapter)

        db.defaults({ report: [] })
.write();

        const target = message.guild.members.cache.get(args[1])
        const reason = args.splice(2).join(" ")

        console.log(reason)

        if(!target) return message.reply("Vous devez mettre l'id de l'user")
        if(!reason) return message.reply("Vous devez ajouté une raison")

        db.get("report").push({reporter: message.author.tag, reported: target.user.tag, reasion: reason}).write()

        console.log(target, reason)

        let embed = new Discord.MessageEmbed()
        .setTitle('💻 | Formulaire de Plainte')
        .setDescription(`
**Vous pouvez vous plaindre pour :**
 1️⃣- Contre un Membres
 2️⃣- Contre le Staff
 3️⃣- Ou autres chose !
 4️⃣- Tout formulaires vide ne seras pas pris en compte !
 📜 Le lien : https://forms.gle/BNW3bqfztiA7uSqa8`)
        .setThumbnail(message.guild.iconURL())
        .setImage('https://cdn.discordapp.com/attachments/983049600036393000/983404056154353704/unknown.png')
        .setColor('RED')
        message.channel.send({
            embeds : [embed]
        })
    }
})

client.on("guildMemberAdd", async member => {
    let channel = member.guild.channels.cache.get("963864949657051176");
    let embed = new Discord.MessageEmbed()
    .setTitle('👋 Un nouveau Membres est la !')
    .setDescription(`
    Bienvenue a toi ${member} sur le serveur !`)
    .setColor('#1ed5e9')
    .setImage('https://cdn.discordapp.com/attachments/983049600036393000/983310605081534464/ujsks.gif')
    channel.send({
        embeds : [embed]
    })
})

client.on("messageCreate", async message => {
    if(message.content === '+help') {
        let row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('admin')
            .setLabel('🛡️ | Administration')
            .setStyle('DANGER'),

            new MessageButton()
            .setCustomId('fun')
            .setLabel('🎉 | Fun')
            .setStyle('DANGER'),

            new MessageButton()
            .setCustomId('commu')
            .setLabel('🌍 | Communautaire')
            .setStyle('DANGER'),
            
            new MessageButton()
            .setCustomId('retour')
            .setLabel('⬅️ | Menu')
            .setStyle('DANGER')
        )

        let embed = new Discord.MessageEmbed()
        .setTitle('📜 | Page d\'aide')
        .setDescription(`
        Voici la page d'aide pour acceder au commande veuillez cliquer sur les boutons ci dessous :
        - 🛡️ | Administration
        - 🛠️ | Utilitaire
        - 🌍 | Communautaire
        - ⬅️ | Retour`)
        .setColor("RED")
        .setFooter({
            text: '📜 | Page d\'aide'
        })
        message.channel.send({
            embeds : [embed],
            components: [row]
        })
    }
})

client.on("interactionCreate", async interaction => {
    if(!interaction.isButton()) return;

    if(interaction.customId === 'admin') {

        let embed = new Discord.MessageEmbed()
        .setTitle('🛡️ | Administration')
        .setDescription(`
        Les commandes d'Administration se trouve ci-dessous :
        
        \`/clear\`, \`/warn\`, \`+ticket\`, \`/annonce\`, \`/ban\`
        `)
        .setColor("RED")
        .setFooter({
            text: '🛡️ | Administration'
        })
        interaction.update({ embeds: [embed] })
    }
})

client.on("interactionCreate", async interaction => {
    if(!interaction.isButton()) return;

    if(interaction.customId === 'fun') {

        let embed = new Discord.MessageEmbed()
        .setTitle('🎉 | Fun')
        .setDescription(`
        Les commandes Utilitaire se trouve ci-dessous :
        
        \`\`, \`\`, \`\`, \`\`
        `)
        .setColor("RED")
        .setFooter({
            text: '🎉 | Fun'
        })
        interaction.update({ embeds: [embed] })
    }
})

client.on("interactionCreate", async interaction => {
    if(!interaction.isButton()) return;

    if(interaction.customId === 'commu') {

        let embed = new Discord.MessageEmbed()
        .setTitle('🌍 | Communautaire')
        .setDescription(`
        Les commandes Communautaire se trouve ci-dessous :
        
        \`/server-info\`, \`/recrutement\`, \`+Plainte\`, \`\`
        `)
        .setColor("RED")
        .setFooter({
            text: '🌍 | Communautaire'
        })
        interaction.update({ embeds: [embed] })
    }
})

client.on("interactionCreate", async interaction => {
    if(!interaction.isButton()) return;

    if(interaction.customId === 'retour') {

        let embed = new Discord.MessageEmbed()
        .setTitle('📜 | Page d\'aide')
        .setDescription(`
        Voici la page d'aide pour acceder au commande veuillez cliquer sur les boutons ci dessous :
        - 🛡️ | Administration
        - 🛠️ | Utilitaire
        - 🌍 | Communautaire
        - ⬅️ | Retour`)
        .setColor("RED")
        .setFooter({
            text: '📜 | Page d\'aide'
        })

        interaction.update({ embeds: [embed] })
    }
})

client.on("messageCreate", async message => {
    if (message.content === '+ticket') {
        if (!message.member.permissions.has('ADMINISTRATOR')) return;
        message.delete()
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('button')
                    .setLabel('📩 | Ouvrir Ticket')
                    .setStyle('PRIMARY'),
            );

        const embed = new Discord.MessageEmbed()
            .setTitle("📩 | Système de ticket")
            .setDescription(`
            Ouvrez un ticket si :

            ⛔️| Pour contactez le staff.
            🤝| Pour une demande de partenariat.
            📜| Ou pour tout autre chose.`)
            .setColor("BLUE")
            .setThumbnail(message.guild.iconURL())
            .setFooter({
                text: '📩 | Système de ticket',
                iconURL: message.guild.iconURL()
            })

        message.channel.send({
            embeds: [embed],
            components: [row]
        })
    }
})

client.on("interactionCreate", async (interaction, message) => {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('close')
                .setLabel('🔒 | Close Ticket')
                .setStyle('PRIMARY'),
        );
    const wait = require('node:timers/promises').setTimeout;
    if (interaction.customId === 'button') {
        const embed = new Discord.MessageEmbed()
            .setColor("BLUE")
            .setDescription(`Salut ${interaction.user} Le support viendras vers toi dans les plus bref délais !`);

        interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
            parent: '1037099231867060334',
            type: 'GUILD_TEXT',
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
                },
                {
                    id: "1037113495847702589",
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES']
                }

            ]
        }).then(async (chat) => {

            chat.send({ embeds: [embed], components: [row] }).then(msg => { });

            await interaction.deferReply({
                ephemeral: true
            })
            await wait(1500)
            await interaction.editReply({
                content: `Ticket crée dans ${chat} !`,
                ephemeral: true,
            })
        });
    }

    const close = new Discord.MessageEmbed()
        .setTitle("🔒 | Close Ticket")
        .setDescription("Êtes vous sur de vouloir fermer le ticket ?")
        .setColor("BLUE")

    if (interaction.customId === 'close') {

        const close1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('oui')
                    .setLabel('✅ | Oui')
                    .setStyle('SUCCESS'),

                new MessageButton()
                    .setCustomId('non')
                    .setLabel('❌ | Non')
                    .setStyle("PRIMARY")
            );


        interaction.reply({ embeds: [close], components: [close1] })
    }

    if (interaction.customId === 'oui') {
        interaction.deferReply({
            ephemeral: true
        })
        await wait(1500)
        interaction.editReply({
            content: 'Je le supprime dans 3 secondes...'
        })
        await wait(3000)
        interaction.channel.delete().catch(err => { })
        await wait(2000)
        console.log(`Fermé par ${interaction.user.username}`)
    }

    if (interaction.customId === 'non') {
        interaction.deferReply({
            ephemeral: true
        })
        await wait(1000)
        interaction.editReply({
            content: 'Commande annulée...',
            ephemeral: true
        })
        await wait(1000)
        interaction.message.delete()
        await wait(1000)
    }
})

client.on("messageCreate", async message => {
    if(message.content === '+pub') {
        let embed = new Discord.MessageEmbed()
        .setTitle('Voici la pub du serveur !')
        .setDescription(`
hey je te présente Altozia https://discord.gg/pNKRWMVgqX

speech_left 
C'est un serveur darkrp garry's mod semi serious 

gift 
*Giveaway
nous organisons chaque mois un giveaway nitro

Et plein D'event !
`)
.setColor('RED')
.setThumbnail(message.guild.iconURL())
message.channel.send({
    embeds : [embed]
})
    }
})

client.login(token);