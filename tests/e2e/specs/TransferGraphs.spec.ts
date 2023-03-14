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

// https://docs.cypress.io/api/introduction/api.html

import {normalizeTransactionId} from "../../../src/utils/TransactionID";

describe('Transfer Graphs Navigation', () => {

    it('should follow links from Hbar transfer graph', () => {
        const timestamp = "1645611953.351954692"
        const transactionId = "0.0.690356@1645611941.817662784"

        const targetURL = 'mainnet/transaction/' + timestamp + "?tid=" + normalizeTransactionId(transactionId)
        cy.visit(targetURL)
        cy.url().should('include', targetURL)

        cy.get('[data-cy=hbarTransfers]')
            .find('[data-cy=sourceAccount]')
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

        cy.go('back')

        cy.get('[data-cy=hbarTransfers]')
            .find('[data-cy=destinationAccount]')
            .eq(0)
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

        cy.go('back')

        cy.get('[data-cy=hbarTransfers]')
            .find('[data-cy=destinationAccount]')
            .eq(1)
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

    })

    it('should follow links from NFT transfer graph', () => {
        const timestamp = "1645611953.351954692"
        const transactionId = "0.0.690356@1645611941.817662784"

        const targetURL = 'mainnet/transaction/' + timestamp + "?tid=" + normalizeTransactionId(transactionId)
        cy.visit(targetURL)
        cy.url().should('include', targetURL)

        cy.get('[data-cy=nftTransfers]')
            .find('[data-cy=sourceAccount]')
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

        cy.go('back')

        cy.get('[data-cy=nftTransfers]')
            .find('[data-cy=nft]')
            .then((nft) => {
                cy.wrap(nft)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/token/')
                cy.contains('Token ')
            })

        cy.go('back')

        cy.get('[data-cy=nftTransfers]')
            .find('[data-cy=destinationAccount]')
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

    })

    it('should follow links from Token transfer graph', () => {
        const timestamp = "1644275573.359523416"
        const transactionId = "0.0.196756@1644275559.734822737"

        const targetURL = 'mainnet/transaction/' + timestamp + "?tid=" + normalizeTransactionId(transactionId)
        cy.visit(targetURL)
        cy.url().should('include', targetURL)

        cy.get('[data-cy=tokenTransfers]')
            .find('[data-cy=sourceAccount]')
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

        cy.go('back')

        cy.get('[data-cy=tokenTransfers]')
            .find('[data-cy="tokenExtra"]')
            .eq(0)
            .then(($token) => {
                cy.wrap($token)
                    .find('a')
                    .click()
                    .then(($name) => {
                        cy.url().should('include', '/mainnet/token/')
                        cy.contains('Token ')
                        cy.contains($name.text())
                    })
            })

        cy.go('back')

        cy.get('[data-cy=tokenTransfers]')
            .find('[data-cy="tokenExtra"]')
            .eq(1)
            .then(($token) => {
                cy.wrap($token)
                    .find('a')
                    .click()
                    .then(($name) => {
                        cy.url().should('include', '/mainnet/token/')
                        cy.contains('Token ')
                        cy.contains($name.text())
                    })
            })

        cy.go('back')

        cy.get('[data-cy=tokenTransfers]')
            .find('[data-cy=destinationAccount]')
            .then(($account) => {
                cy.wrap($account)
                    .find('a')
                    .click()
                cy.url().should('include', '/mainnet/account/' + $account.text())
                cy.contains('Account ID:' + $account.text())
            })

    })

})
