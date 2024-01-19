/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import Oruga from '@oruga-ui/oruga-next'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faForward } from "@fortawesome/free-solid-svg-icons";

import "./fonts/styreneA/1802-UFGULA.css";
import "./fonts/novamono/stylesheet.css";
import "./assets/styles/explorer-bulma.css";
import "./assets/styles/explorer-oruga.css";
import "./assets/styles/explorer.css";
import {AxiosMonitor} from "@/utils/AxiosMonitor";

library.add(faForward);
export default FontAwesomeIcon;

AxiosMonitor.instance.setTargetAxios(axios)

const app = createApp(App)
app.component("font-awesome-icon", FontAwesomeIcon)
app.use(router)
app.use(Oruga, {iconPack: 'fas'})
app.mount('#app')
