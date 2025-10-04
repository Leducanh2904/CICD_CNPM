import { createContext, useContext, useEffect, useState } from "react";
import storeService from "services/store.service";

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    storeService.getStores(page).then((response) => {
      setStores(response.data.data || response.data); 
      setIsLoading(false);
    }).catch(() => setIsLoading(false)); 
  }, [page]);

  return (
    <StoreContext.Provider
      value={{ stores, setStores, isLoading, setIsLoading, page, setPage }}
    >
      {children}
    </StoreContext.Provider>
  );
};

const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

export { StoreContext, StoreProvider, useStore };