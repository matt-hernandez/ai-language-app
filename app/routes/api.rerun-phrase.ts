import { ActionFunctionArgs, json } from "@remix-run/node";
import { makeImageGenerationPrompt, retrySinglePhrase } from "~/utils/make-prompt";
import { getChatGPTImage, getChatGPTResponse } from "~/server/chatgpt-api.server";
import { PhraseRaw } from "~/types";

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.json();
  const english = data.english;
  const spanish = data.spanish;
  const feedback = data.feedback;
  const redoImage = data.redoImage;
  const prompt = retrySinglePhrase(english ?? "", spanish ?? "", feedback ?? "");
  const response = await getChatGPTResponse(prompt);
  const phrase: PhraseRaw = JSON.parse(response).phrases[0];
  if (redoImage) {
    const imagePrompt = makeImageGenerationPrompt(phrase.imagePrompt);
    const image = await getChatGPTImage(imagePrompt) ?? "";
    return json({ phrase, image });
  }
  return json({ phrase, image: null });
}
