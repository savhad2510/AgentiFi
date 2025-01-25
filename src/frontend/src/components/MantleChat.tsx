import React, { useState, useRef, useEffect } from 'react';
import { Settings, Wallet, Send, LineChart, X, ChevronDown } from 'lucide-react';

// Types from original codebase
interface ChatMessage {
  type: 'user' | 'agent' | 'error';
  content: string;
  timestamp: string;
  metadata?: {
    agentType?: string;
    subType?: string;
  };
}

interface QuickCommand {
  label: string;
  command: string;
  requiresAddress?: boolean;
  addressPrompt?: string;
  group?: string;
  description?: string;
}

interface SystemEvent {
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'error';
}



// Format message content with better styling
const formatMessageContent = (content: string): React.ReactNode => {
  try {
    // Try to parse the content if it's JSON
    const parsed = JSON.parse(content);
    
    // If it's in our standard API response format
    if (parsed.input && parsed.output?.[0]?.text) {
      let text = parsed.output[0].text.trim();
      
      // Check if the text contains key-value pairs we want to highlight
      if (text.includes("Public Key:") || text.includes("Address:") || text.includes("Transaction Hash:")) {
        // Split the text into lines
        const lines = text.split('\n').map((line: string): React.ReactNode => {
          // Highlight specific data points
          if (line.includes("Public Key:") || 
              line.includes("Address:") || 
              line.includes("Private Key:") ||
              line.includes("Transaction Hash:") ||
              line.includes("Precalculated Address:")) {
            const [label, value] = line.split(':').map((s: string) => s.trim());
            if (value) {
              return (
                <div key={label} className="my-2 p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">{label}:</div>
                  <div className="font-mono text-sm break-all text-blue-400">{value}</div>
                </div>
              );
            }
          }
          
          // Format numbered lists
          if (/^\d+\./.test(line)) {
            return <div key={line} className="ml-4 my-1">{line}</div>;
          }
          
          // Format bullet points
          if (line.startsWith('-')) {
            return (
              <div key={line} className="ml-4 my-1 flex items-center">
                <div className="w-1 h-1 rounded-full bg-blue-400 mr-2"></div>
                {line.slice(1).trim()}
              </div>
            );
          }
          
          // Section headers
          if (line.toLowerCase().includes('next steps:')) {
            return (
              <div key={line} className="text-blue-400 font-semibold mt-4 mb-2">
                {line}
              </div>
            );
          }
          
          // Default line formatting
          return <div key={line} className="my-1">{line}</div>;
        });
        
        return <div className="space-y-1">{lines}</div>;
      }
      
      // Return the raw text if no special formatting is needed
      return text;
    }
    
    // If it's a structured response from our API
    if (parsed.status === "success") {
      return (
        <div>
          {parsed.transaction_hash && (
            <div className="my-2 p-3 bg-gray-800/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Transaction Hash:</div>
              <a 
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-400 hover:underline break-all"
              >
                {parsed.transaction_hash}
              </a>
            </div>
          )}
          {parsed.message && (
            <div className="my-2">{parsed.message}</div>
          )}
        </div>
      );
    }
    
    // Return the original content if it doesn't match our format
    return content;
  } catch {
    // If parsing fails, return the original content
    return content;
  }
};

