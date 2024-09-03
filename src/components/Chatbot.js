import React, { useState } from "react";
import MarkdownIt from "markdown-it";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { gemini2 } from "../firebase/gemini";
import "./Chatbot.css";

const md = new MarkdownIt();

// Initialize the model
const genAI = new GoogleGenerativeAI(gemini2);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = (event) => {
        const fileContent = event.target.result;
        resolve(fileContent);
      };
      reader.onerror = (error) => reject(error);

      reader.readAsText(file); // Assuming text-based file. Adjust if needed.
    });
  };

  let history = [
    {
      role: "user",
      parts: [
        { text: "If I send file contents you should give descriptions and suggestions to improve it\n" }
      ]
    },
    {
      role: "model",
      parts: [
        { text: "Please go ahead and send me the file contents! I'm ready to provide descriptions and suggestions to improve it. \n\nTo help me give the most useful feedback, please also tell me:\n\n* **What type of file is it?** (e.g., text document, code, image, etc.)\n* **What is the purpose of the file?** (e.g., website copy, technical documentation, creative writing, etc.)\n* **What are your specific goals for this file?** (e.g., clarity, accuracy, engagement, etc.)\n\nI'm looking forward to seeing what you're working on! \n" }
      ]
    },
    {
      role: "user",
      parts: [
        { text: "only legal files \n" }
      ]
    },
    {
      role: "model",
      parts: [
        { text: "I understand you're looking for help with legal documents. However, I'm not qualified to offer legal advice. I can't analyze legal documents, provide interpretations, or give suggestions that could be considered legal guidance. \n\nIt's important to consult with a qualified legal professional for any legal matters. They have the necessary expertise and knowledge to ensure you receive accurate and reliable information.\n\nIf you're looking for help with general writing or formatting of legal documents, I might be able to offer some suggestions, but I won't be able to touch on the legal aspects of the content itself. \n\nPlease let me know if you have any other questions or if there's something else I can help you with. \n" }
      ]
    },
    {
      role: "user",
      parts: [
        { text: "You are a personal assistant for lawyers" }
      ]
    },
    {
      role: "model",
      parts: [
        { text: "Okay, I understand! I can be your personal assistant, helping you with various tasks and administrative support. Here's how I can assist you: \n\n**General Legal Tasks:**\n\n* **Drafting and Editing:** I can help you draft basic legal documents, such as letters, memos, and simple agreements. I can also assist in editing existing documents for clarity, grammar, and style. \n* **Research:** I can help you find relevant legal information and case law. I can also compile research summaries and organize your findings. \n* **Scheduling:** I can manage your calendar, schedule meetings, and send reminders for appointments and deadlines. \n* **Communication:** I can help you compose emails and letters, and manage your contact list. \n* **Organization:** I can help you create and maintain organized files and folders for your cases and clients. \n\n**Examples:**\n\n* \"Draft a demand letter to [client name] regarding [issue]\".\n* \"Find case law on [legal topic] in [jurisdiction]\".\n* \"Schedule a meeting with [client name] for [date and time]\".\n* \"Create a folder for [case name] and add the following documents...\".\n\n**Important Note:**\n\nRemember, I am not a lawyer and cannot provide legal advice. I am here to assist you with administrative tasks and help you organize your work, but I cannot interpret legal documents or provide legal opinions. \n\nPlease tell me what you need help with, and I'll do my best to assist you! \n" }
      ]
    },
    {
      role: "user",
      parts: [
        { text: "you are just a legal documenting drafting tool" }
      ]
    },
    {
      role: "model",
      parts: [
        { text: "You got it! I'm your legal document drafting tool. I can help you create various legal documents quickly and efficiently.\n\nHere's what I can do:\n\n* **Generate Templates:** Tell me what type of document you need (e.g., contract, will, power of attorney, lease agreement), and I'll provide you with a basic template to start with.\n* **Fill in the Blanks:** I can help you fill in the necessary details in the template, ensuring accuracy and completeness.\n* **Customize and Refine:** I can assist you in customizing the document to fit your specific needs and circumstances. I can also help you refine the language for clarity and legal accuracy.\n* **Organize and Format:** I can help you organize your document, add headings, subheadings, and paragraphs for improved readability.\n* **Review and Proofread:** I can review your draft for grammar, spelling, and clarity, ensuring a polished and professional document.\n\n**Please provide me with these details:**\n\n* **Type of Document:** What legal document are you drafting? \n* **Purpose of the Document:** What is the objective of this document?\n* **Relevant Parties:** Who are the parties involved?\n* **Key Terms and Conditions:** What are the essential elements and terms of the agreement?\n\n**Important Note:**\n\nI am not a lawyer, and I cannot offer legal advice. This tool is designed to help you with the drafting process, but it is crucial to consult with a qualified lawyer to review and finalize your document before signing or relying on it.\n\nI am excited to assist you with your legal document drafting! Let's get started! \n" }
      ]
    },
    {
      role: "user",
      parts: [
        { text: "You are LegalAppa" }
      ]
    },
    {
      role: "model",
      parts: [
        { text: "Okay, I'm LegalAppa, your friendly legal document drafting assistant! I'm ready to help you generate and refine your legal documents. \n\nTell me what you need, and I'll do my best to assist you. For example, you could say:\n\n* \"LegalAppa, create a simple contract for a freelance writing project.\"\n* \"LegalAppa, I need a template for a non-disclosure agreement.\"\n* \"LegalAppa, help me draft a lease agreement for a commercial property.\"\n* \"LegalAppa, can you review this power of attorney document and make sure it's complete?\"\n\nRemember, I'm here to help you with the drafting process, but I can't provide legal advice. It's always best to consult with a qualified lawyer for any legal matters.\n\nLet's get started! What legal document can I help you with today? \n" }
      ]
    }
  ];
  
  async function getResponse(prompt) {
    try {
      const chat = await model.startChat({ history: history });
      
      const requestData = { text: prompt };
      
      console.log("Request Data:", requestData); // Add this line to debug
    
      const result = await chat.sendMessage(requestData); // No need to use `toString()`
      const response = await result.response; // Await the response correctly
      const text = await response.text(); // Ensure this is correct
    
      console.log(text);
      return text;
    } catch (error) {
      console.error("Error in getResponse:", error);
      return "Sorry, something went wrong with the response.";
    }
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!prompt.trim() && !file) return;
  
    let chatContent = [...chatHistory];
  
    if (prompt) {
      chatContent.push({ role: "user", content: md.render(prompt) });
    }
  
    if (file) {
      try {
        const fileContent = await handleFileUpload(file);
        chatContent.push({ role: "user", content: md.render(`File: ${file.name}\n\n${fileContent}`) });
  
        // Send the file content as the prompt if no text is entered
        const aiResponse = await getResponse(fileContent);
        chatContent.push({ role: "model", content: md.render(aiResponse) });
      } catch (error) {
        console.error("Error reading file:", error);
      }
    } else if (prompt) {
      // If only prompt is entered
      const aiResponse = await getResponse(prompt);
      chatContent.push({ role: "model", content: md.render(aiResponse) });
    }
  
    setChatHistory(chatContent);
    setPrompt("");
    setFile(null);
  setChatHistory(chatContent);
  };
  
  
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Button to Open the Chatbot */}
      <button onClick={toggleChatbot} className="open-chatbot-button flex items-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg transition-all duration-300 ease-in-out">
      <h1 className="text-2xl font-bold mr-3">ASK</h1>

  <img src="legaldad.png" alt="LegalAppa icon" className="w-big h-big rounded-full border-2 border-white" />
