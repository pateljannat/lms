import './index.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'

import {
	FrappeUI,
	Button,
	setConfig,
	frappeRequest,
	resourcesPlugin,
} from 'frappe-ui'
import translationPlugin from './translation'

// create a pinia instance
let pinia = createPinia()

let app = createApp(App)

setConfig('resourceFetcher', frappeRequest)

app.use(FrappeUI)
app.use(pinia)
app.use(router)
app.use(resourcesPlugin)
app.use(translationPlugin)

app.component('Button', Button)
app.mount('#app')