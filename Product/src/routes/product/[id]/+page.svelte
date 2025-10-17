<!-- Файл: product/[id]/+page.svelte
Описание: Страница за отделен продукт.
Показва детайли за продукта, включително снимка, описание, цена и форма за добавяне в количката.
-->

<script lang="ts">
	import productsDefault from '$lib/data/defaultProducts.json';
	import type { Product } from '$lib/types';
	import { cart } from '$lib/stores/cart';
	import { getLocalAdds, getLocalRemovals, merge } from '$lib/storage/productsLocal';
	import { onMount } from 'svelte';

	export let data: { id: string };

	let product: Product | null = null;

	// дефолтно количество
	let qty = 1;

	// първоначално – от дефолтните (работи и при SSR)
	product = (productsDefault as Product[]).find((p) => p.id === data.id) || null;

	onMount(() => {
		const merged = merge(productsDefault as Product[], getLocalAdds(), getLocalRemovals());
		product = merged.find((p) => p.id === data.id) || null;
	});

	// добавяне в количката
	function addToCart() {
		if (product && qty > 0) cart.add(product, qty);
	}
</script>

{#if product}
	<div class="product">
		<div class="media">
			{#if product.image}
				<img src={product.image} alt={product.title} />
			{:else}
				<div class="ph">Без снимка</div>
			{/if}
		</div>
		<div class="info">
			<h1>{product.title}</h1>
			<div class="price">{product.price.toFixed(2)} лв.</div>
			<p class="desc">{product.description}</p>

			<div class="buy">
				<label>
					Количество
					<input type="number" min="1" bind:value={qty} />
				</label>
				<button class="btn" on:click={addToCart}>Добави в количката</button>
			</div>

			<a href="/" class="back">← Обратно към продуктите</a>
		</div>
	</div>
{:else}
	<h1>Продуктът не е наличен</h1>
	<p><a href="/">Върни се към началната страница</a></p>
{/if}

<style>
	.product {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	@media (min-width: 768px) {
		.product {
			grid-template-columns: 1fr 1fr;
		}
	}

	.media {
		border: 1px solid #eee;
		border-radius: 12px;
		background: #fafafa;
		aspect-ratio: 4/3;
		overflow: hidden;
	}
	.media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.ph {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #777;
	}

	.info h1 {
		margin: 0 0 6px;
	}
	.price {
		font-weight: 700;
		margin-bottom: 8px;
	}
	.desc {
		color: #444;
	}

	.buy {
		display: flex;
		gap: 12px;
		align-items: center;
		margin: 12px 0 20px;
	}
	.buy input {
		width: 90px;
		padding: 8px 10px;
		border: 1px solid #ccc;
		border-radius: 8px;
		font: inherit;
	}

	.back {
		text-decoration: none;
		color: #333;
	}
</style>
