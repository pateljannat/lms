<template>
	<FormShell :title="__('Find material')" size="lg" @close="emit('close')">
		<template #default>
			<div class="flex flex-col gap-3">
				<form class="flex items-end gap-2" @submit.prevent="search()">
					<FormControl
						v-model="query"
						class="flex-1"
						variant="outline"
						:label="__('Search for')"
						:placeholder="__('What people should learn')"
					/>
					<Button
						type="submit"
						:label="__('Search')"
						:disabled="searching || !query.trim()"
					/>
				</form>

				<!-- The wait looks like what arrives: rows with a tick, a name and a line. -->
				<ul
					v-if="searching"
					class="flex flex-col gap-1"
					:aria-busy="true"
					:aria-label="__('Searching the web')"
				>
					<li v-for="row in 4" :key="row" class="flex items-center gap-2.5 py-2">
						<div class="size-8 shrink-0 animate-pulse rounded-6 bg-surface-gray-2" />
						<div class="flex flex-1 flex-col gap-1.5">
							<div class="h-3 w-2/3 animate-pulse rounded-4 bg-surface-gray-2" />
							<div class="h-3 w-1/3 animate-pulse rounded-4 bg-surface-gray-2" />
						</div>
					</li>
				</ul>

				<ul v-else-if="pages.length" class="flex flex-col gap-0.5">
					<li v-for="page in pages" :key="page.url">
						<label
							class="flex items-center gap-2.5 rounded-4 px-1.5 py-2"
							:class="
								page.readable
									? 'cursor-pointer hover:bg-surface-gray-1'
									: 'cursor-not-allowed'
							"
						>
							<Checkbox
								:model-value="picked.has(page.url)"
								:disabled="!page.readable || adding"
								:aria-label="page.title"
								@update:model-value="(on) => pick(page, !!on)"
							/>
							<span
								class="flex size-8 shrink-0 items-center justify-center rounded-6"
								:class="page.readable ? 'bg-surface-blue-2' : 'bg-surface-gray-2'"
								aria-hidden="true"
							>
								<span
									class="lucide-globe size-4"
									:class="page.readable ? 'text-ink-blue-7' : 'text-ink-gray-5'"
								/>
							</span>
							<span class="min-w-0 flex-1">
								<span
									class="block truncate text-p-sm"
									:class="page.readable ? 'text-ink-gray-8' : 'text-ink-gray-6'"
								>
									{{ page.title }}
								</span>
								<span class="block truncate text-p-xs text-ink-gray-6">
									{{ [page.site, page.problem || page.why].filter(Boolean).join(' · ') }}
								</span>
							</span>
						</label>
					</li>
				</ul>

				<ErrorMessage :message="error" />
			</div>
		</template>
		<template #actions>
			<p v-if="pages.length" class="me-auto self-center text-p-sm text-ink-gray-6">
				{{ __('Lumi teaches from the pages you tick') }}
			</p>
			<HeaderButton
				:label="picked.size ? __('Add {0}', [picked.size]) : __('Add')"
				variant="solid"
				:disabled="!picked.size || searching"
				:loading="adding"
				@click="add"
			/>
		</template>
	</FormShell>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { Button, call, Checkbox, ErrorMessage, FormControl } from 'frappe-ui'
import FormShell from '@/components/FormShell.vue'
import HeaderButton from '@/components/HeaderButton.vue'

type Page = {
	title: string
	url: string
	site: string
	why: string
	readable: boolean
	problem: string
}

const props = defineProps<{ goal: string }>()
const emit = defineEmits<{ close: []; added: [sources: unknown[]] }>()

const query = ref('')
const pages = ref<Page[]>([])
const picked = ref<Set<string>>(new Set())
const searching = ref(false)
const adding = ref(false)
const error = ref<string | null>(null)
let poll: ReturnType<typeof setInterval> | null = null
// A search that hasn't answered in this long has stalled; the admin can search again.
const SEARCH_LIMIT_MS = 3 * 60 * 1000

// On /skills/new the search needs the skill, so it is created as the first search starts.
const ensureGoal = inject<() => Promise<string>>('ensureGoal', () =>
	Promise.resolve(props.goal)
)

const stop = () => {
	if (poll) clearInterval(poll)
	poll = null
}
onBeforeUnmount(stop)

// The first search runs as the dialog opens, from what the skill says people should be able to do.
const search = async () => {
	stop()
	error.value = null
	pages.value = []
	picked.value = new Set()
	searching.value = true
	try {
		const goal = await ensureGoal()
		const started = (await call('lms.lms.ai.api.find_material_for', {
			goal,
			query: query.value.trim(),
		})) as { session: string; query: string }
		query.value = started.query
		const gaveUpAt = Date.now() + SEARCH_LIMIT_MS
		poll = setInterval(async () => {
			if (Date.now() > gaveUpAt) {
				stop()
				searching.value = false
				error.value = __('The search is taking too long. Try again.')
				return
			}
			const result = (await call('lms.lms.ai.api.found_material', {
				session: started.session,
			}).catch(() => null)) as {
				running: boolean
				pages: Page[]
				error: string | null
			} | null
			if (!result || result.running) return
			stop()
			searching.value = false
			pages.value = result.pages || []
			error.value = result.error
			// The pages that can be read start ticked, up to three, so Add works straight away.
			picked.value = new Set(
				pages.value
					.filter((page) => page.readable)
					.slice(0, 3)
					.map((page) => page.url)
			)
		}, 2500)
	} catch (err) {
		searching.value = false
		error.value = (err as Error).message
	}
}
onMounted(search)

const pick = (page: Page, on: boolean) => {
	const next = new Set(picked.value)
	if (on) next.add(page.url)
	else next.delete(page.url)
	picked.value = next
}

// Each ticked page is added the way Add a link adds one, then read in the background.
const add = async () => {
	adding.value = true
	error.value = null
	let sources: unknown[] | null = null
	try {
		const goal = await ensureGoal()
		for (const url of picked.value) {
			sources = (await call('lms.lms.ai.api.add_url', { goal, url })) as unknown[]
			pick(pages.value.find((page) => page.url === url)!, false)
		}
		emit('added', sources || [])
		emit('close')
	} catch (err) {
		// The pages added before the failure stay added and show in the panel; the rest stay ticked.
		if (sources) emit('added', sources)
		error.value = (err as Error).message
	} finally {
		adding.value = false
	}
}
</script>
