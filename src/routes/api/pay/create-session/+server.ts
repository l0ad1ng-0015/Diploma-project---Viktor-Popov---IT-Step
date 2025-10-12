import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-09-30.clover' });

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { order } = (await request.json()) as {
			order: {
				id: string;
				items: Array<{ title: string; price: number; qty: number }>;
				total: number;
			};
		};

		// ВАЛУТА: използваме BGN (по-стабилно за тест)
		const CURRENCY = 'bgn';

		const line_items = (order.items || [])
			.filter((it) => it.qty > 0 && it.price > 0)
			.map((it) => ({
				price_data: {
					currency: CURRENCY,
					product_data: { name: it.title },
					unit_amount: Math.round(it.price * 100) // стотинки/евроцентове
				},
				quantity: it.qty
			}));

		if (!line_items.length) {
			// fallback (не би трябвало да се стига)
			if (!order.total || order.total <= 0) {
				console.error('[stripe] empty items and non-positive total', order);
				return new Response(JSON.stringify({ error: 'empty_line_items' }), { status: 400 });
			}
			line_items.push({
				price_data: {
					currency: CURRENCY,
					product_data: { name: 'MiniShop order ' + order.id },
					unit_amount: Math.round(order.total * 100)
				},
				quantity: 1
			});
		}

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			line_items,
			success_url: `${STRIPE_SUCCESS_URL}?order_id=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${STRIPE_CANCEL_URL}?order_id=${encodeURIComponent(order.id)}`,
			metadata: { order_id: order.id }
		});

		if (!session.url) {
			console.error('[stripe] session created but no URL', session);
			return new Response(JSON.stringify({ error: 'no_session_url' }), { status: 500 });
		}

		return new Response(JSON.stringify({ url: session.url }), {
			status: 200,
			headers: { 'content-type': 'application/json' }
		});
	} catch (e: any) {
		console.error('[stripe] session error:', e?.message || e);
		return new Response(
			JSON.stringify({ error: 'stripe_error', message: e?.message || String(e) }),
			{
				status: 500,
				headers: { 'content-type': 'application/json' }
			}
		);
	}
};
