import { json, LoaderFunctionArgs } from "@remix-run/node";
import { makeImageGenerationPrompt, retrySinglePhrase } from "~/utils/make-prompt";
import { getChatGPTImage, getChatGPTResponse } from "~/server/chatgpt-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const english = url.searchParams.get('english');
  const spanish = url.searchParams.get('spanish');
  const feedback = url.searchParams.get('feedback');
  const redoImage = url.searchParams.get('redoImage');
  const prompt = retrySinglePhrase(english ?? "", spanish ?? "", feedback ?? "");
  const response = await getChatGPTResponse(prompt);
  const phrase = JSON.parse(response).phrases[0];
  if (redoImage) {
    const imagePrompt = makeImageGenerationPrompt(phrase.english);
    const image = await getChatGPTImage(imagePrompt) ?? "";
    return json({ phrase, image });
  }
  return json({ phrase, image: null });
}
