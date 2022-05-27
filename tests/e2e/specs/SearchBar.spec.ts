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
        testBody(searchAccount, '/testnet/account/' + searchAccount, 'Account ' + searchAccount)
    })

    it('should find the transaction ID', () => {
        const searchTransaction = "0.0.88@1647261503.217669000"
        testBody(
            searchTransaction,
            '/testnet/transaction/' + normalizeTransactionId(searchTransaction),
            'Transaction ' + searchTransaction
        )
    })

    it('should find and list the scheduling/scheduled transactions', () => {
        const searchTransaction = "0.0.11852473@1650382121.542685062"
        testBody(
            searchTransaction,
            '/testnet/transactionsById/' + normalizeTransactionId(searchTransaction),
            'Transactions with ID ' + searchTransaction
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
            'Transactions with ID ' + searchTransaction
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

    it('should find the NFT ID', () => {
        const searchNFT = "0.0.30961728"
        testBody(searchNFT, '/testnet/token/' + searchNFT, 'Token ' + searchNFT)
    })

    it('should find the token ID', () => {
        const searchToken = "0.0.30960947"
        testBody(searchToken, '/testnet/token/' + searchToken, 'Token ' + searchToken)
    })

    it('should find the topic ID', () => {
        const searchTopic = "0.0.30961057"
        testBody(searchTopic, '/testnet/topic/' + searchTopic, 'Messages for Topic ' + searchTopic)
    })

    it('should find the contract ID', () => {
        const searchContract = "0.0.30962023"
        testBody(searchContract, '/testnet/contract/' + searchContract, 'Contract ' + searchContract)
    })

    it('should not fail with empty search string', () => {
        cy.visit('/')

        cy.get('[data-cy=searchBar]').submit()

        cy.url().should('include', '/testnet/dashboard')
        cy.get('form').get('input').should('be.enabled')
    })

    it('should bring "No result" with unknown ID', () => {
        const unknownID = "42.42.42"
        testBody(unknownID, '/testnet/search-result/' + unknownID, 'No result')
    })

})

const testBody = (searchID: string, expectedPath: string, expectedTitle: string ) => {
    cy.get('[data-cy=searchBar]').within(() => {
        cy.get('input').type(searchID)
    }).submit()

    cy.url({ timeout: 5000 }).should('include', expectedPath)
    cy.contains(expectedTitle)
}

