<script lang="ts">
	import { FAQS, EXAMPLE_QUESTIONS } from '$lib/faq';

	type Msg = { from: 'bot' | 'user'; text: string };
	let open = false;
	let userInput = '';
	let autoSend = false; // 🆕 ако е true – клик върху чип изпраща директно

	let messages: Msg[] = [
		{ from: 'bot', text: 'Здравей! Аз съм мини помощник. Попитай за доставка, плащане, връщане…' }
	];

	let bodyRef: HTMLDivElement | null = null;

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

		let best: null | { idx: number; score: number } = null;

		FAQS.forEach((f, idx) => {
			const kws = f.keywords.map(normalize).filter(Boolean);
			const hits = kws.reduce((n, kw) => (words.has(kw) ? n + 1 : n), 0);
			const threshold = Math.min(2, kws.length || 1);
			if (hits >= threshold) {
				const score = hits / (kws.length || 1);
				if (!best || score > best.score) best = { idx, score };
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
					text: 'Не знам отговора. Попитайте за друго или използвайте някой от примерните въпроси по-долу.'
				}
			];
		}
		userInput = '';
		bodyRef?.scrollTo({ top: bodyRef.scrollHeight, behavior: 'smooth' });
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	// 🆕 клик върху готов въпрос
	function pickSuggestion(q: string) {
		if (autoSend) {
			userInput = q;
			send();
		} else {
			userInput = q;
			// фокус в textarea би бил nice-to-have, но избягваме document.querySelector за SSR
		}
	}
</script>

<!-- Плаващ бутон -->
<button class="cb-fab" on:click={() => (open = !open)} aria-label="Chat">
	{#if open}✕{:else}💬{/if}
</button>

{#if open}
	<div class="cb-wrap card">
		<div class="cb-head">Мини чат-бот</div>

		<div class="cb-body" bind:this={bodyRef}>
			{#each messages as m}
				<div class="msg {m.from}">
					<div class="bubble">{m.text}</div>
				</div>
			{/each}
		</div>

		<!-- 🆕 Примерни въпроси (чипове) -->
		<div class="cb-sugs">
			{#each EXAMPLE_QUESTIONS as q}
				<button class="chip" on:click={() => pickSuggestion(q)}>{q}</button>
			{/each}
			<label class="auto">
				<input type="checkbox" bind:checked={autoSend} />
				изпращай веднага
			</label>
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
		width: min(90vw, 380px);
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
		height: 260px;
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

	/* 🆕 Suggestions (chips) */
	.cb-sugs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 10px 10px 0 10px;
		background: #fff;
	}
	.chip {
		border: 1px solid #d1d5db;
		background: #fff;
		color: #111;
		border-radius: 999px;
		padding: 6px 10px;
		font-size: 13px;
		cursor: pointer;
	}
	.chip:hover {
		background: #f3f4f6;
	}
	.auto {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: #555;
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
