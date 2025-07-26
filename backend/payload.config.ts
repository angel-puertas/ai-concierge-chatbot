import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import FAQ from "./collections/faq.js";
import FallbackLogs from "./collections/FallbackLogs.js";

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  collections: [FAQ, FallbackLogs],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
});
