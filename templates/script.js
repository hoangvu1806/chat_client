console.log("Link successfully");

let isDarkMode = true;
let sessions = [
    {
        id: 1,
        title: "Cuộc trò chuyện #1",
        messages: [
            {
                id: 1,
                content: "Hello! How can I help you today?",
                isUser: false,
            },
        ],
        active: true,
    },
];
let selectedFile = null;
let isTyping = false;

// DOM Elements
const messagesArea = document.getElementById("messagesArea");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const fileInput = document.getElementById("fileInput");
const attachButton = document.getElementById("attachButton");
const filePreview = document.getElementById("filePreview");
const fileName = document.getElementById("fileName");
const clearFile = document.getElementById("clearFile");
const chatHistory = document.getElementById("chatHistory");
const newChatBtn = document.getElementById("newChatBtn");
const chatTitle = document.getElementById("chatTitle");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Theme Toggle
function toggleTheme() {
    isDarkMode = !isDarkMode;
    updateTheme();
}

function updateTheme() {
    if (isDarkMode) {
        body.classList.remove("light");
        body.classList.add("dark");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        document.querySelectorAll(".theme-transition").forEach((el) => {
            el.classList.remove(
                "bg-light-surface",
                "text-light-text",
                "border-light-border"
            );
            el.classList.add(
                "bg-dark-surface",
                "text-dark-text",
                "border-dark-border"
            );
        });
    } else {
        body.classList.remove("dark");
        body.classList.add("light");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        document.querySelectorAll(".theme-transition").forEach((el) => {
            el.classList.remove(
                "bg-dark-surface",
                "text-dark-text",
                "border-dark-border"
            );
            el.classList.add(
                "bg-light-surface",
                "text-light-text",
                "border-light-border"
            );
        });
    }
}

// Helper Functions
function getActiveSession() {
    return sessions.find((s) => s.active) || sessions[0];
}

function updateChatHistory() {
    chatHistory.innerHTML = sessions
        .map(
            (session) => `
    <button 
        class="theme-transition w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
            session.active
                ? isDarkMode
                    ? "bg-dark-border text-dark-text"
                    : "bg-light-border text-light-text"
                : isDarkMode
                ? "text-dark-text-muted hover:bg-dark-surface"
                : "text-light-text-muted hover:bg-light-surface"
        }"
        onclick="selectSession(${session.id})"
    >
        <i class="fas fa-message"></i>
        <span class="truncate">${session.title}</span>
    </button>
`
        )
        .join("");
}

function createTypingIndicator() {
    return `
    <div class="flex justify-start animate-fade-in">
        <div class="theme-transition ${
            isDarkMode
                ? "bg-dark-surface text-dark-text-muted"
                : "bg-light-surface text-light-text-muted"
        } rounded-lg px-4 py-2">
            <div class="flex gap-1">
                <div class="typing-dot w-2 h-2 rounded-full bg-current"></div>
                <div class="typing-dot w-2 h-2 rounded-full bg-current"></div>
                <div class="typing-dot w-2 h-2 rounded-full bg-current"></div>
            </div>
        </div>
    </div>
`;
}

function addMessage(content, isUser, file = null) {
    const activeSession = getActiveSession();
    const newMessage = {
        id:
            (activeSession.messages[activeSession.messages.length - 1]?.id ||
                0) + 1,
        content,
        isUser,
        file,
    };

    sessions = sessions.map((session) =>
        session.id === activeSession.id
            ? {
                  ...session,
                  messages: [...session.messages, newMessage],
              }
            : session
    );

    renderMessages();
}

