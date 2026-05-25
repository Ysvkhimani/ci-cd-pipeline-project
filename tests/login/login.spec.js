const { test, expect } = require('@playwright/test');

test('Login Module Test', async ({ page }) => {

    console.log("Login module execution started");

    await page.goto('https://example.com');

    await expect(page).toHaveTitle(/Example/);

    console.log("Login module execution completed");

});