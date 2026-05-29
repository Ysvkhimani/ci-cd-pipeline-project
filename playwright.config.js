import { defineConfig, devices } from '@playwright/test';

const currentDate = new Date();

const formattedDate =
  currentDate.toLocaleDateString().replace(/\//g, '-');

const formattedTime =
  currentDate.toTimeString().split(' ')[0].replace(/:/g, '-');

const reportFolderName =
  `reports/Kaleyra_Login_Report_${formattedDate}_${formattedTime}`;

export default defineConfig({

  testDir: './tests',

  fullyParallel: false,

  workers: 1,

  retries: 0,

  reporter: [

    ['list'],

    ['json', {
      outputFile: 'test-results.json'
    }],

    ['html', {
      outputFolder: reportFolderName,
      open: 'never'
    }]
  ],

  use: {

    headless: false,

    screenshot: 'only-on-failure',

    video: 'off',

    trace: 'off'
  },

  projects: [

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      },
    }

  ],
});