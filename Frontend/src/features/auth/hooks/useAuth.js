import { useDispatch, useSelector } from "react-redux";
import { register, login, logout, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";
import {
  clearLogoutPending,
  isLogoutPending,
  setLogoutPending,
} from "../service/sessionStorage";
import { resetChatState } from "../../chat/chat.slice";
import { clearActiveChatId } from "../../chat/service/activeChatStorage";
import { disconnectSocket } from "../../chat/service/chat.socket";

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
      clearLogoutPending();
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

    if (isLogoutPending()) {
      dispatch(setUser(null));
      dispatch(setError(null));
      return;
    }

    const data = await getMe();

    dispatch(setUser(data?.user || null));
    dispatch(setError(null));

  } catch (error) {
    const status = error?.response?.status;

    // No token, invalid token, or user not found
    if ([401, 403, 404].includes(status)) {
      dispatch(setUser(null));
      dispatch(setError(null));
    } else {
      dispatch(
        setError(
          error?.response?.data?.message ||
          "Failed to fetch user"
        )
      );
    }

  } finally {
    dispatch(setLoading(false));
  }
}

  async function handleLogout() {
    let succeeded = true;

    try {
      await logout();
      clearLogoutPending();
    } catch (logoutError) {
      succeeded = false;
      console.error("Logout request failed:", logoutError);
      try {
        setLogoutPending();
      } catch (storageError) {
        console.error("Could not persist the signed-out state:", storageError);
      }
    } finally {
      if (user?._id) {
        clearActiveChatId(user._id);
      }

      dispatch(setUser(null));
      dispatch(setError(null));
      dispatch(resetChatState());
      disconnectSocket();
    }

    return succeeded;
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
    user,
    loading,
    error,
  };
}
