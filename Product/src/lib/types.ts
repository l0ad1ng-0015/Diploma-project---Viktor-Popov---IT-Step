// дефиниции, които се използват в проекта

export type Product = {
	id: string;
	title: string;
	price: number;
	image: string;
	description: string;
};

export type CartItem = {
	id: string;
	title: string;
	price: number;
	qty: number;
	image: string;
};

export type Order = {
	id: string;
	items: CartItem[];
	total: number;
	customer: {
		name: string;
		phone: string;
		email: string;
		address: string;
		notes?: string;
	};
	createdAt: string;
};
