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

describe('Main Dashboard sanity check', () => {

    const defaultNetwork = 'mainnet'

    it('should include the expected high level components', () => {
        cy.visit('/')
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')

        cy.get('.market-dashboard')
            .find('[data-cy="market-dashboard-item"]')
            .should('have.length', 4)

        cy.get('.market-dashboard')
            .find('#crypto-logo')
        cy.get('.market-dashboard')
            .find('.lucide-globe-icon')
        cy.get('.market-dashboard')
            .find('.lucide-arrow-big-up-dash-icon')
        cy.get('.market-dashboard')
            .find('.lucide-coins-icon')

        cy.contains('Network')
        cy.contains('Accounts')

        cy.get('[data-cy="chart-view"]')
            .should('have.length', 3)
            .eq(0)
            .contains("Transactions Over Time")

        cy.get('[data-cy="chart-view"]')
            .eq(1)
            .contains("Network Fees")

        cy.get('[data-cy="chart-view"]')
            .eq(2)
            .contains("Active Accounts")
    })
})
