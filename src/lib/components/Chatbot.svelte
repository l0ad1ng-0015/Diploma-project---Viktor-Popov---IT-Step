<script lang="ts">
	import { FAQS } from '$lib/faq';

	type Msg = { from: 'bot' | 'user'; text: string };
	let open = false;
	let userInput = '';
	let messages: Msg[] = [
		{ from: 'bot', text: 'Здравей! Аз съм мини помощник. Попитай за доставка, плащане, връщане…' }
	];

	function normalize(s: string) {
		return s
			.toLowerCase()
			.replace(/[.,!?;:/\\()[\]{}"'`~@#$%^&*_+=<>|0-9-]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function matchFAQ(q: string) {
		const norm = normalize(q);
		if (!norm) return null;

		const words = new Set(norm.split(' '));

		let best = null as null | { idx: number; score: number; needed: number };

		FAQS.forEach((f, idx) => {
			const kws = f.keywords.map(normalize).filter(Boolean);
			// броим съвпаденията по ключови думи
			const hits = kws.reduce((n, kw) => (words.has(kw) ? n + 1 : n), 0);

			// праг: минимум 2 съвпадения или всички, ако са <=2
			const threshold = Math.min(2, kws.length || 1);

			if (hits >= threshold) {
				const score = hits / (kws.length || 1);
				if (!best || score > best.score) {
					best = { idx, score, needed: threshold };
				}
			}
		});

		return best ? FAQS[best.idx] : null;
	}

	function send() {
		const q = userInput.trim();
		if (!q) return;
		messages = [...messages, { from: 'user', text: q }];

		const hit = matchFAQ(q);

		if (hit) {
			messages = [...messages, { from: 'bot', text: hit.answer }];
		} else {
			messages = [
				...messages,
				{
					from: 'bot',
					text: 'Не съм сигурен по този въпрос. Можеш да попиташ за: доставка, плащане, връщане, материали, контакти.'
				}
			];
		}
		userInput = '';
		// скрол до дъното
		const box = document.querySelector('.cb-body');
		box?.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<!-- Плаващ бутон -->
<button class="cb-fab" on:click={() => (open = !open)} aria-label="Chat">
	{#if open}✕{:else}💬{/if}
</button>

<!-- Прозорец -->
{#if open}
	<div class="cb-wrap card">
		<div class="cb-head">Мини чат-бот</div>
		<div class="cb-body">
			{#each messages as m}
				<div class="msg {m.from}">
					<div class="bubble">{m.text}</div>
				</div>
			{/each}
		</div>
		<div class="cb-input">
			<textarea
				bind:value={userInput}
				on:keydown={handleKey}
				placeholder="Напиши въпрос и натисни Enter..."
			></textarea>
			<button class="btn" on:click={send}>Изпрати</button>
		</div>
	</div>
{/if}

<style>
	.cb-fab {
		position: fixed;
		right: 16px;
		bottom: 16px;
		z-index: 9999;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid #222;
		background: #222;
		color: #fff;
		cursor: pointer;
		font-size: 20px;
		line-height: 1;
	}
	.cb-wrap {
		position: fixed;
		right: 16px;
		bottom: 76px;
		z-index: 9998;
		width: min(90vw, 360px);
		background: #fff;
		border: 1px solid #e5e5e5;
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.cb-head {
		padding: 10px 12px;
		font-weight: 700;
		background: #f6f6f6;
		border-bottom: 1px solid #eee;
	}
	.cb-body {
		padding: 12px;
		height: 280px;
		overflow-y: auto;
		background: #fff;
	}
	.msg {
		display: flex;
		margin-bottom: 8px;
	}
	.msg.user {
		justify-content: flex-end;
	}
	.bubble {
		max-width: 85%;
		padding: 8px 10px;
		border-radius: 10px;
		border: 1px solid #ddd;
		background: #fafafa;
	}
	.msg.user .bubble {
		background: #222;
		color: #fff;
		border-color: #222;
	}
	.cb-input {
		display: flex;
		gap: 8px;
		padding: 10px;
		border-top: 1px solid #eee;
		background: #fff;
	}
	.cb-input textarea {
		flex: 1;
		min-height: 38px;
		max-height: 100px;
		resize: vertical;
		padding: 8px 10px;
		border: 1px solid #ccc;
		border-radius: 8px;
		font: inherit;
	}
</style>
