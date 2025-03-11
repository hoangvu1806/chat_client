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
const topicDropdownBtn = document.getElementById("topicDropdownBtn");
const topicDropdown = document.getElementById("topicDropdown");
const topic = topicDropdownBtn.textContent.trim();

// Hàm escape HTML để bảo vệ nội dung
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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
    <div class="flex justify-start py-2 animate-fade-in">
        <div class="theme-transition flex items-center gap-1.5 px-4 py-2 rounded-lg ${
            isDarkMode
                ? "bg-dark-surface text-dark-text-muted"
                : "bg-light-surface text-light-text-muted"
        }">
            <div class="typing-container">
                <span class="typing-dot dot1 w-2 h-2 rounded-full bg-current"></span>
                <span class="typing-dot dot2 w-2 h-2 rounded-full bg-current"></span>
                <span class="typing-dot dot3 w-2 h-2 rounded-full bg-current"></span>
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
            ? { ...session, messages: [...session.messages, newMessage] }
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
        <div class="message-animation" style="animation-delay: ${
            index * 0.01
        }s">
            <div class="flex ${
                message.isUser ? "justify-end" : "justify-start"
            }">
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
                    <div class="markdown-content text-sm break-words">
                        ${
                            message.isUser
                                ? escapeHtml(message.content)
                                : marked.parse(message.content, {
                                      gfm: true,
                                      breaks: true,
                                      sanitize: true,
                                  })
                        }
                    </div>
                </div>
            </div>
        </div>
    `
            )
            .join("") + (isTyping ? createTypingIndicator() : "");

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Biến toàn cục lưu chủ đề đã chọn
let selectedTopic = "General"; // Mặc định là "General"

// Hiển thị hoặc ẩn dropdown chủ đề
function toggleTopicDropdown() {
    topicDropdown.classList.toggle("hidden");
}

// Đóng dropdown khi click ra ngoài
document.addEventListener("click", (e) => {
    if (
        !topicDropdownBtn.contains(e.target) &&
        !topicDropdown.contains(e.target)
    ) {
        topicDropdown.classList.add("hidden");
    }
});

function selectTopic(topic) {
    // Cập nhật chủ đề đã chọn vào biến toàn cục
    let selectedTopic = topic;

    // Giữ nguyên icon và chỉ thay đổi nội dung văn bản
    topicDropdownBtn.innerHTML = `<i class="fas fa-comments"></i> ${topic.replace(
        "_",
        " "
    )}`;

    const welcomeMessages = {
        General: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
        SAP_B1: "Chào bạn! Bạn muốn tôi giúp gì về SAP B1?",
        SAP_HANA: "Xin chào! Bạn cần trợ giúp gì về SAP HANA không?",
        HBC_AI_ASSISTANT: "Chào bạn! Tôi ở đây để hỗ trợ bạn, bạn cần giúp gì?",
    };

    addMessage(
        welcomeMessages[topic] || "Xin chào! Hãy bắt đầu cuộc trò chuyện.",
        false
    );
    topicDropdown.classList.add("hidden");
    console.log("Chủ đề đã chọn:", selectedTopic);
}

// Handle Send Message
async function handleSend() {
    const content = messageInput.value.trim();
    if (!content && !selectedFile) return;

    const topic = topicDropdownBtn.textContent.trim();
    const prompt = content;
    const activeSession = getActiveSession();

    addMessage(prompt, true, selectedFile);

    isTyping = true;
    renderMessages();

    messageInput.value = "";
    const tempSelectedFile = selectedFile;
    selectedFile = null;
    filePreview.classList.add("hidden");

    const formData = new FormData();
    formData.append("topic", topic);
    formData.append("prompt", prompt);
    formData.append("section_name", activeSession.title); // Gửi section_name
    console.log("Topic: " + topic);
    console.log("Prompt: " + prompt);
    console.log("Section Name: " + activeSession.title);
    if (tempSelectedFile) {
        formData.append("file", tempSelectedFile);
    }

    try {
        const response = await fetch("/chat/send_message", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Gửi tin nhắn thất bại");
        }

        const data = await response.json();
        const serverResponse = data.output;

        isTyping = false;
        addMessage(serverResponse, false);
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        isTyping = false;
        addMessage("Đã xảy ra lỗi: " + error.message, false);
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
        .map((session) => ({ ...session, active: false }))
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

const editTitleBtn = document.getElementById("editTitleBtn");
const editTitleModal = document.getElementById("editTitleModal");
const newTitleInput = document.getElementById("newTitleInput");
const saveTitleBtn = document.getElementById("saveTitleBtn");
const cancelTitleBtn = document.getElementById("cancelTitleBtn");

function showEditTitleModal() {
    const activeSession = getActiveSession();
    newTitleInput.value = activeSession.title;
    editTitleModal.classList.remove("hidden");
}

function hideEditTitleModal() {
    editTitleModal.classList.add("hidden");
    newTitleInput.value = "";
}

function saveNewTitle() {
    const newTitle = newTitleInput.value.trim();
    if (!newTitle) {
        alert("Tên không được để trống!");
        return;
    }

    const activeSession = getActiveSession();
    sessions = sessions.map((session) =>
        session.id === activeSession.id
            ? { ...session, title: newTitle }
            : session
    );

    updateChatHistory();
    renderMessages();
    hideEditTitleModal();
}

editTitleBtn.addEventListener("click", showEditTitleModal);
saveTitleBtn.addEventListener("click", saveNewTitle);
cancelTitleBtn.addEventListener("click", hideEditTitleModal);

editTitleModal.addEventListener("click", (e) => {
    if (e.target === editTitleModal) {
        hideEditTitleModal();
    }
});

// Initial render
updateTheme();
updateChatHistory();
renderMessages();
