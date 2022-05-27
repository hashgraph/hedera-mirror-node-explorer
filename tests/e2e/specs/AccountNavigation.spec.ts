/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

describe('Account Navigation', () => {

    it('should navigate from table to account details', () => {
        cy.visit('#/testnet/accounts/')
        cy.url().should('include', '/testnet/accounts')
        cy.contains('Recent Accounts')

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected account Id: ' + $id.text())
                cy.url().should('include', '/testnet/account/' + $id.text())
                cy.contains('Account ' + $id.text())
            })
    })

    it('should follow links from account with many tokens', () => {
        const accountId1 = "0.0.29627434"

        cy.visit('#/testnet/account/' + accountId1)
        cy.url().should('include', '/testnet/account/')
        cy.contains('Account ' + accountId1)

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/' + normalizeTransactionId($id.text()))
                cy.contains('Transaction ' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/testnet/account/')

        cy.get('#balance')
            .contains('a', "Show all token balances")
            .click()

        cy.url().should('include', 'accountbalances/' + accountId1)
        cy.contains('Token Balances for Account ' + accountId1)

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .find('span')
            .eq(0)
            .click()
            .then(($id) => {
                cy.log('Selected token Id: ' + $id.text())
                cy.url().should('include', '/testnet/token/' + $id.text())
                cy.contains('Token ' + $id.text())
            })
    })

    it('should follow links from account with few tokens', () => {
        const accountId2 = "0.0.30974874"

        cy.visit('#/testnet/account/' + accountId2)
        cy.url().should('include', '/testnet/account/')
        cy.contains('Account ' + accountId2)

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/' + normalizeTransactionId($id.text()))
                cy.contains('Transaction ' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/testnet/account/')

        cy.get('#balance')
            .find('a')
            .then(($a) => {
                cy.wrap($a)
                    .invoke('attr', 'href')
                    .should('not.be.empty')
                    .then((href) => {
                        const parts = (href as string).split('/')
                        const tokenId = parts[parts.length - 1]
                        cy.wrap($a).click()
                        cy.url().should('include', '/testnet/token/' + tokenId)
                        cy.contains('Token ' + tokenId)
                    })
            })
    })

    it('should detect navigation to unknown account ID', () => {
        const unknownID = '9.9.9'
        cy.visit('#/testnet/account/' + unknownID)
        cy.url().should('include', '/testnet/account/' + unknownID)
        cy.contains('Account')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Account with ID ' + unknownID + ' was not found')
    })
})
