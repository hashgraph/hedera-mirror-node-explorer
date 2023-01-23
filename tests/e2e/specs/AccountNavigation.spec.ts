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

describe('Account Navigation', () => {

    it('should navigate from table to account details', () => {
        cy.visit('testnet/accounts/')
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

        cy.visit('testnet/account/' + accountId1)
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
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', 'tid=' + normalizeTransactionId($id.text()))
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

        cy.visit('testnet/account/' + accountId2)
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
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', 'tid=' + normalizeTransactionId($id.text()))
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

    it ('should display account details using account ID', () => {
        const accountID = "0.0.46022656"
        cy.visit('testnet/account/' + accountID)
        cy.url().should('include', '/testnet/account/' + accountID)
        cy.contains('Account ' + accountID)
    })

    it ('should display account details using account base32 alias', () => {
        const accountID = "0.0.46022656"
        const accountAlias = "HIQQGOGHZGVM3E7KT47Z6VQYY2TTYY3USZUDJGVSRLYRUR5J72ZD6PI4"
        cy.visit('testnet/account/' + accountAlias)
        cy.url().should('include', '/testnet/account/' + accountAlias)
        cy.contains('Account ' + accountID)
    })

    it ('should display account details using account hex alias', () => {
        const accountID = "0.0.46022656"
        const accountAliasInHex = "0x3a210338c7c9aacd93ea9f3f9f5618c6a73c63749668349ab28af11a47a9feb23f3d1c"
        cy.visit('testnet/account/' + accountAliasInHex)
        cy.url().should('include', '/testnet/account/' + accountAliasInHex)
        cy.contains('Account ' + accountID)
    })

    it ('should display account details using account evm address', () => {
        const accountID = "0.0.46022656"
        const evmAddress = "0x43cb701defe8fc6ed04d7bddf949618e3c575fe1"

        cy.visit('testnet/account/' + evmAddress)
        cy.url().should('include', '/testnet/account/' + evmAddress)
        cy.contains('Account ' + accountID)

        // EIP 3091
        cy.visit('testnet/address/' + evmAddress)
        cy.url().should('include', '/testnet/account/' + evmAddress)
        cy.contains('Account ' + accountID)
    })

    it('should detect navigation to unknown account ID', () => {
        const unknownID = '9.9.9'
        cy.visit('testnet/account/' + unknownID)
        cy.url().should('include', '/testnet/account/' + unknownID)
        cy.contains('Account')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Account with ID ' + unknownID + ' was not found')
    })

    it('should follow link to associated contract and back', () => {
        const accountId = '0.0.47981544'
        cy.visit('testnet/account/' + accountId)
        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ' + accountId)
        cy.contains('a', "Show associated contract")
            .click()

        cy.url().should('include', '/testnet/contract/' + accountId)
        cy.contains('Contract ' + accountId)
        cy.contains('a', "Show associated account")
            .click()

        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ' + accountId)
    })

    it('should follow link to associated contract and back using evm address', () => {
        const accountID = "0.0.48949369"
        const evmAddress = "0x0000000000000000000000000000000002eAE879"

        cy.visit('testnet/account/' + evmAddress)
        cy.url().should('include', '/testnet/account/' + evmAddress)
        cy.contains('Account ' + accountID)
        cy.contains('a', "Show associated contract")
            .click()

        cy.url().should('include', '/testnet/contract/' + accountID)
        cy.contains('Contract ' + accountID)
        cy.contains('a', "Show associated account")
            .click()

        cy.url().should('include', '/testnet/account/' + accountID)
        cy.contains('Account ' + accountID)
    })

    it('should follow link to corresponding node and back', () => {
        const accountId = '0.0.3'
        const nodeId = '0'
        cy.visit('testnet/account/' + accountId)
        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ' + accountId)
        cy.contains('a', "Node " + nodeId)
            .click()

        cy.url().should('include', '/testnet/node/' + nodeId)
        cy.contains('Node ' + nodeId)
        cy.contains('a', accountId)
            .click()

        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ' + accountId)
    })

    it('should not show a link to associated contract', () => {
        const accountId = '0.0.47981544'
        const searchId = '0.0.3'
        cy.visit('testnet/account/' + accountId)
        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ' + accountId)
        cy.contains('a', "Show associated contract")

        cy.get('[data-cy=searchBar]').within(() => {
            cy.get('input').type(searchId)
        }).submit()

        cy.url({timeout: 5000}).should('include', '/testnet/account/' + searchId)
        cy.contains('Account ' + searchId)
        cy.contains('a', "Show associated contract").should('not.exist')
    })
})
