import { HWLAssistant } from './components/HWLAssistant'

export default function App() {
  return (
    <>
      {/* Placeholder page so the widget has something to float over */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">HWL Own Application</p>
      </div>

      <HWLAssistant
        apiUrl="http://localhost:3000/api"
        title="HWL Helpbot"
        theme={{ primaryColor: '#0066cc' }}
        placeholder="Ask me anything..."
      />
    </>
  )
}