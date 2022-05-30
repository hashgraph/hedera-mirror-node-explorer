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

describe('Transaction Navigation', () => {

    it('should navigate from table to transaction details', () => {
        cy.visit('#/testnet/transactions/')
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
                cy.url().should('include', '/testnet/transaction/' + normalizeTransactionId($id.text()))
                cy.contains('Transaction ' + $id.text())
            })
    })

    it('should filter table by transaction type', () => {
        const selectType = 'CONTRACTCALL'

        cy.visit('#/testnet/transactions/')
        cy.url().should('include', '/testnet/transactions')

        cy.get('.box')
            .find('select')
            .select(selectType)
            .then(($type) => {
                cy.wrap($type).should('have.value', selectType)
                cy.url().should('include', '/testnet/transactions?type=' + selectType.toLowerCase())
            })

        cy.get('.box')
            .find('[data-cy="playPauseButton"]')
            .click()
    })

    it('should follow links from transaction details', () => {
        const transactionId = "0.0.11495@1650446896.868427600"
        const consensusTimestamp = "1650446903.332120989"

        cy.visit('#/testnet/transaction/' + normalizeTransactionId(transactionId) + "?t=" + consensusTimestamp)
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)

        cy.get('#operatorAccount')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/account/' + $id.text())
                cy.contains('Account ' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)

        cy.get('#nodeAccount')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/account/' + $id.text())
                cy.contains('Account ' + $id.text())
            })

        cy.go('back')
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)
    })

    it('should follow schedule relationship links', () => {
        const transactionId = "0.0.11495@1650446896.868427600"
        const schedulingConsensusTimestamp = "1650446903.332120989"
        const scheduledConsensusTimestamp = "1650446904.595635000"

        cy.visit('#/testnet/transaction/' + normalizeTransactionId(transactionId) + "?t=" + schedulingConsensusTimestamp)
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', schedulingConsensusTimestamp)

        cy.get('#scheduledTransactionValue')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', normalizeTransactionId(transactionId) + "?t=" + scheduledConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })

        cy.get('#schedulingTransactionValue')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', normalizeTransactionId(transactionId) + "?t=" + schedulingConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should follow parent/child relationship links', () => {
        const transactionId = "0.0.6036@1652787852.826165451"
        const parentConsensusTimestamp = "1652787861.365127000"
        const childConsensusTimestamp = "1652787861.365127001"

        cy.visit('#/testnet/transaction/' + normalizeTransactionId(transactionId) + "?t=" + parentConsensusTimestamp)
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', parentConsensusTimestamp)

        cy.get('#childrenValue')
            .find('a')
            .should('have.length', 2)
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', normalizeTransactionId(transactionId) + "?t=" + childConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })

        cy.get('#parentTransactionValue')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', normalizeTransactionId(transactionId) + "?t=" + parentConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should handle ETHEREUMTRANSACTION type', () => {
        const transactionId = "0.0.34912635@1653499859.000000336"
        const parentConsensusTimestamp = "1653499919.290794746"
        const childConsensusTimestamp = "1653499919.290794747"
        const contractId = "0.0.34912638"

        cy.visit('#/testnet/transaction/' + normalizeTransactionId(transactionId) + "?t=" + parentConsensusTimestamp)
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', parentConsensusTimestamp)

        cy.get('#transactionTypeValue')
            .should('contain', "ETHEREUM TRANSACTION")
        cy.get('#entityIdName')
            .should('contain', "Contract ID")

        cy.get('#entityIdValue')
            .find('a')
            .should('have.length', 1)
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/contract/')
                cy.url().should('include', contractId)
                cy.contains('Contract ' + contractId)
            })
        cy.go('back')

        cy.get('#childrenValue')
            .find('a')
            .should('have.length', 1)
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', normalizeTransactionId(transactionId) + "?t=" + childConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })

        cy.get('#parentTransactionValue')
            .find('a')
            .click()
            .then(($id) => {
                // cy.log('Selected operator Id: ' + $id.text())
                cy.url().should('include', '/testnet/transaction/')
                cy.url().should('include', normalizeTransactionId(transactionId) + "?t=" + parentConsensusTimestamp)
                cy.contains('Transaction ' + transactionId)
            })
    })

    it('should detect navigation to unknown transaction ID', () => {
        const unknownID = '9.9.9@1650446896.868427600'
        cy.visit('#/testnet/transaction/' + normalizeTransactionId(unknownID))
        cy.url().should('include', '/testnet/transaction/' + normalizeTransactionId(unknownID))
        cy.contains('Transaction')

        cy.get('[id=notificationBanner]')
            .find('span')
            .contains('Transaction with ID ' + unknownID + ' was not found')
    })
})
