import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchChats as fetchChatsAction,
  fetchMessages as fetchMessagesAction,
  sendMessage as sendMessageAction,
  deleteChat as deleteChatAction,
  setCurrentChat,
  clearMessages,
  clearChatError,
} from "../chat.slice";

import { initializeSocketConnection } from "../service/chat.socket";

export const useChat = () => {
  const dispatch = useDispatch();

  const {
    chats,
    messages,
    currentChatId,
    loading,
    messagesLoading,
    sendingMessage,
    error,
  } = useSelector((state) => state.chat);

  // ==================================================
  // SOCKET
  // ==================================================

  const initializeSocket = useCallback(() => {
    initializeSocketConnection();
  }, []);

  // ==================================================
  // FETCH CHATS
  // ==================================================

  const fetchChats = useCallback(() => {
    return dispatch(fetchChatsAction());
  }, [dispatch]);

  // ==================================================
  // FETCH MESSAGES
  // ==================================================

  const fetchMessages = useCallback(
    (chatId) => {
      return dispatch(fetchMessagesAction(chatId));
    },
    [dispatch]
  );

  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const sendMessage = useCallback(
    ({ message, chatId }) => {
      return dispatch(
        sendMessageAction({
          message,
          chatId,
        })
      ).unwrap();
    },
    [dispatch]
  );

  // ==================================================
  // DELETE CHAT
  // ==================================================

  const deleteChat = useCallback(
    (chatId) => {
      return dispatch(deleteChatAction(chatId)).unwrap();
    },
    [dispatch]
  );

  // ==================================================
  // SET CURRENT CHAT
  // ==================================================

  const handleSetCurrentChat = useCallback(
    (chatId) => {
      dispatch(setCurrentChat(chatId));
    },
    [dispatch]
  );

  // ==================================================
  // CLEAR MESSAGES
  // ==================================================

  const handleClearMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // ==================================================
  // CLEAR ERROR
  // ==================================================

  const handleClearError = useCallback(() => {
    dispatch(clearChatError());
  }, [dispatch]);

  // ==================================================
  // RETURN
  // ==================================================

  return {
    chats,
    messages,
    currentChatId,

    loading,
    messagesLoading,
    sendingMessage,
    error,

    initializeSocketConnection: initializeSocket,

    fetchChats,
    fetchMessages,
    sendMessage,
    deleteChat,

    setCurrentChat: handleSetCurrentChat,
    clearMessages: handleClearMessages,
    clearChatError: handleClearError,
  };
};