export const retrySinglePhrase = (english: string, spanish: string, feedback: string) => {
  return `
    I'm not quite satisfied with the following phrase:
    
    English: "${english}"
    Spanish: "${spanish}"

    This is my feedback: "${feedback}"

    Please generate a new version of the phrase in Spanish and English.
  `;
};

export const makeImageGenerationPrompt = (prompt: string, feedback?: string) => {
  return `
    Your job is to read a user prompt and generate images from that prompt that are note-worthy to help
    someone remember a concept.
    ${feedback ? `In this case, this user has already asked you for an image before and they were not satisfied with the result.
      Try to generate an image that addresses the feedback.

      Here is their feedback: "${feedback}"` : ''}
    
    Please follow these guidelines:
    1. Read the user prompt and generate an image that is metaphorical or symbolic of their prompt.
    2. Make the image strange or funny to help someone remember the concept.
    3. Generate the image in a cartoon style.
    4. Avoid lewd or offensive images.

    User prompt: ${prompt}
  `;
};
