import ThreeCanvas from "./component/Canvas";
import { useAuth } from "./hooks/useAuth";
import { Button } from "./component/ui/button";

export default function App() {
    const { account, setAccount } = useAuth();

    return (
        <div className="w-screen h-screen bg-black text-white">
            <div className="absolute top-4 left-4 z-50 flex gap-2">
                <Button onClick={account}>Login</Button>
                <div>{account?.name || "Guest"}</div>
            </div>

            <ThreeCanvas running={true} />
        </div>
    );
}