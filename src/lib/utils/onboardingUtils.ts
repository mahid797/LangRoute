export const nodeCommand = (apiKey: string, model: string) => `// npm install --save langroute
import {LangRoute} from 'langroute';

// Create an LLM using a virtual key
const langroute = new LangRoute({
    apiKey: "${apiKey}",
    virtualKey: "virtual-key-12abdf"
});

const chatCompletion = await langroute.chat.completions.create({
    messages: [{ role: 'user', content: 'What is an LLM proxy?' }],
    model: "${model}",
    maxTokens: 64
});

console.log(chatCompletion.choices);`;

export const curlCommand = (
	apiKey: string,
	model: string,
) => `curl "https://api.langroute.com/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "${model}",
    "messages": [{"role": "user", "content": "What is an LLM proxy?"}],
    "max_tokens": 64,
    "virtual_key": "virtual-key-12abdf"
  }'
  `;

export const pythonCommand = (apiKey: string, model: string) => `# pip install langroute
from langroute import LangRoute

# Create an LLM using a virtual key
langroute = LangRoute(
    api_key="${apiKey}",
    virtual_key="virtual-key-12abdf"
)

chat_completion = langroute.chat.completions.create(
    model="${model}",
    messages=[{"role": "user", "content": "What is an LLM proxy?"}],
    max_tokens=64
)

print(chat_completion.choices)`;
