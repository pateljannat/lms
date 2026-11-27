import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.stubGlobal('__', (text: string) => text)

const { call } = vi.hoisted(() => ({ call: vi.fn() }))

vi.mock('frappe-ui', () => ({
	call,
	Button: {
		props: ['disabled', 'ariaLabel'],
		emits: ['click'],
		template: `<button :disabled="disabled" :aria-label="ariaLabel" @click="$emit('click')"><slot name="icon" /><slot /></button>`,
	},
	ErrorMessage: { props: ['message'], template: `<p v-if="message">{{ message }}</p>` },
	FormControl: { props: ['modelValue', 'label'], template: `<textarea :value="modelValue" />` },
	LoadingIndicator: { template: `<span />` },
	// The panel is always drawn, so the test reads it without opening a real popover.
	Popover: { template: `<div><slot name="trigger" /><div class="panel"><slot /></div></div>` },
}))

const OPTIONS = [
	{ label: 'Start with what to do', outcome: 'Report it to the Internal Committee within three months.' },
	{ label: 'Prevent as well as respond', outcome: 'Tell welcome from unwelcome behaviour and step in.' },
	{ label: 'Short and simple', outcome: 'Know what counts and where to report it.' },
]

async function openSuggestions() {
	const { default: OutcomeField } = await import('@/components/Goals/OutcomeField.vue')
	const wrapper = mount(OutcomeField, {
		props: { goal: 'posh-2026', modelValue: '', hasMaterial: true, reading: false },
		global: { mocks: { __: (globalThis as any).__ } },
	})
	await wrapper.find('button').trigger('click')
	await flushPromises()
	vi.advanceTimersByTime(2500)
	await flushPromises()
	return wrapper
}

const button = (wrapper: ReturnType<typeof mount>, name: string) =>
	wrapper.findAll('button').find((b) => b.text() === name || b.attributes('aria-label') === name)!

beforeEach(() => {
	vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
	call.mockReset()
	call.mockImplementation(async (method: string) => {
		if (method === 'lms.lms.ai.api.suggest_outcome') return 'S1'
		if (method === 'lms.lms.ai.api.outcome_state') return { running: false, options: OPTIONS, error: null }
	})
})
afterEach(() => vi.useRealTimers())

describe('Suggest from my material', () => {
	it('shows one suggestion at a time, in full', async () => {
		const wrapper = await openSuggestions()
		const panel = wrapper.find('.panel').text()
		expect(panel).toContain(OPTIONS[0].label)
		expect(panel).toContain(OPTIONS[0].outcome)
		expect(panel).not.toContain(OPTIONS[1].outcome)
		expect(button(wrapper, 'Previous suggestion').attributes('disabled')).toBeDefined()
	})

	it('moves with the arrows and the dots, and stops at the ends', async () => {
		const wrapper = await openSuggestions()
		await button(wrapper, 'Next suggestion').trigger('click')
		expect(wrapper.find('.panel').text()).toContain(OPTIONS[1].outcome)
		await button(wrapper, 'Short and simple').trigger('click')
		expect(wrapper.find('.panel').text()).toContain(OPTIONS[2].outcome)
		expect(button(wrapper, 'Next suggestion').attributes('disabled')).toBeDefined()
	})

	it('puts the suggestion on screen into the box and saves it', async () => {
		const wrapper = await openSuggestions()
		await button(wrapper, 'Next suggestion').trigger('click')
		await button(wrapper, 'Use this').trigger('click')
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([OPTIONS[1].outcome])
		expect(wrapper.emitted('save')).toBeTruthy()
	})
})
