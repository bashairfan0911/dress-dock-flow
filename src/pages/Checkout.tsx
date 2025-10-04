import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { OrderService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to place an order",
      });
      navigate('/auth');
      return;
    }

    if (!shippingAddress.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a shipping address",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty cart",
        description: "Your cart is empty",
      });
      return;
    }

    setLoading(true);

    try {
      const order = await OrderService.createOrder(
        items.map(item => ({
          productId: item._id,
          quantity: item.quantity
        }))
      );

      clearCart();

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. Order ID: " + order._id.slice(0, 8),
      });

      navigate('/orders');
    } catch (error: any) {
      console.error('Error placing order:', error);

      // Show specific error message from server
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to place order. Please try again.";

      toast({
        variant: "destructive",
        title: "Order failed",
        description: errorMessage,
      });

      // If product not found, suggest clearing cart
      if (errorMessage.includes('not found')) {
        toast({
          variant: "destructive",
          title: "Stale cart data",
          description: "Some products in your cart no longer exist. Please clear your cart and add products again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container py-8 text-center">
          <h1 className="mb-4 text-3xl font-bold">Your cart is empty</h1>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your delivery address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full shipping address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order
                </Button>

                <Button
                  onClick={() => {
                    clearCart();
                    navigate('/shop');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Clear Cart & Shop Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
