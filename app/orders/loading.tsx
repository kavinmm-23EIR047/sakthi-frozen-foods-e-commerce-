import FoodLoadingScreen from '@/components/FoodLoadingScreen';

export default function OrdersLoading() {
  return (
    <FoodLoadingScreen
      message="Loading Your Orders..."
      subMessage="Retrieving order status and tracking details"
    />
  );
}
