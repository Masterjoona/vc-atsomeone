/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ChannelStore, GuildMemberStore, SelectedChannelStore, SelectedGuildStore } from "@webpack/common";

export default definePlugin({
    name: "atSomeone",
    authors: [Devs.Joona],
    description: "Mention someone randomly",
    patches: [
        {
            find: ".LAUNCHABLE_APPLICATIONS;",
            replacement: [
                {
                    match: /&(\i)\(\)\((\i),\i\(\)\.test\)&&(\i)\.push\(\i\(\)\)/g,
                    replace: "$&,$1()($2,/someone/.test)&&$3.push({text:'@someone',description:'Mention someone randomly'})"
                },
            ],
        },
        {
            find: "inQuote:",
            replacement: {
                match: /\|Clyde/,
                replace: "$&|someone"
            }
        }
    ],
    start() {
        this.preSend = addPreSendListener((_, msg) => {
            msg.content = msg.content.replace(/@someone/g, ()=>`<@${this.randomUser()}>`);
            msg.content = msg.content.replace(/<@&(\d+)>\*/g, (_, roleId) => {
                return `<@${this.randomUser(roleId)}>`;
            });
        });
    },

    stop() {
        removePreSendListener(this.preSend);
    },

    randomUser(roleId: string = ""): string {
        const guildId = SelectedGuildStore.getGuildId();
        if (guildId === null) {
            const dmUsers = ChannelStore.getChannel(SelectedChannelStore.getChannelId()).recipients;
            return dmUsers[~~(dmUsers.length * Math.random())];
        }
        let members = GuildMemberStore.getMembers(guildId);
        if (roleId) {
            members = members.filter(m => m.roles.includes(roleId));
        }
        console.log(members);
        return members[~~(members.length * Math.random())].userId;
    }
});
