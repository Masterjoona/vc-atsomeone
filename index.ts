/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import definePlugin from "@utils/types";
import { ChannelStore, GuildMemberStore, SelectedChannelStore, SelectedGuildStore } from "@webpack/common";

export default definePlugin({
    name: "atSomeone",
    authors: [{
        name: "Joona",
        id: 297410829589020673n
    }],
    description: "Mention someone randomly",
    patches: [
        {
            find: "MENTION_EVERYONE_AUTOCOMPLETE_DESCRIPTION}",
            replacement: {
                match: /MENTION_EVERYONE_AUTOCOMPLETE_DESCRIPTION}\),/,
                replace: "$&MENTION_SOMEONE: ()=>({test:'someone',text:'@someone',description:'Mention someone randomly'}),"
            }
        },
        {
            find: ".LAUNCHABLE_APPLICATIONS;",
            replacement: [
                {
                    match: /&(\i)\(\)\((\i),\i\(\)\.test\)&&(\i)\.push\(\i\(\)\)/g,
                    replace: "$&,$1()($2,atSomeone().test)&&$3.push(atSomeone())"
                },
                {
                    match: /MENTION_EVERYONE(?<=\((\w)=.{10,35})/,
                    replace: "$&,atSomeone=$1.MENTION_SOMEONE"
                }
            ],
        },
    ],
    start() {
        this.preSend = addPreSendListener((_, msg) => {
            msg.content = msg.content.replace(/@someone/g, ()=>`<@${randomUser()}>`);
        });
    },

    stop() {
        removePreSendListener(this.preSend);
    }
});

const randomUser = () => {
    const guildId = SelectedGuildStore.getGuildId();
    if (guildId === null) {
        const dmUsers = ChannelStore.getChannel(SelectedChannelStore.getChannelId()).recipients;
        return dmUsers[~~(dmUsers.length * Math.random())];
    }
    const members = GuildMemberStore.getMembers(guildId);
    return members[~~(members.length * Math.random())].userId;
};
