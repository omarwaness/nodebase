// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello.world" },
    async ({ event, step }) => {
        // Fetch video
        await step.sleep("fetch-video", "5s");

        // Transcribe video
        await step.sleep("transcribe-video", "5s");

        // Send transcription to ai
        await step.sleep("send-to-ai", "5s");

        await step.run("create-workflow", () => {
            return prisma.workflow.create({
                data: {
                    name: 'test-workflow'
                }
            })
        })
    },
);