const { Module } = require("../index");
const ListenerModel = require('../models/ListenerModel');

const appId = Number(process.env.API_ID);

Module(
  { pattern: "listener", fromMe: true, desc: "Listener command", use: "utility" },
  async (m, match) => {
    await ListenerModel.sync();
    const listenerData = await ListenerModel.findOne({ where: { app_id: appId } });
    console.log(listenerData);
    if (!listenerData) {
      await ListenerModel.create({
        app_id: appId,
        get_id: [],
        forward_id: [],
        status: 'stopped',
      });
    }

    let channelIdList = listenerData.get_id || [];
    let forwardIdList = listenerData.forward_id || [];

    let text = "**Channel ID List**\n\n";
    if (channelIdList.length > 0) {
      for (const id of channelIdList) {
        const channelname = await m.getUsername(id);
        text += `${id} - ${channelname}\n`;
      }
      text += "\n";
    } else {
      text += "No channels found.\n\n";
    }

    text += "**Forward ID List**\n\n";
    if (forwardIdList.length > 0) {
      for (const id of forwardIdList) {
        const forwardName = await m.getUsername(id);
        text += `${id} - ${forwardName}\n`;
      }
    } else {
      text += "No forwards found.\n\n";
    }

    await m.send(text);
  }
);

Module(
  {
    pattern: "addChannel ?(.*)",
    fromMe: true,
    desc: "List commands",
    use: "utility",
  },
  async (m, match) => {
    // Handle start command logic here
    if (match[1]) {
      const words = match[1].trim().split(/\s+/);
      let channelList = [];
      let invalidIds = [];
      for (const channel of words) {
        try {
          await m.getUsername(channel);
          channelList.push(channel);
        } catch (e) {
          invalidIds.push(channel);
        }
      }

      if (invalidIds.length > 0) {
        console.log(`Invalid IDs: ${invalidIds.join(", ")}`);
      }

      let text = "**Berhasil Menyimpan Data **\n\n";
      text += "valid Channel: " + channelList.length + "\n";
      text += "Invalid Channel: " + invalidIds.length;

      try {
        const listenerData = await ListenerModel.findOne({ where: { app_id: appId } });

        if (listenerData) {
          const updatedGetId = [...new Set([...(listenerData.get_id || []), ...channelList])];
          await ListenerModel.update({ get_id: updatedGetId }, { where: { app_id: appId } });
          await m.send(text);
        }
      } catch (error) {
        console.error('Error updating the database:', error);
        await m.send('Error updating please try again and check console log');
      }
    }
  }
);
