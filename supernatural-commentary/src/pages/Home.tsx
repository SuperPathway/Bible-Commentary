import React, { useEffect, useState } from 'react';
import { User } from '@/entities/User';
import { Commentary } from '@/entities/Commentary';
import { Material } from '@/entities/Material';
import { InvokeLLM, GenerateImage } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, BookOpen, AlertTriangle, Copy, Check, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [passage, setPassage] = useState('');
  const [commentary, setCommentary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [commentaryError, setCommentaryError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const persistedCommentary = sessionStorage.getItem('supernaturalCommentary');
      const persistedImages = sessionStorage.getItem('supernaturalImages');
      if (persistedCommentary) setCommentary(JSON.parse(persistedCommentary));
      if (persistedImages) setGeneratedImages(JSON.parse(persistedImages));
    } catch (e) {
      sessionStorage.removeItem('supernaturalCommentary');
      sessionStorage.removeItem('supernaturalImages');
    }
    loadUser();
    loadMaterials();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  };

  const loadMaterials = async () => {
    try {
      const materialData = await Material.list();
      setMaterials(materialData);
    } catch {}
  };

  const getUsageLimit = (plan: string) => ({ free: 3, basic: 20, standard: 45, pro: 110 } as any)[plan] || 0;
  const getUsagePercentage = () => (!user ? 0 : (user.usage_count / Math.max(1, getUsageLimit(user.subscription_plan))) * 100);
  const canUseService = () => !!user && user.usage_count < getUsageLimit(user.subscription_plan);

  const cleanText = (text: string) => text
    .replace(/\*{1,3}/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion || !commentary) return;
    setIsFollowUpLoading(true);
    setFollowUpAnswer('');

    const context = `Original Scripture: ${commentary.passage}`;
    const allMaterialsContent = materials.map((m) => `Title: ${m.title}\nContent: ${m.content}`).join('\n\n---\n\n');
    const followUpPrompt = `Provide a compassionate, biblically-grounded 1-2 paragraph answer.\nContext: ${context}\nQuestion: ${followUpQuestion}\nMaterials: ${allMaterialsContent}`;

    try {
      const answer = await InvokeLLM({ prompt: followUpPrompt });
      setFollowUpAnswer(answer);
    } catch (error) {
      setFollowUpAnswer("I'm sorry, I encountered an error. Please try again.");
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await User.login();
      const u = await User.me();
      setUser(u);
      return;
    }

    // Reset monthly usage for paid plans on month change
    if (user.subscription_plan !== 'free') {
      const last = user.last_activity ? new Date(user.last_activity) : null;
      const now = new Date();
      if (last && (last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear())) {
        await User.updateMyUserData({ usage_count: 0 });
        setUser((prev: any) => ({ ...prev, usage_count: 0 }));
      }
    }

    if (!canUseService()) {
      setCommentaryError('You have reached your usage limit for this period.');
      return;
    }

    setIsLoading(true);
    setIsCopied(false);
    setCommentary(null);
    setCommentaryError(null);
    setGeneratedImages([]);

    try {
      if (materials.length === 0) {
        setCommentaryError('No ministry materials available. Add some in Admin.');
        setIsLoading(false);
        return;
      }

      const allMaterialsContent = materials.map((material) => `// MATERIAL: ${material.title}\n${material.content}`).join('\n\n');

      const analysisPrompt = `You are a biblical scholar. Provide concise commentary on: "${passage}". Use tags _HEADING_ and include Greek/Hebrew with **bold**.`;
      const biblicalAnalysis = await InvokeLLM({ prompt: analysisPrompt, add_context_from_internet: true });

      const applicationPrompt = `You are an assistant for supernatural interpretation. Scripture: "${passage}". Commentary: ${biblicalAnalysis}\nMaterials: ${allMaterialsContent}\nGenerate: summary, 4 statements + expansions, prayer, and 3 paragraphs using the specified tags.`;
      const supernaturalApplication = await InvokeLLM({ prompt: applicationPrompt });

      const finalResponse = `${biblicalAnalysis}\n\n${supernaturalApplication}`;
      const newCommentary = {
        passage,
        response: finalResponse,
        user_plan: user.subscription_plan,
        module_used: 'all_materials',
        timestamp: new Date().toISOString(),
      };

      await Commentary.create(newCommentary as any);
      setCommentary(newCommentary);

      await User.updateMyUserData({ usage_count: user.usage_count + 1, last_activity: new Date().toISOString() });
      setUser((prev: any) => ({ ...prev, usage_count: prev.usage_count + 1, last_activity: new Date().toISOString() }));
      setPassage('');

      // Generate images from paragraphs
      const paragraphRegex = /_PARAGRAPH_\d*:\s*([\s\S]*?)(?=_PARAGRAPH_|_HEADING_|$)/g;
      const paragraphs = [...finalResponse.matchAll(paragraphRegex)].map((m) => m[1].trim());
      if (paragraphs.length > 0) {
        const urls = await Promise.all(
          paragraphs.slice(0, 3).map(async (p) => {
            const quotePrompt = `Extract a single powerful quote under 25 words from: "${p}"`;
            const intelligentQuote = await InvokeLLM({ prompt: quotePrompt });
            const result = await GenerateImage({ prompt: `Salvation Centre — ${intelligentQuote.trim()}` });
            return result.url;
          })
        );
        setGeneratedImages(urls.filter(Boolean) as string[]);
        sessionStorage.setItem('supernaturalCommentary', JSON.stringify(newCommentary));
        sessionStorage.setItem('supernaturalImages', JSON.stringify(urls.filter(Boolean)));
      }
    } catch (error) {
      setCommentaryError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!commentary?.response) return;
    const textToCopy = commentary.response
      .replace(/_HEADING_([^\n\r]*)/g, '\n\n--- $1 ---\n')
      .replace(/_SUPERNATURAL_SUMMARY_([^\n\r]*)/g, '\n\n--- Supernatural Commentary Summary ---\n$1\n')
      .replace(/_STATEMENT_\d*:\s*/g, '\n\nProphetic Key: ')
      .replace(/Human Struggle:\s*/g, '\nHuman Struggle: ')
      .replace(/Heart's Response:\s*/g, "\nHeart's Response: ")
      .replace(/The Heavenly Shift:\s*/g, '\nThe Heavenly Shift: ')
      .replace(/Divine Illustration:\s*/g, '\nDivine Illustration: ')
      .replace(/Supernatural Support:\s*/g, '\nSupernatural Support: ')
      .replace(/The Path to Power:\s*/g, '\nThe Path to Power: ')
      .replace(/Your Call to Victory:\s*/g, '\nYour Call to Victory: ')
      .replace(/_QUOTE_:\s*/g, '\n\nQuote: ')
      .replace(/_PRAYER_:\s*/g, '\n\n')
      .replace(/_PARAGRAPH_\d*:\s*/g, '\n\n')
      .replace(/<br\s*\/?>(?i)/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

  const formatText = (text: string) => {
    const cleanedText = cleanText(text);
    const lines = cleanedText.split('\n');
    const elements: any[] = [];
    let currentSection: any = null;
    const boldRegex = /\*\*(.*?)\*\*(\s*\(.*?\))?/g;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.match(/^[_\-]+$/) || trimmed === '') return;
      if (trimmed.startsWith('_HEADING_')) {
        currentSection = { type: 'section', title: trimmed.replace('_HEADING_', '').replace(/_/g, ' ').trim(), content: [] as string[] };
        elements.push(currentSection);
      } else if (trimmed.startsWith('_SUPERNATURAL_SUMMARY_')) {
        currentSection = null;
        elements.push({ type: 'summary', text: trimmed.replace('_SUPERNATURAL_SUMMARY_', '').trim() });
      } else if (trimmed.startsWith('_STATEMENT_')) {
        currentSection = null;
        elements.push({ type: 'statement', text: trimmed.replace(/_STATEMENT_\d*:\s*/, '').trim() });
      } else if (trimmed.startsWith('_PRAYER_:')) {
        currentSection = null;
        elements.push({ type: 'prayer', text: trimmed.replace('_PRAYER_:', '').trim() });
      } else if (trimmed.startsWith('_PARAGRAPH_')) {
        currentSection = null;
        elements.push({ type: 'paragraph', text: trimmed.replace(/_PARAGRAPH_\d*:\s*/, '').trim() });
      } else if (trimmed.startsWith('_QUOTE_')) {
        currentSection = null;
        elements.push({ type: 'quote', text: trimmed.replace('_QUOTE_:', '').trim() });
      } else {
        if (currentSection) currentSection.content.push(trimmed);
        else elements.push({ type: 'loose_paragraph', text: trimmed });
      }
    });

    return elements.map((element, index) => {
      switch (element.type) {
        case 'section':
          return (
            <div key={index} id={slugify(element.title)} className="bg-yellow-50 mb-6 px-2 py-6 rounded-lg border-2 border-yellow-200 scroll-mt-20">
              <h2 className="font-bold text-black text-2xl mb-4 border-b-2 border-gray-300 pb-2">{element.title}</h2>
              <div className="space-y-2">
                {element.content.map((p: string, pIndex: number) => (
                  <p key={pIndex} className="text-black text-justify leading-relaxed" dangerouslySetInnerHTML={{ __html: p.replace(boldRegex, '<strong class=\'font-bold text-black\'>$1$2</strong>') }} />
                ))}
              </div>
            </div>
          );
        case 'summary':
          return (
            <div key={index} id="supernatural-commentary-summary" className={`my-6 p-6 rounded-lg ${isDarkMode ? 'bg-purple-900/40 border-purple-700' : 'bg-gradient-to-r from-purple-100 to-amber-100 border-2 border-purple-300'} scroll-mt-20`}>
              <h3 className={`font-bold mb-3 text-lg ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>Supernatural Commentary Summary</h3>
              <p className={`italic font-medium leading-relaxed text-justify ${isDarkMode ? 'text-white' : 'text-purple-900'}`}>{element.text}</p>
            </div>
          );
        case 'statement':
          return <h3 key={index} className={`font-bold mt-4 mb-2 text-lg underline ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} scroll-mt-20`}><strong>Prophetic Key: {element.text}</strong></h3>;
        case 'prayer':
          return <p key={index} id="a-prophetic-prayer" className={`scroll-mt-20 italic leading-relaxed text-lg my-4 p-4 text-justify rounded-lg ${isDarkMode ? 'text-white bg-purple-900/40 border-purple-700' : 'text-black bg-purple-50 border-l-4 border-purple-400'}`}>{element.text}</p>;
        case 'paragraph':
          return <p key={index} className={`mb-4 leading-relaxed text-lg font-medium italic text-justify ${isDarkMode ? 'text-white' : 'text-black'}`}>{element.text}</p>;
        case 'quote':
          return (
            <div key={index} className={`my-4 p-4 rounded-r-lg ${isDarkMode ? 'bg-amber-900/40 border-amber-700' : 'bg-amber-50 border-l-4 border-amber-400'}`}>
              <p className={`italic font-medium text-justify ${isDarkMode ? 'text-white' : 'text-amber-800'}`}>&quot;{element.text}&quot;</p>
            </div>
          );
        case 'loose_paragraph':
          const stepHeadingRegex = /^(Human Struggle:|Heart's Response:|The Heavenly Shift:|Divine Illustration:|Supernatural Support:|The Path to Power:|Your Call to Victory:)/;
          const boldRegex2 = /\*\*(.*?)\*\*(\s*\(.*?\))?/g;
          let processedText = element.text.replace(boldRegex2, (match: string, word: string, meaning: string) => `<strong class=\'font-bold ${isDarkMode ? 'text-white' : 'text-black'}\'>${word}${meaning || ''}</strong>`);
          processedText = processedText.replace(stepHeadingRegex, `<strong class=\'font-bold ${isDarkMode ? 'text-white' : 'text-black'}\'>$1</strong>`);
          return <p key={index} className={`mb-1 leading-relaxed text-justify ${isDarkMode ? 'text-white' : 'text-black'}`} dangerouslySetInnerHTML={{ __html: processedText }} />;
        default:
          return null;
      }
    });
  };

  const commentaryHeadings = commentary ? [
    commentary.response.includes('_SUPERNATURAL_SUMMARY_') ? 'Supernatural Commentary Summary' : null,
    ...new Set((commentary.response.match(/_HEADING_([^\r\n]+)/g) || []).map((h: string) => h.replace('_HEADING_', '').replace(/_/g, ' ').trim())),
    commentary.response.includes('_PRAYER_') ? 'A Prophetic Prayer' : null,
    'Have a Follow-up Question',
  ].filter(Boolean) : [];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : ''}`}>
      <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Biblical Commentary</span>
              <br />
              <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>with Supernatural Insight</span>
            </h2>
            <p className={`${isDarkMode ? 'text-gray-200' : 'text-fuchsia-950'} mb-8 mx-auto text-lg max-w-2xl`}>Experience scripture interpretation through divine revelation based on proprietary ministry materials.</p>
            {user && (
              <div className="mb-8">
                <div className={`inline-flex items-center space-x-4 ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm rounded-full px-6 py-3 shadow-lg`}>
                  <Badge variant="secondary" className="capitalize">{user.subscription_plan} Plan</Badge>
                  {user.subscription_plan !== 'pro' && (
                    <div className="flex items-center space-x-2">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                        {Math.max(0, getUsageLimit(user.subscription_plan) - user.usage_count)} uses remaining
                      </span>
                      <Progress value={getUsagePercentage()} className="w-20 h-2" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-0 -mt-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {user && !canUseService() && (
              <Alert className={`mb-8 ${isDarkMode ? 'bg-amber-900/30 border-amber-700' : 'border-amber-200 bg-amber-50'} mx-2 sm:mx-0`}>
                <AlertTriangle className={`h-4 w-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                <AlertDescription className={`${isDarkMode ? 'text-amber-100' : 'text-amber-800'}`}>
                  You've used all your commentary requests for this period.
                  <Link to={createPageUrl('Pricing')} className="font-medium underline ml-1 text-purple-800 hover:text-purple-600">Upgrade to continue</Link>
                </AlertDescription>
              </Alert>
            )}

            {commentaryError && (
              <Alert variant="destructive" className="mb-8 mx-2 sm:mx-0">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{commentaryError}</AlertDescription>
              </Alert>
            )}

            <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'holy-glow'} mb-8 mx-2 sm:mx-0`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Request Supernatural Commentary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Textarea value={passage} onChange={(e) => setPassage(e.target.value)} placeholder="Enter a Bible verse or passage..." className={`min-h-32 text-lg border-2 ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-400' : 'border-purple-200 focus:border-purple-400'} w-full`} required />
                  <div className="flex justify-center">
                    <Button type="submit" disabled={isLoading || !canUseService()} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Worth the wait...quality is coming your way
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Get Supernatural Commentary
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {commentary && (
              <Card id="commentary-top" className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'divine-border bg-gradient-to-r from-purple-50 to-amber-50'} mb-8 mx-2 sm:mx-0`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <span className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Supernatural Biblical Commentary</span>
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsDarkMode(!isDarkMode)} className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' : 'bg-white hover:bg-gray-100 border-gray-200 text-black'}`}>
                      {isDarkMode ? 'Light' : 'Dark'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`${isDarkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border border-gray-200'} backdrop-blur-sm rounded-lg p-6 w-full`}>
                    <h4 className={`font-bold mb-3 text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Scripture Passage:</h4>
                    <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} italic text-lg leading-relaxed border-l-4 border-purple-400 pl-4`}>{commentary.passage}</p>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90'}`}>
                    <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Quick Navigation</h4>
                    <div className="flex flex-wrap gap-2">
                      {commentaryHeadings.map((heading: any) => (
                        <a key={slugify(heading as string)} href={`#${slugify(heading as string)}`} className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{heading}</a>
                      ))}
                    </div>
                  </div>

                  <div className="py-4 rounded-lg">
                    <div className="space-y-2 break-words">{formatText(commentary.response)}</div>
                  </div>

                  <div id="have-a-follow-up-question" className={`scroll-mt-20 mt-8 p-6 ${isDarkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border border-gray-200'} backdrop-blur-sm rounded-lg w-full`}>
                    <h4 className={`font-bold mb-2 text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}><MessageSquare className="w-5 h-5 mr-2 text-purple-600" />Have a Follow-up Question?</h4>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-sm`}>Ask about this passage or share a spiritual concern for a personalized insight.</p>
                    <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                      <Textarea value={followUpQuestion} onChange={(e) => setFollowUpQuestion(e.target.value)} placeholder="Type your question here..." className={`${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-400' : 'border-gray-300 focus:border-purple-400'}`} />
                      <Button type="submit" disabled={isFollowUpLoading || !followUpQuestion} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {isFollowUpLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Getting Insight...
                          </>
                        ) : (
                          'Get Insight'
                        )}
                      </Button>
                    </form>
                    {isFollowUpLoading && <div className={`${isDarkMode ? 'text-purple-300' : 'text-purple-700'} mt-4`}>Loading...</div>}
                    {followUpAnswer && (
                      <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/40 border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                        <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} leading-relaxed`}>{followUpAnswer}</p>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center justify-between mt-6 pt-4 w-full ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
                    <a href="#commentary-top" className={`text-sm ${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-600 hover:text-purple-800'} underline`}>Back to Top</a>
                    <Button variant="outline" onClick={handleCopy} className={`flex items-center space-x-2 px-6 py-2 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'}`}>
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="font-medium">Copy Commentary</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className={`text-right text-sm w-full ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Revealed on {new Date(commentary.timestamp).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedImages.length > 0 && (
              <Card className={`mt-8 mx-2 sm:mx-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Social Media Graphics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedImages.map((url, index) => (
                    <img key={index} src={url} alt={`Generated image ${index + 1}`} className="rounded-lg shadow-md w-full" />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <footer className={`${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-900 text-gray-400'} py-8 mt-16`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Supernatural Commentary. All rights reserved.</p>
          <p className="mt-2">
            <Link to={createPageUrl('Pricing')} className={`${isDarkMode ? 'text-purple-300 hover:text-purple-200' : 'text-purple-400 hover:text-purple-300'} underline`}>
              Upgrade Your Experience
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}