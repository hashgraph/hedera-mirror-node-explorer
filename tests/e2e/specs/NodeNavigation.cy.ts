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

describe.skip('Node Navigation', () => {

    it('should navigate from node table to node details', () => {
        cy.visit('testnet/nodes/')
        cy.url().should('include', '/testnet/nodes')
        cy.contains('Network')
        cy.contains('Nodes')

        cy.get('table')
            .find('tbody tr')
            .should('be.visible')
            .should('have.length', 7)
            .eq(0)
            .find('td')
            .eq(0)
            .click()
            .then(($id) => {
                // cy.log('Selected node Id: ' + $id.text())
                cy.url().should('include', '/testnet/node/' + $id.text())
                cy.contains('Node ' + $id.text())
            })
    })

    it('should follow links from node to account', () => {
        const nodeId = "3"
        const nodeAccount = "0.0.6"

        cy.visit('testnet/node/' + nodeId)
        cy.url().should('include', '/testnet/node/')
        cy.contains('Node ' + nodeId)

        cy.get('#nodeAccount')
            .find('a')
            .contains(nodeAccount)
            .click()

        cy.url().should('include', '/testnet/account/' + nodeAccount)
        cy.contains('Account ID:' + nodeAccount)
        // cy.contains('Node ' + nodeId)
    })

})
