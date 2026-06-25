'use client';
import { ProtectedRoute } from '../../components/ProtectedRoute';

const Add = () => {
    return (
        <ProtectedRoute>
            <div>Add page</div>
        </ProtectedRoute>
    );
}

export default Add;
