import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage"
    }
};

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeAuth() {
    await msalInstance.initialize();
    let account = msalInstance.getActiveAccount();

    if (!account) {
        const accounts = msalInstance.getAllAccounts();
        
        if (accounts.length > 0) {
            account = accounts[0];
            msalInstance.setActiveAccount(account);
            return account;
        }
    }

    // try {
    //     const result = await msalInstance.ssoSilent({
    //         scopes: ['User.Read']
    //     });

    //     msalInstance.setActiveAccount(result.account);
    //     return result.account;
    // } catch (err) {
    //     console.log('SSO Failed', err);
    //     return null;
    // }
}

let isLoggingIn = false;

export async function login() {

    if (isLoggingIn) {
        return;
    }
    isLoggingIn = true;
    try {
         const result = await msalInstance.loginPopup({
            // scopes: ['User.Read']
            scopes: ["openid", "profile"]
            // scopes: []
        });

        msalInstance.setActiveAccount(result.account);

        return result.account;
    } catch (err: any) {
        console.error('Login failed', err);
        return null;
    } finally {
        isLoggingIn = false;
    }
}

export function getCurrentUser() {
    return msalInstance.getActiveAccount();
}

export async function getAccessToken() {
    const account = msalInstance.getActiveAccount();

    if (!account) {
        throw new Error("No active account");
    }

    const result = await msalInstance.acquireTokenSilent({
        account,
        // scopes: ['User.Read']
        scopes: ["openid", "profile"]
        // scopes: []
    });

    return result.accessToken;
}

export async function logout() {
    await msalInstance.logoutPopup();
}