import type { RequestHandler } from './$types';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
		return new Response('Missing Telegram env', { status: 500 });
	}

	const order = await request.json();

	// какво се изразява в telegram
	const lines: string[] = [];
	lines.push(`🧾 Нова поръчка #${order.id}`);
	lines.push(`Час: ${new Date(order.createdAt || Date.now()).toLocaleString('bg-BG')}`);
	lines.push('');
	lines.push('Клиент:');
	lines.push(`• ${order.customer?.name}`);
	lines.push(`• 📞 ${order.customer?.phone}`);
	lines.push(`• ✉️ ${order.customer?.email}`);
	lines.push(`• 📍 ${order.customer?.address}`);
	if (order.customer?.notes) lines.push(`• 📝 ${order.customer.notes}`);
	lines.push('');
	lines.push('Артикули:');
	for (const it of order.items || []) {
		lines.push(`- ${it.title} x${it.qty} — ${(it.price * it.qty).toFixed(2)} лв.`);
	}
	lines.push('');
	lines.push(`Общо: ${Number(order.total || 0).toFixed(2)} лв.`);

	const text = lines.join('\n');

	const url = `https://api.telegram.org/bot8366336562:AAHR4hW6-NrXIHkVDcDBiwykrGS3bLzqBO4/sendMessage`;
	const payload = {
		chat_id: TELEGRAM_CHAT_ID,
		text
	};

	const resp = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (!resp.ok) {
		const t = await resp.text().catch(() => '');
		console.error('Telegram send error:', t);
		return new Response('Telegram error', { status: 500 });
	}

	return new Response('ok');
};
