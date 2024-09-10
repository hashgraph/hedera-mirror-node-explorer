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

describe('Transaction Navigation', () => {

    it('should navigate from table to transaction details', () => {
        cy.visit('testnet/transactions/')
        cy.url().should('include', '/testnet/transactions')

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
                cy.contains('Transaction ' + $id.text())
            })
    })

    it('should filter table by transaction type', () => {
        const selectType = 'CONTRACTCALL'

        cy.visit('testnet/transactions/')
        cy.url().should('include', '/testnet/transactions')

        cy.get('[data-cy="select-type"]')
            .select(selectType)
            .then(($type) => {
                cy.wrap($type).should('have.value', selectType)
                cy.url().should('include', '/testnet/transactions?type=' + selectType.toLowerCase())
            })

        cy.get('.box')
            .find('[data-cy="pauseButton"]')
            .click()

        cy.get('.box')
            .find('[data-cy="playButton"]')
            .click()
    })

    it('should follow links from transaction details', () => {
        const consensusTimestamp = "1674761227.924091003"

        cy.visit('mainnet/transaction/' + consensusTimestamp)
        cy.url().should('include', '/mainnet/transaction/')
        cy.url().should('include', consensusTimestamp)

        cy.get('#operatorAccount')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/account/' + $id.text())
                cy.contains('Account ID:' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/mainnet/transaction/')
        cy.url().should('include', consensusTimestamp)

        cy.get('#nodeAccount')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/account/' + $id.text())
                cy.contains('Account ID:' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/mainnet/transaction/')
        cy.url().should('include', consensusTimestamp)
    })

    it('should follow schedule relationship links', () => {
        const transactionId = "0.0.723493@1674825784.117967020"
        const schedulingConsensusTimestamp = "1674825796.070463898"
        const scheduledConsensusTimestamp = "1674825835.244778007"

        const targetURL = 'mainnet/transaction/' + schedulingConsensusTimestamp
        cy.visit(targetURL)
        cy.url().should('include', targetURL)

        cy.get('#transactionTypeValue')
            .find('a')
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.url().should('include', scheduledConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })

        cy.get('#scheduledValue')
            .find('a')
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.url().should('include', schedulingConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should follow parent/child relationship links', () => {
        const transactionId = "0.0.1425530@1674827792.993110472"
        const parentConsensusTimestamp = "1674827805.332465003"
        const childConsensusTimestamp = "1674827805.332465004"

        cy.visit('mainnet/transaction/' + parentConsensusTimestamp)
        cy.url().should('include', '/mainnet/transaction/')
        cy.url().should('include', parentConsensusTimestamp)

        cy.get('#childTransactionsValue')
            .find('a')
            .should('have.length', 6)
            .eq(0)
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.url().should('include', childConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })

        cy.get('#parentTransactionValue')
            .find('a')
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.url().should('include', parentConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should follow link "Show all transactions with same ID"', () => {
        const timestamp = "1674505116.619586693"
        const transactionId = "0.0.995584@1674505107.270597663"

        cy.visit('mainnet/transaction/' + timestamp)
        cy.url().should('include', '/mainnet/transaction/' + timestamp)

        cy.get('#allTransactionsLink')
            .contains('Show all transactions with the same ID')
            .click()

        cy.url().should('include', '/mainnet/transactionsById/' + makeExchangeFormat(transactionId))
        cy.contains('Transactions with ID ' + transactionId)

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()

        cy.url().should('include', '/mainnet/transaction/')
        cy.contains('Transaction ' + transactionId)
    })

    it('should switch format of transaction ID', () => {
        const timestamp = "1674505116.619586693"
        const transactionId = "0.0.995584@1674505107.270597663"

        cy.visit('mainnet/transaction/' + timestamp)
        cy.url().should('include', '/mainnet/transaction/' + timestamp)

        cy.contains('Transaction ' + transactionId)

        cy.get('[data-cy="select-format"]')
            .select('dashForm')
            .then(($type) => {
                cy.wrap($type).should('have.value', 'dashForm')
                cy.contains('Transaction ' + makeExchangeFormat(transactionId))
            })

        cy.get('[data-cy="select-format"]')
            .select('atForm')
            .then(($type) => {
                cy.wrap($type).should('have.value', 'atForm')
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should handle ETHEREUMTRANSACTION type', () => {
        const transactionId = "0.0.995584@1674505107.270597663"
        const parentConsensusTimestamp = "1674505116.619586691"
        const childConsensusTimestamp = "1674505116.619586692"
        const contractId = "0.0.1718841"

        const targetURL = 'mainnet/transaction/' + parentConsensusTimestamp
        cy.visit(targetURL)
        cy.url().should('include', targetURL)

        cy.get('#transactionTypeValue')
            .should('contain', "ETHEREUM TRANSACTION")
        cy.get('#entityIdName')
            .should('contain', "Contract ID")

        cy.get('#entityIdValue')
            .find('a')
            .should('have.length', 1)
            .eq(0)
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/contract/')
                cy.url().should('include', contractId)
                cy.contains('Contract ID:' + contractId)
            })
        cy.go('back')

        cy.get('#childTransactionsValue')
            .find('a')
            .should('have.length', 4)
            .eq(0)
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.url().should('include', childConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })

        cy.get('#parentTransactionValue')
            .find('a')
            .click()
            .then(() => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/mainnet/transaction/')
                cy.url().should('include', parentConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should detect navigation to unknown transaction ID', () => {
        const unknownTimestamp = "2050446896.868427600"
        const targetURL = 'testnet/transaction/' + unknownTimestamp
        cy.visit(targetURL)
        cy.url().should('include', targetURL)
        cy.contains('Transaction')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Transaction with timestamp ' + unknownTimestamp + ' was not found')
    })

    it('should change the table page size', () => {

        cy.visit('testnet/transactions/')
        cy.url().should('include', '/testnet/transactions')

        cy.get('table')
            .find('tbody tr')
            .should('have.length', 15)

        cy.get('[data-cy="select-page-size"]')
            .select('5')
            .then(($type) => {
                cy.wrap($type).should('have.value', '5')
            })

        cy.get('table')
            .find('tbody tr')
            .should('have.length', 5)

        cy.get('[data-cy="select-page-size"]')
            .select('50')
            .then(($type) => {
                cy.wrap($type).should('have.value', '50')
            })

        cy.get('table')
            .find('tbody tr')
            .should('have.length', 50)

    })

})
