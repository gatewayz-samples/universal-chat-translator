'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, ArrowRight } from 'lucide-react';
import { ChatMessage, UserSettings, SUPPORTED_LANGUAGES } from '@/types/chat';
import { ModelPicker } from '@/components/ModelPicker';

export default function UniversalChatTranslator() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userAInput, setUserAInput] = useState('');
  const [userBInput, setUserBInput] = useState('');
  const [isTranslatingA, setIsTranslatingA] = useState(false);
  const [isTranslatingB, setIsTranslatingB] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [languagePairs, setLanguagePairs] = useState(1);

  const [userASettings, setUserASettings] = useState<UserSettings>({
    user: 'A',
    language: 'English',
    explainMode: false,
    model: 'gpt-4o-mini',
  });

  const [userBSettings, setUserBSettings] = useState<UserSettings>({
    user: 'B',
    language: 'Spanish',
    explainMode: false,
    model: 'gpt-4o-mini',
  });

  const scrollAreaRefA = useRef<HTMLDivElement>(null);
  const scrollAreaRefB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRefA.current) {
      scrollAreaRefA.current.scrollTop = scrollAreaRefA.current.scrollHeight;
    }
    if (scrollAreaRefB.current) {
      scrollAreaRefB.current.scrollTop = scrollAreaRefB.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setTotalMessages(messages.length);
  }, [messages]);

  useEffect(() => {
    const pair = `${userASettings.language}-${userBSettings.language}`;
    setLanguagePairs(1);
  }, [userASettings.language, userBSettings.language]);

  const translateMessage = async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    explainMode: boolean,
    model: string
  ): Promise<string> => {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
        explainMode,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  };

  const handleSendMessage = async (user: 'A' | 'B') => {
    const input = user === 'A' ? userAInput : userBInput;
    const senderSettings = user === 'A' ? userASettings : userBSettings;
    const receiverSettings = user === 'A' ? userBSettings : userASettings;

    if (!input.trim()) return;

    const setIsTranslating = user === 'A' ? setIsTranslatingA : setIsTranslatingB;
    const setInput = user === 'A' ? setUserAInput : setUserBInput;

    setIsTranslating(true);

    try {
      const translatedText = await translateMessage(
        input,
        senderSettings.language,
        receiverSettings.language,
        receiverSettings.explainMode,
        senderSettings.model
      );

      const newMessage: ChatMessage = {
        id: uuidv4(),
        user,
        originalText: input,
        translatedText,
        originalLanguage: senderSettings.language,
        targetLanguage: receiverSettings.language,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to translate message. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, user: 'A' | 'B') => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(user);
    }
  };

  const getMessagesForUser = (user: 'A' | 'B'): Array<{ text: string; isSent: boolean; message: ChatMessage }> => {
    return messages.map((msg) => {
      if (msg.user === user) {
        return {
          text: msg.originalText,
          isSent: true,
          message: msg,
        };
      } else {
        return {
          text: msg.translatedText,
          isSent: false,
          message: msg,
        };
      }
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Universal Chat Translator
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Real-time translation infrastructure for seamless cross-language communication.
              Powered by intelligent model routing and AI.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="flex justify-center items-center gap-12 mt-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {totalMessages}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                messages translated
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {SUPPORTED_LANGUAGES.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                languages supported
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                {languagePairs}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                active language pair
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* User A Side */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-900 dark:text-white">
                  A
                </div>
                User A
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Settings */}
              <div className="space-y-6 mb-6">
                <div>
                  <Label htmlFor="lang-a" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Language
                  </Label>
                  <Select
                    value={userASettings.language}
                    onValueChange={(value) =>
                      setUserASettings({ ...userASettings, language: value })
                    }
                  >
                    <SelectTrigger id="lang-a" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model-a" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    AI Model
                  </Label>
                  <ModelPicker
                    selectedModel={userASettings.model}
                    onModelSelect={(modelId) =>
                      setUserASettings({ ...userASettings, model: modelId })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="explain-a" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Explain Mode
                  </Label>
                  <Switch
                    id="explain-a"
                    checked={userASettings.explainMode}
                    onCheckedChange={(checked) =>
                      setUserASettings({ ...userASettings, explainMode: checked })
                    }
                  />
                </div>
                {userASettings.explainMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Adds contextual explanations for idioms and cultural nuances
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Chat Area */}
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRefA}>
                <div className="space-y-4">
                  {getMessagesForUser('A').length === 0 ? (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-600 text-sm">
                      No messages yet. Start a conversation.
                    </div>
                  ) : (
                    getMessagesForUser('A').map(({ text, isSent, message }) => (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-3 ${
                            isSent
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{text}</p>
                          <p className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <Separator className="my-6" />

              {/* Input Area */}
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={userAInput}
                  onChange={(e) => setUserAInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'A')}
                  disabled={isTranslatingA}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage('A')}
                  disabled={isTranslatingA || !userAInput.trim()}
                  size="icon"
                  variant="default"
                >
                  {isTranslatingA ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User B Side */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-900 dark:text-white">
                  B
                </div>
                User B
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Settings */}
              <div className="space-y-6 mb-6">
                <div>
                  <Label htmlFor="lang-b" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Language
                  </Label>
                  <Select
                    value={userBSettings.language}
                    onValueChange={(value) =>
                      setUserBSettings({ ...userBSettings, language: value })
                    }
                  >
                    <SelectTrigger id="lang-b" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model-b" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    AI Model
                  </Label>
                  <ModelPicker
                    selectedModel={userBSettings.model}
                    onModelSelect={(modelId) =>
                      setUserBSettings({ ...userBSettings, model: modelId })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="explain-b" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Explain Mode
                  </Label>
                  <Switch
                    id="explain-b"
                    checked={userBSettings.explainMode}
                    onCheckedChange={(checked) =>
                      setUserBSettings({ ...userBSettings, explainMode: checked })
                    }
                  />
                </div>
                {userBSettings.explainMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Adds contextual explanations for idioms and cultural nuances
                  </p>
                )}
              </div>

              <Separator className="my-6" />

              {/* Chat Area */}
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRefB}>
                <div className="space-y-4">
                  {getMessagesForUser('B').length === 0 ? (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-600 text-sm">
                      No messages yet. Start a conversation.
                    </div>
                  ) : (
                    getMessagesForUser('B').map(({ text, isSent, message }) => (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg px-4 py-3 ${
                            isSent
                              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{text}</p>
                          <p className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <Separator className="my-6" />

              {/* Input Area */}
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={userBInput}
                  onChange={(e) => setUserBInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'B')}
                  disabled={isTranslatingB}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage('B')}
                  disabled={isTranslatingB || !userBInput.trim()}
                  size="icon"
                  variant="default"
                >
                  {isTranslatingB ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Translation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Messages are instantly translated between any language pair with AI-powered accuracy
              </p>
              <a href="#" className="text-sm text-gray-900 dark:text-white hover:underline inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Smart Model Routing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Gatewayz API automatically selects the optimal model for each language combination
              </p>
              <a href="#" className="text-sm text-gray-900 dark:text-white hover:underline inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Context-Aware Translation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Optional explain mode provides cultural context and nuance for complex phrases
              </p>
              <a href="#" className="text-sm text-gray-900 dark:text-white hover:underline inline-flex items-center gap-1">
                Learn more <ArrowRight className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Powered by Gatewayz API • Built for developers and teams
          </p>
        </div>
      </div>
    </div>
  );
}
