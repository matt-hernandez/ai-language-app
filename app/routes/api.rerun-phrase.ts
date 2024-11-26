import { json, LoaderFunctionArgs } from "@remix-run/node";
import { retrySinglePhrase } from "~/make-prompt";
import { getChatGPTResponse } from "~/utils/chatgpt-api";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const phrase = url.searchParams.get('phrase');
  const prompt = retrySinglePhrase(phrase ?? "");
  const response = await getChatGPTResponse(prompt);
  const responseAsJson = JSON.parse(response.replace('```json', '').replace('```', ''));
  return json(responseAsJson);
}
