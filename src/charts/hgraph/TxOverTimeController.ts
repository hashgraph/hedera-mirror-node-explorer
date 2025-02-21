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

import {ThemeController} from "@/components/ThemeController.ts";
import {RouteManager} from "@/utils/RouteManager.ts";
import {HgraphChartController} from "@/charts/hgraph/HgraphChartController.ts";
import {EcosystemMetric, filterMetrics, makeLatestQuery, selectMetrics} from "@/charts/hgraph/EcosystemMetric.ts";
import {ChartRange, computeGranularityForRange} from "@/charts/core/ChartRange.ts";
import {ChartConfiguration} from "chart.js/auto";

export class TxOverTimeController extends HgraphChartController {

    //
    // Public
    //

    public constructor(themeController: ThemeController, routeManager: RouteManager) {
        super("Transactions Over Time", themeController, routeManager,
            [ChartRange.all, ChartRange.year, ChartRange.day])
    }

    //
    // HgraphChartController
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected makeQuery(range: ChartRange): string {
        // We request all rows so that transformMetrics() can perform accumulation
        return "{" +
            "  all_metrics: ecosystem_metric(" +
            "    where: {" +
            "      name: {_eq: \"transactions\"}, " +
            "      period: {_eq: \"hour\"}," +
            "    }" +
            "    order_by: {end_date: asc}" +
            "  ) {" +
            "    start_date" +
            "    end_date" +
            "    total" +
            "  }" +
            "}"
    }


    protected makeLatestQuery(): string {
        return makeLatestQuery("transactions")
    }

    //
    // ChartController
    //

    protected async transformMetrics(metrics: EcosystemMetric[], range: ChartRange): Promise<EcosystemMetric[]> {
        // metrics contains all the since collection begun

        // 1) we accumulate
        let accumulatedTotal = 0
        for (const m of metrics) {
            accumulatedTotal += m.total
            m.total = accumulatedTotal
        }

        // 2) we select according granularity
        const granularity = computeGranularityForRange(range)
        metrics = selectMetrics(metrics, granularity)

        // 3) we slice according the range
        const result = filterMetrics(metrics, range)

        return Promise.resolve(result)
    }

    protected makeChartConfig(metrics: EcosystemMetric[], range: ChartRange): ChartConfiguration {
        return this.makeBarChartConfig(metrics, range, false, "# of transactions")
    }

}
