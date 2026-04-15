import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HttpRequestData = {
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

    const result = await step.run("http-request", async () => {
        const endpoint = data.endpoint!;
        const method = data.method || 'GET';

        const options: KyOptions = { method, };
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
            options.body = data.body;
        }

        const response = await ky(endpoint, options);
        const contentType = response.headers.get('content-type');
        const responseData = contentType && contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        return {
            ...context,
            httpResponse: {
                status: response.status,
                statusText: response.statusText,
                data: responseData
            }
        }
    })

    // TODO publish state

    return result;
}