// SPDX-License-Identifier: Apache-2.0

// https://docs.cypress.io/api/introduction/api.html

describe('Hedera Explorer legal notices', () => {

    it('Visits the terms of use notice', () => {
        cy.visit('/testnet')
        cy.url().should('include', '/testnet/dashboard')
        cy.get('[data-cy=termsOfUse]').click()
        // In dev context, core-config.termsOfUseURL parameter is not set and explorer falls to /dashboard back
        // May be we should hide termsOfUse element when parameter is not set ?
        // cy.url().should('include', '/terms-of-use.html')
        cy.url().should('include', '/testnet/dashboard')
    })

    it('Visits the privacy policy notice', () => {
        cy.visit('/privacy-policy.html')
        cy.url().should('include', '/privacy-policy.html')
    })
})
