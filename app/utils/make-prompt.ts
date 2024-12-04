export const retrySinglePhrase = (english: string, spanish: string, feedback: string) => {
  return `
    I'm not quite satisfied with the following phrase:
    
    English: "${english}"
    Spanish: "${spanish}"

    This is my feedback: "${feedback}"

    Please generate a new version of the phrase in Spanish and English. Attempt to preserve most of the original
    meaning of the phrase, unless the feedback suggests you make a new phrase entirely.

    Please respond in JSON format. The format should be as follows:
      {
        "phrases": [
          {
            "spanish": "the Spanish phrase",
            "english": "the English phrase",
            "imagePrompt": "the image prompt"
          }
        ]
      }

    The "phrases" array should contain only one object, which will be the newly revised phrase. That object should
    have the same keys as the original phrase: "english", "spanish", and "imagePrompt".
  `;
};

export const retryImageGenerationPrompt = (imagePrompt: string, feedback?: string) => {
  return `
    I'm not quite satisfied with the image that was generated from DALL-E 3 using the following imagePrompt: "${imagePrompt}".
    
    Please generate a new version of the imagePrompt that addresses this feedback I have: "${feedback}"

    Please respond in JSON format. The format should be as follows:
      {
        "phrases": [
          {
            "imagePrompt": "the image prompt"
          }
        ]
      }

    The "phrases" array should contain only one object, and that object should have the "imagePrompt" key with the
    new value.

    I hope DALL-E 3 can generate a better image this time.
  `;
};

export const makeImageGenerationPrompt = (prompt: string) => {
  return `
    I NEED to test how the tool works with extremely simple prompts. DO NOT add any detail, just use it AS-IS: ${prompt}
  `;
};
