import OpenAIApi from 'openai';

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAIApi(configuration);

export async function getChatGPTResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw new Error('Failed to get response from ChatGPT');
  }
}

export async function getChatGPTImage(prompt: string): Promise<string | undefined> {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
      quality: 'standard',
      style: 'vivid'
    });
    return response.data[0].b64_json;
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    throw new Error('Failed to get response from ChatGPT');
  }
}
