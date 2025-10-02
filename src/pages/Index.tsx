import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50">
        <div className="container text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Welcome to <span className="text-primary">DressShop</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Discover the latest fashion trends and elevate your style with our curated collection of elegant dresses.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop">
              <Button size="lg" className="gap-2">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
