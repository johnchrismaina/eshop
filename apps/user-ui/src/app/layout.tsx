import Header from '../shared/widgets/header';
import '../../../../packages/theme/fonts.css';
import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'Eshop',
  description: 'Eshop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <Header />
          <main className="relative z-0">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
