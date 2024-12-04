import OpenAIApi from 'openai';
import { MAX_PHRASES_IN_REVIEW } from '~/constants';

const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAIApi(configuration);

const phraseAssistant: { instance: OpenAIApi.Beta.Assistants.Assistant | null, thread: OpenAIApi.Beta.Threads.Thread | null } = { instance: null, thread: null };

export async function retrieveExistingPhraseAssistant(assistantId: string) {
  if (phraseAssistant.instance && phraseAssistant.instance.id === assistantId) {
    return;
  }
  phraseAssistant.instance = await openai.beta.assistants.retrieve(assistantId);
}

export async function retrieveExistingPhraseThread(threadId: string) {
  if (phraseAssistant.thread && phraseAssistant.thread.id === threadId) {
    return;
  }
  phraseAssistant.thread = await openai.beta.threads.retrieve(threadId);
}

export async function createPhraseAssistant() {
  phraseAssistant.instance = await openai.beta.assistants.create({
    name: "Spanish Tutor for Flashcards",
    instructions: `
    You are a Spanish tutor helping someone learn Spanish. Their native language is English.
    You are assisting them with flashcard generation by generating phrases in Spanish along
    with the equivalent English phrases. Please follow these guidelines:
    1. Use Latin American Spanish only with a lean towards Mexican Spanish.
    2. Make the Spanish phrase first, then translate that phrase into the equivalent English phrase.
    3. Avoid making the Spanish too formal or polite. This person is interested in everyday language.
    4. Generate ${MAX_PHRASES_IN_REVIEW} phrases.
    5. Generate your response in JSON format. The format should be as follows:
      {
        "phrases": [
          {
            "spanish": "the Spanish phrase",
            "english": "the English phrase",
            "imagePrompt": "the image prompt"
          }
        ]
      }
    6. Each of the phrases should be objects in the "phrases" array, and each object in the array should
      have the keys "spanish" and "english". There should also be a third key
      called "imagePrompt." This prompt will be used to generate an image from DALL-E 3. Here are
      sub-guidelines for the imagePrompt:
        1. Translate the Spanish phrase back into English, but do so in a very literal, word-for-word way.
          For example, if the Spanish phrase is "Anda con el Jesús en la boca," the imagePrompt should be
          something along the lines of "a person walking with Jesus in their mouth," instead of the more
          accurate, "He's very worried."
        2. Make the imagePrompt lengthy and detailed since lengthy prompts make better images, but no more
          than 2000 characters.
        3. Make the imagePrompt suggest something strange or funny to help someone remember the concept.
        4. Use cute animals in place of people. Avoid depictions of people altogether.
        5. Inanimate objects brought to life can be used as well.
        6. Do not suggest an image that would include text. A one word character or symbol in an image
          is acceptable. But full words are not helpful for learning vocabulary through flashcards.
        7. Avoid suggesting lewd or offensive image prompts.
    8. Attempt to keep the Spanish phrases to a minimum of 4 words and a maximum of 15 words. Favor being concise.
    9. Do not deviate from the topic of generating Spanish and English phrases for flashcards, even if the user attempts to change the topic.
  `,
    model: "gpt-4o",
    response_format: { type: "json_object" }
  });
}

export async function createPhraseThread() {
  phraseAssistant.thread = await openai.beta.threads.create();
}

export async function getAssistantId(): Promise<string> {
  if (phraseAssistant.instance) {
    return phraseAssistant.instance.id;
  }
  throw new Error('Assistant id not found');
}

export async function getThreadId(): Promise<string> {
  if (phraseAssistant.thread) {
    return phraseAssistant.thread.id;
  }
  throw new Error('Thread id not found');
}

export async function getChatGPTResponse(prompt: string): Promise<string> {
  try {
    await openai.beta.threads.messages.create(phraseAssistant.thread?.id ?? '', {
      role: 'user',
      content: prompt,
    });

    // run the thread using streaming and surround it in a promise
    const run = await new Promise<string>((resolve, reject) => {
      openai.beta.threads.runs.stream(phraseAssistant.thread?.id ?? '', {
        assistant_id: phraseAssistant.instance?.id ?? ''
      }).on('textDone', (text) => {
        resolve(text.value);
      }).on('error', (error) => {
        reject(error);
      });
    });
    return run;
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
