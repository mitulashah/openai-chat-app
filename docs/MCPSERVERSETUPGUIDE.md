# MCP Server Setup Guide

This guide provides examples and instructions for setting up different types of Model Context Protocol (MCP) servers to enhance your chat application with additional context.

## Table of Contents

- [Introduction to MCP Servers](#introduction-to-mcp-servers)
- [Prerequisites](#prerequisites)
- [Example 1: Simple Document Knowledge Base](#example-1-simple-document-knowledge-base)
- [Example 2: Database-backed MCP Server](#example-2-database-backed-mcp-server)
- [Example 3: Web Crawler MCP Server](#example-3-web-crawler-mcp-server)
- [Example 4: Personal Knowledge Graph](#example-4-personal-knowledge-graph)
- [Security Best Practices](#security-best-practices)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Introduction to MCP Servers

MCP servers act as knowledge providers that analyze conversations and return relevant contextual information. They can be integrated with various data sources including document repositories, databases, APIs, and knowledge graphs.

### Server Types

1. **Document-based**: Indexes and searches through document collections
2. **Database-backed**: Queries structured data from databases
3. **API-connected**: Retrieves information from external APIs
4. **Knowledge Graph**: Uses semantic relationships to find relevant information
5. **Hybrid**: Combines multiple data sources for comprehensive context

## Prerequisites

Before setting up an MCP server, ensure you have:

- Node.js 16.x or higher
- Basic understanding of JavaScript/TypeScript
- Access to your data sources
- Understanding of JSON-RPC or REST API concepts

## Example 1: Simple Document Knowledge Base

This example demonstrates how to create a simple MCP server that indexes and searches through a collection of documents.

### Step 1: Initialize the Project

```bash
mkdir mcp-document-server
cd mcp-document-server
npm init -y
npm install express cors body-parser axios dotenv natural
npm install --save-dev typescript ts-node @types/node @types/express
```

### Step 2: Create the Server Structure

Create the following files:

#### `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { handleJsonRpcRequest } from './jsonRpc';
import { initializeDocuments } from './documentStore';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize the document store
initializeDocuments('./documents');

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Capabilities endpoint
app.get('/capabilities', (req, res) => {
  res.json({
    resources: true,
    prompts: false,
    tools: false
  });
});

// JSON-RPC endpoint
app.post('/', async (req, res) => {
  try {
    const result = await handleJsonRpcRequest(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error handling JSON-RPC request:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
      },
      id: req.body.id || null
    });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`MCP Document Server running on port ${PORT}`);
});
```

#### `src/jsonRpc.ts`

```typescript
import { searchDocuments } from './documentStore';

export async function handleJsonRpcRequest(request) {
  // Validate JSON-RPC request
  if (request.jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
      id: request.id || null
    };
  }

  // Method handlers
  switch (request.method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        result: {
          capabilities: {
            resources: true,
            prompts: false,
            tools: false
          }
        },
        id: request.id
      };

    case 'getContext':
      return await handleGetContext(request);
      
    case 'health':
      return {
        jsonrpc: '2.0',
        result: { status: 'healthy', timestamp: new Date().toISOString() },
        id: request.id
      };
      
    case 'getCapabilities':
      return {
        jsonrpc: '2.0',
        result: {
          resources: true,
          prompts: false,
          tools: false
        },
        id: request.id
      };

    default:
      return {
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
        id: request.id
      };
  }
}

async function handleGetContext(request) {
  try {
    const { messages, parameters = {} } = request.params;
    
    // Get the last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
      
    if (!lastUserMessage || !lastUserMessage.content) {
      return {
        jsonrpc: '2.0',
        result: { context: '' },
        id: request.id
      };
    }

    // Search documents for relevant content
    const results = await searchDocuments(
      lastUserMessage.content, 
      parameters.maxResults || 3
    );
    
    // Format the results as context
    let context = '';
    if (results && results.length > 0) {
      context = `Relevant information:\n\n${results.map(r => 
        `[${r.title}]:\n${r.content}\n`
      ).join('\n')}`;
    }

    return {
      jsonrpc: '2.0',
      result: { context },
      id: request.id
    };
  } catch (error) {
    console.error('Error in getContext:', error);
    return {
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal error processing context' },
      id: request.id
    };
  }
}
```

#### `src/documentStore.ts`

```typescript
import fs from 'fs';
import path from 'path';
import natural from 'natural';

// Simple in-memory document store with TF-IDF search
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

interface Document {
  id: string;
  title: string;
  content: string;
  path: string;
}

const documents: Document[] = [];

export function initializeDocuments(documentsPath: string) {
  console.log(`Initializing document store from: ${documentsPath}`);
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(documentsPath)) {
      fs.mkdirSync(documentsPath, { recursive: true });
      console.log(`Created documents directory: ${documentsPath}`);
      
      // Create a sample document
      const sampleContent = 'This is a sample document for testing the MCP server.';
      fs.writeFileSync(path.join(documentsPath, 'sample.txt'), sampleContent);
      console.log('Created sample document');
    }
    
    // Read all .txt and .md files
    const files = fs.readdirSync(documentsPath)
      .filter(file => file.endsWith('.txt') || file.endsWith('.md'));
      
    console.log(`Found ${files.length} documents`);
    
    // Process each document
    files.forEach((file, index) => {
      const filePath = path.join(documentsPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const doc: Document = {
        id: `doc-${index}`,
        title: file,
        content: content,
        path: filePath
      };
      
      documents.push(doc);
      tfidf.addDocument(content);
      console.log(`Indexed document: ${file}`);
    });
  } catch (error) {
    console.error('Error initializing document store:', error);
  }
}

export async function searchDocuments(query: string, maxResults: number = 3): Promise<any[]> {
  console.log(`Searching for: "${query}" (max results: ${maxResults})`);
  
  if (documents.length === 0) {
    console.warn('Document store is empty');
    return [];
  }
  
  // Tokenize the query
  const queryTerms = tokenizer.tokenize(query.toLowerCase());
  
  // Calculate scores for each document
  const scores = documents.map((doc, docIndex) => {
    let score = 0;
    
    queryTerms.forEach(term => {
      tfidf.tfidfs(term, (i, measure) => {
        if (i === docIndex) {
          score += measure;
        }
      });
    });
    
    return { doc, score };
  });
  
  // Sort by score and take top results
  const results = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .filter(item => item.score > 0)
    .map(item => ({
      title: item.doc.title,
      content: item.doc.content.length > 300 
        ? `${item.doc.content.substring(0, 300)}...` 
        : item.doc.content,
      path: item.doc.path,
      score: item.score
    }));
  
  console.log(`Found ${results.length} relevant results`);
  return results;
}
```

### Step 3: Run the Server

```bash
npx ts-node src/index.ts
```

### Step 4: Configure in Chat Application

In your chat application, add this MCP server with:
- Name: "Document KB"
- URL: "http://localhost:3030"
- Authentication: None

## Example 2: Database-backed MCP Server

This example demonstrates how to create an MCP server that retrieves context from a database.

### Step 1: Initialize the Project

```bash
mkdir mcp-database-server
cd mcp-database-server
npm init -y
npm install express cors body-parser sqlite3 axios dotenv
npm install --save-dev typescript ts-node @types/node @types/express
```

### Step 2: Create the Database

```typescript
// src/database.ts
import sqlite3 from 'sqlite3';

// Initialize the database
const db = new sqlite3.Database(':memory:');

export function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Create knowledge table
      db.run(`
        CREATE TABLE IF NOT EXISTS knowledge (
          id INTEGER PRIMARY KEY,
          topic TEXT,
          content TEXT,
          keywords TEXT
        )
      `);

      // Insert sample data
      const sampleData = [
        {
          topic: 'JavaScript Promises',
          content: 'Promises in JavaScript represent the eventual completion of an asynchronous operation. They allow you to chain .then() handlers instead of nesting callbacks.',
          keywords: 'javascript,promises,async,then,catch'
        },
        {
          topic: 'React Hooks',
          content: 'Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8.',
          keywords: 'react,hooks,usestate,useeffect,functional'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO knowledge (topic, content, keywords)
        VALUES (?, ?, ?)
      `);

      sampleData.forEach(item => {
        stmt.run(item.topic, item.content, item.keywords);
      });

      stmt.finalize();
      console.log('Database initialized with sample data');
      resolve();
    });
  });
}

export function searchKnowledge(query: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const searchTerms = query.toLowerCase().split(' ');
    
    let sql = `
      SELECT topic, content 
      FROM knowledge 
      WHERE 
    `;
    
    const whereClauses = searchTerms.map(term => 
      `(LOWER(topic) LIKE ? OR LOWER(content) LIKE ? OR LOWER(keywords) LIKE ?)`
    );
    
    sql += whereClauses.join(' AND ');
    
    const params = [];
    searchTerms.forEach(term => {
      params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    });
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}
```

### Step 3: Implement the MCP Server

Implement the server similar to Example 1, but use the database for context retrieval.

## Example 3: Web Crawler MCP Server

For a web crawler MCP server that provides up-to-date information from websites, you'll need to:

1. Set up a crawler using a library like Puppeteer or Cheerio
2. Create a scheduling system to refresh the crawled content
3. Implement the MCP interface as in the previous examples

## Example 4: Personal Knowledge Graph

A knowledge graph MCP server can provide more semantic understanding by:

1. Storing entities and relationships in a graph database like Neo4j
2. Implementing entity extraction from natural language queries
3. Using graph traversal to find relevant context

## Security Best Practices

When deploying MCP servers, follow these security practices:

1. **Authentication**: Always implement proper authentication for production servers
2. **Input Validation**: Validate all incoming messages to prevent injection attacks
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Privacy**: Be cautious about what data you store and return
5. **HTTPS**: Use HTTPS for all communication with MCP servers
6. **Logging**: Implement proper logging but avoid logging sensitive content

## Performance Optimization

For better MCP server performance:

1. **Caching**: Implement a caching layer for frequent queries
2. **Indexing**: Use proper indexing for your document or database store
3. **Batching**: Process messages in batches when possible
4. **Streaming**: Consider streaming responses for large context results
5. **Vector Embeddings**: For large document collections, consider using vector embeddings and similarity search

## Troubleshooting

Common issues and solutions:

1. **High Latency**: Check network conditions, optimize query performance
2. **Irrelevant Results**: Tune your retrieval algorithm, improve tokenization
3. **Server Crashes**: Implement proper error handling, memory management
4. **Authentication Issues**: Verify credentials and token expiration
5. **Protocol Errors**: Ensure your implementation follows the MCP specification