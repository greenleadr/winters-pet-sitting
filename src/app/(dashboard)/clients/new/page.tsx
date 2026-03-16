import Header from '@/components/layout/Header';
import ClientForm from '@/components/clients/ClientForm';

export default function NewClientPage() {
  return (
    <>
      <Header title="Add Client" showBack backHref="/clients" />
      <ClientForm />
    </>
  );
}
