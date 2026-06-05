import { Button } from "./ui/button";
import { login } from "../auth/msal";

export function LoginButton() {
    return (
        <Button onClick={() => login()}>
            Sign in with Microsoft
        </Button>
    );
}