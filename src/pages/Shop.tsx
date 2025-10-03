import { useEffect, useState } from 'react';
import { ProductService } from '@/services/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import { ShoppingCart } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  createdAt: Date;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products",
      });
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
        <Card key={product._id} className="overflow-hidden">
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
            <Button
              className="w-full"
              disabled={product.stock === 0}
              onClick={() => addToCart({
                _id: product._id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                stock: product.stock,
              })}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
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
