import { CollectionConfig } from 'payload/types';
const FAQ: CollectionConfig = {
    slug: 'faq',
    admin: {
        useAsTitle: 'question',
    },
    fields: [
    {
        name: 'question',
        type: 'text',
        required: true,
    },
    {
        name: 'answer',
        type: 'textarea',
        required: true,
    },
    {
        name: 'language',
        type: 'select',
        options: ['hr', 'en'],
        required: true,
    },
    ],
}
export default FAQ