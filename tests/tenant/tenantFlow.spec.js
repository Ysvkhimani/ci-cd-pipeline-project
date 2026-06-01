import { test, expect } from '@playwright/test';

let page;
let tenantPage;

const timestamp = Date.now();

const extensionNumber =
    `6${timestamp.toString().slice(-5)}`;

const extensionName =
    `EXT${timestamp}`;

const email =
    `ext${timestamp}@testmail.com`;

test.describe.serial('Kaleyra Tenant Complete Flow', () => {

    test.beforeAll(async ({ browser }) => {

        page = await browser.newPage();

        console.log('Starting Tenant Flow');
    });

    test.afterAll(async () => {

        await tenantPage?.close();

        await page?.close();

        console.log('Tenant Flow Completed');
    });

    test('Admin Login', async () => {

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

        console.log('Admin Login Successful');
    });

    test('Open Tenant Module', async () => {

        await page
            .getByText('Tenant', {
                exact: true
            })
            .click();

        await page.waitForTimeout(1000);

        console.log('Tenant Module Opened');
    });

    test('Open Tenant Login', async () => {

        const popupPromise =
            page.waitForEvent('popup');

        await page
            .getByRole('row', {
                name: 'Edit Delete Login TENANT096'
            })
            .getByLabel('Login')
            .click();

        tenantPage = await popupPromise;

        await tenantPage.waitForLoadState();

        console.log('Tenant Login Opened');
    });

    test('Open Telephony Module', async () => {

        await tenantPage
            .getByRole('link', {
                name: 'radio_button_unchecked'
            })
            .click();

        await tenantPage
            .getByText('perm_identity Telephony')
            .click();

        console.log('Telephony Module Opened');
    });

    test('Open Extensions Module', async () => {

        await tenantPage
            .getByRole('link', {
                name: 'Extensions'
            })
            .click();

        console.log('Extensions Page Opened');
    });

    test('Open Add Extension Page', async () => {

        await tenantPage
            .getByRole('link', {
                name: 'Add New'
            })
            .click();

        console.log('Add Extension Page Opened');
    });

    test('Fill Basic Extension Details', async () => {

        await tenantPage
            .getByRole('textbox', {
                name: 'Extension Number *'
            })
            .fill(extensionNumber);

        await tenantPage
            .getByRole('textbox', {
                name: 'Extension Name *'
            })
            .fill(extensionName);

        await tenantPage
            .getByRole('textbox', {
                name: 'Email *'
            })
            .fill(email);

        console.log('Basic Details Filled');
    });

    test('Select Group Language Timezone', async () => {

        await tenantPage
            .getByRole('textbox', {
                name: '-- Select Group --'
            })
            .click();

        await tenantPage
            .getByRole('treeitem', {
                name: 'grp1'
            })
            .click();

        await tenantPage
            .getByRole('textbox', {
                name: '-- Select Language --'
            })
            .click();

        await tenantPage
            .getByRole('treeitem', {
                name: 'English'
            })
            .click();

        await tenantPage
            .getByRole('textbox', {
                name: '-- Select Timezone --'
            })
            .click();

        await tenantPage
            .locator('input[type="search"]')
            .nth(2)
            .fill('asia/kol');

        await tenantPage
            .getByRole('treeitem', {
                name: 'Asia/Kolkata'
            })
            .click();

        console.log('Group Language Timezone Selected');
    });

    test('Fill Call Settings', async () => {

        await tenantPage.mouse.wheel(0, 1200);

        await tenantPage
            .getByText('Call Settings')
            .click();

        await tenantPage
            .getByRole('textbox', {
                name: 'Simultaneous External Call *'
            })
            .fill('3');

        await tenantPage
            .getByRole('textbox', {
                name: 'SIP Password'
            })
            .fill('Admin@123');

        await tenantPage
            .locator(
                '#select2-callsettings-ecs_dial_out-container'
            )
            .click();

        await tenantPage
            .getByRole('treeitem', {
                name: 'Inactive'
            })
            .click();

        console.log('Call Settings Filled');
    });

    test('Create Extension', async () => {

        await tenantPage
            .getByRole('button', {
                name: 'Create'
            })
            .click();

        await tenantPage.waitForLoadState(
            'networkidle'
        );

        console.log('Extension Created');
    });

    test('Verify Extension Creation', async () => {

        await expect(
            tenantPage.getByText(extensionNumber)
        ).toBeVisible({
            timeout: 15000
        });

        console.log(
            `Extension ${extensionNumber} Created Successfully`
        );
    });

    // ====================================== 
    // search test is added at the end to ensure that the 
    // created extension is available in the search results and to 
    // avoid any stale element issues that might arise due to page reloads after creation
    

test('Search Created Extension', async () => {

    console.log(
        `Searching Extension ${extensionNumber}`
    );

    // Ensure redirect to Extension Listing Page is completed

    await tenantPage.waitForURL(
        /extension.*index/,
        {
            timeout: 30000
        }
    );

    console.log(
        'Current URL:',
        await tenantPage.url()
    );

    // Wait for Search Accordion

    const searchAccordion =
        tenantPage.locator(
            "//div[@class='collapsible-header']"
        );

   await expect(
    tenantPage.getByRole('cell', {
        name: extensionNumber,
        exact: true
    })
).toBeVisible({
    timeout: 15000
});

    await searchAccordion.scrollIntoViewIfNeeded();

    await searchAccordion.click();

    console.log(
        'Search Accordion Opened'
    );

    // Wait for Search Fields

    const extensionNumberField =
        tenantPage.getByRole(
            'textbox',
            {
                name: 'Extension Number'
            }
        );

    await expect(
        extensionNumberField
    ).toBeVisible({
        timeout: 30000
    });

    // Clear Extension Name

    const extensionNameField =
        tenantPage.getByRole(
            'textbox',
            {
                name: 'Extension Name'
            }
        );

    if (
        await extensionNameField
            .isVisible()
            .catch(() => false)
    ) {

        await extensionNameField.fill('');
    }

    // Enter Generated Extension Number

    await extensionNumberField.clear();

    await extensionNumberField.fill(
        extensionNumber
    );

    console.log(
        `Entered Extension Number: ${extensionNumber}`
    );

    // Click Search

    const searchButton =
        tenantPage.getByRole(
            'button',
            {
                name: /^Search$/
            }
        );

    await expect(
        searchButton
    ).toBeVisible({
        timeout: 30000
    });

    await searchButton.click();

    await tenantPage.waitForLoadState(
        'networkidle'
    );

    await tenantPage.waitForTimeout(
        3000
    );

    // Verify Extension Number Found

    await expect(
        tenantPage.getByRole(
            'cell',
            {
                name: extensionNumber,
                exact: true
            }
        )
    ).toBeVisible({
        timeout: 30000
    });

    console.log(
        `Extension ${extensionNumber} found successfully`
    );
});
});