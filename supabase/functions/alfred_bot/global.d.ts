import { Context } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import {
  type Conversation,
  type ConversationFlavor,
} from "https://deno.land/x/grammy_conversations@v1.1.2/conversation.ts";

export {};

declare global {
  type MyContext = Context & ConversationFlavor;
  type MyConversation = Conversation<MyContext>;
}
