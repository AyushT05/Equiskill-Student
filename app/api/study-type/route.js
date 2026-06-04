import { db } from "@/configs/db";
import { CHAPTER_NOTES_TABLE, STUDY_TYPE_CONTENT_TABLE } from "@/configs/schema";
import { STUDY_TYPES } from "@/configs/studyTypes";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { courseId, studyType } = await req.json();

    if (studyType === "ALL") {
        const notes = await db
            .select()
            .from(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));

        const contentList = await db
            .select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId));

        const result = {
            notes,
            flashCard: contentList.find((item) => item.type === STUDY_TYPES.FLASHCARD) ?? null,
            // FIX: was using key "qa" but MaterialCardItem looks up key "question"
            question: contentList.find((item) => item.type === STUDY_TYPES.QNA) ?? null,
            quiz: contentList.find((item) => item.type === STUDY_TYPES.QUIZ) ?? null,
        };

        return NextResponse.json(result);
    } else if (studyType === STUDY_TYPES.NOTES || studyType === "notes") {
        const notes = await db
            .select()
            .from(CHAPTER_NOTES_TABLE)
            .where(eq(CHAPTER_NOTES_TABLE.courseId, courseId));
        return NextResponse.json(notes);
    } else {
        // FIX: normalize legacy studyType strings to canonical STUDY_TYPES values
        const normalizeType = (t) => {
            if (t === "Quizzes" || t === STUDY_TYPES.QUIZ) return STUDY_TYPES.QUIZ;
            if (t === "Question/Answers" || t === "Q&A" || t === STUDY_TYPES.QNA) return STUDY_TYPES.QNA;
            if (t === "Flashcard" || t === STUDY_TYPES.FLASHCARD) return STUDY_TYPES.FLASHCARD;
            return t;
        };

        const canonicalType = normalizeType(studyType);

        const result = await db
            .select()
            .from(STUDY_TYPE_CONTENT_TABLE)
            .where(
                and(
                    eq(STUDY_TYPE_CONTENT_TABLE.courseId, courseId),
                    eq(STUDY_TYPE_CONTENT_TABLE.type, canonicalType)
                )
            );
        return NextResponse.json(result[0] ?? null);
    }
}
