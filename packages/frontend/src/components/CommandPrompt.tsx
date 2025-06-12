import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  CommandLineIcon, 
  ArrowSmallRightIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { taskExecutor } from '../services/TaskExecutor'

interface CommandPromptProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPrompt({ isOpen, onClose }: CommandPromptProps) {
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    error: voiceError 
  } = useVoiceRecognition()

  // Update prompt with voice transcript
  useEffect(() => {
    if (transcript) {
      setPrompt(transcript)
    }
  }, [transcript])

  // Show voice recognition errors
  useEffect(() => {
    if (voiceError) {
      toast.error(voiceError)
    }
  }, [voiceError])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Escape' && isListening) {
        stopListening()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, isListening, stopListening])

  // Clean up voice recognition when closing
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening()
    }
  }, [isOpen, isListening, stopListening])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const result = await taskExecutor.executeCommand(prompt)
      if (result.success) {
        toast.success(result.message)
        setPrompt('')
        onClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to process command')
      console.error('Command processing error:', error)
    } finally {
      setIsProcessing(false)
      resetTranscript()
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-800 p-6 shadow-xl transition-all">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-4">
                    <CommandLineIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={isListening ? 'Listening...' : "Type a command or press the microphone to speak"}
                      className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg focus:outline-none"
                      autoFocus
                      disabled={isListening}
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700'
                      }`}
                    >
                      <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isProcessing}
                      className="p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowSmallRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                {isListening && (
                  <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      {transcript || 'Listening... Speak your command'}
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Example commands:
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>• "Schedule a team meeting for tomorrow at 2 PM"</p>
                    <p>• "Send an email to John about the project update"</p>
                    <p>• "Set a reminder to review documents in 2 hours"</p>
                    <p>• "Create a task to prepare presentation for next week"</p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 