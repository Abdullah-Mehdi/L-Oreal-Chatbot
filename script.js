/*
 * L'ORÉAL BEAUTY ASSISTANT - ENHANCED WITH CONVERSATION CONTEXT
 * Tracks user details, conversation history, and preferences for personalized interactions
 */

console.log("🚀 Loading L'Oréal Beauty Assistant with Context Tracking...");

// Global variables
let chatForm, userInput, chatWindow;
let contextToggle, userContextPanel, userProfileDisplay, clearDataBtn;
let conversationHistory = [];
let userProfile = {
  name: null,
  skinType: null,
  concerns: [],
  preferences: [],
  previousRecommendations: [],
  conversationCount: 0,
  lastInteraction: null,
};

// Conversation context storage
let conversationContext = {
  currentTopic: null,
  recentQuestions: [],
  mentionedProducts: [],
  discussedConcerns: [],
  userGoals: [],
};

// Welcome message
const welcomeMessage = `💄 Welcome to L'Oréal Beauty Assistant!

I'm here to help you discover the perfect beauty products and create personalized routines that make you feel confident and beautiful.

To get started, I'd love to know your name! Feel free to tell me:
• Your name
• Your skin type or concerns
• What beauty goals you're working towards

Ask me about:
• Skincare routines for your skin type
• Makeup tips and tutorials  
• Product recommendations
• Color matching and trends
• Hair care solutions

How can I help you look and feel your best today?`;

/**
 * Initialize the application
 */
function initializeApp() {
  console.log("🔧 Initializing app with context tracking...");

  // Get DOM elements
  chatForm = document.getElementById("chatForm");
  userInput = document.getElementById("userInput");
  chatWindow = document.getElementById("chatWindow");
  contextToggle = document.getElementById("contextToggle");
  userContextPanel = document.getElementById("userContextPanel");
  userProfileDisplay = document.getElementById("userProfileDisplay");
  clearDataBtn = document.getElementById("clearDataBtn");

  // Verify elements exist
  if (!chatForm || !userInput || !chatWindow) {
    console.error("❌ Required DOM elements not found");
    return false;
  }

  // Verify configuration exists
  if (
    typeof API_CONFIG === "undefined" ||
    typeof LOREAL_SYSTEM_PROMPT === "undefined"
  ) {
    console.error("❌ Configuration not loaded");
    return false;
  }

  // Load saved user profile if exists
  loadUserProfile();

  // Initialize conversation with enhanced system prompt
  initializeConversationHistory();

  // Display personalized welcome message
  displayPersonalizedWelcome();

  // Setup form handler
  setupFormHandler();

  // Setup context UI handlers
  setupContextUI();

  // Update context display
  updateContextDisplay();

  // Focus input
  userInput.focus();

  console.log("✅ App initialized successfully with context tracking");
  return true;
}

/**
 * Initialize conversation history with enhanced system prompt
 */
function initializeConversationHistory() {
  const enhancedSystemPrompt = `${LOREAL_SYSTEM_PROMPT}

## ENHANCED CONTEXT TRACKING:
You have access to the user's conversation context and profile. Use this information to provide personalized responses:

### User Profile Information:
- Name: ${userProfile.name || "Not provided yet"}
- Skin Type: ${userProfile.skinType || "Unknown"}
- Concerns: ${
    userProfile.concerns.length > 0
      ? userProfile.concerns.join(", ")
      : "None identified yet"
  }
- Preferences: ${
    userProfile.preferences.length > 0
      ? userProfile.preferences.join(", ")
      : "None identified yet"
  }
- Previous Recommendations: ${
    userProfile.previousRecommendations.length > 0
      ? userProfile.previousRecommendations.slice(-3).join(", ")
      : "None yet"
  }
- Conversation Count: ${userProfile.conversationCount}

### Recent Conversation Context:
- Current Topic: ${conversationContext.currentTopic || "Getting to know user"}
- Recent Questions: ${conversationContext.recentQuestions.slice(-3).join("; ")}
- Mentioned Products: ${conversationContext.mentionedProducts
    .slice(-5)
    .join(", ")}
- Discussed Concerns: ${conversationContext.discussedConcerns.join(", ")}

## PERSONALIZATION GUIDELINES:
1. Use the user's name when available
2. Reference previous conversations and recommendations
3. Build on previously discussed skin concerns and preferences
4. Avoid repeating the same product recommendations
5. Ask follow-up questions based on conversation history
6. Remember user's goals and check on progress
7. Adapt communication style based on user's engagement level

Remember to update context as the conversation progresses and provide increasingly personalized advice!`;

  conversationHistory = [
    {
      role: "system",
      content: enhancedSystemPrompt,
    },
  ];
}

