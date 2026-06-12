import {useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {Button} from './button';
import {login as msalLogin} from '../auth/msal';

export const LoginModal = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 15000);
        try {
            const account = await msalLogin();

            if (account && !loading) {
                setOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button variant="login" size="md" loading={loading}>
                {!loading &&
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                }
                {loading ? 'Connecting...' : 'LOGIN'}
                </Button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />

                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-90 rounded-xl border border-white/10 bg-[#0a131d] shadow-2xl p-6">

                    <div className='flex-row gap-1 mb-4'>
                        <div className="text-white text-sm font-semibold mb-4">
                            Microsoft SSO Login
                        </div>
                        <span className='text-white text-xs'>Only SISO Customers can access to this service.</span>
                    </div>
                    <Button
                        variant="login"
                        size="lg"
                        className="w-full"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? "Connecting..." : "LOGIN WITH MICROSOFT"}
                    </Button>

                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 text-white/30 hover:text-white/70">
                            ×
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
