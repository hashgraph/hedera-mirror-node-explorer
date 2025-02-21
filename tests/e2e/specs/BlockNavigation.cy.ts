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

// https://docs.cypress.io/api/introduction/api.html

describe.skip('Block Navigation', () => {

    it('should navigate from block table to block details', () => {
        cy.visit('testnet/blocks/')
        cy.url().should('include', '/testnet/blocks')
        cy.contains('Blocks')

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected block number: ' + $id.text())
                cy.url().should('include', '/testnet/block/' + $id.text())
                cy.contains('Block ' + $id.text())
            })
    })

    it('should navigate from block details to previous block details', () => {
        const blockNumber = "3"
        cy.visit('testnet/block/' + blockNumber)
        cy.url().should('include', '/testnet/block/' + blockNumber)
        cy.contains('Block ' + blockNumber)

        cy.get('#prev-block-button')
            .contains('< PREV. BLOCK')
            .click()
        cy.contains('Block ' + (Number(blockNumber) - 1))

        cy.get('#next-block-button')
            .contains('NEXT BLOCK >')
            .click()
        cy.contains('Block ' + blockNumber)
    })

    it('should navigate from the list of Block Transactions to TransactionDetails and back', () => {
        const blockNumber = "3"
        cy.visit('testnet/block/' + blockNumber)
        cy.url().should('include', '/testnet/block/' + blockNumber)
        cy.contains('Block ' + blockNumber)

        cy.get('table')
            .contains('td', '@').click()
            .then(($id) => {
                // cy.log('Selected transaction ID: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.contains('Transaction ' + $id.text())
                cy.get('#blockNumberValue')
                    .contains(blockNumber)
                    .click()
                    .url().should('include', '/testnet/block/' + blockNumber)
                cy.contains('Block ' + blockNumber)
            })
    })

})