/**
 * Display personalized welcome message
 */
function displayPersonalizedWelcome() {
  let personalizedMessage = welcomeMessage;

  // Personalize based on user profile
  if (userProfile.name) {
    personalizedMessage = `💄 Welcome back, ${
      userProfile.name
    }! I'm your L'Oréal Beauty Assistant.

${
  userProfile.conversationCount > 0
    ? `Great to see you again! Last time we talked about ${
        conversationContext.currentTopic || "beauty tips"
      }.`
    : `I'm here to help you discover the perfect beauty products and create personalized routines.`
}

${
  userProfile.skinType
    ? `I remember you have ${userProfile.skinType} skin.`
    : ""
}
${
  userProfile.concerns.length > 0
    ? ` We've discussed your concerns about ${userProfile.concerns
        .slice(-2)
        .join(" and ")}.`
    : ""
}

What would you like to explore today? I'm here to help you feel confident and beautiful! ✨`;
  }

  displayMessage(personalizedMessage, "ai");
}

/**
 * Load user profile from localStorage
 */
function loadUserProfile() {
  try {
    const savedProfile = localStorage.getItem("loreal_user_profile");
    const savedContext = localStorage.getItem("loreal_conversation_context");

    if (savedProfile) {
      userProfile = { ...userProfile, ...JSON.parse(savedProfile) };
      console.log("📋 Loaded user profile:", userProfile);
    }

    if (savedContext) {
      conversationContext = {
        ...conversationContext,
        ...JSON.parse(savedContext),
      };
      console.log("💭 Loaded conversation context:", conversationContext);
    }
  } catch (error) {
    console.log("ℹ️ No previous user data found, starting fresh");
  }
}

/**
 * Save user profile to localStorage
 */
function saveUserProfile() {
  try {
    localStorage.setItem("loreal_user_profile", JSON.stringify(userProfile));
    localStorage.setItem(
      "loreal_conversation_context",
      JSON.stringify(conversationContext)
    );
    console.log("💾 User profile and context saved");
  } catch (error) {
    console.error("❌ Failed to save user profile:", error);
  }
}

/**
 * Extract and update user information from message
 */
function extractUserInformation(userMessage, aiResponse) {
  const messageLower = userMessage.toLowerCase();
  const responseLower = aiResponse.toLowerCase();

  // Extract name
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /i am (\w+)/i,
    /call me (\w+)/i,
  ];

  for (const pattern of namePatterns) {
    const match = userMessage.match(pattern);
    if (match && !userProfile.name) {
      userProfile.name = match[1];
      console.log("👤 User name identified:", userProfile.name);
    }
  }

  // Extract skin type
  const skinTypes = [
    "oily",
    "dry",
    "combination",
    "sensitive",
    "normal",
    "acne-prone",
  ];
  for (const skinType of skinTypes) {
    if (messageLower.includes(skinType) && !userProfile.skinType) {
      userProfile.skinType = skinType;
      console.log("🧴 Skin type identified:", userProfile.skinType);
    }
  }

  // Extract concerns
  const concerns = [
    "acne",
    "wrinkles",
    "dark spots",
    "dryness",
    "oiliness",
    "sensitivity",
    "aging",
    "pores",
    "blackheads",
    "redness",
  ];
  for (const concern of concerns) {
    if (
      messageLower.includes(concern) &&
      !userProfile.concerns.includes(concern)
    ) {
      userProfile.concerns.push(concern);
      conversationContext.discussedConcerns.push(concern);
      console.log("⚠️ New concern identified:", concern);
    }
  }

  // Extract product mentions from AI response
  const productKeywords = [
    "serum",
    "moisturizer",
    "cleanser",
    "cream",
    "lotion",
    "foundation",
    "concealer",
    "mascara",
    "lipstick",
  ];
  for (const product of productKeywords) {
    if (
      responseLower.includes(product) &&
      !conversationContext.mentionedProducts.includes(product)
    ) {
      conversationContext.mentionedProducts.push(product);
      if (conversationContext.mentionedProducts.length > 10) {
        conversationContext.mentionedProducts =
          conversationContext.mentionedProducts.slice(-10);
      }
    }
  }

  // Track recent questions
  conversationContext.recentQuestions.push(userMessage);
  if (conversationContext.recentQuestions.length > 5) {
    conversationContext.recentQuestions =
      conversationContext.recentQuestions.slice(-5);
  }

  // Update conversation count and last interaction
  userProfile.conversationCount++;
  userProfile.lastInteraction = new Date().toISOString();

  // Update context display if panel is visible
  if (userContextPanel && !userContextPanel.classList.contains("hidden")) {
    updateContextDisplay();
  }
}

