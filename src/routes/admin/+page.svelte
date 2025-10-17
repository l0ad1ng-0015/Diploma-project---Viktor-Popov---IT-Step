<!--  Файл: аdmin/+page.svelte
 Описание: Административен панел за управление на продуктите
 Включва добавяне, скриване и изтриване на продукти.
-->

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

	// панел за администратор (логин)
	// потребителско име: Admin
	// парола: Admin123
	let isLoggedIn = false;
	let username = '';
	let password = '';
	let rememberMe = false;

	const ADMIN_USERNAME = 'Admin';
	const ADMIN_PASSWORD = 'Admin123';

	// Логика за вход
	function handleLogin() {
		if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
			isLoggedIn = true;

			// запазване на логин данните при натискане на Запомни ме,
			if (rememberMe) {
				localStorage.setItem('isLoggedIn', 'true');
			}
		} else {
			alert('Грешно потребителско име или парола!');
		}
	}

	// Проверка дали потребителят вече е логнат
	onMount(() => {
		if (localStorage.getItem('isLoggedIn') === 'true') {
			isLoggedIn = true;
		}
	});

	let products: Product[] = [];
	let adds: Product[] = [];
	let removals: string[] = [];

	// форми за добавяне на продукт
	let title = '';
	let price: number | string = '';
	let image = '';
	let description = '';
	let customId = '';

	function genId() {
		return 'p' + Date.now().toString(36);
	}

	// обновяване на списъка с продукти след релоуд на страницата или промяна
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

<!-- Логин форма -->
{#if !isLoggedIn}
	<div class="login-form">
		<h2 style="margin-bottom: 20px">Админ страница</h2>
		<input type="text" placeholder="Потребителско име" bind:value={username} />
		<input type="password" placeholder="Парола" bind:value={password} />
		<label>
			<input type="checkbox" bind:checked={rememberMe} />
			Запомни ме
		</label>
		<button on:click={handleLogin}>Вход</button>
	</div>
{:else}
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
					<input
						type="text"
						bind:value={customId}
						placeholder="ако оставите празно, ще се генерира"
					/>
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
{/if}

<style>
	.login-form {
		max-width: 340px;
		margin: 60px auto 0 auto;
		padding: 32px 24px;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.login-form h2 {
		text-align: center;
		font-size: 1.5em;
		margin-bottom: 20px;
	}

	.login-form input[type='text'],
	.login-form input[type='password'] {
		width: 100%;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 6px;
		font-size: 1em;
		margin-bottom: 8px;
	}

	.login-form label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.98em;
		margin-bottom: 8px;
	}

	.login-form button {
		width: 100%;
		padding: 10px;
		background: #2a7;
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 1em;
		cursor: pointer;
		transition: background 0.2s;
	}

	.login-form button:hover {
		background: #238a5e;
	}

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
