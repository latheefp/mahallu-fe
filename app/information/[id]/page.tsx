import { redirect } from 'next/navigation';

interface InformationRedirectProps {
  params: { id: string };
}

export default function InformationDetailRedirect({ params }: InformationRedirectProps) {
  redirect(`/news/${params.id}`);
}
