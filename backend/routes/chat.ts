import express from 'express';
import payload from 'payload';
import OpenAI from 'openai';

const router = express.Router();

router.post('/chat', async (req, res) => {
    console.log('Received chat request:', {
        body: req.body,
        headers: req.headers
    });

    try {
        const { message, lang = 'en' } = req.body;

        if (!message) {
            console.error('No message provided in request');
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        try {
            console.log('Searching for FAQ in database...');
            const faqs = await payload.find({
                collection: 'faq',
                where: {
                    question: { like: message },
                    language: { equals: lang },
                },
            });
            
            if (faqs.docs.length > 0) {
                console.log('Found matching FAQ');
                return res.json({ 
                    answer: faqs.docs[0].answer, 
                    source: 'local' 
                });
            }
            
            console.log('No matching FAQ found, querying OpenAI...');
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
            
            const answer = response.choices[0]?.message?.content || 'No response from AI';
            return res.json({ 
                answer, 
                source: 'openai' 
            });
        
        } catch (error: any) {
            console.error('Error in chat processing:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                status: error.status,
                response: error.response?.data
            });
            
            return res.status(500).json({ 
                error: 'Error processing your request',
                details: error.message || 'Unknown error',
                code: error.code
            });
        }
        
    } catch (error: any) {
        console.error('Unexpected error in chat endpoint:', error);

        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;