/**
 * Determine current conversation topic
 */
function updateConversationTopic(userMessage) {
  const messageLower = userMessage.toLowerCase();

  if (messageLower.includes("skincare") || messageLower.includes("skin")) {
    conversationContext.currentTopic = "skincare";
  } else if (
    messageLower.includes("makeup") ||
    messageLower.includes("foundation") ||
    messageLower.includes("lipstick")
  ) {
    conversationContext.currentTopic = "makeup";
  } else if (
    messageLower.includes("hair") ||
    messageLower.includes("shampoo")
  ) {
    conversationContext.currentTopic = "hair care";
  } else if (messageLower.includes("routine")) {
    conversationContext.currentTopic = "beauty routine";
  } else if (
    messageLower.includes("product") ||
    messageLower.includes("recommend")
  ) {
    conversationContext.currentTopic = "product recommendations";
  }
}

/**
 * Setup form submission handler
 */
function setupFormHandler() {
  chatForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Update conversation topic
    updateConversationTopic(userMessage);

    // Display user message
    displayMessage(userMessage, "user");

    // Clear input
    userInput.value = "";

    // Send to API with context
    await sendToAPIWithContext(userMessage);
  });
}

/**
 * Display a message in the chat
 */
function displayMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `msg ${sender}`;
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Display AI response with user question reminder above it
 */
function displayAIResponseWithQuestion(userQuestion, aiResponse) {
  // Create container for the AI response block
  const responseContainer = document.createElement("div");
  responseContainer.className = "ai-response-container";

  // Create user question reminder
  const questionReminder = document.createElement("div");
  questionReminder.className = "user-question-reminder";
  questionReminder.textContent = userQuestion;

  // Create AI response message
  const aiMessageDiv = document.createElement("div");
  aiMessageDiv.className = "msg ai";
  aiMessageDiv.textContent = aiResponse;

  // Append question reminder and AI response to container
  responseContainer.appendChild(questionReminder);
  responseContainer.appendChild(aiMessageDiv);

  // Add container to chat window
  chatWindow.appendChild(responseContainer);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/**
 * Enhanced send to API with conversation context
 */
async function sendToAPIWithContext(userMessage) {
  try {
    // Add user message to conversation history
    conversationHistory.push({
      role: "user",
      content: userMessage,
    });

    // Update system prompt with current context before each request
    conversationHistory[0] = {
      role: "system",
      content: createContextualSystemPrompt(),
    };

    // Prepare request
    const requestBody = {
      model: API_CONFIG.model,
      messages: conversationHistory,
      max_completion_tokens: API_CONFIG.maxTokens,
      temperature: API_CONFIG.temperature,
    };

    // Show loading message
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "msg ai loading";
    loadingDiv.id = "loading-message";
    loadingDiv.textContent = userProfile.name
      ? `✨ Let me find the perfect advice for you, ${userProfile.name}...`
      : "✨ Let me find the perfect beauty advice for you...";
    chatWindow.appendChild(loadingDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Make API request
    const response = await fetch(API_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Remove loading message
    loadingDiv.remove();

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response received from AI");
    }

    // Extract user information from this interaction
    extractUserInformation(userMessage, aiResponse);

    // Add AI response to conversation history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
    });

    // Limit conversation history to prevent token overflow (keep last 20 messages + system)
    if (conversationHistory.length > 21) {
      conversationHistory = [
        conversationHistory[0], // Keep system prompt
        ...conversationHistory.slice(-20), // Keep last 20 messages
      ];
    }

    // Save updated profile
    saveUserProfile();

    // Update context display
    updateContextDisplay();

    // Display AI response with user question reminder
    displayAIResponseWithQuestion(userMessage, aiResponse);

    // Update placeholder text based on conversation
    updateInputPlaceholder();
  } catch (error) {
    // Remove loading message if it exists
    const loadingDiv = document.getElementById("loading-message");
    if (loadingDiv) {
      loadingDiv.remove();
    }

    console.error("API Error:", error);
    const errorMessage = userProfile.name
      ? `🌸 I'm sorry ${userProfile.name}, I'm having trouble connecting right now. Please try again in a moment!`
      : "🌸 I'm sorry, I'm having trouble connecting right now. Please try again in a moment. I'm here to help you with all your beauty questions!";

    displayMessage(errorMessage, "ai");
  }
}

