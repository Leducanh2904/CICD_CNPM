import API from "api/axios.config";
import WithAxios from "helpers/WithAxios";
import { createContext, useContext, useEffect, useState } from "react";
import authService from "services/auth.service";
import { normalizeToken } from "helpers/token";
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [authData, setAuthData] = useState({ token: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      authService.getCurrentUser().then((res) => setUserData(res?.data));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const storedToken = normalizeToken(localStorage.getItem("token"));
    if (storedToken) {
      setIsLoggedIn(true);
      setAuthData({ token: storedToken });
    }
  }, []);

  const updateUserData = async ({ fullname, email, username, address, city, state, country }) => {
    const res = await API.put(`/users/${userData.user_id}`, {
      fullname,
      email,
      username,
      address,
      city,
      state,
      country,
    });
    setUserData(res.data);
  };

  const setUserInfo = (data) => {
    const { user, token } = data;
    const normalizedToken = normalizeToken(token);
    setIsLoggedIn(true);
    setUserData(user);
    setAuthData({ token: normalizedToken });

    if (normalizedToken) {
      localStorage.setItem("token", normalizedToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setUserData(null);
    setAuthData(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    authService.logout();
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        setUserState: (data) => setUserInfo(data),
        logout,
        isLoggedIn,
        setIsLoggedIn,
        authData,
        setAuthData,
        updateUserData,
      }}
    >
      <WithAxios>{children}</WithAxios>
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};

export { UserProvider, useUser };
