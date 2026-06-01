// @ts-check

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const currentDate = new Date();

const timestamp =
`${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getFullYear()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;

// Detect executed test file automatically

const testArg = process.argv.find(arg =>
    arg.includes('tests/')
);

let moduleName = 'Kaleyra_All_Modules';

if (testArg) {

    moduleName =
        path
            .basename(testArg)
            .replace('.spec.js', '')
            .replace(/[^a-zA-Z0-9]/g, '_');
}

module.exports = defineConfig({

    testDir: './tests',

    fullyParallel: false,

    workers: 1,

    retries: 0,

    timeout: 120000,

    reporter: [

        [
            'html',
            {
                outputFolder:
                    `reports/${moduleName}_${timestamp}`,

                open: 'never'
            }
        ],

        [
            'json',
            {
                outputFile:
                    'test-results.json'
            }
        ]
    ],

    use: {

        browserName: 'chromium',

        headless: process.env.CI ? true : false,

        screenshot: 'only-on-failure',

        video: 'off',

        trace: 'off',

        viewport: {
            width: 1400,
            height: 900
        },

        actionTimeout: 30000,

        navigationTimeout: 120000
    },

    projects: [
        {
            name: 'chromium',

            use: {
                ...devices['Desktop Chrome']
            }
        }
    ]
});