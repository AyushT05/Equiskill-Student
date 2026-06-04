import { db } from "@/configs/db";
import { inngest } from "./client";
import {
    CHAPTER_NOTES_TABLE,
    STUDY_MATERIAL_TABLE,
    STUDY_TYPE_CONTENT_TABLE,
    USER_TABLE,
} from "@/configs/schema";
import { eq } from "drizzle-orm";
import {
    generateChapterNotes,
    generateFlashcards,
    generateQuiz,
    generateQnA,
} from "@/configs/AiModel";
import { STUDY_TYPES } from "@/configs/studyTypes";

export const helloWorld = inngest.createFunction(
    { id: "hello-world", triggers: [{ event: "test/hello.world" }] },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "1s");
        return { event, body: "Hello, World!" };
    }
);

export const CreateNewUser = inngest.createFunction(
    { id: "create-user", triggers: [{ event: "user.create" }] },
    async ({ event, step }) => {
        const { user } = event.data;

        const result = await step.run(
            "Check User and create new if Not in DB",
            async () => {
                const existingUser = await db
                    .select()
                    .from(USER_TABLE)
                    .where(eq(USER_TABLE.email, user.primaryEmailAddress.emailAddress));

                if (existingUser.length === 0) {
                    const newUser = await db
                        .insert(USER_TABLE)
                        .values({
                            name: user.fullName,
                            email: user.primaryEmailAddress.emailAddress,
                        })
                        .returning({ id: USER_TABLE.id });
                    return newUser;
                }

                return existingUser;
            }
        );

        return "Success";
    }
);

export const GenerateNotes = inngest.createFunction(
    { id: "generate-course", triggers: [{ event: "notes.generate" }] },
    async ({ event, step }) => {
        const { course } = event.data;

        await step.run("Generate Chapter Notes", async () => {
            const chapters = course?.courseLayout?.chapters ?? [];

            for (let index = 0; index < chapters.length; index++) {
                const chapter = chapters[index];
                console.log("Generating notes for chapter:", chapter.chapter_title);

                const htmlContent = await generateChapterNotes(chapter);

                await db.insert(CHAPTER_NOTES_TABLE).values({
                    chapterId: index,
                    courseId: course?.courseId,
                    notes: htmlContent,
                });
            }

            return "Completed";
        });

        await step.run("Update Course Status to Ready", async () => {
            await db
                .update(STUDY_MATERIAL_TABLE)
                .set({ status: "Ready" })
                .where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
            return "Success";
        });
    }
);

export const GenerateStudyTypeContent = inngest.createFunction(
    { id: "generate-study-type-content", triggers: [{ event: "studyType.content" }] },
    async ({ event, step }) => {
        const { studyType, chapters, courseId, recordId } = event.data;

        const aiResult = await step.run("Generate content using AI", async () => {
            if (studyType === STUDY_TYPES.FLASHCARD) {
                return await generateFlashcards(chapters);
            } else if (studyType === STUDY_TYPES.QUIZ) {
                return await generateQuiz(chapters);
            } else if (studyType === STUDY_TYPES.QNA) {
                return await generateQnA(chapters);
            } else {
                throw new Error(`Invalid study type: ${studyType}`);
            }
        });

        await step.run("Save Result to DB", async () => {
            await db
                .update(STUDY_TYPE_CONTENT_TABLE)
                .set({
                    content: aiResult,
                    status: "Ready",
                })
                .where(eq(STUDY_TYPE_CONTENT_TABLE.id, recordId));
            return "Data saved";
        });
    }
);