import { redirect } from 'next/navigation';

// 🚀 Ana sayfa (/) artık doğrudan /products adresine yönlendiriyor
export default function HomePage() {
  redirect('/products');
}