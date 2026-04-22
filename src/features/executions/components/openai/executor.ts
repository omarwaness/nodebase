import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { openaiChannel } from "@/inngest/channels/openai";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type OpenaiData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

export const openaiExecutor: NodeExecutor<OpenaiData> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        openaiChannel().status({
            nodeId,
            status: "loading"
        })
    )

    if (!data.variableName) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAI node variableName is missing")
    }

    if (!data.userPrompt) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error"
            })
        )
        throw new NonRetriableError("OpenAI node user prompt is missing")
    }

    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context) :
        "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(data.userPrompt)(context)

    // TODO fetch credentials from vault

    const openai = createOpenAI({
        apiKey: "",
    })

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: openai("gpt-4o"),
                system: systemPrompt,
                prompt: userPrompt,
                experimental_telemetry: {
                    isEnabled: true,
                    recordInputs: true,
                    recordOutputs: true,
                }
            },
        )

        const text = steps[0].content[0].type === "text"
            ? steps[0].content[0].text
            : ""

        await publish(
            openaiChannel().status({
                nodeId,
                status: "success",
            })
        )

        return {
            ...context,
            [data.variableName]: {
                aiResponse: text,
            },
        }

    } catch (error) {
        await publish(
            openaiChannel().status({
                nodeId,
                status: "error",
            })
        )
        throw error
    }

}