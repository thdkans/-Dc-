const { Client, GatewayIntentBits } = require('discord.js');

const ROOM_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
};

// Discord bot token and channel ID
const token = '';
const channelId = '';
const roomId = '';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let currentStatus = ROOM_STATUS.OFFLINE;

client.once('ready', () => {
  console.log('Discord bot is online!');
  checkLiveStatus();
  setInterval(checkLiveStatus, 60000); // 每分鐘檢查一次
});

async function checkLiveStatus() {
  try {
    const fetch = await import('node-fetch').then(mod => mod.default); // 動態加載 node-fetch 模塊
    const roomLiveInfoUrl = `https://play.sooplive.co.kr/{roomId}`;
    const response = await fetch(roomLiveInfoUrl);
    const json = await response.json();

    const { data, code } = json;
    if (code !== 0 || !data) {
      throw new Error('Soop API responded with an error status.');
    }

    const { room_info, anchor_info } = data;
    let status = ROOM_STATUS.OFFLINE;
    if (room_info.live_status === 1) {
      status = ROOM_STATUS.ONLINE;
    }

    if (status !== currentStatus) {
      currentStatus = status; // 更新當前狀態
      const channel = await client.channels.fetch(channelId);

      if (status === ROOM_STATUS.ONLINE) {
        const message = `---------------------------------------------------\n(${anchor_info.base_info.uname})的直播已開始！\n\n房間標題：${room_info.title}\n\n房間連結：https://play.sooplive.co.kr/${room_info.room_id}\n\n[封面連結](${room_info.cover})\n---------------------------------------------------`;
        await channel.send(message);
      } else {
        const message = `---------------------------------------------------\n(${anchor_info.base_info.uname})的直播已結束！\n\n房間標題：${room_info.title}\n\n房間連結：https://play.sooplive.co.kr/${room_info.room_id}\n\n[封面連結](${room_info.cover})\n---------------------------------------------------`;
        await channel.send(message);
      }
    }
  } catch (error) {
    console.error('Error fetching live room info:', error);
  }
}

client.login(token);
