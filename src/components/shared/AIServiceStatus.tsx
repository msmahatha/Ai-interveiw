import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Cpu, AlertCircle, CheckCircle, TestTube } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { geminiService, testGeminiConnection } from '@/services/geminiService'
import { toast } from 'sonner'

export default function AIServiceStatus() {
  const [isTesting, setIsTesting] = useState(false)
  const isConfigured = geminiService.isConfigured

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const success = await testGeminiConnection()
      if (success) {
        toast.success('✅ Gemini AI connection working perfectly!')
      } else {
        toast.error('❌ Gemini AI connection failed - check console for details')
      }
    } catch (error) {
      toast.error('❌ Connection test failed: ' + (error as Error).message)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={`border-2 ${isConfigured ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <CardTitle className="text-lg">AI Service Status</CardTitle>
            </div>
            <Badge
              variant={isConfigured ? 'default' : 'secondary'}
              className={isConfigured ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
            >
              {isConfigured ? 'Active' : 'Fallback Mode'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Bot className={`w-6 h-6 ${isConfigured ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Question Generation</div>
                <div className="text-sm text-muted-foreground">
                  {isConfigured ? 'Google Gemini AI' : 'Static Questions'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Cpu className={`w-6 h-6 ${isConfigured ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Answer Scoring</div>
                <div className="text-sm text-muted-foreground">
                  {isConfigured ? 'AI-Powered Evaluation' : 'Basic Algorithm'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            {isConfigured ? (
              <Button 
                onClick={handleTestConnection} 
                disabled={isTesting}
                variant="outline"
                size="sm"
              >
                <TestTube className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
            ) : (
              <div className="flex-1">
                <div className="p-3 bg-orange-100 rounded-lg border-l-4 border-orange-400">
                  <p className="text-sm text-orange-800">
                    <strong>Note:</strong> To enable AI-powered features, add your Google Gemini API key to the <code>.env</code> file:
                  </p>
                  <code className="block mt-2 text-xs bg-white p-2 rounded border">
                    VITE_GEMINI_API_KEY=your_api_key_here
                  </code>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}