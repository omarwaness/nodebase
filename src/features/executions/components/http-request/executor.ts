import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
    variableName?: string;
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
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

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || 'GET';

        const options: KyOptions = { method, };
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = data.body;
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

        if (data.variableName) {
            return {
                ...context,
                [data.variableName]: responsePayload
            }
        }

        // fallback for backward compatibility
        return {
            ...context,
            ...responsePayload
        }
    })

    // TODO publish state

    return result;
}