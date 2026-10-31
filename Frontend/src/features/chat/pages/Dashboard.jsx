import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router";

import { useChat } from "../hooks/useChat";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  clearActiveChatId,
  getActiveChatId,
  setActiveChatId,
} from "../service/activeChatStorage";

// ==================================================
// CODE BLOCK
// ==================================================

const CodeBlock = ({ children }) => {
  const [copied, setCopied] = useState(false);

  const codeElement = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === "code"
  );

  const className = codeElement?.props?.className || "";

  const languageMatch = className.match(/language-(\w+)/);

  const language = languageMatch
    ? languageMatch[1]
    : "code";

  const codeText = String(
    codeElement?.props?.children ?? ""
  ).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#15171b]">
      {/* CODE HEADER */}

      <div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#191b20] px-4">
        <span className="text-[12px] font-medium text-gray-400">
          {language}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] text-gray-400 transition hover:bg-white/8 hover:text-gray-200"
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>

              Copied
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="9"
                  y="9"
                  width="11"
                  height="11"
                  rx="2"
                />

                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>

              Copy
            </>
          )}
        </button>
      </div>

      {/* CODE */}

      <div className="overflow-x-auto">
        <pre className="m-0 p-4">
          {children}
        </pre>
      </div>
    </div>
  );
};

// ==================================================
// MARKDOWN COMPONENTS
// ==================================================

const markdownComponents = {
  // ==================================================
  // HEADINGS
  // ==================================================

  h1: ({ children }) => (
    <h1 className="mb-4 mt-7 text-2xl font-semibold tracking-tight text-gray-100">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mb-3 mt-7 text-xl font-semibold tracking-tight text-gray-100">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-lg font-semibold text-gray-100">
      {children}
    </h3>
  ),

  h4: ({ children }) => (
    <h4 className="mb-2 mt-5 text-base font-semibold text-gray-100">
      {children}
    </h4>
  ),

  // ==================================================
  // PARAGRAPH
  // ==================================================

  p: ({ children }) => (
    <p className="mb-4 leading-7 text-gray-300 last:mb-0">
      {children}
    </p>
  ),

  // ==================================================
  // BOLD
  // ==================================================

  strong: ({ children }) => (
    <strong className="font-semibold text-gray-100">
      {children}
    </strong>
  ),

  // ==================================================
  // ITALIC
  // ==================================================

  em: ({ children }) => (
    <em className="italic text-gray-300">
      {children}
    </em>
  ),

  // ==================================================
  // UNORDERED LIST
  // ==================================================

  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-300">
      {children}
    </ul>
  ),

  // ==================================================
  // ORDERED LIST
  // ==================================================

  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-gray-300">
      {children}
    </ol>
  ),

  // ==================================================
  // LIST ITEM
  // ==================================================

  li: ({ children }) => (
    <li className="leading-7">
      {children}
    </li>
  ),

  // ==================================================
  // BLOCKQUOTE
  // ==================================================

  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-white/20 pl-4 italic text-gray-400">
      {children}
    </blockquote>
  ),

  // ==================================================
  // HORIZONTAL LINE
  // ==================================================

  hr: () => (
    <hr className="my-6 border-white/10" />
  ),

  // ==================================================
  // LINKS
  // ==================================================

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-2 transition hover:text-cyan-300"
    >
      {children}
    </a>
  ),

  // ==================================================
  // INLINE / BLOCK CODE
  // ==================================================

  code: ({ children, className }) => {
    const isBlock =
      className?.includes("language-");

    if (isBlock) {
      return (
        <code
          className={`${className} block whitespace-pre font-mono text-[13px] leading-6 text-gray-200`}
        >
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-gray-200">
        {children}
      </code>
    );
  },

  // ==================================================
  // CODE BLOCK CONTAINER
  // ==================================================

  pre: ({ children }) => (
    <CodeBlock>
      {children}
    </CodeBlock>
  ),

  // ==================================================
  // TABLE
  // ==================================================

  table: ({ children }) => (
    <div className="mb-5 mt-4 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-white/5 text-gray-200">
      {children}
    </thead>
  ),

  tbody: ({ children }) => (
    <tbody className="divide-y divide-white/10">
      {children}
    </tbody>
  ),

  tr: ({ children }) => (
    <tr>
      {children}
    </tr>
  ),

  th: ({ children }) => (
    <th className="border-r border-white/10 px-4 py-3 font-semibold last:border-r-0">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border-r border-white/10 px-4 py-3 text-gray-300 last:border-r-0">
      {children}
    </td>
  ),
};

