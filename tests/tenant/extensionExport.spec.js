import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
const { exec } = require('child_process');

test('Export Extension And Validate CSV Data', async ({ page }) => {

    await page.goto(
        'https://adminqa.ecosmob.net:3006/login'
    );

    await page
        .getByRole('textbox', {
            name: '*Email ID'
        })
        .fill('rohini.kamble@ecosmob.com');

    await page
        .getByRole('textbox', {
            name: '*Password'
        })
        .fill('Admin@123');

    await page
        .getByRole('button', {
            name: 'Sign-in'
        })
        .click();

    await page.waitForLoadState('networkidle');

    console.log('Login Successful');

    // ====================================
    // OPEN TENANT MODULE
    // ====================================

    await page
        .getByText('Tenant', {
            exact: true
        })
        .click();

    await page.waitForLoadState('networkidle');

    // ====================================
    // OPEN SEARCH PANEL
    // ====================================

    await page
        .locator(
            "//span[@class='MuiAccordionSummary-content MuiAccordionSummary-contentGutters css-1b8uc0m']"
        )
        .click();

    // ====================================
    // SEARCH TENANT096
    // ====================================

    await page
        .locator("//input[@id='name']")
        .fill('TENANT096');

    await page
        .locator("//button[@type='submit']")
        .click();

    await page.waitForLoadState('networkidle');

    console.log('Tenant096 Found');

    // ====================================
    // OPEN TENANT LOGIN
    // ====================================

    const popupPromise =
    page.waitForEvent('popup');

await page
    .getByRole('row', {
        name: /TENANT096/
    })
    .getByTestId('ArrowCircleRightIcon')
    .click();

const tenantPage =
    await popupPromise;

    // ====================================
    // OPEN EXTENSIONS
    // ====================================

  await tenantPage.waitForLoadState('networkidle');

await tenantPage
    .getByRole('link', {
        name: 'radio_button_unchecked'
    })
    .click();

await tenantPage.waitForTimeout(2000);

await tenantPage
    .getByText('perm_identity Telephony')
    .click();

await tenantPage.waitForTimeout(5000);

// Expand Telephony menu if needed

// Expand Telephony menu if needed
await tenantPage.waitForTimeout(5000);

const extensionsMenu = tenantPage.getByRole('link', {
    name: 'Extensions'
});

await expect(extensionsMenu).toBeVisible({
    timeout: 60000
});

await extensionsMenu.click();

await tenantPage.waitForLoadState('networkidle');

console.log('Extensions Opened');

    // ====================================
    // CAPTURE FIRST EXTENSION NUMBER
    // ====================================

    const extensionNumber =
        (
            await tenantPage
                .locator('table tbody tr')
                .first()
                .locator('td')
                .nth(1)
                .textContent()
        )?.trim();

    console.log(
        `Extension Selected: ${extensionNumber}`
    );

    expect(extensionNumber)
        .not
        .toBeNull();

    // ====================================
    // EXPORT CSV
    // ====================================

    await tenantPage
        .getByRole('button', {
            name: /ACTION/i
        })
        .click();

    const downloadPromise =
        tenantPage.waitForEvent(
            'download'
        );

    await tenantPage
        .getByRole('link', {
            name: 'Export'
        })
        .click();

    const download =
        await downloadPromise;

    const fileName =
        download.suggestedFilename();

    const downloadsFolder =
        path.join(
            process.cwd(),
            'downloads'
        );

    if (
        !fs.existsSync(
            downloadsFolder
        )
    ) {

        fs.mkdirSync(
            downloadsFolder
        );
    }

    const filePath =
        path.join(
            downloadsFolder,
            fileName
        );

    await download.saveAs(
    filePath
);

console.log(
    `Downloaded File: ${fileName}`
);

// Open CSV automatically in local machine only

if (!process.env.CI) {

    exec(`xdg-open "${filePath}"`);

    console.log(
        `Opened File: ${filePath}`
    );
}

    // ====================================
    // VERIFY FILE EXISTS
    // ====================================

    expect(
        fs.existsSync(filePath)
    ).toBeTruthy();

    const stats =
        fs.statSync(filePath);

    expect(
        stats.size
    ).toBeGreaterThan(0);

    console.log(
        `File Size: ${stats.size}`
    );

    // ====================================
    // READ CSV
    // ====================================

    const csvContent =
        fs.readFileSync(
            filePath,
            'utf8'
        );

    expect(
        csvContent.length
    ).toBeGreaterThan(0);

    console.log(
        'CSV File Read Successfully'
    );

    // ====================================
    // VERIFY EXTENSION EXISTS IN CSV
    // ====================================

    expect(
        csvContent.includes(
            extensionNumber
        )
    ).toBeTruthy();

    console.log(
        `Extension ${extensionNumber} found in CSV export`
    );

    console.log(
        'Export Validation Completed Successfully'
    );
});