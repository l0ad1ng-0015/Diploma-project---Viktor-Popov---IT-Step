<script lang="ts">
	import { cart, totalPrice } from '$lib/stores/cart';
	export let form: { success?: boolean; message?: string; orderId?: string } | undefined;

	// изчистване на количката при успешна поръчка
	$: if (form?.success) {
		cart.clear();
	}
</script>

<h1>Поръчка</h1>

{#if form?.success}
	<div class="card" style="padding:16px; margin-bottom:16px;">
		<h2>Благодарим за поръчката!</h2>
		<p>Номер на поръчка: <strong>{form.orderId}</strong></p>
		<p>Ще получиш потвърждение в най-скоро време.</p>
		<p><a href="/">← Обратно към продуктите</a></p>
	</div>
{:else}
	{#if form?.message}
		<div class="card" style="padding:12px; margin-bottom:12px; border-color:#e99;">
			<strong>Грешка:</strong>
			{form.message}
		</div>
	{/if}

	<form method="POST" class="form card" style="padding:16px;">
		<div class="row two">
			<div>
				<label>Име и фамилия</label>
				<input name="name" type="text" required />
			</div>
			<div>
				<label>Телефон</label>
				<input name="phone" type="tel" required />
			</div>
		</div>
		<div class="row two">
			<div>
				<label>E-mail</label>
				<input name="email" type="email" required />
			</div>
			<div>
				<label>Адрес за доставка</label>
				<input name="address" type="text" required />
			</div>
		</div>

		<div class="row">
			<div>
				<label>Бележки (по избор)</label>
				<textarea name="notes" placeholder="Предпочитан час за доставка, вход, етаж…"></textarea>
			</div>
		</div>

		<!-- Метод на плащане -->
		<div class="row">
			<div>
				<label>Метод на плащане</label>
				<div style="display:flex; gap:12px; align-items:center;">
					<label><input type="radio" name="paymethod" value="cod" checked /> Наложен платеж</label>
					<label
						><input type="radio" name="paymethod" value="card" /> Карта (Visa/Mastercard – Stripe test)</label
					>
				</div>
			</div>
		</div>

		<!-- артикули и сума -->
		<input type="hidden" name="items" value={JSON.stringify($cart)} />
		<input type="hidden" name="total" value={$totalPrice} />

		<button class="btn" type="submit">Изпрати поръчката</button>
	</form>
{/if}
