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

describe.skip('Copy HexaValue to Clipboard', () => {

    beforeEach(() => {
        cy.wrap(Cypress.automation('remote:debugger:protocol', {
            command: 'Browser.grantPermissions',
            params: {
                permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
                // make the permission tighter by allowing the current origin only
                // like "http://localhost:56978"
                origin: window.location.origin,
            },
        }))
    })

    it('should copy the last transaction hash', () => {
        cy.visit('testnet/transactions')
        cy.contains('Transactions')

        cy.get('table')
            .find('tbody tr')
            .should('have.length.at.least', 2)
            .eq(0)
            .click()

        cy.url().should('include', '/testnet/transaction/')
        cy.contains('Transaction ')

        cy.get('#transactionHash')
            .find('#shyCopyButton')
            .should('be.hidden')
            .invoke('show')
            .find('button ')
            .click()

        cy.window().its('navigator.clipboard')
            .then((clipboard) => clipboard.readText())
            .then(($txt) => {
                // cy.log($txt)
                cy.get('#transactionHashValue').should(($hash) => {
                    const hexBytes = $txt.substr(2, $txt.length - 2) // Removes 0x prefix
                    expect(hexBytes).equal(
                        $hash.text()
                            .replace(/\s/g, "")
                            .substr(0, hexBytes.length));
                });
            })
    })

})
