const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:8080',
        supportFile: false,
        specPattern: 'tests/e2e/**/*.cy.js',
        video: false,
        screenshotOnRunFailure: true
    }
});
