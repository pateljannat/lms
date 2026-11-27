<template>
	<section>
		<FormControl
			type="textarea"
			variant="outline"
			class="[&_textarea]:resize-none"
			:rows="rows"
			:label="__('What should people be able to do?')"
			:placeholder="
				__(
					'For example: calm an upset customer, spot a fire hazard, or close the books at month end'
				)
			"
			:modelValue="modelValue"
			@update:modelValue="(value: string) => emit('update:modelValue', value)"
			@blur="emit('save')"
		/>

		<p v-if="!hasMaterial" class="mt-2 text-p-xs text-ink-gray-6">
			{{ __('Add your material above to get suggestions from it.') }}
		</p>

		<!-- Suggestions open in a panel from the link, so the sidebar keeps its height. -->
		<div v-else class="mt-3 text-p-xs text-ink-gray-6">
			{{ __('Need a starting point?') }}
			<Popover v-model:open="open" side="bottom" align="start" :offset="6">
				<template #trigger>
					<button
						type="button"
						class="font-medium text-ink-gray-8 underline decoration-[var(--outline-gray-3)] underline-offset-2 hover:text-ink-gray-9 hover:decoration-[var(--ink-gray-4)] disabled:cursor-not-allowed disabled:opacity-50"
						:disabled="reading"
						@click="suggestOnce"
					>
						{{ __('Suggest from my material') }}
					</button>
				</template>
				<div class="w-[26rem] max-w-[calc(100vw-2rem)] p-1">
					<!-- The wait looks like what arrives: one suggestion, an angle and a few lines. -->
					<div v-if="suggesting" class="flex flex-col gap-2" :aria-busy="true">
						<div
							class="flex items-center gap-2 px-2.5 pb-1 pt-1.5 text-p-xs text-ink-gray-6"
						>
							<LoadingIndicator class="size-3.5" />
							{{ __('Reading your material. About twenty seconds.') }}
						</div>
						<div class="flex flex-col gap-2 px-2.5 py-2">
							<div
								class="h-2.5 w-1/3 animate-pulse rounded bg-surface-gray-2"
							/>
							<div class="h-3 w-full animate-pulse rounded bg-surface-gray-1" />
							<div class="h-3 w-full animate-pulse rounded bg-surface-gray-1" />
							<div class="h-3 w-3/5 animate-pulse rounded bg-surface-gray-1" />
						</div>
					</div>
					<!-- One suggestion at a time, in full, so each can be read before it is used. -->
					<div
						v-else-if="current"
						class="flex flex-col gap-2 px-2.5 pb-1 pt-1.5"
						role="group"
						:aria-label="__('Suggestions')"
						@keydown.left.prevent="move(-1)"
						@keydown.right.prevent="move(1)"
					>
						<span class="text-p-xs text-ink-gray-6">{{ current.label }}</span>
						<p class="text-p-sm text-ink-gray-8" aria-live="polite">
							{{ current.outcome }}
						</p>
						<div
							v-if="options.length > 1"
							class="flex items-center justify-center gap-2 pt-1"
						>
							<Button
								size="sm"
								variant="ghost"
								:aria-label="__('Previous suggestion')"
								:disabled="shown === 0"
								@click="move(-1)"
							>
								<template #icon>
									<span class="lucide-chevron-left size-4 text-ink-gray-7" />
								</template>
							</Button>
							<div class="flex items-center gap-1">
								<button
									v-for="(option, i) in options"
									:key="option.label"
									type="button"
									class="flex size-4 items-center justify-center rounded-full"
									:aria-label="option.label"
									:aria-current="i === shown"
									@click="shown = i"
								>
									<span
										class="size-1.5 rounded-full"
										:class="
											i === shown ? 'bg-surface-gray-7' : 'bg-surface-gray-4'
										"
									/>
								</button>
							</div>
							<Button
								size="sm"
								variant="ghost"
								:aria-label="__('Next suggestion')"
								:disabled="shown === options.length - 1"
								@click="move(1)"
							>
								<template #icon>
									<span class="lucide-chevron-right size-4 text-ink-gray-7" />
								</template>
							</Button>
						</div>
					</div>
					<ErrorMessage
						v-else-if="error"
						class="px-2.5 py-2"
						:message="error"
					/>
					<p v-else class="px-2.5 py-2 text-p-sm text-ink-gray-6">
						{{
							__(
								'Nothing to suggest from this material yet. Add more and try again.'
							)
						}}
					</p>
					<div
						v-if="!suggesting"
						class="mt-1 flex items-center justify-between border-t border-outline-gray-1 pt-1"
					>
						<Button
							size="sm"
							variant="ghost"
							:disabled="reading"
							@click="suggest"
						>
							{{ __('Refresh') }}
						</Button>
						<Button
							v-if="current"
							size="sm"
							variant="solid"
							@click="pick(current)"
						>
							{{ __('Use this') }}
						</Button>
					</div>
				</div>
			</Popover>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
	Button,
	call,
	ErrorMessage,
	FormControl,
	LoadingIndicator,
	Popover,
} from 'frappe-ui'

interface Option {
	label: string
	outcome: string
}

const props = defineProps<{
	goal: string
	modelValue: string
	hasMaterial: boolean
	reading: boolean
}>()
const emit = defineEmits<{
	'update:modelValue': [value: string]
	save: []
}>()

// Grows with the text, about 45 characters a line in this column, so nothing is cut off.
const rows = computed(() =>
	Math.min(10, Math.max(3, Math.ceil((props.modelValue || '').length / 45) + 1))
)

const options = ref<Option[]>([])
const suggesting = ref(false)
const open = ref(false)
const error = ref<string | null>(null)
let poll: ReturnType<typeof setInterval> | null = null

const stop = () => {
	if (poll) clearInterval(poll)
	poll = null
}

const suggest = async () => {
	stop()
	error.value = null
	options.value = []
	suggesting.value = true
	try {
		const session = await call('lms.lms.ai.api.suggest_outcome', {
			goal: props.goal,
		})
		poll = setInterval(async () => {
			const result = await call('lms.lms.ai.api.outcome_state', {
				session,
			}).catch(() => null)
			if (!result || result.running) return
			stop()
			suggesting.value = false
			options.value = result.options || []
			error.value = result.error
		}, 2500)
	} catch (err) {
		suggesting.value = false
		error.value = (err as Error).message
	}
}

// The first open asks; later opens show the same three until Refresh.
const suggestOnce = () => {
	// A failure stays on screen until Refresh; it is not retried on every open.
	if (!options.value.length && !error.value && !suggesting.value) suggest()
}

// Which suggestion is on screen; a fresh set starts again at the first.
const shown = ref(0)
const current = computed(() => options.value[shown.value])
watch(options, () => (shown.value = 0))
const move = (step: number) => {
	shown.value = Math.min(
		Math.max(shown.value + step, 0),
		options.value.length - 1
	)
}

// The chosen option goes into the box and is saved, so the admin edits it like their own words.
const pick = (option: Option) => {
	emit('update:modelValue', option.outcome)
	emit('save')
	open.value = false
	options.value = []
}

onBeforeUnmount(stop)
</script>
