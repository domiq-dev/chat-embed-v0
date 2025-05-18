export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: transparent;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </head>
      <body>
        <div id="__next">{children}</div>
      </body>
    </html>
  );
}