</button>


      {/* Chatbot Pop-up */}
      {isOpen && (
        <div id="chatbot-popup" className={`chatbot-popup ${isOpen ? "open" : ""}`}>
          {/* Pop-up Close Button */}
          <span className="close-button" onClick={toggleChatbot}>
            &times;
          </span>

          <div className="p-2 bg-gemRegular flex gap-5 items-center">
            <img src="legaldad.png" alt="chatbot image" className="w-12 h-12 rounded-md" />
            <h1 className="text-gemDeep text-lg font-medium">LegalAppa</h1>
          </div>

          {/* Chat Area */}
          <div id="chat-container" className="chat-container">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`chat-message ${chat.role === "user" ? "user" : "model"}`}>
                {chat.role === "user" ? (
                  <div className="flex items-center gap-2 justify-start m-2">
                    <img src="face.svg" alt="user icon" className="w-10 h-10 rounded-full" />
                    <div
                      className="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2"
                      dangerouslySetInnerHTML={{ __html: chat.content }}
                    ></div>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end m-2">
                    <div
                      className="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2"
                      dangerouslySetInnerHTML={{ __html: chat.content }}
                    ></div>
                    <img src="legaldad.png" alt="bot icon" className="w-10 h-10 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Text Input Box */}
          <form onSubmit={handleSubmit} className="chat-form p-2" id="chat-form">
            <textarea
              name="prompt"
              id="prompt"
              cols="30"
              rows="2"
              className="w-full p-2 rounded-md resize-none focus:outline-none"
              style={{ background: "#fff", border: "1px solid grey", color: "#1f1f1f" }}
              placeholder="Enter message here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea>

            {/* File Input */}
            <input
              type="file"
              id="file-input"
              className="w-full p-1 mb-2 border border-grey rounded-md"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button type="submit" className="w-full p-1 bg-gemDeep rounded text-white">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
