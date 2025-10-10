import type { Product } from '$lib/types';
import { browser } from '$app/environment';

const KEY_ADDS = 'miniShop_adds';
const KEY_REMOVALS = 'miniShop_removals';

export function getLocalAdds(): Product[] {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem(KEY_ADDS) || '[]');
	} catch {
		return [];
	}
}
export function getLocalRemovals(): string[] {
	if (!browser) return [];
	try {
		return JSON.parse(localStorage.getItem(KEY_REMOVALS) || '[]');
	} catch {
		return [];
	}
}

export function saveAdd(p: Product) {
	if (!browser) return;
	const list = getLocalAdds();
	const exists = list.find((x) => x.id === p.id);
	const next = exists ? list.map((x) => (x.id === p.id ? p : x)) : [...list, p];
	localStorage.setItem(KEY_ADDS, JSON.stringify(next));
}
export function deleteAdd(id: string) {
	if (!browser) return;
	const list = getLocalAdds().filter((x) => x.id !== id);
	localStorage.setItem(KEY_ADDS, JSON.stringify(list));
}

export function saveRemove(id: string) {
	if (!browser) return;
	const list = getLocalRemovals();
	if (!list.includes(id)) {
		localStorage.setItem(KEY_REMOVALS, JSON.stringify([...list, id]));
	}
}
export function saveUnremove(id: string) {
	if (!browser) return;
	const list = getLocalRemovals().filter((x) => x !== id);
	localStorage.setItem(KEY_REMOVALS, JSON.stringify(list));
}

export function merge(defaults: Product[], adds: Product[], removals: string[]): Product[] {
	const filtered = defaults.filter((d) => !removals.includes(d.id));
	const map = new Map(filtered.map((p) => [p.id, p]));
	for (const a of adds) map.set(a.id, a);
	return Array.from(map.values());
}
