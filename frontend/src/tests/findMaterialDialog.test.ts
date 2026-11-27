import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.stubGlobal('__', (text: string, args?: unknown[]) =>
	args ? text.replace(/\{(\d+)\}/g, (_, i) => String(args[Number(i)])) : text
)

const { call } = vi.hoisted(() => ({ call: vi.fn() }))

vi.mock('frappe-ui', () => ({
	call,
	Button: {
		props: ['label', 'disabled'],
		template: `<button :disabled="disabled">{{ label }}</button>`,
	},
	Checkbox: {
		props: ['modelValue', 'disabled'],
		emits: ['update:modelValue'],
		template: `<input type="checkbox" :checked="modelValue" :disabled="disabled" @change="$emit('update:modelValue', $event.target.checked)" />`,
	},
	ErrorMessage: { props: ['message'], template: `<p v-if="message" class="error">{{ message }}</p>` },
	FormControl: {
		props: ['modelValue', 'label'],
		emits: ['update:modelValue'],
		template: `<label>{{ label }}<input class="query" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" /></label>`,
	},
}))
vi.mock('@/components/FormShell.vue', () => ({
	default: { template: `<div><slot /><footer><slot name="actions" /></footer></div>` },
}))
vi.mock('@/components/HeaderButton.vue', () => ({
	default: {
		props: ['label', 'disabled', 'loading'],
		emits: ['click'],
		template: `<button class="add" :disabled="disabled" @click="$emit('click')">{{ label }}</button>`,
	},
}))

const PAGES = [
	{ title: 'Fire safety at work', url: 'https://a.org/fire', site: 'a.org', why: 'Exits and alarms', readable: true, problem: '' },
	{ title: 'Exit routes', url: 'https://b.org/exits', site: 'b.org', why: 'How exits work', readable: true, problem: '' },
	{ title: 'Fire drills', url: 'https://c.org/drills', site: 'c.org', why: 'Running drills', readable: true, problem: '' },
	{ title: 'Evacuation plan', url: 'https://d.org/plan', site: 'd.org', why: 'A plan to adapt', readable: true, problem: '' },
	{ title: 'Training', url: 'https://e.org/course', site: 'e.org', why: '', readable: false, problem: "Needs a login, so it can't be read" },
]

async function openDialog() {
	const { default: FindMaterialDialog } = await import('@/components/Goals/FindMaterialDialog.vue')
	const wrapper = mount(FindMaterialDialog, {
		props: { goal: 'fire-safety' },
		global: { mocks: { __: (globalThis as any).__ } },
	})
	await flushPromises()
	return wrapper
}

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
	call.mockReset()
	call.mockImplementation(async (method: string, args: Record<string, string>) => {
		if (method === 'lms.lms.ai.api.find_material_for')
			return { session: 'S1', query: args.query || 'Leave calmly when the alarm sounds' }
		if (method === 'lms.lms.ai.api.found_material') return { running: false, pages: PAGES, error: null }
		if (method === 'lms.lms.ai.api.add_url') return [{ title: args.url }]
	})
})
afterEach(() => vi.useRealTimers())

describe('Find material', () => {
	it('searches as it opens, from what the skill says, and ticks the first three readable pages', async () => {
		const wrapper = await openDialog()
		expect(call).toHaveBeenCalledWith('lms.lms.ai.api.find_material_for', { goal: 'fire-safety', query: '' })
		expect((wrapper.find('input.query').element as HTMLInputElement).value).toBe(
			'Leave calmly when the alarm sounds'
		)
		vi.advanceTimersByTime(1000)
		await flushPromises()

		const boxes = wrapper.findAll('input[type="checkbox"]').map((box) => box.element as HTMLInputElement)
		expect(boxes.map((box) => box.checked)).toEqual([true, true, true, false, false])
		expect(boxes[4].disabled).toBe(true)
		expect(wrapper.text()).toContain("e.org · Needs a login, so it can't be read")
		expect(wrapper.find('button.add').text()).toBe('Add 3')
	})

	it('adds each ticked page the way Add a link does, then closes', async () => {
		const wrapper = await openDialog()
		vi.advanceTimersByTime(1000)
		await flushPromises()
		await wrapper.findAll('input[type="checkbox"]')[1].setValue(false)
		await wrapper.find('button.add').trigger('click')
		await flushPromises()

		const added = call.mock.calls.filter(([method]) => method === 'lms.lms.ai.api.add_url').map(([, args]) => args.url)
		expect(added).toEqual(['https://a.org/fire', 'https://c.org/drills'])
		expect(wrapper.emitted('added')?.[0]).toEqual([[{ title: 'https://c.org/drills' }]])
		expect(wrapper.emitted('close')).toBeTruthy()
	})

	it('keeps the pages added before a failure, and the dialog open', async () => {
		call.mockImplementation(async (method: string, args: Record<string, string>) => {
			if (method === 'lms.lms.ai.api.find_material_for') return { session: 'S1', query: 'fire' }
			if (method === 'lms.lms.ai.api.found_material') return { running: false, pages: PAGES, error: null }
			if (args.url === 'https://b.org/exits') throw new Error('We couldn’t read this page.')
			return [{ title: args.url }]
		})
		const wrapper = await openDialog()
		vi.advanceTimersByTime(1000)
		await flushPromises()
		await wrapper.find('button.add').trigger('click')
		await flushPromises()

		expect(wrapper.emitted('added')?.[0]).toEqual([[{ title: 'https://a.org/fire' }]])
		expect(wrapper.emitted('close')).toBeFalsy()
		expect(wrapper.find('.error').text()).toContain('couldn’t read')
	})
})
