import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Cart from '@/components/Cart';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">DressShop</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/shop">
            <Button variant="ghost">Shop</Button>
          </Link>

          {user ? (
            <>
              <Link to="/orders">
                <Button variant="ghost">Orders</Button>
              </Link>
              
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="icon">
                    <Shield className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              
              <Cart />
              
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
