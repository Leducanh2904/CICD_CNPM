// client/src/context/StoreContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import storeService from "services/store.service";

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [stores, setStores] = useState([]);        // [] thay vì null để map an toàn
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await storeService.getStores(page);

        // Chuẩn hoá mọi trường hợp có thể gặp
        let list = [];
        let total = 0;

        if (Array.isArray(res)) {
          list = res;
          total = res.length;
        } else if (res && Array.isArray(res.list)) {
          list = res.list;
          total = Number(res.total ?? res.list.length);
        } else if (res && res.data) {
          // Trường hợp service vẫn trả axios response
          const d = res.data;
          list = Array.isArray(d) ? d
               : Array.isArray(d?.data) ? d.data
               : Array.isArray(d?.stores) ? d.stores
               : [];
          total = Number(d?.total ?? list.length);
        }

        if (!ignore) {
          setStores(list);
          setTotalResults(total);
        }
      } catch (e) {
        if (!ignore) {
          console.error("fetchStores error:", e);
          setStores([]);
          setTotalResults(0);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetch();
    return () => { ignore = true; };
  }, [page]);

  return (
    <StoreContext.Provider
      value={{ stores, setStores, totalResults, isLoading, setIsLoading, page, setPage }}
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
