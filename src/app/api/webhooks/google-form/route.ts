import { sendWorkflowEcecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const workflowId = url.searchParams.get("workflowId");

        if (!workflowId) {
            return NextResponse.json(
                { success: false, message: "Missing workflowId in query parameters." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const formData = {
            formId: body.formId,
            formTitle: body.formTitle,
            responsesId: body.responsesId,
            timestamp: body.timestamp,
            respondentEmail: body.respondentEmail,
            responses: body.responses,
            raw: body,
        }

        // trigger an inngest job
        await sendWorkflowEcecution({
            workflowId,
            initialData: {
                googleForm: formData
            }
        })

    } catch (error) {
        console.error("Error handling Google Form trigger:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred while handling the Google Form trigger." },
            { status: 500 }
        );
    }
}