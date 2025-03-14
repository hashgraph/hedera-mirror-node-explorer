import {defineConfig} from 'cypress'

export default defineConfig({
  video: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  defaultCommandTimeout: 30000,
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    // setupNodeEvents(on, config) {
    //   return require('./tests/e2e/plugins/index.js')(on, config)
    // },
    baseUrl: 'https://localhost:5173',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js',
    experimentalRunAllSpecs: true,
  },
})
