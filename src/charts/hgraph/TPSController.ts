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

import {Chart} from 'chart.js/auto';
import {ChartRange, computeGranularityForRange, computeStartDateForRange,} from "@/charts/core/ChartController.ts";
import {HgraphChartController, makeGraphLabels} from "@/charts/hgraph/HgraphChartController.ts";
import {aggregateMetrics, EcosystemMetric, getTimeRange} from "@/charts/hgraph/EcosystemMetric.ts";

export class TPSController extends HgraphChartController {

    //
    // Public
    //

    public constructor() {
        super("TPS", [ChartRange.year, ChartRange.day, ChartRange.all])
    }

    //
    // ChartController
    //

    protected async makeChart(canvas: HTMLCanvasElement, period: ChartRange): Promise<Chart> {
        const query = this.makeQuery(period)
        const rawMetrics = await this.loadEcosystemMetrics(query)
        const granularity = computeGranularityForRange(period)
        const aggregatedMetrics = aggregateMetrics(rawMetrics, granularity)
        const graphLabels = makeGraphLabels(aggregatedMetrics, granularity)
        const graphDataSet = makeGraphDataSet(aggregatedMetrics) as any
        const scaleType = this.logarithmic.value ? "logarithmic" : "linear"
        return  new Chart(canvas, {
            type: 'bar',
            data: {
                labels: graphLabels,
                datasets: [graphDataSet],
            },
            options: {
                plugins: {
                  legend: {
                      display: false
                  }
                },
                scales: {
                    y: {
                        type: scaleType,
                        beginAtZero: true
                    }
                },
                maintainAspectRatio: false
            }
        });
    }

    //
    // Private
    //

    private makeQuery(period: ChartRange): string {
        const periodStartDate = computeStartDateForRange(period)
        return "{" +
            "  all_metrics: ecosystem_metric(" +
            "    where: {" +
            "      name: {_eq: \"transactions\"}, " +
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


}



function makeGraphDataSet(metrics: EcosystemMetric[]): object {
    const totals: number[] = []
    for (const m of metrics) {
        const range = getTimeRange(m) // milliseconds
        if (range !== null) {
            totals.push(Math.round(m.total / (range / 1000)))
        }
    }
    return {
        label: "TPS",
        data: totals,
        borderWidth: 1
    }
}
