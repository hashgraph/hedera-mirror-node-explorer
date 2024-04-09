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

describe('Hedera Explorer legal notices', () => {
    it.skip('Visits the terms of use notice', () => {
        cy.visit('/')
        cy.url().should('include', '/testnet/dashboard')
        cy.get('[data-cy=termsOfUse]').click()
        cy.url().should('include', '/terms-of-use.html')
    })

    it.skip('Visits the privacy policy notice', () => {
        cy.visit('/privacy-policy.html')
        cy.url().should('include', '/privacy-policy.html')
    })
})
