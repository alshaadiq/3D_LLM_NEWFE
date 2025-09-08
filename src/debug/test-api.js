// Debug helper for testing API functionality
// Copy and paste this into the browser console at http://localhost:3000

// Test function to create a chat and send a message
async function testChatFlow() {
  console.log('🧪 Testing chat flow...')
  
  try {
    // Basic health check
    console.log('1. Testing health endpoint...')
    const response = await fetch('http://localhost:8000/health')
    const health = await response.json()
    console.log('✅ Health check:', health)
    
    // Test authentication
    console.log('2. Testing authentication...')
    const authResponse = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        remember_me: false
      })
    })
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.statusText}`)
    }
    
    const authData = await authResponse.json()
    console.log('✅ Authentication successful:', authData.user.username)
    
    const token = authData.token
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    // Test chat creation
    console.log('3. Creating new chat...')
    const chatResponse = await fetch('http://localhost:8000/chats', {
      method: 'POST',
      headers: authHeaders
    })
    
    if (!chatResponse.ok) {
      throw new Error(`Chat creation failed: ${chatResponse.statusText}`)
    }
    
    const chatData = await chatResponse.json()
    console.log('✅ Chat created:', chatData.id)
    
    // Test sending a message
    console.log('4. Sending test message...')
    const messageResponse = await fetch(`http://localhost:8000/chats/${chatData.id}/messages/user`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        message: 'Hello! This is a test message from the frontend.',
        mode: 'agent'
      })
    })
    
    if (!messageResponse.ok) {
      throw new Error(`Message failed: ${messageResponse.statusText}`)
    }
    
    const messageData = await messageResponse.json()
    console.log('✅ Message sent:', messageData)
    
    // Test listing chats
    console.log('5. Testing chat list...')
    const listResponse = await fetch('http://localhost:8000/chats', {
      method: 'GET',
      headers: authHeaders
    })
    
    if (!listResponse.ok) {
      throw new Error(`List chats failed: ${listResponse.statusText}`)
    }
    
    const chats = await listResponse.json()
    console.log('✅ Chat list:', chats)
    
    console.log('🎉 All tests passed! The backend is working correctly.')
    return {
      success: true,
      chatId: chatData.id,
      token: token
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Simple UI test function
async function testUI() {
  console.log('🖱️ Testing UI...')
  
  try {
    // Try to send a message through the chat interface
    const chatInput = document.querySelector('input[placeholder*="message"]') || 
                     document.querySelector('input[placeholder*="thinking"]')
    
    if (!chatInput) {
      console.log('❓ Chat input not found - you might not be on the chat interface')
      return false
    }
    
    console.log('✅ Found chat input field')
    
    // Simulate typing a message
    chatInput.value = 'Hello from the test script!'
    chatInput.dispatchEvent(new Event('input', { bubbles: true }))
    
    // Try to find and click send button
    const sendButton = document.querySelector('button[class*="send"]') ||
                      document.querySelector('button:has(svg)')
    
    if (sendButton) {
      console.log('✅ Found send button, you can click it to test')
      console.log('💡 Or press Enter in the input field')
    } else {
      console.log('❓ Send button not found')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ UI test failed:', error)
    return false
  }
}

// Run the tests
console.log('🚀 Starting API test...')
console.log('You can also run:')
console.log('  - testChatFlow() to test backend API')
console.log('  - testUI() to test frontend interface')
testChatFlow().then(() => {
  console.log('🖱️ Now testing UI...')
  testUI()
})
