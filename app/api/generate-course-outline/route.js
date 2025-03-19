import { courseOutline } from "@/configs/AiModel";
import { db } from "@/configs/db";
import { STUDY_MATERIAL_TABLE } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { courseId, topic, courseType, difficultyLevel, createdBy } = await req.json();
    console.log(courseId, topic, courseType, difficultyLevel, createdBy);

    const PROMPT = 'Generate a study material for '+topic+ ' for ' +courseType+' and level of difficulty will be ' +difficultyLevel+ ' with summary of course, List of Chapters along with summary for each chapter,Topic list in each chapter, All results in JSON format';

    try {
        const aiResp = await courseOutline.sendMessage(PROMPT);
        const aiResult = JSON.parse(aiResp.response.text());
        console.log(createdBy);

        const dbResult = await db.insert(STUDY_MATERIAL_TABLE).values({
            courseId,
            courseType,
            topic,
            difficultyLevel,
            courseLayout: aiResult,
            createdBy
        }).returning({ resp: STUDY_MATERIAL_TABLE });

        const result = await inngest.send({
            name: 'notes.generate',
            data: {
                course: dbResult[0].resp
            }
        });

        console.log(dbResult);
        return NextResponse.json({ result: dbResult[0] });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Failed to generate course outline" }, { status: 500 });
    }
}
