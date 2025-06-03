// Force dynamic rendering using new route segment config
export const dynamic = 'force-dynamic';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {children}
    </div>
  );
}
