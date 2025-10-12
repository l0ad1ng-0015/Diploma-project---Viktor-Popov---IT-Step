<!-- Начална страница -->

<script lang="ts">
	import productsDefault from '$lib/data/defaultProducts.json';
	import type { Product } from '$lib/types';
	import { cart } from '$lib/stores/cart';
	import { getLocalAdds, getLocalRemovals, merge } from '$lib/storage/productsLocal';
	import { onMount } from 'svelte';

	let products: Product[] = productsDefault as Product[];
	onMount(() => {
		products = merge(productsDefault as Product[], getLocalAdds(), getLocalRemovals());
	});

	function addToCart(p: Product) {
		cart.add(p, 1);
	}

	function scrollToGrid() {
		const grid = document.getElementById('products-grid');
		if (grid) {
			grid.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="hero-section">
	<div class="hero-overlay"></div>
	<div class="hero-content">
		<div>
			<h1 class="hero-title">
				Открий<br />
				Магията на Ръчното Творчество
			</h1>
			<p class="hero-desc">
				Уникални ръчно изработени продукти, създадени с любов и внимание.<br />
				Персонализирани подаръци и декорации за всеки повод.
			</p>
			<a href="#products-grid" class="hero-btn" on:click|preventDefault={scrollToGrid}>
				Разгледай колекцията
			</a>
		</div>
	</div>
</div>

<h1>Нашата Колекция</h1>
<div id="products-grid" class="grid">
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
	/* Hero section styles */
	.hero-section {
		position: relative;
		height: 80vh;
		border-radius: 36px;
		background-image: url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80');
		background-size: cover;
		background-position: center center;
		margin-bottom: 60px;
	}
	.hero-overlay {
		position: absolute;
		inset: 0;
		background: rgba(60, 40, 20, 0.45);
		z-index: 1;
		border-radius: 36px;
	}
	.hero-content {
		position: relative;
		z-index: 2;
		height: 100%;
		max-width: 1120px;
		margin: 0 auto;
		padding: 0 16px;
		display: flex;
		align-items: center;
	}
	.hero-title {
		color: #fff;
		font-size: 2.7rem;
		font-weight: bold;
		margin-bottom: 24px;
		line-height: 1.1;
		letter-spacing: 1px;
		text-shadow: 0 2px 16px rgba(60, 40, 20, 0.25);
	}
	@media (min-width: 768px) {
		.hero-title {
			font-size: 3.5rem;
		}
	}
	.hero-desc {
		color: #fff;
		font-size: 1.25rem;
		margin-bottom: 32px;
		max-width: 640px;
		text-shadow: 0 1px 8px rgba(60, 40, 20, 0.18);
	}
	.hero-btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #ffe4c4;
		color: #6b4226;
		padding: 12px 32px;
		border-radius: 12px;
		text-decoration: none;
		font-weight: 600;
		font-size: 1.1rem;
		box-shadow: 0 2px 8px rgba(60, 40, 20, 0.1);
		transition:
			background 0.2s,
			color 0.2s;
		border: none;
	}
	.hero-btn:hover {
		background: #ffd7b5;
		color: #4e2e1e;
	}

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
