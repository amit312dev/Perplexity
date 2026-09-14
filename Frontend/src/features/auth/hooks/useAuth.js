import { useDispatch, useSelector } from "react-redux";
import { register, login, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));
      const data = await register({ email, username, password });
      dispatch(setUser(data.user));
      dispatch(setError(null));
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Registration failed"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }
  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, password });
      dispatch(setUser(data.user));
      dispatch(setError(null));
      return data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user));
      dispatch(setError(null));
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch user"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    user,
    loading,
    error,
  };
}
