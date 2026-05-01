import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { HttpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecuter } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecuter } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAiExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { slackExecutor } from "../components/slack/executor";
import { discordExecutor } from "../components/discord/executor";



export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
    [NodeType.INITIAL]: manualTriggerExecutor,
    [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecuter,
    [NodeType.STRIPE_TRIGGER]: stripeTriggerExecuter,
    [NodeType.GEMINI]: geminiExecutor,
    [NodeType.ANTHROPIC]: anthropicExecutor,
    [NodeType.OPENAI]: openAiExecutor,
    [NodeType.DISCORD]: discordExecutor,
    [NodeType.SLACK]: slackExecutor,

}

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No executor found for node type: ${type}`);
    }

    return executor;
}