// ==================================================
// DASHBOARD
// ==================================================

const Dashboard = () => {
  // ==================================================
  // CHAT HOOK
  // ==================================================

  const {
    initializeSocketConnection,
    chats = [],
    messages = [],
    currentChatId,
    loading,
    messagesLoading,
    sendingMessage,
    error,
    fetchChats,
    fetchMessages,
    sendMessage,
    clearMessages,
    clearChatError,
  } = useChat();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  // ==================================================
  // AUTH USER
  // ==================================================

  const { user } = useSelector(
    (state) => state.auth
  );
  const userId = user?._id;

  // ==================================================
  // LOCAL STATE
  // ==================================================

  const [message, setMessage] = useState("");
  const [restoredUserId, setRestoredUserId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const messagesEndRef = useRef(null);
  const profileMenuRef = useRef(null);

  // ==================================================
  // SOCKET CONNECTION
  // ==================================================

  useEffect(() => {
    initializeSocketConnection();
  }, [initializeSocketConnection]);

  // ==================================================
  // LOAD CHATS
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    setRestoredUserId(null);
    clearMessages();

    const restoreChat = async () => {
      try {
        const chatList = await fetchChats();

        if (cancelled) {
          return;
        }

        const savedChatId = getActiveChatId(userId);

        if (!chatList.length || !savedChatId) {
          if (savedChatId) {
            clearActiveChatId(userId);
          }
          return;
        }

        if (!chatList.some((chat) => chat.id === savedChatId)) {
          clearActiveChatId(userId);
          return;
        }

        try {
          await fetchMessages(savedChatId);
        } catch (fetchError) {
          if (cancelled) {
            return;
          }

          if (fetchError?.status === 404) {
            clearActiveChatId(userId);
            clearMessages();
            clearChatError();
          }
        }
      } catch {
        // The rejected thunk updates the chat error shown in the dashboard.
      } finally {
        if (!cancelled) {
          setRestoredUserId(userId);
        }
      }
    };

    if (userId) {
      restoreChat();
    }

    return () => {
      cancelled = true;
    };
  }, [clearChatError, clearMessages, fetchChats, fetchMessages, userId]);

  useEffect(() => {
    if (userId && restoredUserId === userId && currentChatId) {
      setActiveChatId(userId, currentChatId);
    }
  }, [currentChatId, restoredUserId, userId]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  // ==================================================
  // AUTO SCROLL
  // ==================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sendingMessage]);

  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || sendingMessage) {
      return;
    }

    try {
      await sendMessage({
        message: trimmedMessage,
        chatId: currentChatId,
      });

      setMessage("");
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );
    }
  };

  // ==================================================
  // KEYBOARD HANDLER
  // ==================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // ==================================================
  // NEW CHAT
  // ==================================================

  const handleNewChat = () => {
    if (sendingMessage) {
      return;
    }

    clearMessages();
    if (userId) {
      clearActiveChatId(userId);
    }
    setMessage("");
  };

  // ==================================================
  // OPEN CHAT
  // ==================================================

  const handleChatClick = async (chatId) => {
    if (chatId === currentChatId) {
      return;
    }

    try {
      await fetchMessages(chatId);
    } catch (err) {
      console.error(
        "Failed to load chat:",
        err
      );
    }
  };

  const handleLogoutClick = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setProfileMenuOpen(false);
    await handleLogout();
    navigate("/login", { replace: true });
  };

  // ==================================================
  // SUGGESTION
  // ==================================================

  const handleSuggestionClick = (text) => {
    setMessage(text);
  };

  // ==================================================
  // INITIAL LETTER
  // ==================================================

  const userInitial =
    (user?.username || user?.email || "")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const accountPlan = user?.plan || user?.accountPlan;

  // ==================================================
  // UI
  // ==================================================

  return (
    <main className="h-screen w-full overflow-hidden bg-[#0b0d0f] text-white">
      <div className="flex h-full">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="flex h-full w-72.5 shrink-0 flex-col border-r border-white/8 bg-[#0b0d0f] px-5 py-5">

          {/* LOGO */}

          <div className="flex shrink-0 items-center justify-between px-1">
            <h1 className="text-[21px] font-semibold tracking-tight text-gray-100">
              Perplexity
            </h1>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/6 hover:text-gray-300"
              aria-label="Toggle sidebar"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                />

                <path d="M9 4v16" />
              </svg>
            </button>
          </div>

          {/* NEW CHAT */}

          <button
            type="button"
            onClick={handleNewChat}
            disabled={sendingMessage}
            className="mt-7 flex h-12 shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-[#15181c] px-4 text-[14px] font-medium text-gray-200 transition hover:border-white/14 hover:bg-[#191d22] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-xl font-light">
              +
            </span>

            <span>
              New Chat
            </span>
          </button>

          {/* RECENT */}

          <div className="mt-7 flex min-h-0 flex-1 flex-col">

            <p className="mb-3 shrink-0 px-2 text-[12px] font-medium text-gray-500">
              Recent
            </p>

            {/* CHAT LIST */}

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">

              {/* LOADING */}

              {loading && (
                <div className="px-3 py-3 text-[13px] text-gray-600">
                  Loading chats...
                </div>
              )}

              {/* EMPTY */}

              {!loading &&
                chats.length === 0 && (
                  <div className="px-3 py-3 text-[13px] leading-5 text-gray-600">
                    No chats yet.
                    <br />
                    Start a new conversation.
                  </div>
                )}

              {/* CHATS */}

              {!loading &&
                chats.length > 0 && (
                  <div className="space-y-0.5">
                    {chats.map((chat) => (
                      <button
                        key={chat.id}
                        type="button"
                        onClick={() =>
                          handleChatClick(chat.id)
                        }
                        className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                          currentChatId ===
                          chat.id
                            ? "bg-[#20242a] text-gray-100"
                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        }`}
                      >

                        {/* CHAT ICON */}

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="shrink-0"
                        >
                          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 1 1 20 11.5Z" />
                        </svg>

                        {/* TITLE */}

                        <span className="min-w-0 flex-1 truncate text-[13px]">
                          {chat.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>

          {/* BOTTOM NAVIGATION */}

          <div className="mt-4 shrink-0 space-y-0.5 border-t border-white/8 pt-4">

            {/* DISCOVER */}

            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-[14px] text-gray-400 transition hover:bg-white/5 hover:text-gray-200"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
              </svg>

              Discover
            </button>

            {/* LIBRARY */}

            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-[14px] text-gray-400 transition hover:bg-white/5 hover:text-gray-200"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect
                  x="4"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                />

                <rect
                  x="10"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                />

                <rect
                  x="16"
                  y="4"
                  width="4"
                  height="16"
                  rx="1"
                />
              </svg>

              Library
            </button>

            {/* SETTINGS */}

            <button
              type="button"
              className="flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-[14px] text-gray-400 transition hover:bg-white/5 hover:text-gray-200"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />

                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.6-1H6.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1.9-0.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z" />
              </svg>

              Settings
            </button>
          </div>

          {/* USER */}

          <div className="relative mt-4 shrink-0 border-t border-white/8 pt-4" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div
                role="menu"
                aria-label="Account menu"
                className="absolute bottom-full left-0 z-50 mb-3 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#202124] p-2 shadow-2xl shadow-black/50"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#383a3d] text-sm font-medium text-gray-100">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-100">
                      {user?.username || "User"}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user?.email || ""}
                    </p>
                    {accountPlan && (
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {accountPlan}
                      </p>
                    )}
                  </div>
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="shrink-0 text-gray-400"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>

                <div className="space-y-0.5">
                  {[
                    ["Upgrade Plan", "M12 3 3.5 8v8L12 21l8.5-5V8L12 3Z M12 8v8 M8 12h8"],
                    ["Personalization", "M4 6h16 M4 12h16 M4 18h16 M8 4v4 M15 10v4 M10 16v4"],
                    ["Profile", "M20 21a8 8 0 0 0-16 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
                    ["Settings", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.6-1H6.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z"],
                    ["Help", "M12 18h.01 M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"],
                  ].map(([label, iconPath]) => (
                    <button
                      key={label}
                      type="button"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-gray-200 transition hover:bg-white/8"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0 text-gray-400"
                        aria-hidden="true"
                      >
                        {iconPath.split(" M").map((path, index) => (
                          <path key={index} d={index ? `M${path}` : path} />
                        ))}
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="my-2 border-t border-white/10" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogoutClick}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-red-300 transition hover:bg-red-400/10 disabled:cursor-wait disabled:opacity-60"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 17l5-5-5-5 M15 12H3 M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                  </svg>
                  {loggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            )}

            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#242830] text-sm font-medium text-gray-200">
                {userInitial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-gray-200">
                  {user?.username || "User"}
                </p>
                <p className="truncate text-[11px] text-gray-500">
                  {user?.email || ""}
                </p>
              </div>

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className={`shrink-0 text-gray-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <section className="relative flex h-full min-w-0 flex-1 flex-col">

          {/* TOP RIGHT USER */}

          <div className="absolute right-7 top-5 z-10">
            <div className="flex items-center gap-2.5 text-gray-400">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#20242a]">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                  />

                  <path d="M5.5 20c.7-3.5 2.8-5.5 6.5-5.5s5.8 2 6.5 5.5" />
                </svg>
              </div>

              <span className="text-[13px]">
                User Message
              </span>
            </div>
          </div>

          {/* ==================================================
              CHAT AREA
          ================================================== */}

          {messagesLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center text-[14px] text-gray-500">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (

            /* ==================================================
               EMPTY CHAT
            ================================================== */

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">

              {/* ICON */}

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/8 bg-[#111419] text-gray-300">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-4.5A7.5 7.5 0 1 1 20 11.5Z" />
                </svg>
              </div>

              {/* HEADING */}

              <h2 className="text-[31px] font-medium tracking-tight text-gray-100">
                Ask anything
              </h2>

              {/* DESCRIPTION */}

              <p className="mt-2 max-w-xl text-center text-[14px] leading-6 text-gray-500">
                Start a conversation. Get instant
                answers, deep insights, and creative
                ideas.
              </p>

              {/* SUGGESTIONS */}

              <div className="mt-6 grid w-full max-w-162.5 grid-cols-2 gap-2.5">

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "Explain a complex topic"
                    )
                  }
                  className="flex items-center gap-3 rounded-full border border-white/8 bg-[#111419] px-5 py-3 text-left text-[13px] text-gray-300 transition hover:border-white/15 hover:bg-[#171a1f]"
                >
                  <span className="text-base">
                    ✧
                  </span>

                  Explain a complex topic
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "Summarize a document"
                    )
                  }
                  className="flex items-center gap-3 rounded-full border border-white/8 bg-[#111419] px-5 py-3 text-left text-[13px] text-gray-300 transition hover:border-white/15 hover:bg-[#171a1f]"
                >
                  <span className="text-base">
                    ▤
                  </span>

                  Summarize a document
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "Help me write code"
                    )
                  }
                  className="flex items-center gap-3 rounded-full border border-white/8 bg-[#111419] px-5 py-3 text-left text-[13px] text-gray-300 transition hover:border-white/15 hover:bg-[#171a1f]"
                >
                  <span className="text-sm">
                    &lt;/&gt;
                  </span>

                  Help me write code
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSuggestionClick(
                      "Generate some ideas"
                    )
                  }
                  className="flex items-center gap-3 rounded-full border border-white/8 bg-[#111419] px-5 py-3 text-left text-[13px] text-gray-300 transition hover:border-white/15 hover:bg-[#171a1f]"
                >
                  <span className="text-base">
                    ▧
                  </span>

                  Generate some ideas
                </button>
              </div>
            </div>

          ) : (

            /* ==================================================
               MESSAGES
            ================================================== */

            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/25">

              <div className="mx-auto w-full max-w-215 space-y-8">

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={
                      msg.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >

                    {/* ==================================================
                        USER MESSAGE
                    ================================================== */}

                    {msg.role === "user" ? (
                      <div className="max-w-[75%] rounded-2xl bg-[#20242a] px-4 py-3 text-[14px] leading-6 text-gray-100">
                        {msg.content}
                      </div>
                    ) : (

                      /* ==================================================
                         AI MESSAGE
                      ================================================== */

                      <div className="max-w-[85%] min-w-0 text-[14px] leading-7 text-gray-300">

                        {/* AI HEADER */}

                        <div className="mb-2 flex items-center gap-2 text-[12px] text-gray-500">

                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/8 bg-[#111419]">
                            ✦
                          </span>

                          <span>
                            Perplexity
                          </span>
                        </div>

                        {/* MARKDOWN RESPONSE */}

                        <div className="min-w-0">
                          <ReactMarkdown
                            components={
                              markdownComponents
                            }
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* THINKING */}

                {sendingMessage && (
                  <div className="flex items-center gap-2 text-[13px] text-gray-500">

                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/8 bg-[#111419]">
                      ✦
                    </span>

                    <span>
                      Thinking...
                    </span>
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* ==================================================
              INPUT AREA
          ================================================== */}

          <div className="shrink-0 px-6 pb-7 pt-3">

            <form
              onSubmit={handleSubmit}
              className="mx-auto flex min-h-19 w-full max-w-212.5 items-center gap-3 rounded-[25px] border border-white/10 bg-[#111419] px-3.5 shadow-2xl shadow-black/30"
            >

              {/* PLUS */}

              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#20242a] text-xl font-light text-gray-400 transition hover:bg-[#292e35] hover:text-white"
              >
                +
              </button>

              {/* TEXTAREA */}

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sendingMessage}
                placeholder="Type your message here..."
                className="max-h-32 min-h-9.5 flex-1 resize-none bg-transparent px-2 py-2.5 text-[14px] text-gray-200 outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {/* MICROPHONE */}

              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-white/6 hover:text-gray-200"
                aria-label="Voice input"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="8"
                    y="3"
                    width="8"
                    height="13"
                    rx="4"
                  />

                  <path d="M5 11a7 7 0 0 0 14 0" />

                  <path d="M12 18v3" />

                  <path d="M9 21h6" />
                </svg>
              </button>

              {/* SEND */}

              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  sendingMessage
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-[#252a30] disabled:text-gray-600"
                aria-label="Send message"
              >
                {sendingMessage ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="40 20"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 19V5" />
                    <path d="m6 11 6-6 6 6" />
                  </svg>
                )}
              </button>
            </form>

            {/* DISCLAIMER */}

            <p className="mt-2.5 text-center text-[11px] text-gray-600">
              AI can make mistakes. Please verify
              important information.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;