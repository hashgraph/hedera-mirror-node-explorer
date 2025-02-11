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

import {ChartController} from "@/charts/core/ChartController.ts";
import {Chart} from "chart.js/auto";
import axios from "axios";

export class HgraphChartController extends ChartController {

    //
    // ChartController
    //

    protected async makeChart(canvas: HTMLCanvasElement): Promise<Chart> {
        console.log("Making chart")
        const query = this.makeQuery()
        const rawData = await this.loadDataFromGraphQL(query) as QueryResult
        const graphLabels = this.makeGraphLabels(rawData)
        const graphDataSet = this.makeGraphDataSet(rawData) as any
        return  new Chart(canvas, {
            type: 'bar',
            data: {
                labels: graphLabels,
                datasets: [graphDataSet],
            },
            options: {
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
    // Protected (tool for subclasses)
    //

    protected async loadDataFromGraphQL(query: string): Promise<object> {
        const url = "https://mainnet.hedera.api.hgraph.dev/v1/graphql"
        const response = await axios.post<GraphQLResponse>(url, { query })
        return Promise.resolve(response.data.data)
    }

    //
    // Private
    //

    private makeQuery(): string {
        return "{\n" +
            "  all_metrics: ecosystem_metric(\n" +
            "    where: {\n" +
            "      name: {_eq: \"active_nft_accounts\"}, \n" +
            "      period: {_eq: \"month\"}, \n" +
            "      start_date: {_gte: \"2024-01-01T00:00:00\"},\n" +
            "      end_date: {_lte: \"2025-01-01T00:00:00\"}" +
            "    }\n" +
            "  ) {\n" +
            "    start_date\n" +
            "    end_date\n" +
            "    total\n" +
            "  }\n" +
            "}"
    }

    private makeGraphLabels(rawData: QueryResult): string[] {
        return rawData.all_metrics.map((record) => {
            return this.extractMonth(record.start_date) ?? "?"
        })
    }

    private makeGraphDataSet(rawData: QueryResult): object {
        const totals = rawData.all_metrics.map((record) => record.total)
        return {
            label: "Active NFT Accounts in 2024",
            data: totals,
            borderWidth: 1
        }
    }

    private parseDate(s: string): Date|null {
        let result: Date|null
        try {
            const d = Date.parse(s)
            result = isNaN(d) ? null : new Date(d)
        } catch(error) {
            console.log("error=" + error)
            result = null
        }
        return result
    }

    private extractMonth(s: string): string|null {
        const d = this.parseDate(s)
        return d?.toLocaleString('default', { month: 'long' }) ?? null
    }
}


interface GraphQLResponse {
    data: object
}

interface QueryResult {
    all_metrics: {
        start_date: string,
        end_date: string,
        total: number
    }[]
}
