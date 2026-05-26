const { test, expect } = require('@playwright/test');

test('Registration Module Test', async ({ page }) => {

    console.log("Registration module started");

    await page.goto('https://example.com');

    await expect(page).toHaveTitle(/Example/);

    console.log("Registration module completed");

});