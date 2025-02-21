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

describe.skip('AdminKeyDetails Navigation', () => {

    it('should follow link from account to admin key details and back', () => {
        const accountId = "0.0.2"

        cy.visit('mainnet/account/' + accountId)
        cy.url().should('include', '/mainnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)

        cy.get('#keyValue')
            .find('a')
            .click()

        cy.url().should('include', '/mainnet/adminKey/' + accountId)
        cy.contains('Admin Key for Account ' + accountId)

        cy.get('#accountId')
            .find('a')
            .click()

        cy.url().should('include', '/mainnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)
    })

    it('should detect navigation to unknown account ID', () => {
        const unknownID = '9.9.9'
        cy.visit('testnet/adminKey/' + unknownID)
        cy.url().should('include', '/testnet/adminKey/' + unknownID)
        cy.contains('Admin Key for Account')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Account with ID ' + unknownID + ' was not found')
    })

    it('should detect navigation to invalid account ID', () => {
        const invalidID = '9.9.9999999999'
        cy.visit('testnet/adminKey/' + invalidID)
        cy.url().should('include', '/testnet/adminKey/' + invalidID)
        cy.contains('Admin Key for Account')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Invalid account ID, address or alias: ' + invalidID)
    })
})