/**
 * Create contextual system prompt with current user information
 */
function createContextualSystemPrompt() {
  return `${LOREAL_SYSTEM_PROMPT}

## CURRENT USER CONTEXT:
### User Profile:
- Name: ${userProfile.name || "Not provided yet"}
- Skin Type: ${userProfile.skinType || "Unknown"}
- Main Concerns: ${
    userProfile.concerns.length > 0
      ? userProfile.concerns.join(", ")
      : "None identified yet"
  }
- Preferences: ${
    userProfile.preferences.length > 0
      ? userProfile.preferences.join(", ")
      : "None identified yet"
  }
- Conversation Count: ${userProfile.conversationCount}
- Returning User: ${userProfile.conversationCount > 1 ? "Yes" : "No"}

### Recent Conversation Context:
- Current Topic: ${
    conversationContext.currentTopic || "General beauty consultation"
  }
- Recent Questions: ${conversationContext.recentQuestions.slice(-3).join(" | ")}
- Recently Mentioned Products: ${conversationContext.mentionedProducts
    .slice(-5)
    .join(", ")}
- Discussed Concerns: ${conversationContext.discussedConcerns.join(", ")}

## PERSONALIZATION INSTRUCTIONS:
1. ${
    userProfile.name
      ? `Always address the user as ${userProfile.name}`
      : "Ask for the user's name if not provided"
  }
2. ${
    userProfile.skinType
      ? `Remember they have ${userProfile.skinType} skin`
      : "Try to identify their skin type"
  }
3. Reference previous conversations naturally when relevant
4. Build on previously discussed concerns: ${userProfile.concerns.join(", ")}
5. Avoid repeating the same product recommendations
6. Ask personalized follow-up questions based on their profile
7. Track their beauty journey and progress

Make responses feel personal and connected to our ongoing conversation!`;
}

/**
 * Update input placeholder based on conversation context
 */
function updateInputPlaceholder() {
  const placeholders = [
    "What else can I help you with today?",
    "Any other beauty questions?",
    "What would you like to explore next?",
    "How can I help you feel even more beautiful?",
    "Tell me more about your beauty goals...",
  ];

  // Personalized placeholders based on context
  if (userProfile.name && conversationContext.currentTopic) {
    const contextPlaceholders = {
      skincare: `More skincare questions, ${userProfile.name}?`,
      makeup: `What other makeup tips can I share, ${userProfile.name}?`,
      "hair care": `Any other hair care questions, ${userProfile.name}?`,
      "product recommendations": `Need more product recommendations, ${userProfile.name}?`,
    };

    if (contextPlaceholders[conversationContext.currentTopic]) {
      userInput.placeholder =
        contextPlaceholders[conversationContext.currentTopic];
      return;
    }
  }

  // Random general placeholder
  userInput.placeholder =
    placeholders[Math.floor(Math.random() * placeholders.length)];
}

/**
 * Add function to clear user data (for privacy)
 */
function clearUserData() {
  localStorage.removeItem("loreal_user_profile");
  localStorage.removeItem("loreal_conversation_context");
  userProfile = {
    name: null,
    skinType: null,
    concerns: [],
    preferences: [],
    previousRecommendations: [],
    conversationCount: 0,
    lastInteraction: null,
  };
  conversationContext = {
    currentTopic: null,
    recentQuestions: [],
    mentionedProducts: [],
    discussedConcerns: [],
    userGoals: [],
  };
  console.log("🗑️ User data cleared");
}

