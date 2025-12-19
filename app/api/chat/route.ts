import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { createOllama } from "ollama-ai-provider";
import { NextRequest } from "next/server";
import Database from "better-sqlite3";
import path from "path";

export async function POST(req: NextRequest) {
  const dbPath = path.join(process.cwd(), 'chat.db');
  const db = new Database(dbPath);
  
  try {
    const { messages, threadId, streamingMode = true, addDelay = false, currentModel = "Ollama", modelSettings } = await req.json();
    
    // Add artificial delay for testing stop button
    if (addDelay) {
      console.log('Adding 3 second delay for stop button testing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Check if thread exists, create if not
    const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(threadId) as any;
    
    if (!thread && messages.length > 0) {
      const firstUserMessage = messages.find((m: any) => m.role === "user");
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
        const now = new Date().toISOString();
        
        db.prepare('INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)')
          .run(threadId, title, now, now);
        
        // Update thread title in database
        db.prepare('UPDATE threads SET title = ? WHERE id = ?').run(title, threadId);
      }
    }

    // Save user message to database
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        const messageId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        db.prepare('INSERT INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(messageId, threadId, 'user', lastMessage.content, now);
      }
    }

    // Get model based on selected provider
    let model;
    let response;
    
    if (currentModel === "OpenAI") {
      // Check if OpenAI settings are configured
      if (!modelSettings?.openai?.apiKey || modelSettings.openai.apiKey.trim() === '') {
        return new Response(JSON.stringify({
          error: 'OpenAI API key not configured',
          message: 'Чтобы использовать OpenAI, нужно настроить API ключ. Зайдите в настройки (иконка шестеренки) и введите ваш OpenAI API ключ.',
          needsConfiguration: true
        }), { status: 400 });
      }
      
      // Use OpenAI
      const openaiModel = openai(modelSettings.openai.model || 'gpt-4');
      const result = await streamText({
        model: openaiModel,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content
        })),
        system: "You are a helpful assistant. Respond in the language of the user's message.",
      });
      
      // Get the response text for database storage
      const assistantContent = await result.text;
      
      // Save assistant response to database
      const messageId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      db.prepare('INSERT INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(messageId, threadId, 'assistant', assistantContent, now);
      
      // Update thread timestamp
      db.prepare('UPDATE threads SET updated_at = ? WHERE id = ?').run(now, threadId);
      
      if (streamingMode) {
        return result.toDataStreamResponse();
      } else {
        return new Response(JSON.stringify({
          role: 'assistant',
          content: assistantContent
        }));
      }
      
    } else {
      // Default to Ollama
      const ollamaUrl = modelSettings?.ollama?.url || 'http://localhost:11434';
      const ollamaModel = modelSettings?.ollama?.model || 'llama2:7b';
      
      console.log('Using Ollama:', { ollamaUrl, ollamaModel, currentModel });
      
      // Use direct HTTP request to Ollama
      const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: messages.map((m: any) => `${m.role}: ${m.content}`).join('\n'),
          stream: false
        }),
        signal: req.signal
      });
      
      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`);
      }
      
      const ollamaData = await ollamaResponse.json();
      
      // Save assistant response to database
      const messageId = crypto.randomUUID();
      const now = new Date().toISOString();
      
      db.prepare('INSERT INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(messageId, threadId, 'assistant', ollamaData.response, now);
      
      // Update thread timestamp
      db.prepare('UPDATE threads SET updated_at = ? WHERE id = ?').run(now, threadId);
      
      // Ollama doesn't support true streaming, so always return non-streaming response
      // for better UX without visual artifacts
      return new Response(JSON.stringify({
        role: 'assistant',
        content: ollamaData.response
      }));
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Произошла ошибка при обработке запроса'
    }), { status: 500 });
  }
}
