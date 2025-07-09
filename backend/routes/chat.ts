import express from 'express';
import payload from 'payload';
import OpenAI from 'openai';

const router = express.Router();

router.post('/chat', async (req: any, res: any) => {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const { message, lang = 'en' } = req.body

    const faqs = await payload.find({
        collection: 'faq',
        where: {
            question: { like: message },
            language: { equals: lang },
        },
    });
    if (faqs.docs.length > 0) {
    return res.json({ answer: faqs.docs[0].answer, source: 'local' });
    }
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful hotel concierge answering questions for guests.',
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
        });
        const answer = response.choices[0].message?.content;
        return res.json({ answer, source: 'openai' });
    } catch (error: any) {
    return res.status(500).json({ error: 'OpenAI request failed' });
    }
});

export default router;