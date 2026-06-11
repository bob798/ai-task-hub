const OPENAI_API_BASE = "https://api.openai.com/v1";

export interface ImageGenerateParams {
  model: string;
  prompt: string;
  n: number;
  size: string;
  quality: string;
  response_format?: string;
}

export interface OpenAIImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface OpenAIImageResponse {
  created: number;
  data: OpenAIImageData[];
}

export async function generateImages(
  apiKey: string,
  params: ImageGenerateParams
): Promise<OpenAIImageResponse> {
  const response = await fetch(`${OPENAI_API_BASE}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    throw new Error(
      error?.error?.message ?? `OpenAI API 请求失败: ${response.status}`
    );
  }

  return response.json() as Promise<OpenAIImageResponse>;
}
