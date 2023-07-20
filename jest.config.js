module.exports = {
// Indicates whether the coverage information should be collected while executing the test
//     collectCoverage: true,
// The directory where Jest should output its coverage files
    coverageDirectory: '<rootDir>/tests/coverage/unit',

    collectCoverageFrom: ["./src/**/*.{ts,vue}"],
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    transform: {
        '^.+\\.vue$': 'vue-jest'
    },

    transformIgnorePatterns: [
        "/node_modules/(?!(hashconnect|@bladelabs|@hashgraph/hedera-wallet-connect)/)",
    ],

    setupFilesAfterEnv: [
        "<rootDir>/tests/unit/globalSetup.js"
    ],

    logHeapUsage: true
}
