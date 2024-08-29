const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gptController = (io) => {
    io.on('connection', (socket) => {
        socket.on('gpt question', async (data) => {
            try {
                const response = await openai.chat.completions.create({
                    messages: [
                        { 
                            "role": 'user', 
                            "content": `
                                아두이노 센서 데이터 및 객체 검출된 토마토 데이터입니다: 
                                ${JSON.stringify(data)}. 
                                여기서 어떻게 하면 좋을지 적절한 조언을 500자 이내로 알려주세요.
                                만약 데이터가 비어있다면 특이 사항을 전달바랍니다. 
                            `
                        }
                    ],
                    model: 'gpt-4',
                    temperature: 1,
                    max_tokens: 1280,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                });
    
                socket.emit('gpt answer', response.choices[0]?.message?.content)
            } catch (error) {
                console.error('Error with OpenAI API:', error);
            }
        });
    });
}

module.exports = { gptController };