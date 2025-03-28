const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for Azure OpenAI configuration
let azureConfig = {
  apiKey: process.env.AZURE_OPENAI_API_KEY || '',
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
  temperature: parseFloat(process.env.AZURE_OPENAI_TEMPERATURE) || 0.7,
  topP: parseFloat(process.env.AZURE_OPENAI_TOP_P) || 1,
};

// Configuration endpoints
app.get('/api/config', (req, res) => {
  // Return masked API key for security
  const maskedConfig = {
    ...azureConfig,
    apiKey: azureConfig.apiKey ? '********' : '',
  };
  res.json(maskedConfig);
});

app.post('/api/config', (req, res) => {
  const { apiKey, endpoint, deploymentName, temperature, topP } = req.body;
  
  if (!apiKey || !endpoint || !deploymentName) {
    return res.status(400).json({ error: 'Missing required configuration fields' });
  }

  // Validate temperature and top_p
  const temp = parseFloat(temperature);
  const top = parseFloat(topP);

  if (isNaN(temp) || temp < 0 || temp > 2) {
    return res.status(400).json({ error: 'Temperature must be between 0 and 2' });
  }

  if (isNaN(top) || top < 0 || top > 1) {
    return res.status(400).json({ error: 'Top P must be between 0 and 1' });
  }

  azureConfig = { 
    apiKey, 
    endpoint, 
    deploymentName,
    temperature: temp,
    topP: top,
  };
  res.json({ message: 'Configuration updated successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    configured: Boolean(azureConfig.apiKey && azureConfig.endpoint && azureConfig.deploymentName)
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!azureConfig.apiKey || !azureConfig.endpoint || !azureConfig.deploymentName) {
      return res.status(400).json({ 
        error: 'Azure OpenAI not configured. Please configure in the admin panel.' 
      });
    }

    const client = new OpenAI({
      apiKey: azureConfig.apiKey,
      baseURL: azureConfig.endpoint,
      defaultQuery: { 'api-version': '2023-05-15' },
      defaultHeaders: { 'api-key': azureConfig.apiKey },
    });

    const completion = await client.chat.completions.create({
      model: azureConfig.deploymentName,
      messages: [{ role: 'user', content: message }],
      temperature: azureConfig.temperature,
      top_p: azureConfig.topP,
      max_tokens: 800,
    });

    const response = {
      message: completion.choices[0].message.content,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Error processing chat request',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 