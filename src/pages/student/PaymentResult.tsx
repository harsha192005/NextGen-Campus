import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PaymentResult = ({ success }: { success: boolean }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {success ? 'Payment Successful' : 'Payment Failed'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {success
            ? 'Your payment status has been updated.'
            : 'Your payment was not completed. You can retry from your dashboard.'}
        </p>
        <Button onClick={() => navigate('/student/dashboard')}>Go to Dashboard</Button>
      </Card>
    </div>
  );
};

export default PaymentResult;
