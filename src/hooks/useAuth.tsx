import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setToken(token);
      const user = JSON.parse(userData);
      setUser(user);
      setIsAdmin(user.role === 'admin');
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { user: newUser, token: newToken } = await AuthService.register(email, password, name);
      setUser(newUser);
      setToken(newToken);
      setIsAdmin(newUser.role === 'admin');
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user_data', JSON.stringify(newUser));
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to sign up',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser, token: newToken } = await AuthService.login(email, password);
      setUser(authUser);
      setToken(newToken);
      setIsAdmin(authUser.role === 'admin');
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user_data', JSON.stringify(authUser));
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to sign in',
      });
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
