import { Context } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import {
  Conversation,
  ConversationFlavor,
} from "https://deno.land/x/grammy_conversations@v1.1.1/mod.ts";

export {};

declare global {
  type MyContext = Context & ConversationFlavor;
  type MyConversation = Conversation<MyContext>;
}
