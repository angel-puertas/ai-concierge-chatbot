import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { FAQ } from './collections/faq'

export default {
    secret: process.env.PAYLOAD_SECRET,
    db: mongooseAdapter({
        url: process.env.DATABASE_URI,
    }),
    collections: [
        {
            slug: 'pages',
            fields: [
                {
                    name: 'title',
                    type: 'text',
                },
            ],
        },
        FAQ
    ],
}
