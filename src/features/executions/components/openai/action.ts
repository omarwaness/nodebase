"use server";

import { openaiChannel } from "@/inngest/channels/openai";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "@inngest/realtime";

export type OpenAiToken = Realtime.Token<
    typeof openaiChannel,
    ["status"]
>

export async function fetchOpenAIRealtimeToken(): Promise<OpenAiToken> {
    const token = await getSubscriptionToken(inngest, {
        channel: openaiChannel(),
        topics: ["status"],
    })

    return token;
}
