<template>
	<div>
		<p class="mb-3 text-p-sm text-ink-gray-7">{{ moment.prompt }}</p>
		<ol class="space-y-1.5">
			<li v-for="(slot, i) in slots" :key="i">
				<button
					type="button"
					:disabled="!!result || !filled[i]"
					class="flex w-full items-start gap-3 rounded-5 border px-3 py-2.5 text-start"
					:class="slotClass(i)"
					:aria-label="
						filled[i]
							? __('Remove {0} from {1}').format(filled[i], slot.label)
							: slot.label
					"
					@click="filled[i] = null"
				>
					<span
						class="flex size-5 shrink-0 items-center justify-center rounded-full text-p-xs font-medium"
						:class="stepClass(i)"
						aria-hidden="true"
					>
						<span
							v-if="result"
							:class="isRight(i) ? 'lucide-check' : 'lucide-x'"
							class="size-3"
						/>
						<template v-else>{{ i + 1 }}</template>
					</span>
					<span class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="text-p-xs font-medium text-ink-gray-6">{{
							slot.label
						}}</span>
						<span v-if="filled[i]" class="text-p-sm text-ink-gray-9">{{
							filled[i]
						}}</span>
						<span v-else class="text-p-sm text-ink-gray-6">{{
							__('Tap a piece below')
						}}</span>
						<span
							v-if="result && !isRight(i)"
							class="text-p-xs text-ink-gray-7"
						>
							{{ __('Answer: {0}').format(slot.answer) }}
						</span>
					</span>
				</button>
			</li>
		</ol>
		<!-- What they built, read as the one message it adds up to. -->
		<div
			v-if="result || filled.every(Boolean)"
			class="mt-3 rounded-5 bg-surface-gray-2 px-3 py-2.5"
		>
			<div class="mb-1 text-p-xs font-medium text-ink-gray-6">
				{{ __('Read together') }}
			</div>
			<p class="text-p-sm text-ink-gray-8">{{ filled.join(' ') }}</p>
		</div>
		<div v-if="!result" class="mt-3 flex flex-wrap gap-2">
			<Button
				v-for="piece in pieces"
				:key="piece"
				size="sm"
				class="h-auto min-h-7 max-w-full py-1 [&>span]:whitespace-normal [&>span]:text-start"
				:disabled="filled.includes(piece)"
				@click="place(piece)"
			>
				{{ piece }}
			</Button>
		</div>
		<div v-if="!result" class="mt-3 flex justify-end">
			<Button
				variant="solid"
				size="sm"
				:disabled="filled.some((piece) => !piece)"
				@click="check"
			>
				{{ __('Check') }}
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from 'frappe-ui'

const props = defineProps<{
	moment: Record<string, any>
	result?: Record<string, any> | null
}>()
const emit = defineEmits<{ answer: [result: Record<string, unknown>] }>()

const slots: { label: string; answer: string }[] = props.moment.slots || []
const pieces = [
	...slots.map((slot) => slot.answer),
	...(props.moment.extra_pieces || []),
].sort(() => Math.random() - 0.5)
const filled = ref<(string | null)[]>(
	props.result?.filled || slots.map(() => null)
)

const place = (piece: string) => {
	const empty = filled.value.indexOf(null)
	if (empty !== -1) filled.value[empty] = piece
}

const check = () => {
	const wrong = slots
		.map((slot, i) => ({
			slot: slot.label,
			theirs: filled.value[i],
			right: slot.answer,
		}))
		.filter((row) => row.theirs !== row.right)
	emit('answer', {
		correct: !wrong.length,
		filled: filled.value,
		summary: { wrong },
	})
}

const isRight = (i: number) => filled.value[i] === slots[i].answer

const stepClass = (i: number) => {
	if (!props.result)
		return filled.value[i]
			? 'bg-surface-gray-7 text-ink-base'
			: 'bg-surface-gray-3 text-ink-gray-7'
	return isRight(i)
		? 'bg-surface-green-7 text-ink-base'
		: 'bg-surface-amber-7 text-ink-base'
}

const slotClass = (i: number) => {
	if (!props.result)
		return filled.value[i]
			? 'border-outline-gray-3 bg-surface-gray-1'
			: 'border-dashed border-outline-gray-3 bg-surface-base'
	return filled.value[i] === slots[i].answer
		? 'border-outline-green-2 bg-surface-green-1'
		: 'border-outline-amber-2 bg-surface-amber-1'
}
</script>
