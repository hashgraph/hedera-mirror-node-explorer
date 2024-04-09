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

describe('Hedera Explorer page not found', () => {

    const defaultNetwork = 'mainnet'
    const target = "No page matches the specified URL"

    beforeEach(() => {
        localStorage.removeItem("network")
        cy.visit('/')
        cy.url().should('include', '/' + defaultNetwork + '/dashboard')
    })

    //
    // last used network is undefined
    //

    it('/#/page-not-found (last used network is undefined)', () => {
        cy.visit('page-not-found')
        cy.url().should('include', '/' + defaultNetwork + '/page-not-found')
        cy.contains(target)
    })

    it('/#/testnet/page-not-found (last used network is undefined)', () => {
        cy.visit('testnet/page-not-found')
        cy.url().should('include', '/testnet/page-not-found')
        cy.contains(target)
    })

    it('/#/mainnet/page-not-found (last used network is undefined)', () => {
        cy.visit('mainnet/page-not-found')
        cy.url().should('include', '/mainnet/page-not-found')
        cy.contains(target)
    })

    //
    // last used network is testnet
    //

    it('/#/page-not-found (last used network is testnet)', () => {
        localStorage.setItem("network", "testnet")
        cy.visit('page-not-found')
        cy.url().should('include', '/' + defaultNetwork + '/page-not-found')
        cy.contains(target)
    })

    it('/#/testnet/page-not-found (last used network is testnet)', () => {
        localStorage.setItem("network", "testnet")
        cy.visit('testnet/page-not-found')
        cy.url().should('include', '/testnet/page-not-found')
        cy.contains(target)
    })

    it('/#/mainnet/page-not-found (last used network is testnet)', () => {
        localStorage.setItem("network", "testnet")
        cy.visit('mainnet/page-not-found')
        cy.url().should('include', '/mainnet/page-not-found')
        cy.contains(target)
    })

    //
    // last used network is mainnet
    //

    it('/#/page-not-found (last used network is mainnet)', () => {
        localStorage.setItem("network", "mainnet")
        cy.visit('page-not-found')
        cy.url().should('include', '/' + defaultNetwork + '/page-not-found')
        cy.contains(target)
    })

    it('/#/testnet/page-not-found (last used network is mainnet)', () => {
        localStorage.setItem("network", "mainnet")
        cy.visit('testnet/page-not-found')
        cy.url().should('include', '/testnet/page-not-found')
        cy.contains(target)
    })

    it('/#/testnet/page-not-found (last used network is mainnet)', () => {
        localStorage.setItem("network", "mainnet")
        cy.visit('mainnet/page-not-found')
        cy.url().should('include', '/mainnet/page-not-found')
        cy.contains(target)
    })

})