function renderMessages() {
    const activeSession = getActiveSession();
    chatTitle.textContent = activeSession.title;

    messagesArea.innerHTML =
        activeSession.messages
            .map(
                (message, index) => `
    <div class="message-animation" style="animation-delay: ${index * 0.01}s">
        <div class="flex ${message.isUser ? "justify-end" : "justify-start"}">
            <div class="theme-transition max-w-[80%] rounded-lg px-4 py-2 ${
                message.isUser
                    ? "bg-dark-primary text-dark-text"
                    : isDarkMode
                    ? "bg-dark-surface text-dark-text"
                    : "bg-light-surface text-light-text"
            }">
                ${
                    message.file
                        ? `
                    <div class="flex items-center gap-2 mb-2 text-sm">
                        <i class="fas fa-file"></i>
                        <span>${message.file.name}</span>
                    </div>
                `
                        : ""
                }
                <p class="text-sm whitespace-pre-wrap break-words">${
                    message.content
                }</p>
            </div>
        </div>
    </div>
`
            )
            .join("") + (isTyping ? createTypingIndicator() : "");

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Topic Dropdown
const topicDropdownBtn = document.getElementById("topicDropdownBtn");
const topicDropdown = document.getElementById("topicDropdown");

function toggleTopicDropdown() {
    topicDropdown.classList.toggle("hidden");
}

document.addEventListener("click", (e) => {
    if (
        !topicDropdownBtn.contains(e.target) &&
        !topicDropdown.contains(e.target)
    ) {
        topicDropdown.classList.add("hidden");
    }
});

function selectTopic(topic) {
    const activeSession = getActiveSession();
    sessions = sessions.map((session) =>
        session.id === activeSession.id
            ? { ...session, title: `${topic} Chat` }
            : session
    );

    const welcomeMessages = {
        General: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
        Technology: "Chào bạn! Bạn muốn thảo luận gì về công nghệ?",
        Science: "Xin chào! Bạn quan tâm đến chủ đề khoa học nào?",
        Support: "Chào bạn! Tôi ở đây để hỗ trợ bạn, bạn cần giúp gì?",
    };

    addMessage(welcomeMessages[topic], false);
    topicDropdown.classList.add("hidden");
}

async function handleSend() {
    const content = messageInput.value.trim();
    if (!content && !selectedFile) return;

    const topic = topicDropdownBtn.textContent.trim(); // Lấy topic từ topicDropdownBtn
    const prompt = content; // Tin nhắn từ người dùng

    // Thêm tin nhắn của người dùng vào giao diện ngay lập tức
    addMessage(prompt, true, selectedFile);
    // Reset input và file sau khi xử lý xong
    messageInput.value = "";
    selectedFile = null;
    filePreview.classList.add("hidden");
    // Tạo FormData để gửi dữ liệu
    const formData = new FormData();
    formData.append("topic", topic);
    formData.append("prompt", prompt);
    if (selectedFile) {
        formData.append("file", selectedFile);
    }
    console.log("formData", formData);
    try {
        const response = await fetch("/chat/send_message", {
            method: "POST",
            body: formData,
        });

        // Kiểm tra nếu yêu cầu thất bại
        if (!response.ok) {
            throw new Error("Gửi tin nhắn thất bại");
        }
        const data = await response.json();
        const serverResponse = data.output; // Giả sử server trả về JSON với trường 'output'

        // Thêm phản hồi từ server vào giao diện
        addMessage(serverResponse, false);
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        // Hiển thị thông báo lỗi cho người dùng
        addMessage(error, false);
    } finally {
        // Reset input và file sau khi xử lý xong
        messageInput.value = "";
        selectedFile = null;
        filePreview.classList.add("hidden");
    }
}

function selectSession(id) {
    sessions = sessions.map((session) => ({
        ...session,
        active: session.id === id,
    }));
    updateChatHistory();
    renderMessages();
}

function createNewSession() {
    const newSession = {
        id: Math.max(...sessions.map((s) => s.id)) + 1,
        title: `Cuộc trò chuyện #${sessions.length + 1}`,
        messages: [
            {
                id: 1,
                content: "Hello! How can I help you today?",
                isUser: false,
            },
        ],
        active: true,
    };

    sessions = sessions
        .map((session) => ({
            ...session,
            active: false,
        }))
        .concat(newSession);

    updateChatHistory();
    renderMessages();
}

// Event Listeners
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

sendButton.addEventListener("click", handleSend);

attachButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        fileName.textContent = file.name;
        filePreview.classList.remove("hidden");
        filePreview.classList.add("flex");
    }
});

clearFile.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    filePreview.classList.add("hidden");
});

newChatBtn.addEventListener("click", createNewSession);

themeToggle.addEventListener("click", toggleTheme);

topicDropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTopicDropdown();
});

suggestedMessages.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
        messageInput.value = e.target.textContent.trim();
        handleSend();
    }
});

// Initial render
updateTheme();
updateChatHistory();
renderMessages();

(function () {
    function c() {
        var b = a.contentDocument || a.contentWindow.document;
        if (b) {
            var d = b.createElement("script");
            d.innerHTML =
                "window.__CF$cv$params={r:'91b83d599deebca2',t:'MTc0MTE2MzMwMy4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
            b.getElementsByTagName("head")[0].appendChild(d);
        }
    }
    if (document.body) {
        var a = document.createElement("iframe");
        a.height = 1;
        a.width = 1;
        a.style.position = "absolute";
        a.style.top = 0;
        a.style.left = 0;
        a.style.border = "none";
        a.style.visibility = "hidden";
        document.body.appendChild(a);
        if ("loading" !== document.readyState) c();
        else if (window.addEventListener)
            document.addEventListener("DOMContentLoaded", c);
        else {
            var e = document.onreadystatechange || function () {};
            document.onreadystatechange = function (b) {
                e(b);
                "loading" !== document.readyState &&
                    ((document.onreadystatechange = e), c());
            };
        }
    }
})();
