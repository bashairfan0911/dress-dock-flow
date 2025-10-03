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
  category?: string;
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
      const category = (product as any).category?.toLowerCase() || '';
      return category === gender;
    });
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    const colors = {
      men: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      women: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      unisex: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[category as keyof typeof colors] || colors.unisex}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const renderProductGrid = (filteredProducts: Product[]) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredProducts.map((product) => (
        <Card key={product._id} className="overflow-hidden">
          <div className="aspect-square overflow-hidden relative">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              {getCategoryBadge(product.category)}
            </div>
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
              <TabsTrigger value="all">
                All Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="women">
                Women's ({filterProductsByGender('women').length})
              </TabsTrigger>
              <TabsTrigger value="men">
                Men's ({filterProductsByGender('men').length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="mb-4 text-sm text-muted-foreground">
                Showing all {products.length} products
              </div>
              {renderProductGrid(filterProductsByGender('all'))}
            </TabsContent>
            
            <TabsContent value="women">
              {filterProductsByGender('women').length === 0 ? (
                <p className="text-center text-muted-foreground">No women's products available yet.</p>
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {filterProductsByGender('women').length} women's products
                  </div>
                  {renderProductGrid(filterProductsByGender('women'))}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="men">
              {filterProductsByGender('men').length === 0 ? (
                <p className="text-center text-muted-foreground">No men's products available yet.</p>
              ) : (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {filterProductsByGender('men').length} men's products
                  </div>
                  {renderProductGrid(filterProductsByGender('men'))}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  );
}
