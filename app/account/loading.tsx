import FoodLoadingScreen from '@/components/FoodLoadingScreen';

export default function AccountLoading() {
  return (
    <FoodLoadingScreen
      message="Loading Account..."
      subMessage="Fetching your profile and account information"
    />
  );
}
