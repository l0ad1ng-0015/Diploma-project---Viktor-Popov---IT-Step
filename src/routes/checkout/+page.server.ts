// Файл: +page.server.ts
// Описание: Обработва формуляра за поръчка на страницата за плащане.
// Включва валидация на входните данни,
// изпращане на поръчката към telegram и ни праща към Stripe.

import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

type CartItem = { id: string; title: string; price: number; qty: number; image: string };

function uuid() {
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
		const paymethod = String(fd.get('paymethod') || 'cod');

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
			customer: { name, phone, email, address, notes, paymethod },
			createdAt: new Date().toISOString()
		};

		// изпращаме поръчката към Telegram
		const tgRes = await fetch('/api/order', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(order)
		}).catch(() => null);

		// Ако е наложен платеж: приключваме поръчката с успех
		if (paymethod === 'cod') {
			return { success: true, orderId: order.id };
		}

		// ако е карта, включваме stripe сесия и пренасочваме
		// (при успех на плащането stripe ще ни пренасочи към succsess страницата (/checkout/success))
		const pay = await fetch('/api/pay/create-session', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ order })
		});

		// ако има грешка при създаването на сесията
		if (!pay.ok) {
			const txt = await pay.text().catch(() => '');
			console.error('Stripe session failed:', txt);
			return fail(500, { message: 'Проблем при стартиране на плащането. Опитай отново.' });
		}

		const { url } = await pay.json();
		if (!url) return fail(500, { message: 'Липсва URL за плащане.' });

		throw redirect(303, url);
	}
};
