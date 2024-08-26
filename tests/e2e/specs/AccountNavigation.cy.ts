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

import {makeExchangeFormat} from "../TestUtils";

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
                cy.contains('Account ID:' + $id.text())
            })
    })

    it('should follow links from account with many tokens', () => {
        const accountId1 = "0.0.592746"

        cy.visit('mainnet/account/' + accountId1)
        cy.url().should('include', '/mainnet/account/')
        cy.contains('Account ID:' + accountId1)

        cy.get('#hbarAllowancesTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 1)

        cy.get('#tab-token').click()

        cy.get('#tokenAllowancesTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 1)

        cy.get('#tab-nft').click()

        cy.get('#nftAllowancesTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 1)

        cy.get('#recentTransactionsTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.contains('Transaction ' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/mainnet/account/')

        cy.get('#tab-fungible').click()
        cy.get('#fungibleTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                        cy.url().should('include', `/mainnet/token/${$id.text()}`)
                        cy.contains('Fungible Token')
                        cy.contains(`${$id.text()}`)
            })

        cy.go('back')
        cy.url().should('include', '/mainnet/account/')

        cy.get('#tab-nfts').click()

        cy.get('#nftsTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(1)
            .click()
            .then(($id) => {
                cy.url().should('include', `/mainnet/token/${$id.text()}`)
                cy.contains('Non Fungible Token')
                cy.contains(`${$id.text()}`)
            })
    })

    it.skip('should follow links from account with few tokens', () => {
        const accountId2 = "0.0.30974874"

        cy.visit('mainnet/account/' + accountId2)
        cy.url().should('include', '/mainnet/account/')
        cy.contains('Account ID:' + accountId2)

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
                cy.url().should('include', 'tid=' + makeExchangeFormat($id.text()))
                cy.contains('Transaction ' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/mainnet/account/')

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
                        cy.url().should('include', '/mainnet/token/' + tokenId)
                        cy.contains('Token ID:' + tokenId)
                    })
            })
    })

    it('should follow link to reward transaction', () => {
        const accountID = "0.0.592746"
        cy.visit('mainnet/account/' + accountID)
        cy.url().should('include', '/mainnet/account/' + accountID)
        cy.contains('Account ID:' + accountID)

        cy.get('#tab-rewards')
            .click()

        cy.get('#recentRewardsTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()

        cy.url().should('include', '/mainnet/transaction/')
        cy.contains('Transaction')
        cy.contains('0.0.800')
    })

    it('should follow link to recent created contract', () => {
        const accountID = "0.0.902"
        cy.visit('testnet/account/' + accountID)
        cy.url().should('include', '/testnet/account/' + accountID)
        cy.contains('Account ID:' + accountID)

        cy.get('#tab-contracts')
            .click()

        cy.get('#recentContractsTable')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()

        cy.url().should('include', '/testnet/contract/')
        cy.contains('Contract')
        cy.contains(accountID)
    })

    it('should display account details using account ID', () => {
        const accountID = "0.0.592746"
        cy.visit('mainnet/account/' + accountID)
        cy.url().should('include', '/mainnet/account/' + accountID)
        cy.contains('Account ID:' + accountID)
    })

    it.skip('should display account details using account base32 alias', () => {
        const accountID = "0.0.592746"
        const accountAlias = "HIQQGOGHZGVM3E7KT47Z6VQYY2TTYY3USZUDJGVSRLYRUR5J72ZD6PI4"
        cy.visit('mainnet/account/' + accountAlias)
        cy.url().should('include', '/mainnet/account/' + accountAlias)
        cy.contains('Account ID:' + accountID)
    })

    it.skip('should display account details using account hex alias', () => {
        const accountID = "0.0.46022656"
        const accountAliasInHex = "0x3a210338c7c9aacd93ea9f3f9f5618c6a73c63749668349ab28af11a47a9feb23f3d1c"
        cy.visit('testnet/account/' + accountAliasInHex)
        cy.url().should('include', '/testnet/account/' + accountAliasInHex)
        cy.contains('Account ID:' + accountID)
    })

    it('should display account details using account evm address', () => {
        const accountID = "0.0.592746"
        const evmAddress = "0x0000000000000000000000000000000000090b6a"

        cy.visit('mainnet/account/' + evmAddress)
        cy.url().should('include', '/mainnet/account/' + evmAddress)
        cy.contains('Account ID:' + accountID)

        // EIP 3091
        cy.visit('mainnet/address/' + evmAddress)
        cy.url().should('include', '/mainnet/account/' + accountID)
        cy.contains('Account ID:' + accountID)
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
        const accountId = '0.0.1744776'
        cy.visit('mainnet/account/' + accountId)
        cy.url().should('include', '/mainnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)
        cy.contains('a', "Show associated contract")
            .click()

        cy.url().should('include', '/mainnet/contract/' + accountId)
        cy.contains('Contract ID:' + accountId)
        cy.contains('a', "Show associated account")
            .click()

        cy.url().should('include', '/mainnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)
    })

    it('should follow link to associated contract and back using evm address', () => {
        const accountID = '0.0.1744776'
        const evmAddress = "0x00000000000000000000000000000000001a9f88"

        cy.visit('mainnet/account/' + evmAddress)
        cy.url().should('include', '/mainnet/account/' + evmAddress)
        cy.contains('Account ID:' + accountID)
        cy.contains('a', "Show associated contract")
            .click()

        cy.url().should('include', '/mainnet/contract/' + accountID)
        cy.contains('Contract ID:' + accountID)
        cy.contains('a', "Show associated account")
            .click()

        cy.url().should('include', '/mainnet/account/' + accountID)
        cy.contains('Account ID:' + accountID)
    })

    it('should follow link to corresponding node and back', () => {
        const accountId = '0.0.3'
        const nodeId = '0'
        cy.visit('testnet/account/' + accountId)
        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)
        cy.contains('a', nodeId + ' - Hosted by Hedera')
            .click()

        cy.url().should('include', '/testnet/node/' + nodeId)
        cy.contains('Node ' + nodeId)
        cy.contains('a', accountId)
            .click()

        cy.url().should('include', '/testnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)
    })

    it('should not show a link to associated contract', () => {
        const accountId = '0.0.1744776'
        const searchId = '0.0.3'
        cy.visit('mainnet/account/' + accountId)
        cy.url().should('include', '/mainnet/account/' + accountId)
        cy.contains('Account ID:' + accountId)
        cy.contains('a', "Show associated contract")

        cy.get('[data-cy=searchBar]').within(() => {
            cy.get('input').type(searchId)
        })
        cy.get('[data-cy=searchCompleted]')
        cy.get('[data-cy=searchBar]').submit()

        cy.url({timeout: 5000}).should('include', '/mainnet/account/' + searchId)
        cy.contains('Account ID:' + searchId)
        cy.contains('a', "Show associated contract").should('not.exist')
    })
})
