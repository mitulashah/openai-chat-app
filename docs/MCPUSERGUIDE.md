# Model Context Protocol (MCP) User Guide

## What is the Model Context Protocol?

The Model Context Protocol (MCP) is a feature that enhances your chat experience by providing additional, relevant context to your conversations with AI models. Instead of relying solely on the conversation history, MCP allows external servers to provide supplementary information that helps the AI generate more accurate, useful, and contextually relevant responses.

## Benefits of Using MCP

- **Enhanced Knowledge**: Access information beyond what the AI model was trained on
- **Up-to-date Information**: Connect to servers that have current data
- **Domain-Specific Knowledge**: Integrate specialized knowledge bases tailored to your needs
- **Personalized Context**: Connect to servers that understand your specific environment or requirements

## How MCP Works

1. When you send a message in the chat, your app connects to configured MCP servers
2. These servers analyze your conversation and provide relevant context
3. This additional context is sent along with your message to the AI model
4. The AI uses both your conversation history and the MCP-provided context to generate a response

## Managing MCP Servers

### Accessing MCP Configuration

1. Click on the settings icon in the chat interface
2. Select "Model Context Protocol" from the settings menu
3. The MCP Configuration panel will open, showing your currently configured servers

### Adding an MCP Server

1. In the MCP Configuration panel, scroll to the "Add New Server" section
2. Enter the server details:
   - **Name**: A friendly name for the server (e.g., "Company Knowledge Base")
   - **URL**: The server's endpoint URL (e.g., "https://mcp.example.com")
   - **Authentication**: Select the authentication method (None, API Key, Bearer Token, or Basic Auth)
3. Click "Add Server"
4. The server will be added to your list and automatically tested for connectivity

### Managing Existing Servers

- **Enable/Disable**: Toggle the switch next to a server to enable or disable it
- **Check Health**: Click the "Check Health" button to test the server's connectivity
- **Edit**: Click the edit icon to modify server settings
- **Remove**: Click the trash icon to remove a server from your configuration

### Checking Server Capabilities

1. Switch to the "Capabilities" tab in the MCP Configuration panel
2. The table shows all configured servers and their capabilities
3. Each capability indicates what kind of context the server can provide

## Troubleshooting

### Common Issues

- **Server Not Responding**: Check that the URL is correct and the server is online
- **Authentication Failed**: Verify your authentication credentials are correct
- **Context Not Relevant**: The server may not have information relevant to your queries

### Health Check Status

- **Healthy**: The server is responding correctly
- **Unhealthy**: The server is not responding or is returning errors

## Privacy Considerations

- Your conversation context is sent to the MCP servers you configure
- Only use MCP servers you trust with your conversation data
- Review the privacy policy of any third-party MCP service before connecting

## Feedback and Support

If you encounter issues with the MCP feature or have suggestions for improvements, please contact support or file an issue in the project repository.