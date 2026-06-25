'use client';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { PageTransition } from '@/components/PageTransition';

const AnimeDetails = () => {
    return (
        <ProtectedRoute>
            <PageTransition>
            <div>Anime Details page</div>
            </PageTransition>
        </ProtectedRoute>
    );
}

export default AnimeDetails;
