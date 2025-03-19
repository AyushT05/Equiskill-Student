import { db } from "@/configs/db";
import { inngest } from "./client";
import { CHAPTER_NOTES_TABLE, STUDY_MATERIAL_TABLE, STUDY_TYPE_CONTENT_TABLE, USER_TABLE } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { GenerateNotesModel, GenerateQuestionsAiModel, GenerateQuizAiModel, GenerateStudyTypeContentAiModel } from "@/configs/AiModel";
import { json } from "drizzle-orm/pg-core";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" }, // ✅ Matches exactly with payload
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body:"Hello, World!" };
  }
);

export const CreateNewUser = inngest.createFunction(
  { id: 'create-user' },
  { event: 'user.create' },
  async ({ event, step }) => {
    const { user } = event.data;
    
    // Ensure you're accessing Clerk user details correctly
    const result = await step.run('Check User and create new if Not in DB', async () => {
      // Check If User Already Exist
      const existingUser = await db.select().from(USER_TABLE)
        .where(eq(USER_TABLE.email, user.primaryEmailAddress.emailAddress));
      
      if (existingUser.length === 0) {
        // Create new user if not exists
        const newUser = await db.insert(USER_TABLE).values({
          name: user.fullName, 
          email: user.primaryEmailAddress.emailAddress
        }).returning({ id: USER_TABLE.id });
        
        return newUser;
      }
      
      return existingUser;
    });

    return 'Success';
  }
);

export const GenerateNotes = inngest.createFunction(
  { id: 'generate-course' },
  { event: 'notes.generate' },
  async ({ event, step }) => {
    const { course } = event.data;

    const notesResult = await step.run('Generate Chapter Notes', async () => {
      const chapters = course?.courseLayout?.chapters;
      let index = 0;
      for (const chapter of chapters) { // Use a standard for...of loop to avoid issues with async callbacks in forEach
        console.log("chapter: " + JSON.stringify(chapter))
        const PROMPT = `Generate beautiful exam material for the chapters:${JSON.stringify(chapter)}. Create the notes by beautifully designing it and use emojis wherever necessary. Make sure to include all topic points in the content. Also make sure to generate the content in PURE HTML FORMAT (Do not include HTMLKL,Head,Title,and Body Tag `
        console.log("Prompt: " + PROMPT)
        const result = await GenerateNotesModel.sendMessage(PROMPT);

        const aiResp = result.response.text();
        try {
          const parsedResponse = JSON.parse(aiResp);
          const htmlContent = parsedResponse.html_content;

          await db.insert(CHAPTER_NOTES_TABLE).values({
            chapterId: index,
            courseId: course?.courseId,
            notes: htmlContent // Store only the HTML content
          })
        } catch (error) {
          console.error("Error parsing JSON response:", error);
          // Handle the error appropriately, maybe store the raw response in the database for debugging
          await db.insert(CHAPTER_NOTES_TABLE).values({
            chapterId: index,
            courseId: course?.courseId,
            notes: aiResp // Store raw response for debugging
          });
        }
        index = index + 1;
      }


      return 'Completed'
    })

    const updateCourseStatusResult = await step.run('Update Course Status to Ready', async () => {

      const result = await db.update(STUDY_MATERIAL_TABLE).set({
        status: 'Ready'
      }).where(eq(STUDY_MATERIAL_TABLE.courseId, course?.courseId));
      return 'Success'
    })
  }
)



export const GenerateStudyTypeContent=inngest.createFunction(
  {id:'Generate Study Type Content'},
  {event:'studyType.content'},
  async({event, step}) => {
    const {studyType,prompt,courseId,recordId} = event.data;
    
    const AiResult= await step.run('Generating Flashcard using AI',async()=>{
      const result = 
    studyType === 'Flashcard' ? await GenerateStudyTypeContentAiModel.sendMessage(prompt) :
    studyType === 'Question/Answers' ? await GenerateQuestionsAiModel.sendMessage(prompt) :
    studyType === 'Quizzes' ? await GenerateQuizAiModel.sendMessage(prompt) :
    (() => { throw new Error(`Invalid study type: ${studyType}`) })(); 
      const AIResult=JSON.parse(result.response.text());
      return AIResult
    })
    const DbResult=await step.run('Save Result to DB',async()=>{
      const result=await db.update(STUDY_TYPE_CONTENT_TABLE)
      .set({
        content:AiResult,
        status:'Ready'
      }).where(eq(STUDY_TYPE_CONTENT_TABLE.id,recordId))
      return 'Data Inserted'
    })
  }

)


