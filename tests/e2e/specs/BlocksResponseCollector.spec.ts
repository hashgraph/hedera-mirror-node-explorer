/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

// https://docs.cypress.io/api/table-of-contents

describe('BlocksResponseCollector', () => {

    const firstTxnInBlock = "1598572649.383706000"
    const lastTxnInBlock = "1598572646.192587000"

    it('should display block 12 for first transaction in block', () => {
        cy.visit('testnet/transaction/' + firstTxnInBlock)
        cy.url().should('include', '/testnet/transaction/' + firstTxnInBlock)

        cy.get('#blockNumberValue').contains("12")
    })

    it('should display block 12 for last transaction in block', () => {
        cy.visit('testnet/transaction/' + lastTxnInBlock)
        cy.url().should('include', '/testnet/transaction/' + lastTxnInBlock)

        cy.get('#blockNumberValue').contains("12")
    })
})
