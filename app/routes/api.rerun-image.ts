import { ActionFunctionArgs, json } from "@remix-run/node";
import { makeImageGenerationPrompt, retryImageGenerationPrompt } from "~/utils/make-prompt";
import { getChatGPTImage, getChatGPTResponse } from "~/server/chatgpt-api.server";

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();
  const prompt = data.prompt;
  const feedback = data.feedback;
  if (!prompt) {
    return json({ error: "No prompt provided" }, { status: 400 });
  }
  if (!feedback) {
    const imageGenerationPrompt = makeImageGenerationPrompt(prompt);
    const imageResponse = await getChatGPTImage(imageGenerationPrompt);
    return json({ image: imageResponse ?? "", imagePrompt: prompt });
  }
  const revisedImagePrompt = retryImageGenerationPrompt(prompt, feedback);
  const response = await getChatGPTResponse(revisedImagePrompt);
  const responseAsArray = JSON.parse(response).phrases;
  const imagePrompt = responseAsArray[0].imagePrompt;
  const imageGenerationPrompt = makeImageGenerationPrompt(imagePrompt);
  const imageResponse = await getChatGPTImage(imageGenerationPrompt);
  return json({ image: imageResponse ?? "", imagePrompt: imagePrompt });
}
