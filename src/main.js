import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bulma/css/bulma.css'
import './assets/css/main.css'
import { initAccessToken } from './access'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { fas } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(fas);

const app = createApp(App)

initAccessToken();

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app')
