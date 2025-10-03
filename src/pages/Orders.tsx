import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: Date;
  user: string;
  products: Array<{
    product: string;
    quantity: number;
  }>;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await OrderService.getUserOrders(user?._id);
      setOrders(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders",
      });
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">My Orders</h1>
        
        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No orders yet. Start shopping!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Order #{order._id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge>{order.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold">${order.total}</p>
                  <p className="text-sm text-muted-foreground">{order.products.length} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
