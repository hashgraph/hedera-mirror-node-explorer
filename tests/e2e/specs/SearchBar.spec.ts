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

describe('Search Bar', () => {

    beforeEach( () => {
        cy.visit('/')
        cy.url().should('include', '/testnet/dashboard')
    })

    it('should find the account ID', () => {
        const searchAccount = "0.0.3"
        testBody(searchAccount, '/testnet/account/' + searchAccount, 'Account ', true)

        cy.visit('#/testnet/account/0.0.4')
        cy.url().should('include', '/testnet/account/0.0.4')
        testBody(searchAccount, '/testnet/account/' + searchAccount, 'Account ', true)
    })

    it('should find the transaction ID', () => {
        const searchTransaction = "0.0.88@1647261503.217669000"
        testBody(
            searchTransaction,
            '/testnet/transaction/' + normalizeTransactionId(searchTransaction),
            'Transaction '
        )
    })

    it('should find and list the scheduling/scheduled transactions', () => {
        const searchTransaction = "0.0.11852473@1650382121.542685062"
        testBody(
            searchTransaction,
            '/testnet/transactionsById/' + normalizeTransactionId(searchTransaction),
            'Transactions with ID '
        )
        cy.get('table')
            .find('tbody tr')
            .should('have.length', 2)
            .eq(0)
            .find('td')
            .eq(3)
            .should('contain', 'Scheduling')  // criteria to check
        cy.get('table')
            .find('tbody tr')
            .eq(1)
            .find('td')
            .eq(3)
            .should('contain', 'Scheduled')  // criteria to check
    })

    it('should find and list the parent/child transactions', () => {
        const searchTransaction = "0.0.6036@1652787852.826165451"
        testBody(
            searchTransaction,
            '/testnet/transactionsById/' + normalizeTransactionId(searchTransaction),
            'Transactions with ID '
        )
        cy.get('table')
            .find('tbody tr')
            .should('have.length', 3)
            .eq(0)
            .find('td')
            .eq(3)
            .should('contain', 'Parent')  // criteria to check
        cy.get('table')
            .find('tbody tr')
            .eq(1)
            .find('td')
            .eq(3)
            .should('contain', 'Child')  // criteria to check
        cy.get('table')
            .find('tbody tr')
            .eq(2)
            .find('td')
            .eq(3)
            .should('contain', 'Child')  // criteria to check
    })

    //
    // To be uncommented when api/v1/transactions accepts transaction hash
    //
    // it('should find the transaction by hash', () => {
    //     const searchTransaction = "0x1dc948b993ec66c161f83d8c686b641152d5a6f49b79550db9a22dd0d44cb60cd814c50c3b8abdabb8bc3d457adbfc38"
    //     testBody(
    //         searchTransaction,
    //         '/testnet/transaction/' + searchTransaction,
    //         'Transaction '
    //     )
    // })

    it('should find the NFT ID', () => {
        const searchNFT = "0.0.30961728"
        testBody(searchNFT, '/testnet/token/' + searchNFT, 'Token ', true)

        cy.visit('#/testnet/token/0.0.45960942')
        cy.url().should('include', '/testnet/token/0.0.45960942')
        testBody(searchNFT, '/testnet/token/' + searchNFT, 'Token ', true)
    })

    it('should find the token ID', () => {
        const searchToken = "0.0.45960539"
        testBody(searchToken, '/testnet/token/' + searchToken, 'Token ', true)

        cy.visit('#/testnet/token/0.0.30960947')
        cy.url().should('include', '/testnet/token/0.0.30960947')
        testBody(searchToken, '/testnet/token/' + searchToken, 'Token ', true)
    })

    it('should find the topic ID', () => {
        const searchTopic = "0.0.45960950"
        testBody(searchTopic, '/testnet/topic/' + searchTopic, 'Messages for Topic ', true)

        cy.visit('#/testnet/topic/0.0.45960954')
        cy.url().should('include', '/testnet/topic/0.0.45960954')
        testBody(searchTopic, '/testnet/topic/' + searchTopic, 'Messages for Topic ', true)
    })

    it('should find the contract ID', () => {
        const searchContract = "0.0.45960092"
        testBody(searchContract, '/testnet/contract/' + searchContract, 'Contract ', true)

        cy.visit('#/testnet/contract/0.0.30962023')
        cy.url().should('include', '/testnet/contract/0.0.30962023')
        testBody(searchContract, '/testnet/contract/' + searchContract, 'Contract ', true)
    })

    it('should not fail with empty search string', () => {
        cy.get('[data-cy=searchBar]').submit()

        cy.url().should('include', '/testnet/dashboard')
        cy.get('form').get('input').should('be.enabled')
    })

    it('should bring "No result" with unknown ID', () => {
        const unknownID = "42.42.42"
        testBody(unknownID, '/testnet/search-result/' + unknownID)
    })

})

const testBody = (searchID: string, expectedPath: string, expectedTitle: string = null, expectTable = false) => {
    cy.get('[data-cy=searchBar]').within(() => {
        cy.get('input').type(searchID)
    }).submit()

    cy.url({timeout: 5000}).should('include', expectedPath)
    cy.contains(expectedTitle ? (expectedTitle + searchID) : 'No result')
    if (expectTable) {
        cy.get('table')
            .find('tbody tr')
            .should('have.length.gt', 1)
        cy.contains('No Data').should("not.exist")
    }
}

