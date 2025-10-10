<script lang="ts">
	import { cart, totalPrice } from '$lib/stores/cart';
	const remove = (id: string) => cart.remove(id);
	const inc = (id: string) => cart.inc(id);
	const dec = (id: string) => cart.dec(id);
	const setQty = (id: string, v: string) => cart.changeQty(id, parseInt(v, 10));
</script>

<h1>Кошница</h1>

{#if $cart.length === 0}
	<div class="card empty">
		<p>Кошницата е празна.</p>
		<p><a href="/">← Върни се към продуктите</a></p>
	</div>
{:else}
	<div class="list">
		{#each $cart as it}
			<article class="row card">
				<a class="thumb" href={`/product/${it.id}`}>
					{#if it.image}<img src={it.image} alt={it.title} />{:else}<div class="ph">
							Без снимка
						</div>{/if}
				</a>

				<div class="info">
					<a class="title" href={`/product/${it.id}`}>{it.title}</a>
					<div class="price">{it.price.toFixed(2)} лв.</div>
				</div>

				<div class="qty">
					<button class="btn sm" on:click={() => dec(it.id)} aria-label="Намали">−</button>
					<input
						type="number"
						min="1"
						value={it.qty}
						on:input={(e) => setQty(it.id, (e.target as HTMLInputElement).value)}
					/>
					<button class="btn sm" on:click={() => inc(it.id)} aria-label="Увеличи">+</button>
				</div>

				<div class="line">{(it.price * it.qty).toFixed(2)} лв.</div>

				<button class="btn danger sm" on:click={() => remove(it.id)} aria-label="Премахни">✕</button
				>
			</article>
		{/each}
	</div>

	<div class="summary card">
		<div class="row-sum">
			<span>Общо</span>
			<strong>{$totalPrice.toFixed(2)} лв.</strong>
		</div>
		<div class="actions">
			<a class="btn" href="/checkout">Към поръчка →</a>
		</div>
	</div>
{/if}

<style>
	.empty {
		padding: 16px;
	}
	.list {
		display: grid;
		gap: 12px;
	}
	.row {
		display: grid;
		grid-template-columns: 96px 1fr auto auto auto;
		align-items: center;
		gap: 12px;
		padding: 10px;
	}
	@media (max-width: 640px) {
		.row {
			grid-template-columns: 72px 1fr;
			grid-template-areas:
				'thumb info'
				'qty qty'
				'line remove';
		}
		.row .thumb {
			grid-area: thumb;
		}
		.row .info {
			grid-area: info;
		}
		.row .qty {
			grid-area: qty;
		}
		.row .line {
			grid-area: line;
		}
		.row .danger {
			grid-area: remove;
			justify-self: end;
		}
	}

	.thumb {
		aspect-ratio: 4/3;
		background: #fafafa;
		border-radius: 8px;
		overflow: hidden;
		display: block;
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
	}

	.info .title {
		display: block;
		font-weight: 700;
		text-decoration: none;
		color: #222;
		margin-bottom: 4px;
	}
	.price {
		color: #444;
	}

	.qty {
		display: flex;
		gap: 6px;
		align-items: center;
	}
	.qty input {
		width: 64px;
		padding: 8px 10px;
		border: 1px solid #ccc;
		border-radius: 8px;
		font: inherit;
		text-align: center;
	}

	.line {
		font-weight: 700;
	}

	.btn.sm {
		padding: 6px 10px;
		font-size: 14px;
	}
	.btn.danger {
		background: #a02222;
		border-color: #a02222;
	}

	.summary {
		margin-top: 14px;
		padding: 12px;
	}
	.row-sum {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
