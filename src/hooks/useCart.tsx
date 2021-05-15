import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const stockItem = await api
        .get(`stock/${productId}`)
        .then((response) => response.data.amount);

      const currentQuantity = cart.find((elem) => elem.id === productId);

      if (currentQuantity !== undefined) {
        if (currentQuantity.amount + 1 > stockItem) {
          toast.error('Quantidade solicitada fora de estoque');
        } else {
          const newCart = cart.map((item) => {
            if (item.id === productId) item.amount += 1;
            return item;
          });
          setCart(newCart);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        }
      } else {
        await api.get(`products/${productId}`).then((response) => {
          setCart([...cart, { ...response.data, amount: 1 }]);
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify([...cart, { ...response.data, amount: 1 }])
          );
        });
      }
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const currentProduct = cart.find((elem) => elem.id === productId);
      if (currentProduct === undefined)
        throw toast.error('Erro na remoção do produto');
      const newCart = cart.filter((item) => {
        if (item.id !== productId) return item;
      });
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        return;
      }
      const stockItem = await api
        .get(`stock/${productId}`)
        .then((response) => response.data.amount);

      if (amount > stockItem) {
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        const newCart = cart.map((item) => {
          if (item.id === productId) item.amount = amount;
          return item;
        });
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
