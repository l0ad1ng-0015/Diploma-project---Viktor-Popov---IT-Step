import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

type CartItem = { id: string; title: string; price: number; qty: number; image: string };

function uuid() {
	// прост и достатъчен за проекта
	return 'oid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const fd = await request.formData();

		const name = String(fd.get('name') || '').trim();
		const phone = String(fd.get('phone') || '').trim();
		const email = String(fd.get('email') || '').trim();
		const address = String(fd.get('address') || '').trim();
		const notes = String(fd.get('notes') || '').trim();

		const itemsRaw = String(fd.get('items') || '[]');
		const totalRaw = String(fd.get('total') || '0');

		let items: CartItem[] = [];
		let total = 0;

		try {
			items = JSON.parse(itemsRaw || '[]');
		} catch {
			return fail(400, { message: 'Невалидни артикули.' });
		}
		total = Number(totalRaw) || 0;

		if (!name || !phone || !email || !address) {
			return fail(400, { message: 'Моля, попълни всички задължителни полета.' });
		}
		if (!items.length) {
			return fail(400, { message: 'Количката е празна.' });
		}

		const order = {
			id: uuid(),
			items,
			total,
			customer: { name, phone, email, address, notes },
			createdAt: new Date().toISOString()
		};

		// Изпращаме към вътрешния API, който говори с Telegram
		const res = await fetch('/api/order', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(order)
		});

		if (!res.ok) {
			const txt = await res.text().catch(() => '');
			console.error('Telegram error:', txt);
			return fail(500, { message: 'Поръчката не можа да се изпрати. Опитай отново.' });
		}

		return { success: true, orderId: order.id };
	}
};
