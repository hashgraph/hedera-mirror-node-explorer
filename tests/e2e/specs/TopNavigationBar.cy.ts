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

describe('Top Navigation Bar', () => {

    const defaultNetwork = 'mainnet'

    beforeEach(() => {
        cy.viewport(2000, 800)
        cy.visit('/')
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')
    })

    it('should switch networks', () => {
        cy.contains('Transactions Over Time')
        cy.contains('Network Fees')
        cy.contains('Active Accounts')

        cy.get('[data-cy="network-selector"]')
            .select('MAINNET')
            .should('have.value', 'mainnet')

        cy.url().should('include', '/mainnet/dashboard')
        cy.contains('Transactions Over Time')
        cy.contains('Network Fees')
        cy.contains('Active Accounts')

        cy.get('[data-cy="network-selector"]')
            .select('TESTNET')
            .should('have.value', 'testnet')

        cy.url().should('include', '/testnet/dashboard')
        cy.contains('Transactions Over Time')
        cy.contains('Network Fees')
        cy.contains('Active Accounts')

        cy.get('[data-cy="network-selector"]')
            .select('PREVIEWNET')
            .should('have.value', 'previewnet')

        cy.url().should('include', '/previewnet/dashboard')
        cy.contains('Transactions Over Time')
        cy.contains('Network Fees')
        cy.contains('Active Accounts')
    })

    it('should navigate to top level pages', () => {
        cy.contains('Transactions').click()
        cy.contains('Recent Transactions')

        cy.contains('Tokens').click()
        cy.contains('Recent NFTs')
        cy.contains('Recent Fungible Tokens')

        cy.contains('Topics').click()
        cy.contains('Recent Topics')

        cy.contains('Contracts').click()
        cy.contains('Recent Contracts')

        cy.contains('Accounts').click()
        cy.contains('Recent Accounts')

        cy.contains('Nodes').click()
        cy.contains('Network')
        cy.contains('Nodes')

        cy.contains('Staking').click()
        cy.contains('My Staking')
        cy.contains('Rewards Estimator')

        cy.contains('Blocks').click()
        cy.contains('Blocks')

        cy.contains('Dashboard').click()
        cy.contains('Transactions Over Time')
        cy.contains('Network Fees')
        cy.contains('Active Accounts')
    })

})
