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

        const stripeData = {
            eventId: body.id,
            eventType: body.type,
            timestamp: body.created,
            livemode: body.livemode,
            raw: body.data?.object,
        }

        // trigger an inngest job
        await sendWorkflowEcecution({
            workflowId,
            initialData: {
                stripe: stripeData
            }
        })
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error handling Stripe trigger:", error);
        return NextResponse.json(
            { success: false, message: "An error occurred while handling the Stripe trigger." },
            { status: 500 }
        );
    }
}