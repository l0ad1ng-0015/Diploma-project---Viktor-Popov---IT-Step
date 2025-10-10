<script lang="ts">
	import productsDefault from '$lib/data/defaultProducts.json';
	import type { Product } from '$lib/types';
	import {
		getLocalAdds,
		getLocalRemovals,
		merge,
		saveAdd,
		saveRemove,
		saveUnremove,
		deleteAdd
	} from '$lib/storage/productsLocal';
	import { onMount } from 'svelte';

	let products: Product[] = [];
	let adds: Product[] = [];
	let removals: string[] = [];

	// форми за добавяне
	let title = '';
	let price: number | string = '';
	let image = '';
	let description = '';
	let customId = '';

	function genId() {
		return 'p' + Date.now().toString(36);
	}

	function refresh() {
		adds = getLocalAdds();
		removals = getLocalRemovals();
		products = merge(productsDefault as Product[], adds, removals);
	}

	onMount(refresh);

	function isDefault(id: string) {
		return (productsDefault as Product[]).some((p) => p.id === id);
	}
	function isAdded(id: string) {
		return adds.some((p) => p.id === id);
	}
	function isHiddenDefault(id: string) {
		return removals.includes(id);
	}

	function handleAdd(e: Event) {
		e.preventDefault();
		const id = (customId || genId()).trim();
		const p: Product = {
			id,
			title: title.trim(),
			price: Number(price) || 0,
			image: image.trim(),
			description: description.trim()
		};
		if (!p.title || !p.price) {
			alert('Заглавие и цена са задължителни.');
			return;
		}
		saveAdd(p);
		title = '';
		price = '';
		image = '';
		description = '';
		customId = '';
		refresh();
	}

	function hide(id: string) {
		if (!confirm('Скриване на този дефолтен продукт?')) return;
		saveRemove(id);
		refresh();
	}

	function unhide(id: string) {
		saveUnremove(id);
		refresh();
	}

	function removeAdded(id: string) {
		if (!confirm('Изтриване на добавения продукт?')) return;
		deleteAdd(id);
		refresh();
	}

	$: hiddenDefaults = (productsDefault as Product[]).filter((d) => removals.includes(d.id));
</script>

<h1>Админ панел</h1>

<!-- Видими продукти -->
<section class="card" style="padding:16px; margin-bottom:16px;">
	<h2>Видими продукти</h2>
	{#if products.length === 0}
		<p>Няма видими продукти.</p>
	{:else}
		<div class="grid">
			{#each products as p}
				<article class="item card">
					<div class="thumb">
						{#if p.image}<img src={p.image} alt={p.title} />
						{:else}<div class="ph">Без снимка</div>{/if}
					</div>
					<div class="body">
						<div class="meta">
							<strong>{p.title}</strong>
							<span class="price">{p.price.toFixed(2)} лв.</span>
						</div>
						<div class="badges">
							{#if isDefault(p.id)}<span class="badge">дефолтен</span>{/if}
							{#if isAdded(p.id)}<span class="badge added">добавен</span>{/if}
						</div>
						<div class="actions">
							{#if isAdded(p.id)}
								<button class="btn danger" on:click={() => removeAdded(p.id)}
									>Изтрий добавения</button
								>
							{:else if isDefault(p.id)}
								<button class="btn" on:click={() => hide(p.id)}>Скрий</button>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

<!-- Скрити дефолтни -->
<section class="card" style="padding:16px; margin-bottom:16px;">
	<h2>Скрити дефолтни продукти</h2>
	{#if hiddenDefaults.length === 0}
		<p>Няма скрити дефолтни продукти.</p>
	{:else}
		<ul>
			{#each hiddenDefaults as p}
				<li>
					<strong>{p.title}</strong> — {p.price.toFixed(2)} лв.
					<button class="btn" style="margin-left:8px;" on:click={() => unhide(p.id)}
						>Възстанови</button
					>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<!-- Добавяне на продукт -->
<section class="card" style="padding:16px;">
	<h2>Добавяне на нов продукт</h2>
	<form class="form" on:submit|preventDefault={handleAdd}>
		<div class="row two">
			<div>
				<label>ID (по избор)</label>
				<input type="text" bind:value={customId} placeholder="ако оставиш празно, ще се генерира" />
			</div>
			<div>
				<label>Цена*</label>
				<input type="text" bind:value={price} placeholder="напр. 12.50" required />
			</div>
		</div>
		<div class="row">
			<div>
				<label>Заглавие*</label>
				<input type="text" bind:value={title} required />
			</div>
		</div>
		<div class="row">
			<div>
				<label>Снимка (URL)</label>
				<input type="text" bind:value={image} placeholder="/img/products/..." />
			</div>
		</div>
		<div class="row">
			<div>
				<label>Описание</label>
				<textarea bind:value={description}></textarea>
			</div>
		</div>
		<button class="btn" type="submit">Добави</button>
	</form>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}
	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.item {
		overflow: hidden;
	}
	.thumb {
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
	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.price {
		font-weight: 700;
	}
	.badges {
		margin: 8px 0;
		display: flex;
		gap: 6px;
	}
	.badge {
		font-size: 12px;
		padding: 2px 6px;
		border: 1px solid #888;
		border-radius: 999px;
		color: #333;
	}
	.badge.added {
		border-color: #2a7;
		color: #2a7;
	}
	.actions {
		display: flex;
		gap: 8px;
	}
	.btn.danger {
		background: #a02222;
		border-color: #a02222;
	}
</style>
