import { useEffect, useState } from "react";
import { msalInstance, login as msalLogin } from "../auth/msal";

export function useAuth() {
    const [account, setAccount] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            await msalInstance.initialize();

            const accounts = msalInstance.getAllAccounts();

            if (accounts.length > 0) {
                msalInstance.setActiveAccount(accounts[0]);
                setAccount(accounts[0]);
            } else {
                setAccount(null);
            }
        };

        init();
    }, []);

    const login = async () => {
        const result = await msalLogin();
        setAccount(result);
    };

    return { account, login };
}