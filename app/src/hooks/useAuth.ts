import { useEffect, useState } from "react";
import { msalInstance } from "../auth/msal";

export function useAuth() {
    const [account, setAccount] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            await msalInstance.initialize();

            const accounts = msalInstance.getAllAccounts();

            if (accounts.length > 0) {
                msalInstance.setActiveAccount(accounts[0]);
                setAccount(accounts[0]);
                return;
            }
            setAccount(null);
        }
        init();
    }, []);

    return {account, setAccount};
}