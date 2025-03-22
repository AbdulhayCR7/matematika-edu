const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Bot tokenlar
const token = '7247732342:AAELxcwcYhyr7pvE9Igs5en63Mtc6mrQwM4'; // Asosiy bot tokeni
const targetBotToken = '7668983753:AAFtrmmBctoc5p1nQVVgodIoAm5gEuuwuKE'; // Ma'lumot yuboriladigan bot tokeni
const targetChatId = '6380444938'; // Ma'lumot yuboriladigan chat ID 

const bot = new TelegramBot(token, { polling: true });

let userSteps = {};
let userData = {};

// /start komandasi
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userSteps[chatId] = 'choosing_course';

    bot.sendMessage(chatId, "🎓 *Matematika Education Centre* o'quv markaziga xush kelibsiz!\n\n📚 Qaysi kursimizga qiziqasiz?", {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                ["📖 Ona tili va adabiyoti", "🇬🇧 Ingliz tili"],
                ["➗ Matematika", "🔬 Fizika"],
                ["📜 Tarix", "🧪 Kimyo"],
                ["🌿 Biologiya", "📚 Majburiy fanlar"],
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

// Foydalanuvchi xabarlarini qayta ishlash
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (userSteps[chatId] === 'choosing_course' && text !== "/start") {
        userSteps[chatId] = 'asking_name';
        userData[chatId] = { kurs: text, sana: new Date().toLocaleString() };

        bot.sendSticker(chatId, 'CAACAgUAAxkBAAEKQltmQwMhzv3XkT0BQ_f68RC0pHZREwAC1gIAAhD6AAFXJ58yoQABWJMtLwQ');
        bot.sendMessage(chatId, `✅ Siz *${text}* kursini tanladingiz!\nIltimos, ismingizni kiriting.`, { parse_mode: 'Markdown' });
    } 
    else if (userSteps[chatId] === 'asking_name') {
        userSteps[chatId] = 'asking_phone';
        userData[chatId].ism = text;

        bot.sendSticker(chatId, 'CAACAgUAAxkBAAEKQmRmQwN7r79xzlv0WcOBqz_ML47hAAKxAgACaQwIWQK_wuT7YrKtLwQ');
        bot.sendMessage(chatId, `😉 Rahmat, *${text}*! Endi telefon raqamingizni yuboring.`, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [[{ text: "📞 Telefon raqamni yuborish", request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } 
    else if (msg.contact) {
        userData[chatId].telefon = msg.contact.phone_number;

        bot.sendSticker(chatId, 'CAACAgUAAxkBAAEKQl5mQwMLPvTq5-yZPYmFDkT3_KXhAAIcAwACSmX5UAb-74uITcdyLwQ');
        bot.sendMessage(chatId, "✅ Sizning ma'lumotlaringiz qabul qilindi! Tez orada siz bilan bog'lanamiz. Rahmat!", {
            reply_markup: { remove_keyboard: true }
        });

        // Ma'lumotni boshqa botga yuborish
        const message = `📌 *Yangi ro'yxatga olish*\n\n📅 Sana: ${userData[chatId].sana}\n📚 Kurs: ${userData[chatId].kurs}\n👤 Ism: ${userData[chatId].ism}\n📞 Telefon: ${userData[chatId].telefon}`;

        axios.post(`https://api.telegram.org/bot${targetBotToken}/sendMessage`, {
            chat_id: targetChatId,
            text: message,
            parse_mode: 'Markdown'
        }).catch(err => console.error('Xatolik yuz berdi:', err));

        // Foydalanuvchi ma'lumotlarini o'chirish
        delete userSteps[chatId];
        delete userData[chatId];
    }
});
