import React, { useState, useEffect, useRef } from "react";
import { faPaperclip, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Chatbox = () => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Xin chào 👋\nTôi có thể giúp gì cho bạn hôm nay?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "model", parts: [{ text: "Xin chào 👋\nTôi có thể giúp gì cho bạn hôm nay?" }] },
  ]);

  const chatBodyRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChatbox = () => {
    setIsChatboxOpen(!isChatboxOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    const textarea = messageInputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(selectedFile.type)) {
      await Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)",
        confirmButtonText: "OK",
      });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target.result.split(",")[1];
      setFile({
        data: base64String,
        mime_type: selectedFile.type,
        preview: event.target.result,
      });
    };
    reader.readAsDataURL(selectedFile);
    e.target.value = "";
  };

  const handleCancelFile = () => {
    resetFileInput();
  };

  // Hàm để reset input file và trạng thái file
  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const messageText = inputValue.trim();

    if (!messageText && !file) return;

    // Cập nhật chatHistory với tin nhắn người dùng
    let updatedChatHistory;
    setChatHistory((prevHistory) => {
      updatedChatHistory = [
        ...prevHistory,
        {
          role: "user",
          parts: [
            { text: messageText },
            ...(file
              ? [
                  {
                    inline_data: {
                      mime_type: file.mime_type,
                      data: file.data,
                    },
                  },
                ]
              : []),
          ],
        },
      ];
      return updatedChatHistory;
    });

    // Hiển thị tin nhắn người dùng
    const userMessage = {
      type: "user",
      text: messageText,
      file: file ? file.preview : null,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setInputValue("");
    resetFileInput();

    // Hiển thị tin nhắn "đang suy nghĩ" của bot và gọi API sau một khoảng trễ
    setTimeout(() => {
      const botThinkingMessageId = Date.now(); // Tạo ID duy nhất cho tin nhắn bot
      const incomingMessageDiv = {
        id: botThinkingMessageId,
        type: "bot",
        text: "", // Nội dung sẽ được cập nhật sau khi có phản hồi từ API
        isThinking: true,
      };
      setMessages((prevMessages) => [...prevMessages, incomingMessageDiv]);
      generateBotResponse(botThinkingMessageId, updatedChatHistory);
    }, 600);
  };

  const generateBotResponse = async (botThinkingMessageId, currentChatHistory) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: currentChatHistory,
    };

    console.log(JSON.stringify(requestBody, null, 2)); // Thêm dòng này để debug

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botThinkingMessageId
            ? { ...msg, text: apiResponseText, isThinking: false }
            : msg
        )
      );
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "model", parts: [{ text: apiResponseText }] },
      ]);
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === botThinkingMessageId
            ? { ...msg, text: error.message, isError: true, isThinking: false }
            : msg
        )
      );
    } finally {
      resetFileInput();
      setIsThinking(false);
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }
  };

  return (
    <>
      <button
        onClick={toggleChatbox}
        className={`fixed bottom-8 right-9 h-16 w-16 flex items-center justify-center rounded-full bg-tiki-blue shadow-lg transition-all duration-300 ease-in-out z-50 hover:bg-tiki-dark-blue ${
          isChatboxOpen ? "transform rotate-180" : ""
        }`}
      >
        <span
          className={`text-white transition-opacity duration-200 flex items-center justify-center w-full h-full ${
            isChatboxOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8.5 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        </span>
        <span
          className={`text-white absolute transition-opacity duration-200 flex items-center justify-center w-full h-full ${
            isChatboxOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </span>
      </button>

      {/* Khung Chatbot */}
      <div
        className={`fixed right-9 bottom-28 w-80 h-[480px] flex flex-col bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out z-50 ${
          isChatboxOpen
            ? "opacity-100 pointer-events-auto transform scale-100"
            : "opacity-0 pointer-events-none transform scale-50"
        }`}
        style={{ transformOrigin: "bottom right" }}
      >
        {/* Header của Chatbot */}
        <div className="flex items-center justify-between p-3 bg-tiki-dark-blue text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base">Tiki Assistant</h2>
          </div>
          <button
            onClick={toggleChatbox}
            className="border-none text-xl cursor-pointer p-1.5 rounded-full bg-transparent transition-colors duration-200 ease-in-out hover:bg-white/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </button>
        </div>

        {/* Body của Chatbot */}
        <div
          ref={chatBodyRef}
          className="flex-grow p-3 overflow-y-auto flex flex-col gap-3 bg-tiki-light-gray"
        >
          {messages.map((message, index) =>
            message.type === "bot" ? (
              <div key={index} className="flex items-start gap-2 self-start">
                <div className="w-7 h-7 rounded-full bg-tiki-blue flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 11.1c0-3.9-3.1-7-7-7s-7 3.1-7 7c0 1.9.8 3.7 2.1 5l-1.5 4.3c-.2.5.3 1 .8.8l4.3-1.5c.6.2 1.2.3 1.8.3 3.9 0 7-3.1 7-7zm-7-5c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zM6 12c0-3.3 2.7-6 6-6v2c-2.2 0-4 1.8-4 4s1.8 4 4 4v2c-3.3 0-6-2.7-6-6z" />
                  </svg>
                </div>
                {message.isThinking ? (
                  <div className="p-2.5 bg-white rounded-lg rounded-bl-none">
                    <div className="flex gap-1 items-center">
                      <div className="h-1.5 w-1.5 bg-tiki-blue rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-1.5 w-1.5 bg-tiki-blue rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-1.5 w-1.5 bg-tiki-blue rounded-full animate-bounce"></div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-2.5 max-w-[220px] text-xs rounded-lg rounded-bl-none ${
                      message.isError
                        ? "text-red-600 bg-red-100"
                        : "bg-white text-tiki-text-gray"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: message.text.replace(/\n/g, "<br />"),
                    }}
                  ></div>
                )}
              </div>
            ) : (
              <div key={index} className="flex flex-col items-end self-end">
                <div className="p-2.5 max-w-[220px] text-xs text-white bg-tiki-blue rounded-lg rounded-br-none">
                  {message.text}
                </div>
                {message.file && (
                  <img
                    src={message.file}
                    alt="attachment"
                    className="w-2/3 mt-1 rounded-md border border-tiki-border-gray"
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* Footer của Chatbot */}
        <div className="p-2 border-t border-tiki-border-gray bg-white rounded-b-xl">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-1.5 relative"
          >
            <div className="relative flex-grow">
              <textarea
                ref={messageInputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSendMessage(e);
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="w-full outline-none resize-none border border-tiki-border-gray rounded-md text-xs py-2 pl-2.5 pr-2 bg-tiki-light-gray focus:border-tiki-blue focus:ring-1 focus:ring-tiki-blue"
                rows={1}
              ></textarea>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative h-9 w-9">
                <input
                  type="file"
                  id="file-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  hidden
                />
                {file && (
                  <img
                    src={file.preview}
                    alt="preview"
                    className="absolute h-full w-full object-cover rounded-md border border-tiki-border-gray"
                  />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className={`h-9 w-9 flex items-center justify-center border border-tiki-border-gray cursor-pointer bg-white rounded-md text-gray-500 transition-colors duration-200 ease-in-out hover:bg-tiki-light-gray hover:text-tiki-blue ${
                    file ? "hidden" : "flex"
                  }`}
                >
                  <FontAwesomeIcon icon={faPaperclip} className="h-4 w-4" />
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={handleCancelFile}
                    className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center border-2 border-white cursor-pointer text-white bg-tiki-red rounded-full text-xs"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputValue && !file}
                className={`h-9 w-7 flex items-center justify-center border-none cursor-pointer text-white bg-tiki-blue rounded-md transition-colors duration-200 ease-in-out hover:bg-tiki-dark-blue disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbox;
