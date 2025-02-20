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

import {HgraphChartController, makeGraphLabels} from "@/charts/hgraph/HgraphChartController.ts";
import {ChartRange, computeGranularityForRange, computeStartDateForRange} from "@/charts/core/ChartRange.ts";
import {EcosystemMetric, makeLatestQuery} from "@/charts/hgraph/EcosystemMetric.ts";
import {ChartConfiguration} from "chart.js";
import {ThemeController} from "@/components/ThemeController.ts";
import {RouteManager} from "@/utils/RouteManager.ts";

export abstract class GenericMetricController extends HgraphChartController {

    private readonly metricName: string

    //
    // Protected
    //

    protected constructor(chartTitle: string,
                       metricName: string,
                       themeController: ThemeController,
                       routeManager: RouteManager,
                       supportedRanges: ChartRange[] = []) {
        super(chartTitle, themeController, routeManager,supportedRanges)
        this.metricName = metricName
    }

    //
    // HgraphChartController
    //

    protected makeQuery(range: ChartRange): string {
        const periodStartDate = computeStartDateForRange(range)
        return "{" +
            "  all_metrics: ecosystem_metric(" +
            "    where: {" +
            "      name: {_eq: \"" + this.metricName + "\"}, " +
            "      period: {_eq: \"hour\"}," +
            "      end_date: {_gte: \"" + periodStartDate + "\"}," +
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
        return makeLatestQuery(this.metricName)
    }


}
