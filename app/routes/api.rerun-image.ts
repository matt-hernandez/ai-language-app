import { json, LoaderFunctionArgs } from "@remix-run/node";
import { makeImageGenerationPrompt, retryImageGenerationPrompt } from "~/utils/make-prompt";
import { getChatGPTImage, getChatGPTResponse } from "~/server/chatgpt-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const phrase = url.searchParams.get('phrase');
  const feedback = url.searchParams.get('feedback');
  const revisedImagePrompt = retryImageGenerationPrompt(phrase ?? "", feedback ?? "");
  const response = await getChatGPTResponse(revisedImagePrompt);
  const responseAsArray = JSON.parse(response).phrases;
  const imagePrompt = responseAsArray[0].imagePrompt;
  const imageGenerationPrompt = makeImageGenerationPrompt(imagePrompt);
  const imageResponse = await getChatGPTImage(imageGenerationPrompt);
  return json({ image: imageResponse ?? "", imagePrompt: imagePrompt });
}
