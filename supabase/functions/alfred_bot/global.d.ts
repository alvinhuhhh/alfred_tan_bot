import { Context } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations@v1.1.2/conversation.ts";

declare global {
  type MyContext = Context & ConversationFlavor;
  type MyConversation = Conversation<MyContext>;

  interface Chat {
    id: number;
    type: ChatType;
  }

  enum ChatType {
    PRIVATE = "private",
    GROUP = "group",
    SUPERGROUP = "supergroup",
    CHANNEL = "channel",
  }

  interface Dinner {
    id: number;
    chatId: number;
    messageIds: number[];
    date: Date;
    yes: string[];
    no: string[];
  }

  interface Secret {
    id: number;
    chatId: number;
    key: string;
    value: string;
  }
}
