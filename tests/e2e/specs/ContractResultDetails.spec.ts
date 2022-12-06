// noinspection DuplicatedCode

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

describe('ContractResultDetails', () => {

    it('should display contract result of contract call transaction', () => {
        const transactionId = "0.0.47818344@1669816707.173720575"
        const consensusTimestamp = "1669816716.094396003"

        cy.visit('testnet/transaction/' + consensusTimestamp + "?tid=" + normalizeTransactionId(transactionId))
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)

        cy.get('#transactionTypeValue').should('have.text', 'CONTRACT CALL')
        cy.get('#entityIdValue').should('have.text', '0.0.48997098')
        cy.contains('Contract Result')
        cy.get('#resultValue').should('have.text', 'SUCCESS')
        cy.get('#fromValue').should('have.text', '0x0000000000000000000000000000000002d9a668(0.0.47818344)')
        cy.get('#toValue').should('have.text', '0x0000000000000000000000000000000002eba2ea(0.0.48997098)')
    })

    it('should display contract result of child (contract call) transaction', () => {
        const transactionId = "0.0.47818344@1669816707.173720575"
        const consensusTimestamp = "1669816716.094396005"

        cy.visit('testnet/transaction/' + consensusTimestamp + "?tid=" + normalizeTransactionId(transactionId))
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)

        cy.get('#transactionTypeValue').should('have.text', 'CONTRACT CALL')
        cy.get('#entityIdValue').should('have.text', 'Hedera Token Service System Contract')
        cy.contains('Contract Result')
        cy.get('#resultValue').should('have.text', 'SUCCESS')
        cy.get('#fromValue').should('have.text', '0x0000000000000000000000000000000002d9a668(0.0.47818344)')
        cy.get('#toValue').should('have.text', '0x0000000000000000000000000000000000000167(Hedera Token Service System Contract)')
    })

    it('should display contract result of child (token burn) transaction', () => {
        const transactionId = "0.0.47818344@1669816707.173720575"
        const consensusTimestamp = "1669816716.094396009"

        cy.visit('testnet/transaction/' + consensusTimestamp + "?tid=" + normalizeTransactionId(transactionId))
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)

        cy.get('#transactionTypeValue').should('have.text', 'TOKEN BURN')
        cy.get('#entityIdValue').should('have.text', '0.0.47879696')
        cy.contains('Contract Result')
        cy.get('#resultValue').should('have.text', 'SUCCESS')
        cy.get('#fromValue').should('have.text', '0x0000000000000000000000000000000002d9a668(0.0.47818344)')
        cy.get('#toValue').should('have.text', '0x0000000000000000000000000000000000000167(Hedera Token Service System Contract)')
    })

    it('should display contract result of child (crypto transfer) transaction', () => {
        const transactionId = "0.0.47818344@1669816707.173720575"
        const consensusTimestamp = "1669816716.094396011"

        cy.visit('testnet/transaction/' + consensusTimestamp + "?tid=" + normalizeTransactionId(transactionId))
        cy.url().should('include', '/testnet/transaction/')
        cy.url().should('include', normalizeTransactionId(transactionId))
        cy.url().should('include', consensusTimestamp)

        cy.get('#transactionTypeValue').should('have.text', 'CRYPTO TRANSFER')
        cy.get('#entityIdValue').should('not.exist')
        cy.contains('Contract Result')
        cy.get('#resultValue').should('have.text', 'SUCCESS')
        cy.get('#fromValue').should('have.text', '0x0000000000000000000000000000000002d9a668(0.0.47818344)')
        cy.get('#toValue').should('have.text', '0x0000000000000000000000000000000000000167(Hedera Token Service System Contract)')
    })
})
