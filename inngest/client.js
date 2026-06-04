console.log("EVENT KEY:", process.env.INNGEST_EVENT_KEY);

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "equiskill-ai",
  eventKey: process.env.INNGEST_EVENT_KEY,
});