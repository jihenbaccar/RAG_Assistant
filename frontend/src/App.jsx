import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Une erreur est survenue. Impossible de contacter le serveur.",
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="logo">R</div>

          <div>
            <h1>RAG Assistant</h1>
            <p>Votre assistant documentaire</p>
          </div>
        </div>

        <button className="new-chat" onClick={clearChat}>
          + Nouvelle conversation
        </button>
      </header>

      {/* Chat */}
      <main className="chat-container">

        {messages.length === 0 && (
          <div className="welcome">
            <div className="welcome-icon">✦</div>

            <h2>Comment puis-je vous aider ?</h2>

            <p>
              Posez une question sur le contenu de vos documents.
              Je rechercherai les informations pertinentes avant de répondre.
            </p>

            <div className="suggestions">
              <button
                onClick={() =>
                  setQuestion(
                    "Quelles sont les différentes sources d'énergies renouvelables ?"
                  )
                }
              >
                Sources d'énergies renouvelables
              </button>

              <button
                onClick={() =>
                  setQuestion("Que sont les modèles climatiques ?")
                }
              >
                Modèles climatiques
              </button>
            </div>
          </div>
        )}

        <div className="messages">
          {messages.map((message, index) => (
            <div
              className={`message-row ${message.role}`}
              key={index}
            >
              {message.role === "assistant" && (
                <div className="avatar">R</div>
              )}

              <div className="message-content">
                <div className="message-bubble">
                  {message.content}
                </div>

                {message.role === "assistant" &&
                  message.sources?.length > 0 && (
                    <div className="sources">
                      <div className="sources-title">
                        <span>📚</span>
                        Sources utilisées
                      </div>

                      {message.sources.map((source, sourceIndex) => (
                        <div
                          className="source-item"
                          key={sourceIndex}
                        >
                          <div>
                            <strong>{source.source}</strong>
                            <span>
                              Page {source.page}
                            </span>
                          </div>

                          <span className="similarity">
                            {source.similarity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="avatar">R</div>

              <div className="message-bubble loading-bubble">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question..."
            rows={1}
          />

          <button
            className="send-button"
            onClick={askQuestion}
            disabled={!question.trim() || loading}
          >
            ↑
          </button>
        </div>

        <p className="input-hint">
          Entrée pour envoyer · Shift + Entrée pour une nouvelle ligne
        </p>
      </div>

    </div>
  );
}

export default App;