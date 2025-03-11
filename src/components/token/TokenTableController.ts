// SPDX-License-Identifier: Apache-2.0

import {Token, TokensResponse} from "@/schemas/MirrorNodeSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class TokenTableController extends TableController<Token, string> {

    private readonly tokenType: Ref<string | null>

    //
    // Public
    //

    public constructor(router: Router, pageSize: Ref<number>, tokenType: Ref<string | null>,
                       pageParamName: string, keyParamName: string) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100,
            pageParamName,
            keyParamName
        );
        this.tokenType = tokenType
        this.watchAndReload([this.tokenType, this.pageSize])
    }

    //
    // TableController
    //

    public async load(tokenId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Token[] | null> {

        const params = {} as {
            limit: number
            "token.id": string | undefined
            order: string
            type: string | undefined
        }
        params.limit = limit
        if (tokenId !== null) {
            params["token.id"] = operator + ":" + tokenId
        }
        params.order = order
        if (this.tokenType.value !== null) {
            params.type = this.tokenType.value
        }
        const cb = (r: AxiosResponse<TokensResponse>): Promise<Token[] | null> => {
            return Promise.resolve(r.data.tokens ?? [])
        }
        return axios.get<TokensResponse>("api/v1/tokens", {params: params}).then(cb)
    }

    public keyFor(row: Token): string {
        return row.token_id ?? ""
    }

    public stringFromKey(key: string): string {
        return key;
    }

    public keyFromString(s: string): string | null {
        return s;
    }
}
