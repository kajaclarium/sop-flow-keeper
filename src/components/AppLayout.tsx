import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';

/**
 * Root layout that wraps all authenticated pages.
 * Renders a persistent left sidebar alongside the routed page content.
 */
export function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}
