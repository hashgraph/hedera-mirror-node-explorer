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


describe.skip('Main Dashboard Navigation', () => {

    const defaultNetwork = 'mainnet'

    beforeEach(() => {
        cy.visit('/')
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')
    })

    it('should navigate to Crypto Transfer transaction details', () => {
        cy.get('[data-cy=cryptoTransfers]').find('table').contains('td', '@').click()
        cy.url().should('include', '/' + defaultNetwork + '/transaction/')
        cy.contains('Transaction ')
        cy.get('#transactionTypeValue').should('have.text', 'CRYPTO TRANSFER')
    })

    it('should navigate to Smart Contract Call transaction details', () => {
        cy.get('[data-cy=smartContractCalls]').find('table').contains('td', '@').click()
        cy.url().should('include', '/' + defaultNetwork + '/transaction/')
        cy.contains('Transaction ')
        cy.get('#transactionTypeValue').should('have.text', 'CONTRACT CALL')
    })

    it('should navigate to HCS Message transaction details', () => {
        cy.get('[data-cy=hcsMessages]').find('table').contains('td', '0.0.').click()
        cy.url().should('include', '/' + defaultNetwork + '/transaction/')
        cy.contains('Transaction ')
        cy.get('#transactionTypeValue').should('have.text', 'HCS SUBMIT MESSAGE')
    })

})
