// IUC 1.0 - A Powerful Multi-Menu Bot // Node.js + Baileys (No QR, Pairing Code Only)

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, generatePairingCode } = require('@whiskeysockets/baileys'); const P = require('pino'); const fs = require('fs'); const { Boom } = require('@hapi/boom');

const PREFIX = '.'; const PASSWORD = 'iucpass123'; // Change this to your desired bot password

async function startBot() { const { state, saveCreds } = await useMultiFileAuthState('auth_info'); const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    logger: P({ level: 'silent' })
});

sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr, pairingCode }) => {
    if (connection === 'open') {
        console.log('✅ IUC 1.0 Bot is connected');
    } else if (connection === 'close') {
        const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Connection closed. Reconnecting...', shouldReconnect);
        if (shouldReconnect) startBot();
    }
});

sock.ev.on('creds.update', saveCreds);

sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (body.startsWith(`${PREFIX}menu`)) {
        const password = body.split(' ')[1];
        if (password !== PASSWORD) {
            return sock.sendMessage(from, { text: '❌ Incorrect password!' });
        }

        const image = fs.readFileSync('./assets/iuc-menu.jpg'); // Add your menu image here
        const caption = `*📜 IUC 1.0 BOT MENU 📜*

Select a category:

1. Group Menu


2. Tools Menu


3. Media Menu


4. 🔞 Rated 18 Menu


5. Education Menu


6. Anime Menu


7. Fun Menu


8. Owner Menu


9. Others Menu



Type: .menu <number> to open a sub-menu.`;

await sock.sendMessage(from, {
            image: image,
            caption: caption
        });
    }

    // 📡 Pairing Code Generator
    if (body === `${PREFIX}pair`) {
        try {
            const code = await generatePairingCode(sock, 'YOUR_PHONE_NUMBER@c.us');
            await sock.sendMessage(from, { text: `🔗 Pairing Code: ${code}` });
        } catch (err) {
            await sock.sendMessage(from, { text: '❌ Could not generate pairing code.' });
        }
    }

    // Handle Sub-Menus
    const match = body.match(/^\.menu\s(\d)$/);
    if (match) {
        const menus = [
            '📁 *Group Menu:*

1. .kick


2. .promote


3. .demote


4. .tagall


5. .mute


6. .unmute


7. .antilink


8. .welcome


9. .bye


10. .groupinfo


11. .admin


12. .add


13. .remove


14. .rules


15. .warn


16. .resetwarn


17. .invite


18. .closetime


19. .opentime


20. .poll', '🧰 Tools Menu:


21. .calc


22. .weather


23. .time


24. .translate


25. .shortlink


26. .ssweb


27. .qrcode


28. .barcode


29. .text2img


30. .binary


31. .base64


32. .iplookup


33. .fancytext


34. .tts


35. .reminder


36. .timer


37. .ping


38. .uuid


39. .json


40. .whois', '🎞 Media Menu:


41. .play (music downloader)


42. .ytmp3


43. .ytmp4


44. .tiktok


45. .fb


46. .ig


47. .twitter


48. .snap


49. .spotify


50. .mediafire


51. .img2url


52. .sticker


53. .stickerurl


54. .toimg


55. .tomp3


56. .tourl


57. .viewonce (save view once messages)


58. .statussaver (save others' WhatsApp status)


59. .instareel


60. .removebg', '🔞 Rated 18 Menu:


61. .hentai


62. .nsfwpic


63. .lewd


64. .ecchi


65. .ahegao


66. .trap


67. .blowjob


68. .boobs


69. .ass


70. .panties


71. .thighs


72. .gifsex


73. .xvideos


74. .pornhub


75. .rule34


76. .doujin


77. .femdom


78. .cum


79. .nsfwstory


80. .fetish', '📘 Education Menu:


81. .gpt


82. .wiki


83. .math


84. .define


85. .periodic


86. .equation


87. .fact


88. .coding


89. .python


90. .java


91. .sql


92. .chem


93. .physics


94. .bio


95. .history


96. .exam


97. .study


98. .quiz


99. .riddle


100. .dictionary', '🍥 Anime Menu:


101. .anime


102. .animequote


103. .waifu


104. .neko


105. .sauce


106. .trace


107. .manga


108. .anilist


109. .op


110. .ed


111. .char


112. .cosplay


113. .animesong


114. .amv


115. .animeinfo


116. .wallpaper


117. .couple


118. .husbando


119. .guessanime


120. .moe', '😄 Fun Menu:


121. .joke


122. .meme


123. .truth


124. .dare


125. .rate


126. .ship


127. .8ball


128. .roast


129. .compliment


130. .fact


131. .gayrate


132. .simprate


133. .love


134. .howhot


135. .coin


136. .dice


137. .rps


138. .say


139. .mock


140. .reverse', '👑 Owner Menu:


141. .shutdown


142. .restart


143. .ban


144. .unban


145. .block


146. .unblock


147. .bc


148. .status


149. .getss


150. .eval


151. .db


152. .update


153. .mode


154. .setpp


155. .setname


156. .setbio


157. .leave


158. .join


159. .getqr


160. .chatlog', '📦 Others Menu:


161. .help


162. .info


163. .alive


164. .uptime


165. .rules


166. .support


167. .botname


168. .owner


169. .prefix


170. .lang


171. .updateinfo


172. .source


173. .credits


174. .report


175. .feedback


176. .speed


177. .ping


178. .donate


179. .invite


180. .version\n\n✨ Extras:\n21. .cutefont (generate cute/fancy text)\n22. .aivid (AI video generator with audio)\n23. .aipic (AI image generator)\n24. .aivoice (AI voice generator)\n25. .pair (generate pairing code)' ]; const index = parseInt(match[1]) - 1; if (menus[index]) sock.sendMessage(from, { text: menus[index] }); } }); }



startBot();

                                                                                                                                   
