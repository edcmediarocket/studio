// This page is effectively / due to route groups.
// It now ensures that the AppLayout (which includes SidebarProvider) is used
// when rendering the dashboard content for the root path.
import AppLayout from "./(app)/layout";
import DashboardPage from "./(app)/page"; // This is the component from src/app/(app)/page.tsx

export default function Home() {
  return (
    <AppLayout>
      <DashboardPage />
    </AppLayout>
  );
}
