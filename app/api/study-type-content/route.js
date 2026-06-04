import { db } from "@/configs/db";
import { STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { STUDY_TYPES } from "@/configs/studyTypes";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { chapters, courseId, type } = await req.json();

    // Validate type using the shared enum
    const validTypes = Object.values(STUDY_TYPES).filter((t) => t !== STUDY_TYPES.NOTES);
    if (!validTypes.includes(type)) {
        return NextResponse.json({ error: `Invalid study type: ${type}` }, { status: 400 });
    }

    const result = await db
        .insert(STUDY_TYPE_CONTENT_TABLE)
        .values({
            courseId,
            type,
        })
        .returning({ id: STUDY_TYPE_CONTENT_TABLE.id });

    await inngest.send({
        name: "studyType.content",
        data: {
            studyType: type,
            chapters,   // raw chapters string — AI prompt built inside functions.js
            courseId,
            recordId: result[0].id,
        },
    });

    return NextResponse.json({ id: result[0].id });
}