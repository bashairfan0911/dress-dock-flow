import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">My Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
