import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

type AuthState = 'loading' | 'ok' | 'denied';

const hintedAuthenticated = () => document.getElementById('cms-app')?.dataset.authenticated === '1';

export const RequireAuth = () => {
    const hinted = hintedAuthenticated();
    const [state, setState] = useState<AuthState>(hinted ? 'ok' : 'loading');

    useEffect(() => {
        let cancelled = false;

        fetch('/manage/api/me', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
        })
            .then(async (response) => {
                if (!response.ok) {
                    return { authenticated: false };
                }
                const type = response.headers.get('content-type') ?? '';
                if (!type.includes('application/json')) {
                    return { authenticated: false };
                }
                return response.json() as Promise<{ authenticated?: boolean }>;
            })
            .then((data) => {
                if (!cancelled) {
                    setState(data.authenticated ? 'ok' : 'denied');
                }
            })
            .catch(() => {
                if (!cancelled && !hinted) {
                    setState('denied');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [hinted]);

    useEffect(() => {
        if (state === 'denied') {
            window.location.replace('/manage/login');
        }
    }, [state]);

    if (state !== 'ok') {
        return null;
    }

    return <Outlet />;
};
