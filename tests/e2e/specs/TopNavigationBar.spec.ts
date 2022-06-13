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

describe('Top Navigation Bar', () => {

  beforeEach(() => {
    cy.visit('/')
    cy.url().should('include', '/testnet/dashboard')
  })

  it('should switch networks', () => {
    cy.contains('Crypto Transfers')
    cy.contains('Smart Contract Calls')
    cy.contains('HCS Messages')

    cy.get('select')
      .select('MAINNET')
      .should('have.value', 'mainnet')

    cy.url().should('include', '/mainnet/dashboard')
    cy.contains('Crypto Transfers')
    cy.contains('Smart Contract Calls')
    cy.contains('HCS Messages')

    cy.get('select')
      .select('TESTNET')
      .should('have.value', 'testnet')

    cy.url().should('include', '/testnet/dashboard')
    cy.contains('Crypto Transfers')
    cy.contains('Smart Contract Calls')
    cy.contains('HCS Messages')

    // TODO may not be valuable to check that PREVIEWNET does NOT exist?
    // cy.get('select')
    //     .select('PREVIEWNET')
    //     .should('have.value', 'previewnet')
  })

  it('should navigate to top level pages', () => {
    cy.contains('Transactions').click()
    cy.contains('Recent Transactions')

    cy.contains('Tokens').click()
    cy.contains('Recent Non Fungible Tokens')
    cy.contains('Recent Fungible Tokens')

    cy.contains('Topics').click()
    cy.contains('Recent Topics')

    cy.contains('Contracts').click()
    cy.contains('Recent Contracts')

    cy.contains('Accounts').click()
    cy.contains('Recent Accounts')

    cy.contains('Dashboard').click()
    cy.contains('Crypto Transfers')
    cy.contains('Smart Contract Calls')
    cy.contains('HCS Messages')
  })

  it('previewnet should NOT exist', () => {
    cy.visit('/#/previewnet/dashboard')
    cy.get('#app').should('contain', 'Page not found')
    cy.get('select').should('not.have.value', 'previewnet')
  })
})
