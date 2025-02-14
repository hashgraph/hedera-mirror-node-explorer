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
import {ChartRange, computeGranularityForRange, computeStartDateForRange} from "@/charts/core/ChartController.ts";
import {aggregateMetrics, EcosystemMetric} from "@/charts/hgraph/EcosystemMetric.ts";
import {Chart} from "chart.js/auto";

export class GenericMetricController extends HgraphChartController {

    private readonly metricName: string

    //
    // Public
    //

    public constructor(chartTitle: string, metricName: string) {
        super(chartTitle)
        this.metricName = metricName
    }

    //
    // HgraphChartController
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    protected makeChart(canvas: HTMLCanvasElement, metrics: EcosystemMetric[], range: ChartRange): Chart {
        const granularity = computeGranularityForRange(range)
        const aggregatedMetrics = aggregateMetrics(metrics, granularity)
        const graphLabels = makeGraphLabels(aggregatedMetrics, granularity)
        const graphDataSet = this.makeGraphDataSet(aggregatedMetrics) as any
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

    private makeGraphDataSet(metrics: EcosystemMetric[]): object {
        const totals = metrics.map((m: EcosystemMetric) => m.total)
        return {
            label: this.chartTitle,
            data: totals,
            borderWidth: 1
        }
    }


}
