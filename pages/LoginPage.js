class LoginPage {

    constructor(page) {

        this.page = page;

        this.emailInput =
            page.locator('input[placeholder="Enter Email ID"]');

        this.passwordInput =
            page.locator('input[placeholder="Enter Password"]');

        this.signInButton =
            page.locator('button:has-text("SIGN-IN")');
    }

    async login(email, password) {

        await this.emailInput.fill(email);

        await this.passwordInput.fill(password);

        await this.signInButton.click();
    }
}

module.exports = LoginPage;