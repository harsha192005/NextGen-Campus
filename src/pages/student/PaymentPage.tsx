import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/format';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [keyId, setKeyId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const { data } = await api.get(`/payments/${id}`);
        setPayment(data.payment);
        setKeyId(data.razorpayKeyId);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Payment not found');
      } finally {
        setLoading(false);
      }
    };
    loadPayment();
  }, [id]);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const payNow = async () => {
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      toast.error('Razorpay checkout failed to load');
      return;
    }

    const razorpay = new window.Razorpay({
      key: keyId,
      amount: payment.amount * 100,
      currency: payment.currency,
      name: 'NextGen Campus',
      description: payment.eventId?.title,
      order_id: payment.providerOrderId.startsWith('order_') ? undefined : payment.providerOrderId,
      handler: async (response: any) => {
        await api.post(`/payments/${payment._id}/success`, {
          providerPaymentId: response.razorpay_payment_id || `test_${Date.now()}`,
        });
        toast.success('Payment successful');
        navigate('/student/payment-success');
      },
      modal: {
        ondismiss: async () => {
          await api.post(`/payments/${payment._id}/failure`, { reason: 'Checkout closed' });
          toast.error('Payment cancelled');
        },
      },
    });

    razorpay.open();
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"><Card>Loading payment...</Card></div>;
  }

  if (!payment) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"><Card>Payment not found.</Card></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment</h1>
        <div className="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
          <p><strong>Event:</strong> {payment.eventId?.title}</p>
          <p><strong>Amount:</strong> {formatCurrency(payment.amount)}</p>
          <p><strong>Status:</strong> {payment.status}</p>
          <p><strong>Provider:</strong> Razorpay test mode</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={payNow} disabled={payment.status === 'paid'}>Pay Now</Button>
          <Button variant="outline" onClick={() => navigate('/student/dashboard')}>Back</Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentPage;

