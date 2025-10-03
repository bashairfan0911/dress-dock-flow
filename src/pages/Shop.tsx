import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category_id: string;
  categories?: {
    name: string;
  };
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filterProductsByGender = (gender: 'all' | 'women' | 'men') => {
    if (gender === 'all') return products;
    
    return products.filter(product => {
      const categoryName = product.categories?.name.toLowerCase() || '';
      if (gender === 'women') {
        return categoryName.includes('women');
      } else {
        return categoryName.includes('men') && !categoryName.includes('women');
      }
    });
  };

  const renderProductGrid = (filteredProducts: Product[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${product.price}</p>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={product.stock === 0}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-8">
          <p className="text-center">Loading products...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">Shop Our Collection</h1>
        
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products available yet. Check back soon!</p>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="women">Women's</TabsTrigger>
              <TabsTrigger value="men">Men's</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderProductGrid(filterProductsByGender('all'))}
            </TabsContent>
            
            <TabsContent value="women">
              {filterProductsByGender('women').length === 0 ? (
                <p className="text-center text-muted-foreground">No women's products available yet.</p>
              ) : (
                renderProductGrid(filterProductsByGender('women'))
              )}
            </TabsContent>
            
            <TabsContent value="men">
              {filterProductsByGender('men').length === 0 ? (
                <p className="text-center text-muted-foreground">No men's products available yet.</p>
              ) : (
                renderProductGrid(filterProductsByGender('men'))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
