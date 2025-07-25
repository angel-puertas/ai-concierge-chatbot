import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import FAQ from './collections/faq.js'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET!,
  collections: [
    FAQ,
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
})