const MantelChat = () => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [selectedCommand, setSelectedCommand] = useState<QuickCommand | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Account');
  const [publicAddress, setPublicAddress] = useState<string>('');
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Command categories from original codebase
  const commandCategories = {
    "Account": [
      { label: "Create Argent Account", command: "Create a new Argent account" },
      { label: "Create OZ Account", command: "Create a new OpenZeppelin account" },
      { label: "Deploy Argent Account", command: "Deploy my Argent account" },
      { label: "Deploy OZ Account", command: "Deploy my OpenZeppelin account" },
      { label: "Get My Address", command: "What is my wallet address?" },
    ],
    "Balances": [
      { label: "Check ETH Balance", command: "What is my ETH balance?" },
      { label: "Check USDC Balance", command: "What is my USDC balance?" },
      { label: "Check USDT Balance", command: "What is my USDT balance?" },
      { label: "Check STRK Balance", command: "What is my STRK balance?" },
      { 
        label: "Check Other Wallet", 
        command: "Get ETH balance of {address}",
        requiresAddress: true,
        addressPrompt: "Enter the wallet address to check:"
      },
    ],
    "Transactions": [
      { label: "Swap ETH to USDC", command: "Swap 0.1 ETH for USDC" },
      { label: "Swap USDC to ETH", command: "Swap 100 USDC for ETH" },
      { 
        label: "Transfer ETH", 
        command: "Transfer 0.1 ETH to {address}",
        requiresAddress: true,
        addressPrompt: "Enter the recipient's address:"
      },
      { 
        label: "Transfer USDC", 
        command: "Transfer 100 USDC to {address}",
        requiresAddress: true,
        addressPrompt: "Enter the recipient's address:"
      },
      { 
        label: "Simulate Transfer", 
        command: "Simulate transferring 0.1 ETH to {address}",
        requiresAddress: true,
        addressPrompt: "Enter the recipient's address for simulation:"
      },
    ],
    "Network": [
      { label: "Latest Block", command: "Get the latest block number" },
      { label: "Chain ID", command: "Get the chain ID" },
      { label: "Syncing Status", command: "Check network syncing status" },
      { label: "Spec Version", command: "Get the spec version" },
    ],
    "Contract Info": [
      { 
        label: "Get Storage", 
        command: "Get storage at address {address}",
        requiresAddress: true,
        addressPrompt: "Enter the contract address:"
      },
      { 
        label: "Get Class", 
        command: "Get class at address {address}",
        requiresAddress: true,
        addressPrompt: "Enter the contract address:"
      },
      { 
        label: "Get Class Hash", 
        command: "Get class hash at address {address}",
        requiresAddress: true,
        addressPrompt: "Enter the contract address:"
      },
      { 
        label: "Get Nonce", 
        command: "Get nonce for address {address}",
        requiresAddress: true,
        addressPrompt: "Enter the address:"
      },
    ]
  };

  // Agents with their specific commands
  const agents = [
    {
      title: 'Account Guardian',
      type: 'AI Assistant',
      description: 'Specializes in account creation and management',
      image: '/assets/char1.png',
      commands: [
        { label: "Create Argent Account", command: "Create a new Argent account" },
        { label: "Create OZ Account", command: "Create a new OpenZeppelin account" },
        { label: "Deploy Argent Account", command: "Deploy my Argent account" },
        { label: "Deploy OZ Account", command: "Deploy my OpenZeppelin account" },
        { label: "Get My Address", command: "What is my wallet address?" }
      ]
    },
    {
      title: 'Token Sentinel',
      type: 'AI Assistant',
      description: 'Monitors and manages token balances and transfers',
      image: '/assets/char2.png',
      commands: [
        { label: "Check ETH Balance", command: "What is my ETH balance?" },
        { label: "Check USDC Balance", command: "What is my USDC balance?" },
        { label: "Check USDT Balance", command: "What is my USDT balance?" },
        { label: "Check STRK Balance", command: "What is my STRK balance?" },
        { 
          label: "Check Other Wallet", 
          command: "Get ETH balance of {address}",
          requiresAddress: true,
          addressPrompt: "Enter the wallet address to check:"
        }
      ]
    },
    {
      title: 'Swap Sage',
      type: 'AI Assistant',
      description: 'Expert in token swaps and DeFi operations',
      image: '/assets/char3.png',
      commands: [
        { label: "Swap ETH to USDC", command: "Swap 0.1 ETH for USDC" },
        { label: "Swap USDC to ETH", command: "Swap 100 USDC for ETH" },
        { label: "Check Swap Rate", command: "Get current ETH/USDC swap rate" },
        { label: "Estimate Swap Fees", command: "Estimate fees for swapping 0.1 ETH to USDC" }
      ]
    },
    {
      title: 'Transfer Oracle',
      type: 'AI Assistant',
      description: 'Handles secure token transfers and simulations',
      image: '/assets/char4.png',
      commands: [
        { 
          label: "Transfer ETH", 
          command: "Transfer 0.1 ETH to {address}",
          requiresAddress: true,
          addressPrompt: "Enter the recipient's address:"
        },
        { 
          label: "Transfer USDC", 
          command: "Transfer 100 USDC to {address}",
          requiresAddress: true,
          addressPrompt: "Enter the recipient's address:"
        },
        { 
          label: "Simulate Transfer", 
          command: "Simulate transferring 0.1 ETH to {address}",
          requiresAddress: true,
          addressPrompt: "Enter the recipient's address for simulation:"
        }
      ]
    },
    {
      title: 'Network Seer',
      type: 'AI Assistant',
      description: 'Provides insights into network status and metrics',
      image: '/assets/char5.png',
      commands: [
        { label: "Latest Block", command: "Get the latest block number" },
        { label: "Chain ID", command: "Get the chain ID" },
        { label: "Syncing Status", command: "Check network syncing status" },
        { label: "Spec Version", command: "Get the spec version" },
        { label: "Network Stats", command: "Get current network statistics" }
      ]
    },
    {
      title: 'Contract Sage',
      type: 'AI Assistant',
      description: 'Analyzes and interacts with smart contracts',
      image: '/assets/char6.png',
      commands: [
        { 
          label: "Get Storage", 
          command: "Get storage at address {address}",
          requiresAddress: true,
          addressPrompt: "Enter the contract address:"
        },
        { 
          label: "Get Class", 
          command: "Get class at address {address}",
          requiresAddress: true,
          addressPrompt: "Enter the contract address:"
        },
        { 
          label: "Get Class Hash", 
          command: "Get class hash at address {address}",
          requiresAddress: true,
          addressPrompt: "Enter the contract address:"
        },
        { 
          label: "Get Nonce", 
          command: "Get nonce for address {address}",
          requiresAddress: true,
          addressPrompt: "Enter the address:"
        }
      ]
    }
  ];

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setPublicAddress(process.env.NEXT_PUBLIC_PUBLIC_ADDRESS || '');

  }, [messages]);

  // Initialize system
  useEffect(() => {
    addSystemEvent('Initializing Mantel agents...', 'info');
    setTimeout(() => {
      addSystemEvent('Agents initialized successfully', 'success');
      addSystemEvent('Ready for Mantel operations', 'info');
    }, 1000);
  }, []);

  // Handle command selection
  const handleCommand = (command: QuickCommand) => {
    if (command.requiresAddress) {
      setSelectedCommand(command);
      setShowAddressPrompt(true);
    } else {
      handleSubmit(undefined, command.command);
    }
  };

  // Handle address submission
  const handleAddressSubmit = () => {
    if (selectedCommand && addressInput) {
      const finalCommand = selectedCommand.command.replace('{address}', addressInput);
      setShowAddressPrompt(false);
      setAddressInput('');
      setSelectedCommand(null);
      handleSubmit(undefined, finalCommand);
    }
  };

  // Handle message submission
  const handleSubmit = async (e?: React.FormEvent, commandOverride?: string) => {
    if (e) e.preventDefault();
    const messageToSend = commandOverride || inputMessage;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    addSystemEvent('Processing request...', 'info');

    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (!apiKey) throw new Error('API key not configured');

      const response = await fetch('/api/agent/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ request: messageToSend })
      });

      const data = await response.json();
      
      const agentMessage: ChatMessage = {
        type: 'agent',
        content: data.output?.[0]?.text || 'Error processing request',
        timestamp: new Date().toLocaleTimeString(),
        metadata: {
          agentType: 'Mantel Agent',
          subType: 'response'
        }
      };

      setMessages(prev => [...prev, agentMessage]);
      addSystemEvent('Request processed successfully', 'success');
    } catch (error) {
      const errorMessage: ChatMessage = {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      addSystemEvent('Error processing request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add system events
  const addSystemEvent = (message: string, type: 'info' | 'success' | 'error') => {
    setSystemEvents(prev => [...prev, {
      message,
      timestamp: new Date().toLocaleTimeString(),
      type
    }]);
  };

  return (
    <div className="flex h-screen bg-[#0B1120] text-gray-100">
      {/* Left Sidebar - Available Agents and Commands */}
      <div className="w-80 bg-[#0D1424] border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Available Agents</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {agents.map((agent, index) => (
            <div key={index} className="border-b border-gray-800/50">
              <button
                onClick={() => setSelectedCategory(selectedCategory === agent.title ? null : agent.title)}
                className="w-full p-4 hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative">
                    <img
                      src={agent.image}
                      alt={agent.title}
                      className="rounded-full"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{agent.title}</h3>
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform ${
                          selectedCategory === agent.title ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <p className="text-sm text-gray-400">{agent.type}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-400 text-left">{agent.description}</p>
              </button>
              
              {selectedCategory === agent.title && (
                <div className="pb-2">
                  <div className="px-4 py-2 border-y border-gray-800/50 bg-gray-900/50">
                    <h4 className="text-sm font-medium text-gray-400">Commands</h4>
                  </div>
                  {agent.commands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommand(cmd);
                      }}
                      className="w-full px-6 py-2 text-left text-sm text-gray-400 hover:text-white hover:bg-gray-800/50"
                    >
                      {cmd.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 bg-[#1E293B] text-gray-100 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-mono">
              {publicAddress 
                ? `${publicAddress.slice(0, 30)}${publicAddress.slice(-40)}`
                : 'Not Connected'}
            </span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="flex items-start gap-4">
              {message.type === 'agent' && (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0" />
              )}
              <div className={`flex-1 ${message.type === 'user' ? 'ml-auto' : ''}`}>
                {message.metadata && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{message.metadata.agentType}</span>
                    {message.metadata.subType && (
                      <>
                        <span>•</span>
                        <span>{message.metadata.subType}</span>
                      </>
                    )}
                  </div>
                )}
                <div className={`mt-1 p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-500 ml-auto' 
                    : message.type === 'error'
                    ? 'bg-red-500/20 border border-red-500/40'
                    : 'bg-gray-800/50'
                }`}>
                  {formatMessageContent(message.content)}
                </div>
                <div className="mt-1 text-sm text-gray-500">{message.timestamp}</div>
              </div>
              {message.type === 'user' && (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar - System Events */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-[#0D1424] border-l border-gray-800 overflow-y-auto">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold">System Events</h2>
        </div>
        <div className="p-4 space-y-4">
          {systemEvents.map((event, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm ${
                event.type === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : event.type === 'error'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-blue-500/10 text-blue-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{event.message}</span>
                <span className="text-xs opacity-60">{event.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address Input Modal */}
      {showAddressPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] rounded-lg p-6 max-w-md w-full border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">
                {selectedCommand?.addressPrompt}
              </h3>
              <button
                onClick={() => {
                  setShowAddressPrompt(false);
                  setAddressInput('');
                  setSelectedCommand(null);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="0x..."
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddressPrompt(false);
                  setAddressInput('');
                  setSelectedCommand(null);
                }}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddressSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={!addressInput.trim()}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MantelChat;