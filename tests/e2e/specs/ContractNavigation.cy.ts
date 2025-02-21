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

describe.skip('Contract Navigation', () => {

    it('should navigate from table to contract details', () => {
        cy.visit('testnet/contracts/')
        cy.url().should('include', '/testnet/contracts')
        cy.contains('Recent Contracts')

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected account Id: ' + $id.text())
                cy.url().should('include', '/testnet/contract/' + $id.text())
                cy.contains('Contract ID:' + $id.text())
            })
    })

    it('should follow links from contract details', () => {
        const contractId = "0.0.1186129"

        cy.visit('mainnet/contract/' + contractId)
        cy.url().should('include', '/mainnet/contract/' + contractId)
        cy.contains('Contract ID:' + contractId)

        cy.get('table').contains('td', '0x')
            .click()
        cy.url().should('include', '/mainnet/transaction/')
        cy.contains('Transaction')
        cy.contains('CONTRACT CALL')
        cy.contains(contractId)

        cy.go('back')
        cy.url().should('include', '/mainnet/contract/' + contractId)
    })

    it('should display contract details using contract ID', () => {
        const contractId = "0.0.1186129"
        cy.visit('mainnet/contract/' + contractId)
        cy.url().should('include', '/mainnet/contract/' + contractId)
        cy.contains('Contract ID:' + contractId)
    })

    it('should display contract details using contract evm address', () => {
        const contractId = "0.0.1186129"
        const evmAddress = "0x0000000000000000000000000000000000121951"

        cy.visit('mainnet/contract/' + evmAddress)
        cy.url().should('include', '/mainnet/contract/' + evmAddress)
        cy.contains('Contract ID:' + contractId)
    })

    it('should detect navigation to unknown contract ID', () => {
        const unknownID = '9.9.9'
        cy.visit('testnet/contract/' + unknownID)
        cy.url().should('include', '/testnet/contract/' + unknownID)
        cy.contains('Contract')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Contract with ID ' + unknownID + ' was not found')
    })

})
