// const { test, expect } = require('@playwright/test');

// const LoginPage = require('../../pages/LoginPage');

// const testData = require('../../utils/testData');

// test.describe.serial('Kaleyra Login Module', () => {

//     let page;
//     let loginPage;

//     test.beforeAll(async ({ browser }) => {

//         // increase timeout
//         test.setTimeout(120000);

//         page = await browser.newPage();

//         // open website
//         await page.goto(
//             testData.loginUrl,
//             {
//                 waitUntil: 'domcontentloaded',
//                 timeout: 120000
//             }
//         );

//         // wait page load
//         await page.waitForTimeout(5000);

//         loginPage = new LoginPage(page);

//         console.log("Browser launched successfully");
//     });

//     test.afterAll(async () => {

//         await page.close();

//         console.log("Browser closed");
//     });

//     test('Invalid Password Test', async () => {

//         console.log("Running Invalid Password Test");

//         await loginPage.emailInput.clear();
//         await loginPage.passwordInput.clear();

//         await loginPage.login(
//             testData.validEmail,
//             testData.invalidPassword
//         );

//         await page.waitForTimeout(3000);

//         await expect(page)
//             .toHaveURL(/login/);
//     });

//     test('Invalid Email Test', async () => {

//         console.log("Running Invalid Email Test");

//         await loginPage.emailInput.clear();
//         await loginPage.passwordInput.clear();

//         await loginPage.login(
//             testData.invalidEmail,
//             testData.validPassword
//         );

//         await page.waitForTimeout(3000);

//         await expect(page)
//             .toHaveURL(/login/);
//     });

//     test('Blank Email Validation Test', async () => {

//         console.log("Running Blank Email Test");

//         await loginPage.emailInput.clear();
//         await loginPage.passwordInput.clear();

//         await loginPage.passwordInput
//             .fill(testData.validPassword);

//         await loginPage.signInButton.click();

//         await page.waitForTimeout(3000);

//         await expect(page)
//             .toHaveURL(/login/);
//     });

//     test('Blank Password Validation Test', async () => {

//         console.log("Running Blank Password Test");

//         await loginPage.emailInput.clear();
//         await loginPage.passwordInput.clear();

//         await loginPage.emailInput
//             .fill(testData.validEmail);

//         await loginPage.signInButton.click();

//         await page.waitForTimeout(3000);

//         await expect(page)
//             .toHaveURL(/login/);
//     });

//     test('Valid Login Test', async () => {

//         console.log("Running Valid Login Test");

//         await loginPage.emailInput.clear();
//         await loginPage.passwordInput.clear();

//         await loginPage.login(
//             testData.validEmail,
//             testData.validPassword
//         );

//         await page.waitForTimeout(5000);

//         await expect(page)
//             .not.toHaveURL(/login/);
//     });

// });

const { test, expect } = require('@playwright/test');

const LoginPage = require('../../pages/LoginPage');

const testData = require('../../utils/testData');

test.describe.serial('Kaleyra Login Module', () => {

    let page;
    let loginPage;

    test.beforeAll(async ({ browser }) => {

        test.setTimeout(120000);

        page = await browser.newPage();

        await page.goto(
            testData.loginUrl,
            {
                waitUntil: 'domcontentloaded',
                timeout: 120000
            }
        );

        await page.waitForTimeout(5000);

        loginPage = new LoginPage(page);

        console.log("Browser launched successfully");
    });

    test.afterAll(async () => {

        await page.close();

        console.log("Browser closed");
    });

    // ==========================
    // Invalid Password Test
    // ==========================

    test('Invalid Password Test', async () => {

        console.log("Running Invalid Password Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.login(
            testData.validEmail,
            testData.invalidPassword
        );

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // Invalid Email Test
    // ==========================

    test('Invalid Email Test', async () => {

        console.log("Running Invalid Email Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.login(
            testData.invalidEmail,
            testData.validPassword
        );

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // Blank Email Validation
    // ==========================

    test('Blank Email Validation Test', async () => {

        console.log("Running Blank Email Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.passwordInput.fill(
            testData.validPassword
        );

        await loginPage.signInButton.click();

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // Blank Password Validation
    // ==========================

    test('Blank Password Validation Test', async () => {

        console.log("Running Blank Password Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.emailInput.fill(
            testData.validEmail
        );

        await loginPage.signInButton.click();

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // Invalid Email Format
    // ==========================

    test('Invalid Email Format Test', async () => {

        console.log("Running Invalid Email Format Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.login(
            'abc123',
            testData.validPassword
        );

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // Special Characters Test
    // ==========================

    test('Special Characters Login Test', async () => {

        console.log("Running Special Characters Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.login(
            '@@@###',
            '@@@###'
        );

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // SQL Injection Test
    // ==========================

    test('SQL Injection Test', async () => {

        console.log("Running SQL Injection Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.login(
            "' OR 1=1 --",
            "' OR 1=1 --"
        );

        await page.waitForTimeout(3000);

        await expect(page).toHaveURL(/login/);
    });

    // ==========================
    // Remember Me Checkbox Test
    // ==========================

    test('Remember Me Checkbox Test', async () => {

        console.log("Running Remember Me Test");

        const rememberCheckbox =
            page.locator('input[type="checkbox"]');

        await rememberCheckbox.check();

        await expect(rememberCheckbox)
            .toBeChecked();
    });

    // ==========================
    // Forgot Password Link Test
    // ==========================

    test('Forgot Password Link Test', async () => {

        console.log("Running Forgot Password Test");

        const forgotPassword =
            page.locator('text=Forgot Password?');

        await forgotPassword.click();

        await page.waitForTimeout(3000);

        await expect(page)
            .not.toHaveURL(/login/);

        await page.goBack();

        await page.waitForTimeout(3000);
    });

    // ==========================
    // Valid Login Test
    // ==========================

    test('Valid Login Test', async () => {

        console.log("Running Valid Login Test");

        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.login(
            testData.validEmail,
            testData.validPassword
        );

        await page.waitForTimeout(5000);

        await expect(page)
            .not.toHaveURL(/login/);
    });

});