/**
 * Setup context UI event handlers
 */
function setupContextUI() {
  // Toggle context panel visibility
  if (contextToggle && userContextPanel) {
    contextToggle.addEventListener("click", function () {
      userContextPanel.classList.toggle("hidden");
      const isVisible = !userContextPanel.classList.contains("hidden");
      contextToggle.textContent = isVisible ? "👤 Hide" : "👤 Profile";

      if (isVisible) {
        updateContextDisplay();
      }
    });
  }

  // Clear user data button
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", function () {
      if (
        confirm(
          "Are you sure you want to clear all your saved beauty profile data? This cannot be undone."
        )
      ) {
        clearUserData();
        updateContextDisplay();
        // Hide the panel after clearing
        if (userContextPanel) {
          userContextPanel.classList.add("hidden");
          contextToggle.textContent = "👤 Profile";
        }
        // Refresh the conversation
        chatWindow.innerHTML = "";
        displayPersonalizedWelcome();
      }
    });
  }
}

/**
 * Update the context display panel
 */
function updateContextDisplay() {
  if (!userProfileDisplay) return;

  const hasProfile =
    userProfile.name || userProfile.skinType || userProfile.concerns.length > 0;

  if (!hasProfile) {
    userProfileDisplay.innerHTML = `
      <div style="text-align: center; color: var(--loreal-gray); font-style: italic;">
        💫 Start chatting to build your personalized beauty profile!
      </div>
    `;
    return;
  }

  let profileHTML = "";

  // Basic profile information
  if (userProfile.name) {
    profileHTML += `
      <div class="user-profile-item">
        <span class="user-profile-label">Name:</span>
        <span class="user-profile-value">${userProfile.name}</span>
      </div>
    `;
  }

  if (userProfile.skinType) {
    profileHTML += `
      <div class="user-profile-item">
        <span class="user-profile-label">Skin Type:</span>
        <span class="user-profile-value">${userProfile.skinType}</span>
      </div>
    `;
  }

  if (userProfile.concerns.length > 0) {
    profileHTML += `
      <div class="user-profile-item">
        <span class="user-profile-label">Concerns:</span>
        <span class="user-profile-value">
          ${userProfile.concerns
            .map(
              (concern) =>
                `<span class="context-indicator concern">${concern}</span>`
            )
            .join("")}
        </span>
      </div>
    `;
  }

  if (conversationContext.currentTopic) {
    profileHTML += `
      <div class="user-profile-item">
        <span class="user-profile-label">Current Topic:</span>
        <span class="user-profile-value">
          <span class="context-indicator topic">${conversationContext.currentTopic}</span>
        </span>
      </div>
    `;
  }

  if (conversationContext.mentionedProducts.length > 0) {
    profileHTML += `
      <div class="user-profile-item">
        <span class="user-profile-label">Products Discussed:</span>
        <span class="user-profile-value">
          ${conversationContext.mentionedProducts
            .slice(-3)
            .map(
              (product) =>
                `<span class="context-indicator product">${product}</span>`
            )
            .join("")}
        </span>
      </div>
    `;
  }

  profileHTML += `
    <div class="user-profile-item">
      <span class="user-profile-label">Conversations:</span>
      <span class="user-profile-value">${userProfile.conversationCount}</span>
    </div>
  `;

  if (userProfile.lastInteraction) {
    const lastDate = new Date(userProfile.lastInteraction).toLocaleDateString();
    profileHTML += `
      <div class="user-profile-item">
        <span class="user-profile-label">Last Visit:</span>
        <span class="user-profile-value">${lastDate}</span>
      </div>
    `;
  }

  userProfileDisplay.innerHTML = profileHTML;
}

// Make clear data function available globally (for privacy compliance)
window.clearUserData = clearUserData;

/**
 * Initialize when DOM is ready
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM ready, initializing with context tracking...");
  initializeApp();
});

// Backup for older browsers
window.addEventListener("load", function () {
  // Try initialization if not already done
  if (!chatForm) {
    console.log("🔄 Backup initialization with context tracking...");
    initializeApp();
  }
});

// Auto-save user data before page unload
window.addEventListener("beforeunload", function () {
  saveUserProfile();
});

console.log("✅ Enhanced script loaded with conversation context tracking");
