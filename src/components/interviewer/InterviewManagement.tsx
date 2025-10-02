import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Save,
  X,
  BookOpen
} from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Question {
  id: string
  text: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  timeLimit: number
  expectedAnswer?: string
  points: number
}

interface InterviewTemplate {
  id: string
  name: string
  description: string
  questions: Question[]
  totalTime: number
  passingScore: number
  createdAt: Date
  lastUsed?: Date
}

export default function InterviewManagement() {
  const [activeTab, setActiveTab] = useState<'templates' | 'questions' | 'schedule'>('templates')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<InterviewTemplate | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Mock data - in production, this would come from your backend
  const [templates, setTemplates] = useState<InterviewTemplate[]>([
    {
      id: '1',
      name: 'Full Stack Developer - Senior',
      description: 'Comprehensive assessment for senior full stack positions',
      questions: [
        {
          id: 'q1',
          text: 'Explain the difference between state and props in React',
          difficulty: 'medium',
          category: 'React',
          timeLimit: 180,
          points: 15
        },
        {
          id: 'q2',
          text: 'Design a scalable microservices architecture for an e-commerce platform',
          difficulty: 'hard',
          category: 'System Design',
          timeLimit: 300,
          points: 25
        }
      ],
      totalTime: 30,
      passingScore: 70,
      createdAt: new Date(),
      lastUsed: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      id: '2',
      name: 'Junior Frontend Developer',
      description: 'Entry-level frontend assessment focusing on basics',
      questions: [
        {
          id: 'q3',
          text: 'What is the difference between let, const, and var in JavaScript?',
          difficulty: 'easy',
          category: 'JavaScript',
          timeLimit: 120,
          points: 10
        }
      ],
      totalTime: 20,
      passingScore: 60,
      createdAt: new Date(Date.now() - 604800000), // 1 week ago
    }
  ])

  const [questionBank, setQuestionBank] = useState<Question[]>([
    {
      id: 'qb1',
      text: 'Explain event delegation in JavaScript',
      difficulty: 'medium',
      category: 'JavaScript',
      timeLimit: 180,
      points: 15
    },
    {
      id: 'qb2',
      text: 'What are React hooks and how do they work?',
      difficulty: 'medium',
      category: 'React',
      timeLimit: 240,
      points: 20
    },
    {
      id: 'qb3',
      text: 'Implement a function to debounce API calls',
      difficulty: 'hard',
      category: 'JavaScript',
      timeLimit: 300,
      points: 25
    }
  ])

  const handleCreateTemplate = () => {
    const newTemplate: InterviewTemplate = {
      id: Date.now().toString(),
      name: 'New Interview Template',
      description: 'Template description',
      questions: [],
      totalTime: 30,
      passingScore: 70,
      createdAt: new Date()
    }
    setEditingTemplate(newTemplate)
    setShowCreateModal(true)
  }

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => {
        const existing = prev.find(t => t.id === editingTemplate.id)
        if (existing) {
          return prev.map(t => t.id === editingTemplate.id ? editingTemplate : t)
        } else {
          return [...prev, editingTemplate]
        }
      })
      setEditingTemplate(null)
      setShowCreateModal(false)
    }
  }

  const handleCreateQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      difficulty: 'medium',
      category: 'General',
      timeLimit: 180,
      points: 15
    }
    setEditingQuestion(newQuestion)
  }

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuestionBank(prev => {
        const existing = prev.find(q => q.id === editingQuestion.id)
        if (existing) {
          return prev.map(q => q.id === editingQuestion.id ? editingQuestion : q)
        } else {
          return [...prev, editingQuestion]
        }
      })
      setEditingQuestion(null)
    }
  }

  const addQuestionToTemplate = (questionId: string) => {
    if (editingTemplate) {
      const question = questionBank.find(q => q.id === questionId)
      if (question && !editingTemplate.questions.find(q => q.id === questionId)) {
        setEditingTemplate({
          ...editingTemplate,
          questions: [...editingTemplate.questions, { ...question, id: Date.now().toString() }]
        })
      }
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Interview Management</h2>
          <p className="text-muted-foreground">Create and manage interview templates and questions</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 border-b">
            {[
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'questions', label: 'Question Bank', icon: BookOpen },
              { id: 'schedule', label: 'Schedule', icon: Calendar }
            ].map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                className="rounded-b-none"
                onClick={() => setActiveTab(tab.id as any)}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <Badge variant="outline">
                              {template.questions.length} questions
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {template.totalTime}min
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{template.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Pass: {template.passingScore}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {template.createdAt.toLocaleDateString()}</span>
                            </div>
                            {template.lastUsed && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Last used: {template.lastUsed.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template)
                              setShowCreateModal(true)
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const copy = { ...template, id: Date.now().toString(), name: template.name + ' (Copy)' }
                              setTemplates(prev => [...prev, copy])
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTemplates(prev => prev.filter(t => t.id !== template.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Question Bank Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Question Bank</h3>
                <Button onClick={handleCreateQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {questionBank.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline">{question.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(question.timeLimit / 60)}:{(question.timeLimit % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{question.text}</p>
                            <div className="text-xs text-muted-foreground">
                              Points: {question.points}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingQuestion(question)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setQuestionBank(prev => prev.filter(q => q.id !== question.id))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Interview Scheduling</h3>
              <p className="text-muted-foreground mb-4">
                Schedule interviews and manage candidate appointments
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Template Modal */}
      <AnimatePresence>
        {showCreateModal && editingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {templates.find(t => t.id === editingTemplate.id) ? 'Edit' : 'Create'} Interview Template
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingTemplate(null)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Template Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template Name</label>
                    <Input
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Time (minutes)</label>
                    <Input
                      type="number"
                      value={editingTemplate.totalTime}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        totalTime: parseInt(e.target.value) || 0
                      })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    })}
                    placeholder="Describe what this template assesses"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTemplate.passingScore}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      passingScore: parseInt(e.target.value) || 0
                    })}
                    placeholder="70"
                  />
                </div>

                {/* Questions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Questions ({editingTemplate.questions.length})</h3>
                  </div>

                  {/* Selected Questions */}
                  <div className="space-y-3 mb-4">
                    {editingTemplate.questions.map((question, index) => (
                      <div key={question.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">Q{index + 1}</span>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.category}</Badge>
                          </div>
                          <p className="text-sm">{question.text}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate({
                            ...editingTemplate,
                            questions: editingTemplate.questions.filter(q => q.id !== question.id)
                          })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Available Questions */}
                  <div>
                    <h4 className="text-md font-medium mb-3">Add from Question Bank</h4>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {questionBank.filter(q => !editingTemplate.questions.find(tq => tq.text === q.text)).map(question => (
                        <div key={question.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge variant="outline">{question.category}</Badge>
                            </div>
                            <p className="text-xs">{question.text.substring(0, 80)}...</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addQuestionToTemplate(question.id)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingTemplate(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Question Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {questionBank.find(q => q.id === editingQuestion.id) ? 'Edit' : 'Create'} Question
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingQuestion(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Text</label>
                  <Textarea
                    value={editingQuestion.text}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion,
                      text: e.target.value
                    })}
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={editingQuestion.difficulty}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Input
                      value={editingQuestion.category}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        category: e.target.value
                      })}
                      placeholder="e.g., React, JavaScript, System Design"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Limit (seconds)</label>
                    <Input
                      type="number"
                      value={editingQuestion.timeLimit}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        timeLimit: parseInt(e.target.value) || 0
                      })}
                      placeholder="180"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Points</label>
                    <Input
                      type="number"
                      value={editingQuestion.points}
                      onChange={(e) => setEditingQuestion({
                        ...editingQuestion,
                        points: parseInt(e.target.value) || 0
                      })}
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveQuestion}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Question
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}