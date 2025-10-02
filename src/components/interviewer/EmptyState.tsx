import { motion } from 'framer-motion'
import { FileText, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center">
        <motion.div
          className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Users className="w-12 h-12 text-blue-600" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-4">No Interviews Yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Get started by conducting your first AI-powered interview. Candidates will appear here once they complete their technical assessment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Resume Upload</h3>
            <p className="text-sm text-muted-foreground">Candidates upload their resumes for parsing</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">AI Interview</h3>
            <p className="text-sm text-muted-foreground">Automated technical questions and evaluation</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Plus className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Instant Results</h3>
            <p className="text-sm text-muted-foreground">Detailed candidate analysis and scoring</p>
          </div>
        </div>

        <Button
          size="lg"
          variant="gradient"
          onClick={() => {
            // Switch to interviewee tab
            window.location.href = '/interviewee'
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Start First Interview
        </Button>
      </div>
    </motion.div>
  )
}