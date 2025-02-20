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


    //
    // Protected (tools for subclasses)
    //

    protected makeBarChartConfig(metrics: EcosystemMetric[], range: ChartRange,
                                 logarithmic: boolean, yLabel: string|null): ChartConfiguration {
        const granularity = computeGranularityForRange(range)
        const graphLabels = makeGraphLabels(metrics, granularity)
        const graphDataSet = this.makeGraphDataSet(metrics) as any
        const textPrimaryColor = this.themeController.getTextPrimaryColor()
        const textSecondaryColor = this.themeController.getTextSecondaryColor()
        const yScaleType = logarithmic ? "logarithmic" : "linear"

        return {
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
                    x: {
                        ticks: {
                            color: textPrimaryColor
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: yScaleType,
                        ticks: {
                            color: textPrimaryColor
                        },
                        grid: {
                            display: false
                        },
                        beginAtZero: true,
                        title: {
                            display: yLabel !== null,
                            text: yLabel ?? "",
                            color: textSecondaryColor
                        },
                    }
                },
                maintainAspectRatio: false
            }
        }
    }


    //
    // Private
    //

    protected makeGraphDataSet(metrics: EcosystemMetric[]): object {
        const totals = metrics.map((m: EcosystemMetric) => m.total)
        const graphBarColor = this.themeController.getGraphBarColor()
        return {
            label: this.chartTitle,
            data: totals,
            borderWidth: 1,
            backgroundColor: graphBarColor
        }
    }


}
