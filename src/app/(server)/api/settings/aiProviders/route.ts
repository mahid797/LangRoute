import { aiProviderService } from '@/app/(server)/services/aiProvider/service';

export async function GET(): Promise<Response> {
	const providers = await aiProviderService.getAiProviders();
	return new Response(JSON.stringify(providers), { status: 200 });
}
