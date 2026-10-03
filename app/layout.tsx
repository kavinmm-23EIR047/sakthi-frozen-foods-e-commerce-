import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartDrawer from '@/components/CartDrawer';
import ProductDetailModal from '@/components/ProductDetailModal';
import PushNotificationPrompt from '@/components/PushNotificationPrompt';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Manrope, Bricolage_Grotesque } from 'next/font/google';
import { SITE_URL, MAIN_SITE_URL } from '@/lib/config';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#50563D',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sakthi Frozen Foods | Buy India's Best Plant-Based Mock Meat Online",
    template: "%s | Sakthi Frozen Foods Online Store",
  },
  description:
    "Buy India's best plant-based mock meat & vegan meat online from Sakthi Frozen Foods. 100% pure vegetarian soya & wheat protein mock mutton chukka, veg chicken, mock fish fingers, vegan prawns & seekh kebabs. Express -18°C frozen cold chain doorstep delivery across Coimbatore (Peelamedu, RS Puram, Gandhipuram, Saravanampatti) and all Tamil Nadu districts.",
  keywords: [
    "buy mock meat online",
    "mock meat online ordering",
    "vegan meat online delivery Coimbatore",
    "plant based meat online shopping",
    "buy vegan meat Tamil Nadu",
    "pure vegetarian meat alternative online",
    "mock meat prices",
    "veg chicken home delivery",
    "vegan mutton chukka buy online",
    "plant based fish fingers online",
    "vegan prawns buy online",
    "frozen mock meat doorstep delivery",
    "Sakthi Frozen Foods online store",
  ],
  authors: [{ name: 'Sakthi Frozen Foods', url: SITE_URL }],
  creator: 'Sakthi Frozen Foods',
  publisher: 'Sakthi Frozen Foods',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Sakthi Frozen Foods Online Store',
    title: "Sakthi Frozen Foods | Buy Plant-Based Mock Meat Online",
    description:
      "100% Pure Vegetarian Plant-Based Meat Alternatives. Juicy Veg Mutton, Chicken, Fish & Prawns delivered frozen at -18°C across Coimbatore & Tamil Nadu.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 800,
        height: 800,
        alt: 'Sakthi Frozen Foods - Pure Vegetarian Plant-Based Mock Meat Online Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sakthi Frozen Foods | Online Store",
    description:
      "Order 100% Pure Vegetarian Plant-Based Meat Online. Cold-chain delivery at -18°C across Coimbatore & all districts.",
    images: [`${SITE_URL}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'IN-TN',
    'geo.placename': 'Coimbatore',
    'geo.position': '11.02778;76.99862',
    ICBM: '11.02778, 76.99862',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-manrope',
});
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-bricolage',
});

// Rich Structured Data (JSON-LD) for OnlineStore / FoodEstablishment / Store
const structuredDataOnlineStore = {
  '@context': 'https://schema.org',
  '@type': ['OnlineStore', 'Store', 'FoodEstablishment'],
  '@id': `${SITE_URL}/#store`,
  name: 'Sakthi Frozen Foods Online Store',
  alternateName: "Sakthi Frozen Foods D2C Store",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/logo.png`,
  description:
    "India's premier plant-based mock meat online store. 100% pure vegetarian vegan mutton, chicken, fish & prawn alternatives delivered at -18°C frozen cold chain.",
  telephone: '+918056389214',
  email: 'sakthifrozenfoods@gmail.com',
  priceRange: '₹₹',
  servesCuisine: ['Plant-Based', 'Vegan', 'Pure Vegetarian', 'Mock Meat'],
  parentOrganization: {
    '@type': 'Organization',
    '@id': `${MAIN_SITE_URL}/#organization`,
    name: 'Sakthi Frozen Foods Traders',
    url: MAIN_SITE_URL,
  },
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 1,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress:
      'Peons Colony, Kalpana Theatre, opposite Edayarpalayam - Koundampalayam Road',
    addressLocality: 'Coimbatore',
    addressRegion: 'Tamil Nadu',
    postalCode: '641030',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 11.02778,
    longitude: 76.99862,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '09:00',
      closes: '21:00',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '33',
    bestRating: '5',
    worstRating: '1',
  },
  sameAs: [
    'https://wa.me/918056389214',
    'https://maps.app.goo.gl/gqVoq24rhxrQEgvs8',
  ],
  areaServed: [
    { '@type': 'City', name: 'Coimbatore' },
    { '@type': 'City', name: 'Tirupur' },
    { '@type': 'City', name: 'Erode' },
    { '@type': 'City', name: 'Salem' },
    { '@type': 'City', name: 'Chennai' },
    { '@type': 'City', name: 'Madurai' },
    { '@type': 'City', name: 'Trichy' },
    { '@type': 'City', name: 'Ooty' },
    { '@type': 'AdministrativeArea', name: 'Tamil Nadu' },
  ],
};

const structuredDataWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sakthi Frozen Foods Online Store',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataOnlineStore) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataWebSite) }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${manrope.variable} ${bricolage.variable} font-sans antialiased min-h-screen bg-[#FBFDF2] text-[#1E201D]`}
      >
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <CartDrawer />
                <ProductDetailModal />
                <PushNotificationPrompt />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
