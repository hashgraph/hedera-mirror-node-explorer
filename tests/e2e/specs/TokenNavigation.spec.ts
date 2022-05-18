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

describe('Token Navigation', () => {

    it('should navigate from table to token details', () => {
        cy.visit('#/testnet/tokens/')
        cy.url().should('include', '/testnet/tokens')

        cy.get('.box.h-box-border')
            .eq(0)
            .should('contain', 'Recent Non Fungible Tokens')
            .find('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/testnet/token/' + $id.text())
                cy.contains('Non Fungible Token ' + $id.text())
            })

        cy.go('back')

        cy.get('.box.h-box-border')
            .eq(1)
            .should('contain', 'Recent Fungible Tokens')
            .find('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected transaction Id: ' + $id.text())
                cy.url().should('include', '/testnet/token/' + $id.text())
                cy.contains('Fungible Token ' + $id.text())
            })
    })

    const nftId = "0.0.33957315"
    it('should follow links from NFT details', () => {
        cy.visit('#/testnet/token/' + nftId)
        cy.url().should('include', '/testnet/token/' + nftId)
        cy.contains('Non Fungible Token ' + nftId)

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(1)
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected account Id: ' + $id.text())
                cy.url().should('include', '/testnet/account/' + $id.text())
                cy.contains('Account ' + $id.text())
            })
    })

    const tokenId = "0.0.33958222"
    it('should follow links from token details', () => {
        cy.visit('#/testnet/token/' + tokenId)
        cy.url().should('include', '/testnet/token/' + tokenId)
        cy.contains('Fungible Token ' + tokenId)

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

    it('should detect navigation to unknown token ID', () => {
        const unknownID = '9.9.9'
        cy.visit('#/testnet/token/' + unknownID)
        cy.url().should('include', '/testnet/token/' + unknownID)
        cy.contains('Token')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Token with ID ' + unknownID + ' was not found')
    })
})
