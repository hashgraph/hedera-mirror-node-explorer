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

describe('Topic Navigation', () => {

    it('should navigate from topic table to topic messages', () => {
        cy.visit('testnet/topics/')
        cy.url().should('include', '/testnet/topics')
        cy.contains('Recent Topics')

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected topic Id: ' + $id.text())
                cy.url().should('include', '/testnet/topic/' + $id.text())
                cy.contains('Topic ' + $id.text())
            })
    })

    it('should navigate from transaction details to topic message table back to transaction', () => {
        const timestamp = "1673267377.484637167"
        const transactionId = "0.0.1259116@1673267363.615392477"
        const targetURL = '/mainnet/transaction/' + timestamp
        cy.visit(targetURL)
        cy.url().should('include', targetURL)
        cy.contains('Transaction ' + transactionId)

        cy.get('#entityId')
            .find('a')
            .click()
            .then(($topicId) => {
                cy.url().should('include', '/mainnet/topic/' + $topicId.text())
                cy.contains('Topic ' + $topicId.text())

                cy.get('table')
                    .find('tbody tr')
                    .should('have.length.at.least', 2)
                    .eq(0)
                    .find('td')
                    .eq(0)
                    .click()
                    .then(($seqNumber) => {
                        cy.url().should('include', '/mainnet/transaction/')
                        cy.contains('Topic ID' + $topicId.text())
                        cy.contains('Message Submitted')
                        cy.contains('Sequence Number' + $seqNumber.text())
                    })
            })
    })
})
