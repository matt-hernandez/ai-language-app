import { json, LoaderFunctionArgs } from "@remix-run/node";
import { makeImageGenerationPrompt } from "~/make-prompt";
import { getChatGPTImage } from "~/utils/chatgpt-api";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const phrase = url.searchParams.get('phrase');
  const imageGenerationPrompt = makeImageGenerationPrompt(phrase ?? "");
  const imageResponse = await getChatGPTImage(imageGenerationPrompt);
  return json({ image: imageResponse ?? "" });
}
