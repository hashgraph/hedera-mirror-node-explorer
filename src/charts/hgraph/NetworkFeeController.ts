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

import {GenericMetricController} from "@/charts/hgraph/GenericMetricController.ts";
import {EcosystemMetric} from "@/charts/hgraph/EcosystemMetric.ts";
import {ChartRange} from "@/charts/core/ChartController.ts";

export class NetworkFeeController extends GenericMetricController {

    //
    // Public
    //

    public constructor() {
        super("Network Fees", "network_fee", [ChartRange.year, ChartRange.all])
    }

    //
    // ChartController
    //

    protected transformMetrics(metrics: EcosystemMetric[], range: ChartRange): EcosystemMetric[] {
        const result = super.transformMetrics(metrics, range);
        for (const m of result) {
            m.total = Math.round(m.total / 10_000_000) // Convert to HBAR
        }
        return result
    }

}
