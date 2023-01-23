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
        cy.visit('/testnet/dashboard')
        cy.url().should('include', '/testnet/dashboard')
    })

    it('should find the account ID', () => {
        const searchAccount = "0.0.3"
        testBody(searchAccount, '/testnet/account/' + searchAccount, 'Account ', true)

        cy.visit('testnet/account/0.0.4')
        cy.url().should('include', '/testnet/account/0.0.4')
        testBody(searchAccount, '/testnet/account/' + searchAccount, 'Account ', true)
    })

    it('should find the transaction ID', () => {
        const searchTransaction = "0.0.88@1647261503.217669000"
        const timestamp = "1647261513.856431000"
        testBody(
            searchTransaction,
            '/testnet/transaction/' + timestamp + "?tid=" + normalizeTransactionId(searchTransaction),
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
            .should('contain', 'Schedule Create')  // criteria to check
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

    it('should find the transaction by hash', () => {
        cy.visit('/mainnet/dashboard')
        const searchHash = "0xe4c9408e65d41bb0b3a417065e0cd98c1fedc98663db7c06909cb63e0236f39848d80fd006da39326800cb896898a85a"
        const timestamp = "1669194629.950871003"
        const transactionId = "0.0.19789@1669194618.004968459"
        testBody(
            transactionId,
            '/mainnet/transaction/' + timestamp + "?tid=" + normalizeTransactionId(transactionId),
            'Transaction ',
            false,
            searchHash
        )
    })

    it('should find the transaction by timestamp', () => {
        const searchTimestamp = "1669195027.532177053"
        const transactionId = "0.0.282498@1669195016.605846807"
        testBody(
            transactionId,
            '/testnet/transaction/' + searchTimestamp + "?tid=" + normalizeTransactionId(transactionId),
            'Transaction ',
            false,
            searchTimestamp
        )
    })

    it('should find the NFT ID', () => {
        const searchNFT = "0.0.30961728"
        testBody(searchNFT, '/testnet/token/' + searchNFT, 'Token ', true)

        cy.visit('testnet/token/0.0.45960942')
        cy.url().should('include', '/testnet/token/0.0.45960942')
        testBody(searchNFT, '/testnet/token/' + searchNFT, 'Token ', true)
    })

    it('should find the token ID', () => {
        const searchToken = "0.0.45960539"
        testBody(searchToken, '/testnet/token/' + searchToken, 'Token ', true)

        cy.visit('testnet/token/0.0.30960947')
        cy.url().should('include', '/testnet/token/0.0.30960947')
        testBody(searchToken, '/testnet/token/' + searchToken, 'Token ', true)
    })

    it('should find the topic ID', () => {
        const searchTopic = "0.0.45960950"
        testBody(searchTopic, '/testnet/topic/' + searchTopic, 'Messages for Topic ', true)

        cy.visit('testnet/topic/0.0.45960954')
        cy.url().should('include', '/testnet/topic/0.0.45960954')
        testBody(searchTopic, '/testnet/topic/' + searchTopic, 'Messages for Topic ', true)
    })

    it('should find the contract ID', () => {
        const searchContract = "0.0.45960092"
        testBody(searchContract, '/testnet/contract/' + searchContract, 'Contract ', true)

        cy.visit('testnet/contract/0.0.30962023')
        cy.url().should('include', '/testnet/contract/0.0.30962023')
        testBody(searchContract, '/testnet/contract/' + searchContract, 'Contract ', true)
    })

    it('should find the account by public key', () => {
        cy.visit('/testnet/dashboard')
        const searchKey = "0xe88d731ad218447874d7470b797cac989d23107b4da129441665625cd5269ab0"
        const searchAccount = "0.0.15818224"
        testBody(
            searchAccount,
            '/testnet/account/' + searchAccount,
            'Account ',
            false,
            searchKey
        )
    })

    it('should find the account by public-key-format alias', () => {
        const searchBase32Alias = "CIQAAAH4AY2OFK2FL37TSPYEQGPPUJRP4XTKWHD62HKPQX543DTOFFQ"
        const searchHexaAlias = "0x12200000fc0634e2ab455eff393f04819efa262fe5e6ab1c7ed1d4f85fbcd8e6e296"
        const searchAccount = "0.0.721838"
        cy.visit('/mainnet/dashboard')
        testBody(
            searchAccount,
            '/mainnet/account/' + searchAccount,
            'Account ',
            false,
            searchBase32Alias
        )
        cy.visit('/mainnet/dashboard')
        testBody(
            searchAccount,
            '/mainnet/account/' + searchAccount,
            'Account ',
            false,
            searchHexaAlias
        )
    })

    it('should find the account by Ethereum-format alias', () => {
        cy.visit('/testnet/dashboard')
        const searchAlias = "0x0000000000000000000000000000000000f15df0"
        const searchAccount = "0.0.15818224"
        testBody(
            searchAccount,
            '/testnet/account/' + searchAccount,
            'Account ',
            false,
            searchAlias
        )
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

