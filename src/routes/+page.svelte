<!-- Начална страница -->

<script lang="ts">
	import productsDefault from '$lib/data/defaultProducts.json';
	import type { Product } from '$lib/types';
	import { cart } from '$lib/stores/cart';
	import { getLocalAdds, getLocalRemovals, merge } from '$lib/storage/productsLocal';
	import { onMount } from 'svelte';

	let products: Product[] = productsDefault as Product[];

	// при клиентски рендер добави локалните промени от "админ"
	onMount(() => {
		products = merge(productsDefault as Product[], getLocalAdds(), getLocalRemovals());
	});

	function addToCart(p: Product) {
		cart.add(p, 1);
	}
</script>

<h1>Ръчно изработени изделия</h1>

<div class="grid">
	{#each products as p}
		<article class="card">
			<a class="thumb" href={`/product/${p.id}`}>
				{#if p.image}
					<img src={p.image} alt={p.title} />
				{:else}
					<div class="ph">Без снимка</div>
				{/if}
			</a>
			<div class="body">
				<h2 class="title"><a href={`/product/${p.id}`}>{p.title}</a></h2>
				<div class="price">{p.price.toFixed(2)} лв.</div>
				<button class="btn" on:click={() => addToCart(p)}>Добави в количката</button>
			</div>
		</article>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}
	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.card {
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		overflow: hidden;
		background: #fff;
	}
	.thumb {
		display: block;
		aspect-ratio: 4/3;
		background: #fafafa;
	}
	.thumb img {
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
		font-size: 14px;
	}
	.body {
		padding: 12px;
	}
	.title {
		margin: 0 0 6px 0;
		font-size: 18px;
	}
	.title a {
		color: #222;
		text-decoration: none;
	}
	.price {
		font-weight: 700;
		margin-bottom: 8px;
	}
	.btn {
		padding: 8px 12px;
		border: 1px solid #222;
		background: #222;
		color: #fff;
		border-radius: 8px;
		cursor: pointer;
	}
	.btn:hover {
		opacity: 0.9;
	}
</style>
