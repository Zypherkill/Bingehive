'use client';
import { ProtectedRoute } from '../../../components/ProtectedRoute';

const AnimeDetails = () => {
    return (
        <ProtectedRoute>
            <div>Anime Details page</div>
        </ProtectedRoute>
    );
}

export default AnimeDetails;
