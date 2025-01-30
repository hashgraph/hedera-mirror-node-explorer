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
import Root from './Root.vue'
import router, {routeManager} from './router'
import axios from 'axios'
import Oruga from '@oruga-ui/oruga-next'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faForward} from "@fortawesome/free-solid-svg-icons";

import "@/styles/explorer.css";
import {AxiosMonitor} from "@/utils/AxiosMonitor";
import {CoreConfig} from "@/config/CoreConfig";
import {NetworkConfig} from "@/config/NetworkConfig";

library.add(faForward);
export default FontAwesomeIcon;

AxiosMonitor.instance.setTargetAxios(axios)

const loadCoreConfig = async () => {
    let result: CoreConfig|unknown
    const coreConfigURL = window.location.origin + '/core-config.json'
    try {
        result = await CoreConfig.load(coreConfigURL)
    } catch(error) {
        result = error
    }
    return result
}

const loadNetworkConfig = async () => {
    let result: NetworkConfig|unknown
    const url = window.location.origin + '/networks-config.json'
    try {
        result = await NetworkConfig.load(url)
    } catch(error) {
        result = error
    }
    return result
}

const createAndMount = async () => {
    const coreConfig = await loadCoreConfig()
    const networkConfig = await loadNetworkConfig()
    if (coreConfig instanceof CoreConfig && networkConfig instanceof NetworkConfig) {
        routeManager.configure(coreConfig, networkConfig)
    }

    const cssId = 'customCss';  // you could encode the css path itself to generate id..
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/style-config.css';
    link.media = 'all';
    head.appendChild(link);

    const app = createApp(Root, {coreConfig, networkConfig})
    app.component("font-awesome-icon", FontAwesomeIcon)
    app.use(router)
    app.use(Oruga, {iconPack: 'fas'})
    app.mount('#app')
}

(async () => createAndMount())()

