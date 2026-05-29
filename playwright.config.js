// @ts-check

const { defineConfig, devices } = require('@playwright/test');

const currentDate = new Date();

const timestamp =
    `${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getFullYear()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;

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
                    `reports/Kaleyra_Login_Report_${timestamp}`,

                open: 'never'
            }
        ]
    ],

    use: {

        browserName: 'chromium',

        headless: process.env.CI ? true : false,

        screenshot: 'only-on-failure',

        video: 'retain-on-failure',

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