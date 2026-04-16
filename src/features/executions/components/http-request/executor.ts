import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
});

type HttpRequestData = {
    variableName: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: string;
}

export const HttpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
    data,
    nodeId,
    context,
    step
}) => {
    // TODO: publish state

    if (!data.endpoint) {
        // publish error state
        throw new NonRetriableError("HTTP request node is missing endpoint configuration");
    }

    if (!data.variableName) {
        // publish error state
        throw new NonRetriableError("HTTP request node is missing variable name configuration");
    }

    if (!data.method) {
        // publish error state
        throw new NonRetriableError("HTTP request node is missing method configuration");
    }

    const result = await step.run("http-request", async () => {
        const endpoint = Handlebars.compile(data.endpoint)(context);
        const method = data.method;

        const options: KyOptions = { method, };
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            const resolved = Handlebars.compile(data.body || '{}')(context);
            JSON.parse(resolved); // validate JSON
            options.body = resolved;
            options.headers = { 'Content-Type': 'application/json' };
        }

        const response = await ky(endpoint, options);
        const contentType = response.headers.get('content-type');
        const responseData = contentType && contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        const responsePayload = {
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            }
        }

        return {
            ...context,
            [data.variableName]: responsePayload
        }

    })

    // TODO publish state

    return result;
}