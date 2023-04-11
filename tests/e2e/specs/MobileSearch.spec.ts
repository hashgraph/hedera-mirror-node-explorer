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

describe('Search Bar', () => {

    beforeEach( () => {
        cy.viewport(700, 800)
        cy.visit('/mainnet/dashboard')
        cy.url().should('include', '/mainnet/dashboard')
        cy.get('#mobile-search-icon').click()
        cy.url().should('include', '/mainnet/mobile-search')
    })

    it('should find the account ID', () => {
        const searchAccount = "0.0.3"
        testBody(searchAccount, '/mainnet/account/' + searchAccount, 'Account ID:', true)
    })

    it('should find the transaction ID', () => {
        const searchTransaction = "0.0.2@1627434000.000000000"
        const timestamp = "1627434006.848027000"
        testBody(
            searchTransaction,
            '/mainnet/transaction/' + timestamp,
            'Transaction '
        )
    })

    it('should find and list the scheduling/scheduled transactions', () => {
        const searchTransaction = "0.0.1407723@1674820202.780744468"
        testBody(
            searchTransaction,
            '/mainnet/transactionsById/' + normalizeTransactionId(searchTransaction),
            'Transactions with ID '
        )
        cy.get('table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length', 2)
            .eq(0)
            .find('td')
            .eq(3)
            .should('contain', 'Schedule Create')  // criteria to check
        cy.get('table')
            .find('tbody tr')
            .eq(1)
            .find('td')
            .eq(3)
            .should('contain', 'Scheduled')  // criteria to check
    })

    it('should find and list the parent/child transactions', () => {
        const searchTransaction = "0.0.445590@1674821543.265349407"
        testBody(
            searchTransaction,
            '/mainnet/transactionsById/' + normalizeTransactionId(searchTransaction),
            'Transactions with ID '
        )
        cy.get('table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length', 5)
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

    it('should find the transaction by hash', () => {
        const searchHash = "0x08e62c0531e603fa6d29930195682e937978d542bd404d490546717bb128da4ec4ed586e6d516735f24049b2c3eb7b20"
        const timestamp = "1674821555.935799283"
        const transactionId = "0.0.445590@1674821543.265349407"
        testBody(
            transactionId,
            '/mainnet/transaction/' + timestamp,
            'Transaction ',
            false,
            searchHash
        )
    })

    it('should find the transaction by timestamp', () => {
        const searchTimestamp = "1674821555.935799283"
        const transactionId = "0.0.445590@1674821543.265349407"
        testBody(
            transactionId,
            '/mainnet/transaction/' + searchTimestamp,
            'Transaction ',
            false,
            searchTimestamp
        )
    })

    it('should find the NFT ID', () => {
        const searchNFT = "0.0.1752721"
        testBody(searchNFT, '/mainnet/token/' + searchNFT, 'Token ID:', true)
    })

    it('should find the token ID', () => {
        const searchToken = "0.0.1738816"
        testBody(searchToken, '/mainnet/token/' + searchToken, 'Token ID:', true)
    })

    it('should find the topic ID', () => {
        const searchTopic = "0.0.1750326"
        testBody(searchTopic, '/mainnet/topic/' + searchTopic, 'Messages for Topic ', true)
    })

    it('should find the contract ID', () => {
        const searchContract = "0.0.1077627"
        testBody(searchContract, '/mainnet/contract/' + searchContract, 'Contract ID:', true)
    })

    it('should find the account by public key', () => {
        const searchKey = "0x02e783457e4d054db3c7850c2dc83e458a13b210fca75984bc7cfb0fae7343ff60"
        const searchAccount = "0.0.1753997"
        testBody(
            searchAccount,
            '/mainnet/account/' + searchAccount,
            'Account ID:',
            false,
            searchKey
        )
    })

    it('should find the account by public-key-format alias', () => {
        const searchBase32Alias = "CIQAAAH4AY2OFK2FL37TSPYEQGPPUJRP4XTKWHD62HKPQX543DTOFFQ"
        const searchAccount = "0.0.721838"
        testBody(
            searchAccount,
            '/mainnet/account/' + searchAccount,
            'Account ID:',
            false,
            searchBase32Alias
        )
    })

    it('should find the account by Ethereum-format alias', () => {
        const searchAlias = "0x00000000000000000000000000000000000b03ae"
        const searchAccount = "0.0.721838"
        testBody(
            searchAccount,
            '/mainnet/account/' + searchAccount,
            'Account ID:',
            false,
            searchAlias
        )
    })

    it('should not fail with empty search string', () => {
        cy.get('[data-cy=searchBar]').submit()
        cy.url().should('include', '/mobile-search')
        cy.get('form').get('input').should('be.enabled')
    })

    it('should bring "No result" with unknown ID', () => {
        const unknownID = "42.42.42"
        cy.visit('/testnet/dashboard')
        cy.get('#mobile-search-icon').click()
        testBody(unknownID, '/testnet/search-result/' + unknownID)
    })

})

const testBody = (searchID: string,
                  expectedPath: string,
                  expectedTitle: string = null,
                  expectTable = false,
                  searchString: string = null) => {
    cy.get('[data-cy=searchBar]').within(() => {
        if (searchString !== null) {
            cy.get('input').type(searchString )
        } else {
            cy.get('input').type(searchID)
        }
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

