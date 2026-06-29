import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { RouteName } from 'ziggy-js';
import { route } from '../../vendor/tightenco/ziggy';
import { PageProps } from '@/types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.tsx`,
                import.meta.glob('./Pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            const ziggy = (page.props as unknown as PageProps).ziggy;
            /* eslint-disable */
            // @ts-expect-error
            global.route = (name: any, params: any, absolute: any) =>
                route(name, params as any, absolute, {
                    ...ziggy,
                    location: new URL(ziggy.location),
                });
            /* eslint-enable */

            return <App {...props} />;
        },
    }),
);
