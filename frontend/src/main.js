import './index.css'

import { createSSRApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import dayjs from '@/utils/dayjs'
import translationPlugin from './translation'
import { usersStore } from './stores/user'
import { sessionStore } from './stores/session'
import { initSocket } from './socket'
import {
	FrappeUI,
	setConfig,
	frappeRequest,
	resourcesPlugin,
	pageMetaPlugin,
} from 'frappe-ui'

export function createApp() {
	let pinia = createPinia()
	const app = createSSRApp(App)
	setConfig('resourceFetcher', frappeRequest)

	app.use(FrappeUI)
	app.use(pinia)
	app.use(router)
	app.use(translationPlugin)
	app.use(pageMetaPlugin)
	app.provide('$dayjs', dayjs)
	app.provide('$socket', initSocket())

	const { userResource } = usersStore()
	let { isLoggedIn } = sessionStore()

	app.provide('$user', userResource)
	app.config.globalProperties.$user = userResource
	return { app }
}
