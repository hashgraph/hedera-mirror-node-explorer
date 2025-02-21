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

describe.skip('Mobile Menu', () => {

    const defaultNetwork = 'mainnet'

    beforeEach(() => {
        cy.viewport(700, 800)
    })

    it('should bring up mobile menu and dismiss it', () => {

        cy.visit('/')
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')
        cy.contains('Crypto Transfers')
        cy.contains('Smart Contract Calls')
        cy.contains('HCS Messages')

        cy.get('#mobile-menu-icon').click()
        cy.url().should('include', '/' + defaultNetwork + '/mobile-menu?from=MainDashboard')

        cy.contains('Dashboard')
        cy.contains('Transactions')
        cy.contains('Tokens')
        cy.contains('Topics')
        cy.contains('Contracts')
        cy.contains('Accounts')
        cy.contains('Nodes')
        cy.contains('Staking')
        cy.contains('Blocks')

        cy.get('#close-icon').click()
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')
    })

    it('should switch networks from mobile menu', () => {

        cy.visit('/mainnet/dashboard')
        cy.url().should('include', '/mainnet/dashboard')

        cy.get('#mobile-menu-icon').click()
        cy.url().should('include', '/mainnet/mobile-menu?from=MainDashboard')

        for (const n of ['PREVIEWNET', 'TESTNET', 'MAINNET']) {
            cy.get('select')
                .select(n)
                .should('have.value', n.toLowerCase())
            cy.url().should('include', '/' + n.toLowerCase() + '/dashboard')

            cy.get('#mobile-menu-icon').click()
        }
    })

    it('should navigate to top level pages', () => {

        cy.visit('/')
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')

        cy.get('#mobile-menu-icon').click()
        cy.url().should('include', '/' + defaultNetwork + '/mobile-menu?from=MainDashboard')

        for (const p of ['Transactions', 'Tokens', 'Topics', 'Contracts', 'Accounts', 'Nodes', 'Staking', 'Blocks', 'Dashboard']) {
            cy.contains(p).click()
            cy.url().should('include', '/' + defaultNetwork + '/' + p.toLowerCase())

            cy.get('#mobile-menu-icon').click()
        }
    })

})
