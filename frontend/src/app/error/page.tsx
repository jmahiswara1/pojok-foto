import { Metadata } from 'next';
import NotFound from '../not-found';

export const metadata: Metadata = {
    title: 'Error | Pojok Foto',
    description: 'Page not found',
};

export default function ErrorPage() {
    return <NotFound />;
}
