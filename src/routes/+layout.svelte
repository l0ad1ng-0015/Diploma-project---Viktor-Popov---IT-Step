<!-- Файл: +layout.svelte
Описание: Основен layout за сайта.
Включва хедър с навигация, футър и контейнер за основното съдържание.
Добавя и чат-бот компонент, който е достъпен от всички страници.
-->

<script lang="ts">
	import '../app.css';
	import { totalItems } from '$lib/stores/cart';
	import Chatbot from '$lib/components/Chatbot.svelte';
	$: count = $totalItems;
</script>

<header class="site-header">
	<div class="container">
		<a href="/" class="logo">MiniShop</a>
		<nav class="nav">
			<a href="/">Начало</a>
			<!-- <a href="/checkout">Поръчка</a> -->
			<a href="/admin">Админ</a>
			<a href="/cart">Кошница 🛒 {count}</a>
		</nav>
	</div>
</header>

<main class="container">
	<slot />
</main>

<Chatbot />

<footer class="site-footer">
	<div class="container">© MiniShop</div>
</footer>
