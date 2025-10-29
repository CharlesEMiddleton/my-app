// Layout to force dynamic rendering for this route segment in App Router
// This prevents Next.js from trying to statically generate this page during build
export const dynamic = 'force-dynamic';

export default function CreateVenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

