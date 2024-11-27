import { json, LoaderFunctionArgs } from "@remix-run/node";
import { makeImageGenerationPrompt } from "~/utils/make-prompt";
import { getChatGPTImage } from "~/server/chatgpt-api.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const phrase = url.searchParams.get('phrase');
  const feedback = url.searchParams.get('feedback');
  const imageGenerationPrompt = makeImageGenerationPrompt(phrase ?? "", feedback ?? "");
  const imageResponse = await getChatGPTImage(imageGenerationPrompt);
  return json({ image: imageResponse ?? "" });
}
