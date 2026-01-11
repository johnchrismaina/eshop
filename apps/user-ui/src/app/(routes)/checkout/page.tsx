'use client';
import { Appearance, loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from 'apps/user-ui/src/shared/components/checkout/checkoutForm';
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Example: if you store it in localStorage
const token = localStorage.getItem('token');

type CartItem = {
  productId: string;
  quantity: number;
  shopId: string;
  sale_price: number;
  selectedOptions?: Record<string, any>;
};

const Page = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const sessionId = searchParams.get('sessionId');

  console.log('Redirecting with sessionId:', sessionId);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError('Invalid session. Please try again.');
        setLoading(false);
        return;
      }

      try {
        const res = await axiosInstance.get(
          `/order/payment-session/${sessionId}`, // ✅ goes through gateway
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { clientSecret, totalAmount, cart, coupon } = res.data;

        if (!clientSecret || totalAmount == null) {
          throw new Error('Invalid payment session data.');
        }

        setCartItems(cart);
        setCoupon(coupon);
        setClientSecret(clientSecret);
      } catch (err: any) {
        console.error('Checkout fetch error:', err);
        setError(
          'Something went wrong while preparing your payment, please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, token]);

  const appearance: Appearance = {
    theme: 'stripe',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Payment Failed
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error} <br className="hidden sm:block" /> Please go back and try
            checking out again.
          </p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-600"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    clientSecret && (
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          clientSecret={clientSecret}
          cartItems={cartItems}
          coupon={coupon}
          sessionId={sessionId!}
        />
      </Elements>
    )
  );
};

export default Page;
