import { generateCourseOutline } from "@/configs/AiModel";
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();
    console.log(courseId, topic, courseType, difficultyLevel, createdBy);

    try {
        const aiResult = await generateCourseOutline(topic, courseType, difficultyLevel);

        const dbResult = await db
            .insert(STUDY_MATERIAL_TABLE)
            .values({
                courseId,
                courseType,
                topic,
                difficultyLevel,
                courseLayout: aiResult,
                createdBy,
            })
            .returning({ resp: STUDY_MATERIAL_TABLE });

        await inngest.send({
            name: "notes.generate",
            data: {
                course: dbResult[0].resp,
            },
        });

        return NextResponse.json({ result: dbResult[0] });
    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Failed to generate course outline", details: error.message },
            { status: 500 }
        );
    }
}