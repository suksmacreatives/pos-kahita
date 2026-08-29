import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import toast, { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster
                    position="top-center"
                    zIndex={99999}
                    toastOptions={{
                        style: {
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            padding: '12px 16px',
                        },
                        success: {
                            iconTheme: { primary: '#10B981', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#EF4444', secondary: '#fff' },
                        },
                        duration: 3500,
                    }}
                />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
