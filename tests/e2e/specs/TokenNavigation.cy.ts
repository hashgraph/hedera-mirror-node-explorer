// noinspection DuplicatedCode

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

describe.skip('Token Navigation', () => {

    it('should navigate from table to token details', () => {
        cy.visit('testnet/tokens/')
        cy.url().should('include', '/testnet/tokens')

        cy.get('.box.h-box-border')
            .eq(0)
            .should('contain', 'Recent Non Fungible Tokens')
            .find('table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/testnet/token/' + $id.text())
                cy.contains('NFT Collection')
                cy.contains('Token ID:' + $id.text())
            })

        cy.go('back')

        cy.get('.box.h-box-border')
            .eq(1)
            .should('contain', 'Recent Fungible Tokens')
            .find('table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/testnet/token/' + $id.text())
                cy.contains('Fungible Token')
                cy.contains('Token ID:' + $id.text())
            })
    })

    const nftId = "0.0.1752721"
    it('should follow links from NFT details', () => {
        cy.visit('mainnet/token/' + nftId)
        cy.url().should('include', '/mainnet/token/' + nftId)
        cy.contains('NFT Collection')
        cy.contains('Token ID:' + nftId)

        cy.get('#createTransactionValue')
            cy.contains('@')
            .click()
            .then( () => {
                cy.url().should('include', '/mainnet/transaction/')
                cy.contains('Token ID' + nftId)
            })

        cy.go("back")
        cy.url().should('include', '/mainnet/token/' + nftId)

        cy.get('#nft-holder-table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(1)
            .click()
            .then(($id) => {
                cy.url().should('include', '/mainnet/token/' + nftId + '/' + $id.text())
                cy.contains('Serial #' + $id.text())
                cy.contains('NFT Collection')
                cy.contains('Owner')
                cy.contains('Created')
                cy.contains('Modified')
                cy.contains('Spender')
                cy.contains('Delegating Spender')
                cy.contains('Mint Transaction')
            })
    })

    const tokenId = "0.0.1738807"
    it('should follow links from fungible token details', () => {
        cy.visit('mainnet/token/' + tokenId)
        cy.url().should('include', '/mainnet/token/' + tokenId)
        cy.contains('Fungible Token')
        cy.contains('Token ID:' + tokenId)

        cy.get('#createTransactionValue')
        cy.contains('@')
            .click()
            .then( () => {
                cy.url().should('include', '/mainnet/transaction/')
                cy.contains('Token ID' + tokenId)
            })

        cy.go("back")
        cy.url().should('include', '/mainnet/token/' + tokenId)

        cy.get('#token-balance-table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected account Id: ' + $id.text())
                cy.url().should('include', '/mainnet/account/' + $id.text())
                cy.contains('Account ID:' + $id.text())
            })
    })

    it('should detect navigation to unknown token ID', () => {
        const unknownID = '9.9.9'
        cy.visit('testnet/token/' + unknownID)
        cy.url().should('include', '/testnet/token/' + unknownID)
        cy.contains('Token')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Token with ID ' + unknownID + ' was not found')
    })

    const tokenAddress = "0x00000000000000000000000000000000001a8837"
    it('should follow links from token details using ERC20 address', () => {
        cy.visit('mainnet/token/' + tokenAddress)
        cy.url().should('include', '/mainnet/token/' + tokenAddress)
        cy.contains('Fungible Token')
        cy.contains('Token ID:' + tokenId)

        cy.get('#token-balance-table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected account Id: ' + $id.text())
                cy.url().should('include', '/mainnet/account/' + $id.text())
                cy.contains('Account ID:' + $id.text())
            })
    })

    it('should follow call results link from token details (proxied as contract)', () => {
        const proxiedTokenId = "0.0.781589"
        cy.visit('mainnet/token/' + proxiedTokenId)
        cy.url().should('include', '/mainnet/token/' + proxiedTokenId)
        cy.contains('Fungible Token')
        cy.contains('Token ID:' + proxiedTokenId)

        cy.get('#contract-results-table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()

        cy.url().should('include', '/mainnet/transaction/')
        cy.contains('CONTRACT CALL')
        cy.contains('Token ID' + proxiedTokenId)
    })

})
