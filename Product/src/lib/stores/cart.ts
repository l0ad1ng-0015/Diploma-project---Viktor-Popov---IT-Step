// Файл: cart.ts
// Описание: Управлява състоянието на количката за пазаруване.
// Съхранява състоянието в localStorage за запазване между сесиите.

import { writable, derived } from 'svelte/store';
import type { CartItem, Product } from '$lib/types';
import { browser } from '$app/environment';

const STORAGE_KEY = 'miniShop_cart_v1';

// зарежда началното състояние от localStorage
function loadInitial(): CartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as CartItem[];
	} catch {
		return [];
	}
}

// записва състоянието в localStorage
function persist(items: CartItem[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {}
}

// създава магазин за количката с методи за управление
function createCart() {
	const { subscribe, update, set } = writable<CartItem[]>(loadInitial());

	subscribe((items) => persist(items));

	return {
		subscribe,
		add(p: Product, qty = 1) {
			update((items) => {
				const i = items.findIndex((x) => x.id === p.id);
				if (i >= 0) {
					const copy = [...items];
					copy[i] = { ...copy[i], qty: copy[i].qty + qty };
					return copy;
				}
				return [...items, { id: p.id, title: p.title, price: p.price, qty, image: p.image }];
			});
		},
		remove(id: string) {
			update((items) => items.filter((x) => x.id !== id));
		},
		changeQty(id: string, qty: number) {
			update((items) =>
				items.flatMap((it) => {
					if (it.id !== id) return it;
					const q = Math.max(0, Number(qty) || 0);
					if (q <= 0) return []; // 0 -> махаме
					return { ...it, qty: q };
				})
			);
		},
		inc(id: string) {
			update((items) => items.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it)));
		},
		dec(id: string) {
			update((items) =>
				items.flatMap((it) => {
					if (it.id !== id) return it;
					const q = it.qty - 1;
					return q <= 0 ? [] : { ...it, qty: q };
				})
			);
		},
		clear() {
			set([]);
			if (browser) localStorage.removeItem(STORAGE_KEY);
		}
	};
}

export const cart = createCart();
export const totalItems = derived(cart, ($c) => $c.reduce((n, i) => n + i.qty, 0));
export const totalPrice = derived(cart, ($c) => $c.reduce((s, i) => s + i.price * i.qty, 0));
