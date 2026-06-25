'use client';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { PageTransition } from '@/components/PageTransition';

const Add = () => {
    return (
        <ProtectedRoute>
            <PageTransition>
                <div>Add page</div>
            </PageTransition>
        </ProtectedRoute>
    );
}

export default Add;
