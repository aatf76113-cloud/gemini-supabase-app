export interface CatalogNodeItem {
  id: string;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: 
    | 'AI & LLM'
    | 'Messaging & Chat'
    | 'Email & Productivity'
    | 'E-Commerce & Payments'
    | 'Social Media'
    | 'Databases & Storage'
    | 'Developer Tools'
    | 'Sales & CRM';
  nodeType: 'trigger' | 'action' | 'condition' | 'ai';
  icon: string;
  brandColor: string;
  gradient: string;
  requiredSecretKey?: string;
  configFields: {
    key: string;
    label: string;
    labelAr: string;
    type: 'text' | 'textarea' | 'select' | 'secret' | 'number' | 'toggle';
    placeholder?: string;
    defaultValue?: any;
    options?: { label: string; labelAr: string; value: string }[];
  }[];
}

export const CATALOG_NODES: CatalogNodeItem[] = [
  {
    id: 'node-computer-use',
    key: 'computer_use',
    name: 'Computer Use & Browser Automation',
    nameAr: 'محرك التحكم بالحاسوب والأتمتة',
    description: 'Autonomous browser navigation, visual AI grounding, table extraction, form auto-filling, and sensitive action guardrails.',
    descriptionAr: 'تصفح المتصفح التلقائي، الرؤية البصرية، استخراج الجداول، تعبئة النماذج، وحارس الموافقة البشرية.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Monitor',
    brandColor: '#0EA5E9',
    gradient: 'from-sky-600 to-indigo-600',
    requiredSecretKey: 'GEMINI_API_KEY',
    configFields: [
      { key: 'targetUrl', label: 'Target URL', labelAr: 'رابط الموقع المستهدف', type: 'text', placeholder: 'https://example.com' },
      { key: 'goal', label: 'Automation Goal', labelAr: 'الهدف التلقائي', type: 'textarea', placeholder: 'Extract catalog table and export CSV' },
      { key: 'requireApproval', label: 'Require Human Approval on Sensitive Actions', labelAr: 'اشتراط الموافقة البشرية على العمليات الحساسة', type: 'toggle', defaultValue: true }
    ]
  },
  // 1. AI & LLMs (12 Nodes)
  {
    id: 'node-gemini',
    key: 'gemini',
    name: 'Google Gemini 2.0',
    nameAr: 'نموذج جيميناي Gemini 2.0',
    description: 'High-speed multimodal AI for reasoning, summary, extraction, and automated content generation.',
    descriptionAr: 'نموذج ذكاء اصطناعي متعدد الوسائط فائق السرعة للتحليل والتخصيص وتوليد المحتوى.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Sparkles',
    brandColor: '#4285F4',
    gradient: 'from-blue-600 to-indigo-600',
    requiredSecretKey: 'GEMINI_API_KEY',
    configFields: [
      { key: 'prompt', label: 'Prompt Template', labelAr: 'قالب الأمر (Prompt)', type: 'textarea', placeholder: 'Analyze input: {{ $trigger.payload }}' },
      { key: 'model', label: 'Model Version', labelAr: 'إصدار النموذج', type: 'select', defaultValue: 'gemini-2.0-flash', options: [{ label: 'Gemini 2.0 Flash', labelAr: 'جيميناي 2.0 فلاش', value: 'gemini-2.0-flash' }, { label: 'Gemini 2.0 Pro', labelAr: 'جيميناي 2.0 برو', value: 'gemini-2.0-pro' }] }
    ]
  },
  {
    id: 'node-openai',
    key: 'openai',
    name: 'OpenAI GPT-4o',
    nameAr: 'نموذج OpenAI GPT-4o',
    description: 'Advanced language model by OpenAI for complex reasoning and structured JSON output.',
    descriptionAr: 'نموذج لغوي متقدم من OpenAI للمنطق المعقد وإخراج بيانات محددة.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Bot',
    brandColor: '#10A37F',
    gradient: 'from-emerald-600 to-teal-700',
    requiredSecretKey: 'OPENAI_API_KEY',
    configFields: [
      { key: 'prompt', label: 'System & User Prompt', labelAr: 'الأمر البرمجي', type: 'textarea', placeholder: 'Extract lead entities...' },
      { key: 'model', label: 'Model', labelAr: 'النموذج', type: 'select', defaultValue: 'gpt-4o', options: [{ label: 'GPT-4o', labelAr: 'جي بي تي 4o', value: 'gpt-4o' }, { label: 'GPT-4o-mini', labelAr: 'جي بي تي 4o ميني', value: 'gpt-4o-mini' }] }
    ]
  },
  {
    id: 'node-claude',
    key: 'claude',
    name: 'Anthropic Claude 3.5',
    nameAr: 'كلود Anthropic Claude 3.5',
    description: 'Claude Sonnet for long-context understanding, legal review, and precise coding.',
    descriptionAr: 'نموذج كلود لتحليل النصوص الطويلة والمراجعات الدقيقة.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Brain',
    brandColor: '#D97706',
    gradient: 'from-amber-600 to-orange-700',
    requiredSecretKey: 'ANTHROPIC_API_KEY',
    configFields: [
      { key: 'prompt', label: 'Prompt', labelAr: 'التعليمات', type: 'textarea', placeholder: 'Summarize report...' }
    ]
  },
  {
    id: 'node-deepseek',
    key: 'deepseek',
    name: 'DeepSeek R1 / V3',
    nameAr: 'نموذج ديب سيك DeepSeek',
    description: 'DeepSeek open-reasoning model for complex math, code, and logical workflows.',
    descriptionAr: 'نموذج ديب سيك البرمجي للاستنتاج التحليلي والبرمجة المعقدة.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Cpu',
    brandColor: '#2563EB',
    gradient: 'from-blue-700 to-cyan-600',
    requiredSecretKey: 'DEEPSEEK_API_KEY',
    configFields: [
      { key: 'prompt', label: 'Prompt', labelAr: 'التعليمات البرمجية', type: 'textarea', placeholder: 'Solve logic...' }
    ]
  },
  {
    id: 'node-perplexity',
    key: 'perplexity',
    name: 'Perplexity AI Search',
    nameAr: 'بحث بيربليكسيتي Perplexity AI',
    description: 'Real-time live web search and citations grounded AI model.',
    descriptionAr: 'بحث ذكي مباشر في الويب مع توثيق المصادر الفوري.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Globe',
    brandColor: '#0EA5E9',
    gradient: 'from-cyan-600 to-blue-700',
    requiredSecretKey: 'PERPLEXITY_API_KEY',
    configFields: [
      { key: 'query', label: 'Search Query', labelAr: 'استعلام البحث المباشر', type: 'text', placeholder: 'Search company news for {{ $trigger.company }}' }
    ]
  },
  {
    id: 'node-mistral',
    key: 'mistral',
    name: 'Mistral AI Large',
    nameAr: 'نموذج ميسترال Mistral AI',
    description: 'European open-weights LLM for fast reasoning and translation.',
    descriptionAr: 'نموذج ذكاء اصطناعي سريع وموثوق للترجمة والاستنتاج.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Zap',
    brandColor: '#F97316',
    gradient: 'from-orange-500 to-red-600',
    requiredSecretKey: 'MISTRAL_API_KEY',
    configFields: [
      { key: 'prompt', label: 'Prompt', labelAr: 'الأمر', type: 'textarea' }
    ]
  },
  {
    id: 'node-elevenlabs',
    key: 'elevenlabs',
    name: 'ElevenLabs Voice AI',
    nameAr: 'صوت إيليفن لابس ElevenLabs',
    description: 'Generate hyper-realistic AI voice overs and audio messages in Arabic & English.',
    descriptionAr: 'توليد بصمات صوتية طبيعية للغاية باللغتين العربية والإنجليزية.',
    category: 'AI & LLM',
    nodeType: 'action',
    icon: 'Mic',
    brandColor: '#7C3AED',
    gradient: 'from-purple-600 to-pink-600',
    requiredSecretKey: 'ELEVENLABS_API_KEY',
    configFields: [
      { key: 'text', label: 'Speech Text', labelAr: 'النص المراد تحويله لصوت', type: 'textarea' },
      { key: 'voiceId', label: 'Voice ID', labelAr: 'معرف الصوت', type: 'text', defaultValue: 'arabic-male-1' }
    ]
  },
  {
    id: 'node-whisper',
    key: 'whisper',
    name: 'Whisper Audio Transcribe',
    nameAr: 'تحويل الصوت لنص Whisper',
    description: 'Transcribe WhatsApp audio messages and calls into clean text.',
    descriptionAr: 'تفريغ المكالمات والرسائل الصوتية في الواتساب إلى نص مكتوب.',
    category: 'AI & LLM',
    nodeType: 'action',
    icon: 'FileAudio',
    brandColor: '#059669',
    gradient: 'from-emerald-600 to-teal-800',
    requiredSecretKey: 'OPENAI_API_KEY',
    configFields: [
      { key: 'audioUrl', label: 'Audio File URL', labelAr: 'رابط ملف الصوت', type: 'text' }
    ]
  },
  {
    id: 'node-replicate',
    key: 'replicate',
    name: 'Replicate Model API',
    nameAr: 'منصة Replicate للذكاء الاصطناعي',
    description: 'Run open-source vision, audio, and image generation models via API.',
    descriptionAr: 'تشغيل نماذج تحويل الصور والفيديو مفتوحة المصدر.',
    category: 'AI & LLM',
    nodeType: 'action',
    icon: 'Layers',
    brandColor: '#000000',
    gradient: 'from-slate-800 to-slate-950',
    requiredSecretKey: 'REPLICATE_API_KEY',
    configFields: [
      { key: 'model', label: 'Model Path', labelAr: 'مسار النموذج', type: 'text', placeholder: 'black-forest-labs/flux-schnell' }
    ]
  },
  {
    id: 'node-huggingface',
    key: 'huggingface',
    name: 'Hugging Face Inference',
    nameAr: 'نماذج Hugging Face',
    description: 'Access thousands of specialized AI models for sentiment, vision, and NLP.',
    descriptionAr: 'الوصول لآلاف النماذج المتخصصة في تحليل المشاعر والرؤية الحاسوبية.',
    category: 'AI & LLM',
    nodeType: 'action',
    icon: 'Smile',
    brandColor: '#FFD21E',
    gradient: 'from-amber-500 to-yellow-600',
    requiredSecretKey: 'HF_API_KEY',
    configFields: [
      { key: 'endpoint', label: 'Inference Endpoint', labelAr: 'رابط الاستدعاء', type: 'text' }
    ]
  },
  {
    id: 'node-midjourney',
    key: 'midjourney',
    name: 'Midjourney Image Generator',
    nameAr: 'توليد الصور Midjourney',
    description: 'Generate marketing graphics and realistic images automatically.',
    descriptionAr: 'توليد صور وإعلانات تسويقية فائقة الدقة أوتوماتيكياً.',
    category: 'AI & LLM',
    nodeType: 'action',
    icon: 'Image',
    brandColor: '#1E1B4B',
    gradient: 'from-indigo-900 to-purple-900',
    requiredSecretKey: 'MIDJOURNEY_API_KEY',
    configFields: [
      { key: 'prompt', label: 'Visual Prompt', labelAr: 'الوصف البصري للصورة', type: 'textarea' }
    ]
  },
  {
    id: 'node-groq',
    key: 'groq',
    name: 'Groq LPU Fast Inference',
    nameAr: 'معالج Groq فائقة السرعة',
    description: 'Sub-second LLM responses powered by Groq LPU hardware.',
    descriptionAr: 'استجابة فائقة السرعة للنماذج اللغوية في أجزاء من الثانية.',
    category: 'AI & LLM',
    nodeType: 'ai',
    icon: 'Zap',
    brandColor: '#F43F5E',
    gradient: 'from-rose-600 to-pink-700',
    requiredSecretKey: 'GROQ_API_KEY',
    configFields: [
      { key: 'prompt', label: 'Prompt', labelAr: 'الأمر', type: 'textarea' }
    ]
  },

  // 2. Messaging & Chat (12 Nodes)
  {
    id: 'node-whatsapp',
    key: 'whatsapp',
    name: 'WhatsApp Business API',
    nameAr: 'واتساب الأعمال WhatsApp Business',
    description: 'Trigger on incoming WhatsApp messages or dispatch template notifications.',
    descriptionAr: 'استقبال الرسائل الواردة وإرسال قوالب التنبيهات المباشرة للعملاء.',
    category: 'Messaging & Chat',
    nodeType: 'trigger',
    icon: 'MessageSquare',
    brandColor: '#25D366',
    gradient: 'from-emerald-500 to-teal-600',
    requiredSecretKey: 'WHATSAPP_TOKEN',
    configFields: [
      { key: 'recipient', label: 'Phone Number', labelAr: 'رقم المستلم الدولية', type: 'text', placeholder: '+966500000000' },
      { key: 'message', label: 'Message Body', labelAr: 'نص الرسالة', type: 'textarea' }
    ]
  },
  {
    id: 'node-telegram',
    key: 'telegram',
    name: 'Telegram Bot API',
    nameAr: 'بوت تليجرام Telegram Bot',
    description: 'Send channel broadcasts, group alerts, or handle interactive bot inline buttons.',
    descriptionAr: 'إرسال تنبيهات المجموعات والقنوات وإدارة البوت التفاعلي.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Send',
    brandColor: '#229ED9',
    gradient: 'from-sky-500 to-blue-600',
    requiredSecretKey: 'TELEGRAM_BOT_TOKEN',
    configFields: [
      { key: 'chatId', label: 'Chat ID / Channel @', labelAr: 'معرف القناة أو المحادثة', type: 'text' },
      { key: 'text', label: 'Message Text', labelAr: 'نص الرسالة', type: 'textarea' }
    ]
  },
  {
    id: 'node-discord',
    key: 'discord',
    name: 'Discord Webhook Bot',
    nameAr: 'ديسكورد Discord Webhook',
    description: 'Post rich embed messages into Discord text channels.',
    descriptionAr: 'إرسال بطاقات منسقة وتنبيهات في قنوات ديسكورد.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'MessageCircle',
    brandColor: '#5865F2',
    gradient: 'from-indigo-600 to-blue-700',
    requiredSecretKey: 'DISCORD_WEBHOOK_URL',
    configFields: [
      { key: 'webhookUrl', label: 'Discord Webhook URL', labelAr: 'رابط ديسكورد الويب هوك', type: 'secret' },
      { key: 'content', label: 'Message Content', labelAr: 'محتوى الرسالة', type: 'textarea' }
    ]
  },
  {
    id: 'node-slack',
    key: 'slack',
    name: 'Slack Automation',
    nameAr: 'سلاك Slack',
    description: 'Post messages to channels, send DMs, or manage team status.',
    descriptionAr: 'إرسال التنبيهات لقنوات فرق العمل ورسائلSlack المباشرة.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Slack',
    brandColor: '#4A154B',
    gradient: 'from-purple-800 to-indigo-900',
    requiredSecretKey: 'SLACK_BOT_TOKEN',
    configFields: [
      { key: 'channel', label: 'Channel Name', labelAr: 'اسم القناة (#sales)', type: 'text' },
      { key: 'text', label: 'Message Text', labelAr: 'محتوى التنبيه', type: 'textarea' }
    ]
  },
  {
    id: 'node-twilio',
    key: 'twilio',
    name: 'Twilio SMS & Voice',
    nameAr: 'رسائل Twilio SMS والمكالمات',
    description: 'Send international SMS, OTP codes, and automated voice IVR calls.',
    descriptionAr: 'إرسال الرسائل النصية القصيرة وكود التحقق والمكالمات الآلية.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'PhoneCall',
    brandColor: '#F22F46',
    gradient: 'from-red-600 to-rose-700',
    requiredSecretKey: 'TWILIO_AUTH_TOKEN',
    configFields: [
      { key: 'to', label: 'To Phone Number', labelAr: 'رقم هاتف المستلم', type: 'text' },
      { key: 'body', label: 'SMS Body', labelAr: 'نص الرسالة القصيرة', type: 'textarea' }
    ]
  },
  {
    id: 'node-line',
    key: 'line',
    name: 'LINE Messaging API',
    nameAr: 'منصة LINE Messaging',
    description: 'Connect with East-Asian customers via LINE Official Accounts.',
    descriptionAr: 'التواصل الفعال مع العملاء عبر حسابات LINE الرسمية.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'MessageSquare',
    brandColor: '#00C300',
    gradient: 'from-green-500 to-emerald-600',
    configFields: [{ key: 'message', label: 'Message', labelAr: 'الرسالة', type: 'textarea' }]
  },
  {
    id: 'node-messenger',
    key: 'messenger',
    name: 'Facebook Messenger',
    nameAr: 'ماسينجر Facebook Messenger',
    description: 'Auto-reply to customer Facebook Page DMs with AI responses.',
    descriptionAr: 'الرد التلقائي الذكي على رسائل صفحات الفيس بوك.',
    category: 'Messaging & Chat',
    nodeType: 'trigger',
    icon: 'MessageCircle',
    brandColor: '#0084FF',
    gradient: 'from-blue-600 to-cyan-600',
    configFields: [{ key: 'pageId', label: 'Facebook Page ID', labelAr: 'معرف صفحة الفيسبوك', type: 'text' }]
  },
  {
    id: 'node-viber',
    key: 'viber',
    name: 'Viber Business Bot',
    nameAr: 'فايبر Viber Business',
    description: 'Send promotional Viber messages with visual action buttons.',
    descriptionAr: 'إرسال الرسائل الترويجية وأزرار التفاعل عبر تطبيق فايبر.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Phone',
    brandColor: '#7360F2',
    gradient: 'from-purple-600 to-indigo-700',
    configFields: [{ key: 'receiver', label: 'Receiver ID', labelAr: 'معرف المستلم', type: 'text' }]
  },
  {
    id: 'node-mattermost',
    key: 'mattermost',
    name: 'Mattermost Self-Hosted Chat',
    nameAr: 'ماتر موست Mattermost',
    description: 'Self-hosted secure team chat notifications for enterprise environments.',
    descriptionAr: 'تنبيهات الدردشة الآمنة الخاصة بالمؤسسات الكبرى.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Shield',
    brandColor: '#0058CC',
    gradient: 'from-blue-700 to-indigo-800',
    configFields: [{ key: 'channelId', label: 'Channel ID', labelAr: 'معرف القناة', type: 'text' }]
  },
  {
    id: 'node-msteams',
    key: 'msteams',
    name: 'Microsoft Teams Bot',
    nameAr: 'مايكروسوفت تيمز MS Teams',
    description: 'Send Adaptive Cards and updates to Microsoft Teams channels.',
    descriptionAr: 'إرسال البطاقات التفاعلية والتحديثات لقنوات Microsoft Teams.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Users',
    brandColor: '#6264A7',
    gradient: 'from-indigo-600 to-purple-800',
    configFields: [{ key: 'webhook', label: 'Teams Webhook URL', labelAr: 'رابط ويب هوك Teams', type: 'secret' }]
  },
  {
    id: 'node-intercom-chat',
    key: 'intercom-chat',
    name: 'Intercom Inbox Bot',
    nameAr: 'إنتركوم Intercom Chat',
    description: 'Auto assign inbound customer chat tickets to specialists.',
    descriptionAr: 'توجيه محادثات العملاء وتعيين التذاكر تلقائياً في إنتركوم.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Headphones',
    brandColor: '#1F8CEB',
    gradient: 'from-blue-500 to-cyan-700',
    configFields: [{ key: 'adminId', label: 'Assignee Admin ID', labelAr: 'معرف المسؤول', type: 'text' }]
  },
  {
    id: 'node-pushover',
    key: 'pushover',
    name: 'Pushover Instant Push',
    nameAr: 'تنبيهات Pushover للجوال',
    description: 'Emergency instant push notifications to mobile devices.',
    descriptionAr: 'تنبيهات فورية عالية الأولوية لشاشات الهاتف المحمول.',
    category: 'Messaging & Chat',
    nodeType: 'action',
    icon: 'Bell',
    brandColor: '#286289',
    gradient: 'from-sky-700 to-slate-900',
    configFields: [{ key: 'userKey', label: 'User Key', labelAr: 'مفتاح المستخدم', type: 'text' }]
  },

  // 3. Email & Productivity (14 Nodes)
  {
    id: 'node-gmail',
    key: 'gmail',
    name: 'Gmail Suite',
    nameAr: 'جيميل Gmail',
    description: 'Send emails, read new inbox threads, search messages, or manage attachments.',
    descriptionAr: 'إرسال وقراءة واستخراج البريد الإلكتروني والمرفقات من Gmail.',
    category: 'Email & Productivity',
    nodeType: 'trigger',
    icon: 'Mail',
    brandColor: '#EA4335',
    gradient: 'from-red-500 to-rose-600',
    requiredSecretKey: 'GMAIL_OAUTH_TOKEN',
    configFields: [
      { key: 'to', label: 'To Email Address', labelAr: 'عنوان البريد المرسل إليه', type: 'text' },
      { key: 'subject', label: 'Email Subject', labelAr: 'عنوان الرسالة', type: 'text' },
      { key: 'body', label: 'HTML Body Content', labelAr: 'محتوى البريد (HTML)', type: 'textarea' }
    ]
  },
  {
    id: 'node-outlook',
    key: 'outlook',
    name: 'Microsoft Outlook 365',
    nameAr: 'أوتلوك Outlook 365',
    description: 'Manage corporate Office 365 emails, drafts, and calendar invites.',
    descriptionAr: 'إدارة بريد أوتلوك للشركات ومواعيد التقويم.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Mail',
    brandColor: '#0078D4',
    gradient: 'from-blue-600 to-indigo-700',
    requiredSecretKey: 'MICROSOFT_OAUTH_TOKEN',
    configFields: [
      { key: 'to', label: 'Recipient Email', labelAr: 'البريد الإلكتروني', type: 'text' },
      { key: 'subject', label: 'Subject', labelAr: 'الموضوع', type: 'text' }
    ]
  },
  {
    id: 'node-gsheets',
    key: 'gsheets',
    name: 'Google Sheets',
    nameAr: 'جداول بيانات Google Sheets',
    description: 'Append new rows, update values, lookup records, or clear ranges automatically.',
    descriptionAr: 'إضافة صفوف، تحديث قيم، واستعلام البيانات في جداول جوجل.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'FileSpreadsheet',
    brandColor: '#0F9D58',
    gradient: 'from-emerald-600 to-green-700',
    requiredSecretKey: 'GOOGLE_SHEETS_CREDENTIALS',
    configFields: [
      { key: 'spreadsheetId', label: 'Spreadsheet ID / URL', labelAr: 'معرف الجدول / رابط Google Sheets', type: 'text' },
      { key: 'sheetName', label: 'Sheet Name', labelAr: 'اسم الورقة (Sheet1)', type: 'text', defaultValue: 'Sheet1' },
      { key: 'values', label: 'Row Values (JSON Array)', labelAr: 'بيانات الصف (مصفوفة JSON)', type: 'textarea' }
    ]
  },
  {
    id: 'node-gdrive',
    key: 'gdrive',
    name: 'Google Drive',
    nameAr: 'جوجل درايف Google Drive',
    description: 'Upload files, create shared folders, set public permissions, or sync docs.',
    descriptionAr: 'رفع الملفات وإنشاء مجلدات المشاركة وإدارتها في Google Drive.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Folder',
    brandColor: '#FFBA00',
    gradient: 'from-amber-500 to-yellow-600',
    configFields: [
      { key: 'folderId', label: 'Folder ID', labelAr: 'معرف المجلد', type: 'text' },
      { key: 'fileName', label: 'File Name', labelAr: 'اسم الملف', type: 'text' }
    ]
  },
  {
    id: 'node-gcalendar',
    key: 'gcalendar',
    name: 'Google Calendar',
    nameAr: 'تقويم Google Calendar',
    description: 'Create events, schedule AI meetings, send invitations, and detect conflicts.',
    descriptionAr: 'جدولة المواعيد والاجتماعات التلقائية وإرسال الدعوات.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Calendar',
    brandColor: '#4285F4',
    gradient: 'from-blue-600 to-cyan-600',
    configFields: [
      { key: 'title', label: 'Event Summary', labelAr: 'عنوان الاجتماع', type: 'text' },
      { key: 'startTime', label: 'Start Time (ISO)', labelAr: 'وقت البداية', type: 'text' }
    ]
  },
  {
    id: 'node-notion',
    key: 'notion',
    name: 'Notion Workspace',
    nameAr: 'نوشن Notion DB',
    description: 'Create database pages, query Notion tables, append blocks and docs.',
    descriptionAr: 'إضافة صفحات وتحديث قواعد بيانات نوشن Notion تلقائياً.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'FileText',
    brandColor: '#000000',
    gradient: 'from-slate-900 to-slate-950',
    requiredSecretKey: 'NOTION_API_KEY',
    configFields: [
      { key: 'databaseId', label: 'Database ID', labelAr: 'معرف قاعدة بيانات نوشن', type: 'text' },
      { key: 'properties', label: 'Page Properties (JSON)', labelAr: 'خصائص الصفحة (JSON)', type: 'textarea' }
    ]
  },
  {
    id: 'node-airtable',
    key: 'airtable',
    name: 'Airtable Relational DB',
    nameAr: 'إيرتايبل Airtable',
    description: 'Perform CRUD operations on Airtable bases, views, and attachments.',
    descriptionAr: 'إضافة وسحب السجلات من قواعد بيانات إيرتايبل.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Database',
    brandColor: '#18BFFF',
    gradient: 'from-cyan-500 to-blue-600',
    requiredSecretKey: 'AIRTABLE_PAT',
    configFields: [
      { key: 'baseId', label: 'Base ID', labelAr: 'معرف الـ Base', type: 'text' },
      { key: 'tableName', label: 'Table Name', labelAr: 'اسم الجدول', type: 'text' }
    ]
  },
  {
    id: 'node-coda',
    key: 'coda',
    name: 'Coda Doc Automation',
    nameAr: 'كودا Coda',
    description: 'Sync docs, push rows into Coda interactive documents.',
    descriptionAr: 'مزامنة المستندات وإدخال البيانات في مستندات Coda.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'BookOpen',
    brandColor: '#F36052',
    gradient: 'from-rose-500 to-red-600',
    configFields: [{ key: 'docId', label: 'Doc ID', labelAr: 'معرف المستند', type: 'text' }]
  },
  {
    id: 'node-asana',
    key: 'asana',
    name: 'Asana Project Tasks',
    nameAr: 'أسانا Asana',
    description: 'Create project tasks, update task assignees, and move kanban sections.',
    descriptionAr: 'إنشاء المهام وتعيين المسؤولين ومتابعة المشاريع في Asana.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'CheckSquare',
    brandColor: '#FC636B',
    gradient: 'from-rose-500 to-orange-600',
    configFields: [{ key: 'taskName', label: 'Task Name', labelAr: 'اسم المهمة', type: 'text' }]
  },
  {
    id: 'node-trello',
    key: 'trello',
    name: 'Trello Board Cards',
    nameAr: 'تريلو Trello',
    description: 'Add cards to lists, attach files, assign members, move lists.',
    descriptionAr: 'إضافة بطاقات جديدة في لوحات تريلو ونقلها بين المراحل.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Trello',
    brandColor: '#0079BF',
    gradient: 'from-blue-600 to-indigo-700',
    configFields: [{ key: 'listId', label: 'List ID', labelAr: 'معرف القائمة', type: 'text' }]
  },
  {
    id: 'node-clickup',
    key: 'clickup',
    name: 'ClickUp Workspace',
    nameAr: 'كليك أب ClickUp',
    description: 'Manage tasks, track work hours, update task statuses and subtasks.',
    descriptionAr: 'إدارة المهام وتتبع ساعات العمل وحالات المشاريع في ClickUp.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'CheckCircle',
    brandColor: '#7B68EE',
    gradient: 'from-purple-600 to-indigo-600',
    configFields: [{ key: 'listId', label: 'List ID', labelAr: 'معرف القائمة', type: 'text' }]
  },
  {
    id: 'node-jira',
    key: 'jira',
    name: 'Atlassian Jira Software',
    nameAr: 'جيرا Jira',
    description: 'Log software issues, sprint tickets, track bug lifecycles.',
    descriptionAr: 'تسجيل التذاكر المشاكل البرمجية وتتبع دورة حياة البق الجيرا.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Sliders',
    brandColor: '#0052CC',
    gradient: 'from-blue-700 to-indigo-900',
    configFields: [{ key: 'projectKey', label: 'Project Key', labelAr: 'رمز المشروع', type: 'text' }]
  },
  {
    id: 'node-zendesk',
    key: 'zendesk',
    name: 'Zendesk Service Desk',
    nameAr: 'زين ديسك Zendesk',
    description: 'Create customer support tickets and dispatch automated satisfaction surveys.',
    descriptionAr: 'إنشاء تذاكر الدعم الفني وتحديث استبيانات تقييم الخدمة.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'HelpCircle',
    brandColor: '#03363D',
    gradient: 'from-teal-800 to-slate-900',
    configFields: [{ key: 'subject', label: 'Ticket Subject', labelAr: 'عنوان التذكرة', type: 'text' }]
  },
  {
    id: 'node-smtp',
    key: 'smtp',
    name: 'Custom SMTP / IMAP',
    nameAr: 'خادم بريد خادمي SMTP',
    description: 'Send custom SMTP emails using company custom domain email servers.',
    descriptionAr: 'إرسال البريد عبر الخوادم الخاصة للشركة بدون قيود.',
    category: 'Email & Productivity',
    nodeType: 'action',
    icon: 'Server',
    brandColor: '#475569',
    gradient: 'from-slate-600 to-slate-800',
    configFields: [{ key: 'host', label: 'SMTP Host', labelAr: 'عنوان خادم SMTP', type: 'text' }]
  },

  // 4. E-Commerce & Payments (12 Nodes)
  {
    id: 'node-stripe',
    key: 'stripe',
    name: 'Stripe Payments',
    nameAr: 'بوابة الدفع Stripe',
    description: 'Handle payment success webhooks, create invoices, process refunds, and manage subscriptions.',
    descriptionAr: 'معالجة أحداث الدفع، إنشاء الفواتير، وإدارة الاشتراكات الشهرية.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'CreditCard',
    brandColor: '#635BFF',
    gradient: 'from-indigo-600 to-purple-600',
    requiredSecretKey: 'STRIPE_SECRET_KEY',
    configFields: [
      { key: 'event', label: 'Stripe Webhook Event', labelAr: 'حدث Stripe', type: 'select', defaultValue: 'payment_intent.succeeded', options: [{ label: 'payment_intent.succeeded', labelAr: 'نجاح الدفع', value: 'payment_intent.succeeded' }, { label: 'customer.subscription.created', labelAr: 'اشتراك جديد', value: 'customer.subscription.created' }] }
    ]
  },
  {
    id: 'node-paypal',
    key: 'paypal',
    name: 'PayPal Commerce',
    nameAr: 'بايبال PayPal',
    description: 'Verify instant payment notifications (IPN) and execute refund orders.',
    descriptionAr: 'التحقق من المدفوعات الفورية وتنفيذ عمليات إعادة الأموال.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'DollarSign',
    brandColor: '#003087',
    gradient: 'from-blue-700 to-indigo-900',
    requiredSecretKey: 'PAYPAL_CLIENT_SECRET',
    configFields: [{ key: 'mode', label: 'Mode', labelAr: 'الوضع', type: 'select', defaultValue: 'live', options: [{ label: 'Live', labelAr: 'المباشر', value: 'live' }, { label: 'Sandbox', labelAr: 'التجريبي', value: 'sandbox' }] }]
  },
  {
    id: 'node-shopify',
    key: 'shopify',
    name: 'Shopify Store',
    nameAr: 'متجر شوبيفاي Shopify',
    description: 'Listen to new Shopify orders, sync inventory stock, update customer tags.',
    descriptionAr: 'استقبال الطلبات الجديدة ومزامنة المخزون وتحديث بيانات المشترين.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'ShoppingBag',
    brandColor: '#96BF48',
    gradient: 'from-lime-600 to-emerald-700',
    requiredSecretKey: 'SHOPIFY_ADMIN_TOKEN',
    configFields: [
      { key: 'storeUrl', label: 'Shopify Store URL', labelAr: 'رابط متجر شوبيفاي', type: 'text', placeholder: 'my-store.myshopify.com' }
    ]
  },
  {
    id: 'node-woocommerce',
    key: 'woocommerce',
    name: 'WooCommerce REST API',
    nameAr: 'ووكومرس WooCommerce',
    description: 'Connect WordPress WooCommerce stores to auto fulfill orders and notify customers.',
    descriptionAr: 'ربط متاجر الووردبريس لتنفيذ الطلبات وتنبيه المشترين تلقائياً.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'ShoppingCart',
    brandColor: '#96588A',
    gradient: 'from-purple-700 to-pink-800',
    requiredSecretKey: 'WOOCOMMERCE_SECRET',
    configFields: [{ key: 'url', label: 'WordPress Site URL', labelAr: 'رابط موقع الووردبريس', type: 'text' }]
  },
  {
    id: 'node-lemonsqueezy',
    key: 'lemonsqueezy',
    name: 'Lemon Squeezy Digital',
    nameAr: 'ليمون سكويزي Lemon Squeezy',
    description: 'SaaS and digital product checkout automation, license keys delivery.',
    descriptionAr: 'أتمتة مبيعات المنتجات الرقمية والبرمجيات وإرسال مفاتيح الترخيص.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'Zap',
    brandColor: '#FFC233',
    gradient: 'from-yellow-500 to-amber-600',
    configFields: [{ key: 'storeId', label: 'Store ID', labelAr: 'معرف المتجر', type: 'text' }]
  },
  {
    id: 'node-paddle',
    key: 'paddle',
    name: 'Paddle Global Billing',
    nameAr: 'باديل Paddle Billing',
    description: 'Handle global VAT tax billing and SaaS recurring subscriptions.',
    descriptionAr: 'إدارة الفواتير والضرائب الدولية والاشتراكات الدورية.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'CreditCard',
    brandColor: '#121212',
    gradient: 'from-slate-800 to-slate-950',
    configFields: [{ key: 'vendorId', label: 'Vendor ID', labelAr: 'معرف البائع', type: 'text' }]
  },
  {
    id: 'node-square',
    key: 'square',
    name: 'Square POS & Online',
    nameAr: 'سكوير Square Payments',
    description: 'Sync in-person point of sale transactions with cloud ERP.',
    descriptionAr: 'مزامنة مبيعات أجهزة POS المباشرة مع الأنظمة السحابية.',
    category: 'E-Commerce & Payments',
    nodeType: 'action',
    icon: 'Box',
    brandColor: '#000000',
    gradient: 'from-slate-900 to-blue-950',
    configFields: [{ key: 'locationId', label: 'Location ID', labelAr: 'معرف الفرع', type: 'text' }]
  },
  {
    id: 'node-mercadopago',
    key: 'mercadopago',
    name: 'Mercado Pago LatAm',
    nameAr: 'ميركادو باغو Mercado Pago',
    description: 'Latin American payment gateways integration for digital commerce.',
    descriptionAr: 'تكامل بوابات الدفع لأمريكا اللاتينية.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'Globe',
    brandColor: '#009EE3',
    gradient: 'from-cyan-500 to-blue-600',
    configFields: [{ key: 'publicKey', label: 'Public Key', labelAr: 'المفتاح العام', type: 'text' }]
  },
  {
    id: 'node-bigcommerce',
    key: 'bigcommerce',
    name: 'BigCommerce Platform',
    nameAr: 'بيج كومرس BigCommerce',
    description: 'Automate enterprise ecommerce inventory and order processing.',
    descriptionAr: 'أتمتة المخزون ومعالجة الطلبات في متاجر BigCommerce.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'ShoppingBag',
    brandColor: '#121118',
    gradient: 'from-slate-900 to-indigo-950',
    configFields: [{ key: 'hash', label: 'Store Hash', labelAr: 'رمز المتجر الفريد', type: 'text' }]
  },
  {
    id: 'node-magento',
    key: 'magento',
    name: 'Adobe Commerce (Magento)',
    nameAr: 'ماجينتو Magento',
    description: 'Enterprise Magento 2 REST API catalog sync and B2B orders.',
    descriptionAr: 'مزامنة الكتالوج والطلبات للشركات عبر ماجينتو 2.',
    category: 'E-Commerce & Payments',
    nodeType: 'action',
    icon: 'Layers',
    brandColor: '#EE672F',
    gradient: 'from-orange-600 to-red-700',
    configFields: [{ key: 'baseUrl', label: 'Magento URL', labelAr: 'رابط خادم ماجينتو', type: 'text' }]
  },
  {
    id: 'node-tap',
    key: 'tap',
    name: 'Tap Payments GCC',
    nameAr: 'تاب جيتواي Tap Payments',
    description: 'GCC KNET, Benefit, Mada, and Apple Pay payment triggers.',
    descriptionAr: 'استقبال مدفوعات مدى وKNET وبنفت وأبل باي بالخليج.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'CreditCard',
    brandColor: '#2B3137',
    gradient: 'from-slate-800 to-teal-900',
    requiredSecretKey: 'TAP_SECRET_KEY',
    configFields: [{ key: 'chargeId', label: 'Charge ID', labelAr: 'معرف عملية الدفع', type: 'text' }]
  },
  {
    id: 'node-moyasar',
    key: 'moyasar',
    name: 'Moyasar Saudi Payments',
    nameAr: 'ميسر Moyasar السعودية',
    description: 'Saudi Mada, Visa, Mastercard payment webhook integration.',
    descriptionAr: 'تكامل بوابة الدفع ميسر بالسعودية لبطاقات مدى وفيزا.',
    category: 'E-Commerce & Payments',
    nodeType: 'trigger',
    icon: 'ShieldCheck',
    brandColor: '#1F82C4',
    gradient: 'from-blue-600 to-emerald-700',
    requiredSecretKey: 'MOYASAR_API_KEY',
    configFields: [{ key: 'invoiceId', label: 'Invoice ID', labelAr: 'رقم الفاتورة', type: 'text' }]
  },

  // 5. Social Media & Video (12 Nodes)
  {
    id: 'node-facebook',
    key: 'facebook',
    name: 'Facebook Pages & Lead Ads',
    nameAr: 'فيسبوك Facebook Leads',
    description: 'Capture lead form submissions directly from Facebook Ads in real time.',
    descriptionAr: 'سحب بيانات المشترين المهتمين فور تعبئة نماذج إعلانات الفيسبوك.',
    category: 'Social Media',
    nodeType: 'trigger',
    icon: 'Facebook',
    brandColor: '#1877F2',
    gradient: 'from-blue-600 to-indigo-600',
    requiredSecretKey: 'FACEBOOK_ACCESS_TOKEN',
    configFields: [
      { key: 'pageId', label: 'Page ID', labelAr: 'معرف الصفحة', type: 'text' },
      { key: 'formId', label: 'Lead Form ID', labelAr: 'معرف نموذج الإعلان', type: 'text' }
    ]
  },
  {
    id: 'node-instagram',
    key: 'instagram',
    name: 'Instagram Graph API',
    nameAr: 'إنستغرام Instagram',
    description: 'Auto reply to comment mentions, story replies, or post carousel updates.',
    descriptionAr: 'الرد التلقائي على التعليقات والمنشورات ورسائل الاستوري.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'Instagram',
    brandColor: '#E4405F',
    gradient: 'from-pink-600 via-rose-500 to-amber-500',
    requiredSecretKey: 'INSTAGRAM_ACCESS_TOKEN',
    configFields: [{ key: 'mediaId', label: 'Media ID', labelAr: 'معرف منشور إنستغرام', type: 'text' }]
  },
  {
    id: 'node-linkedin',
    key: 'linkedin',
    name: 'LinkedIn Company Page',
    nameAr: 'لينكد إن LinkedIn',
    description: 'Publish B2B company status updates, articles, and track profile analytics.',
    descriptionAr: 'نشر التحديثات المهنية والمقالات على صفحات الشركات في لينكد إن.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'Linkedin',
    brandColor: '#0A66C2',
    gradient: 'from-blue-700 to-indigo-800',
    requiredSecretKey: 'LINKEDIN_TOKEN',
    configFields: [{ key: 'postText', label: 'Post Text', labelAr: 'نص المنشور', type: 'textarea' }]
  },
  {
    id: 'node-x',
    key: 'x',
    name: 'X (Twitter) v2 API',
    nameAr: 'منصة إكس X (تويتر)',
    description: 'Post tweets, monitor hashtag mentions, DM auto responders.',
    descriptionAr: 'نشر التغريدات، تتبع الهشتاجات، والرد الآلي في الخاص.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'Twitter',
    brandColor: '#000000',
    gradient: 'from-slate-800 to-slate-950',
    requiredSecretKey: 'TWITTER_BEARER_TOKEN',
    configFields: [{ key: 'text', label: 'Tweet Content', labelAr: 'محتوى التغريدة', type: 'textarea' }]
  },
  {
    id: 'node-tiktok',
    key: 'tiktok',
    name: 'TikTok for Business',
    nameAr: 'تيك توك TikTok Ads',
    description: 'Capture TikTok lead generation ads and sync creator video metrics.',
    descriptionAr: 'استقبال إعلانات جلب العملاء وتحليلات فيديوهات تيك توك.',
    category: 'Social Media',
    nodeType: 'trigger',
    icon: 'Video',
    brandColor: '#000000',
    gradient: 'from-slate-900 via-red-950 to-cyan-900',
    configFields: [{ key: 'advertiserId', label: 'Advertiser ID', labelAr: 'معرف المعلن', type: 'text' }]
  },
  {
    id: 'node-youtube',
    key: 'youtube',
    name: 'YouTube Data API',
    nameAr: 'يوتيوب YouTube API',
    description: 'Trigger on new channel video uploads, read comments, update video titles.',
    descriptionAr: 'التفاعل مع الفيديوهات الجديدة في القناة والتعليقات تلقائياً.',
    category: 'Social Media',
    nodeType: 'trigger',
    icon: 'Youtube',
    brandColor: '#FF0000',
    gradient: 'from-red-600 to-rose-700',
    requiredSecretKey: 'YOUTUBE_API_KEY',
    configFields: [{ key: 'channelId', label: 'Channel ID', labelAr: 'معرف القناة', type: 'text' }]
  },
  {
    id: 'node-pinterest',
    key: 'pinterest',
    name: 'Pinterest Board API',
    nameAr: 'بينتريست Pinterest',
    description: 'Auto create pins and visual boards for product visual marketing.',
    descriptionAr: 'إنشاء دبوس Pin تلقائي في لوحات بينتريست البصرية.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'Image',
    brandColor: '#BD081C',
    gradient: 'from-red-700 to-rose-800',
    configFields: [{ key: 'boardId', label: 'Board ID', labelAr: 'معرف اللوحة', type: 'text' }]
  },
  {
    id: 'node-reddit',
    key: 'reddit',
    name: 'Reddit API Bot',
    nameAr: 'ريديت Reddit Bot',
    description: 'Monitor subreddit keyword discussions and publish community posts.',
    descriptionAr: 'مراقبة الكلمات المفتاحية ونشر المنشورات في مجتمعات ريديت.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'MessageSquare',
    brandColor: '#FF4500',
    gradient: 'from-orange-600 to-red-600',
    configFields: [{ key: 'subreddit', label: 'Subreddit Name', labelAr: 'اسم المجتمَع (r/tech)', type: 'text' }]
  },
  {
    id: 'node-twitch',
    key: 'twitch',
    name: 'Twitch EventSub API',
    nameAr: 'تويتش Twitch',
    description: 'Listen to live stream status, channel followers, chat commands.',
    descriptionAr: 'التفاعل مع البث المباشر والمتابعين والمحاثات المباشرة.',
    category: 'Social Media',
    nodeType: 'trigger',
    icon: 'Tv',
    brandColor: '#9146FF',
    gradient: 'from-purple-600 to-indigo-700',
    configFields: [{ key: 'broadcasterId', label: 'Broadcaster ID', labelAr: 'معرف القناة', type: 'text' }]
  },
  {
    id: 'node-threads',
    key: 'threads',
    name: 'Meta Threads API',
    nameAr: 'ثريدز Threads Meta',
    description: 'Post text updates and media posts to Meta Threads platform.',
    descriptionAr: 'نشر التدوينات النصية على منصة ثريدز التابعة لـ Meta.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'AtSign',
    brandColor: '#000000',
    gradient: 'from-slate-900 to-slate-950',
    configFields: [{ key: 'text', label: 'Post Content', labelAr: 'محتوى التدوينة', type: 'textarea' }]
  },
  {
    id: 'node-snapchat',
    key: 'snapchat',
    name: 'Snapchat Marketing',
    nameAr: 'سناب شات Snapchat Ads',
    description: 'Receive lead gen form responses from Snapchat ad campaigns.',
    descriptionAr: 'سحب ردود العملاء من حملات إعلانات سناب شات.',
    category: 'Social Media',
    nodeType: 'trigger',
    icon: 'Camera',
    brandColor: '#FFFC00',
    gradient: 'from-yellow-400 to-amber-500',
    configFields: [{ key: 'campaignId', label: 'Campaign ID', labelAr: 'معرف الحملة', type: 'text' }]
  },
  {
    id: 'node-vimeo',
    key: 'vimeo',
    name: 'Vimeo Pro Video',
    nameAr: 'فيميو Vimeo Video',
    description: 'Upload video content, set privacy controls, sync video transcribers.',
    descriptionAr: 'رفع مقاطع الفيديو وضبط الخصوصية والمزامنة التلقائية.',
    category: 'Social Media',
    nodeType: 'action',
    icon: 'Play',
    brandColor: '#1AB7EA',
    gradient: 'from-cyan-500 to-blue-600',
    configFields: [{ key: 'videoTitle', label: 'Video Title', labelAr: 'عنوان الفيديو', type: 'text' }]
  },

  // 6. Databases & Storage (12 Nodes)
  {
    id: 'node-postgres',
    key: 'postgres',
    name: 'PostgreSQL Cloud DB',
    nameAr: 'قاعدة بيانات PostgreSQL',
    description: 'Execute SQL queries, insert records, call stored procedures, streaming CDC events.',
    descriptionAr: 'تنفيذ استعلامات SQL، إدراج السجلات، واستدعاء الدوال المخزنة.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Database',
    brandColor: '#336791',
    gradient: 'from-blue-700 to-cyan-800',
    requiredSecretKey: 'DATABASE_URL',
    configFields: [
      { key: 'sqlQuery', label: 'SQL Statement', labelAr: 'جملة استعلام SQL', type: 'textarea', placeholder: 'SELECT * FROM users WHERE email = {{ $trigger.email }}' }
    ]
  },
  {
    id: 'node-mysql',
    key: 'mysql',
    name: 'MySQL Database',
    nameAr: 'قاعدة بيانات MySQL',
    description: 'Connect to relational MySQL / MariaDB databases for data operations.',
    descriptionAr: 'الربط المباشر مع قواعد بيانات MySQL لتنفيذ الأوامر.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Database',
    brandColor: '#00758F',
    gradient: 'from-cyan-700 to-blue-800',
    requiredSecretKey: 'MYSQL_CONNECTION_STRING',
    configFields: [{ key: 'query', label: 'SQL Query', labelAr: 'استعلام SQL', type: 'textarea' }]
  },
  {
    id: 'node-mongodb',
    key: 'mongodb',
    name: 'MongoDB Atlas',
    nameAr: 'مونجو دي بي MongoDB Atlas',
    description: 'NoSQL document database insertOne, find, aggregate pipeline operations.',
    descriptionAr: 'إدارة المستندات وتجميع البيانات في NoSQL MongoDB.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Server',
    brandColor: '#47A248',
    gradient: 'from-emerald-600 to-green-700',
    requiredSecretKey: 'MONGODB_URI',
    configFields: [
      { key: 'collection', label: 'Collection Name', labelAr: 'اسم المجموعة (Collection)', type: 'text' },
      { key: 'document', label: 'JSON Document', labelAr: 'مستند JSON', type: 'textarea' }
    ]
  },
  {
    id: 'node-redis',
    key: 'redis',
    name: 'Redis Cache & Queue',
    nameAr: 'خادم ريديس Redis Cache',
    description: 'In-memory KV caching, rate limiting, and pub/sub message queues.',
    descriptionAr: 'التخزين المؤقت في الذاكرة وإدارة طوابير المهام السريعة.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Cpu',
    brandColor: '#DC382D',
    gradient: 'from-red-600 to-rose-700',
    requiredSecretKey: 'REDIS_URL',
    configFields: [{ key: 'key', label: 'Cache Key', labelAr: 'مفتاح الكاش', type: 'text' }]
  },
  {
    id: 'node-supabase',
    key: 'supabase',
    name: 'Supabase Postgres & Auth',
    nameAr: 'سوبابيز Supabase',
    description: 'Instant Postgres, Row Level Security, Storage Buckets and Realtime listeners.',
    descriptionAr: 'قاعدة بيانات سوبابيز الفورية وإدارة المستخدمين والتخزين.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Zap',
    brandColor: '#3ECF8E',
    gradient: 'from-emerald-500 to-teal-700',
    requiredSecretKey: 'SUPABASE_SERVICE_ROLE_KEY',
    configFields: [
      { key: 'table', label: 'Table Name', labelAr: 'اسم الجدول', type: 'text' },
      { key: 'action', label: 'Action', labelAr: 'الإجراء', type: 'select', defaultValue: 'insert', options: [{ label: 'Insert', labelAr: 'إدراج', value: 'insert' }, { label: 'Select', labelAr: 'استعلام', value: 'select' }] }
    ]
  },
  {
    id: 'node-firebase',
    key: 'firebase',
    name: 'Google Cloud Firestore',
    nameAr: 'فايبربيس Cloud Firestore',
    description: 'Realtime Firestore document updates, collection triggers, and Auth events.',
    descriptionAr: 'مزامنة السجلات الحية في قواعد بيانات Firestore.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Database',
    brandColor: '#FFCA28',
    gradient: 'from-amber-500 to-orange-600',
    configFields: [
      { key: 'collection', label: 'Collection Path', labelAr: 'مسار المجموعة (Collection)', type: 'text', defaultValue: 'workflows' },
      { key: 'docData', label: 'Document Fields (JSON)', labelAr: 'بيانات المستند (JSON)', type: 'textarea' }
    ]
  },
  {
    id: 'node-s3',
    key: 's3',
    name: 'AWS S3 Bucket Storage',
    nameAr: 'أمازون S3 Storage',
    description: 'Store static assets, files, documents and generate pre-signed download URLs.',
    descriptionAr: 'تخزين الملفات والمستندات في خوادم أمازون S3 وتوليد الروابط.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'HardDrive',
    brandColor: '#FF9900',
    gradient: 'from-amber-600 to-orange-700',
    requiredSecretKey: 'AWS_SECRET_ACCESS_KEY',
    configFields: [{ key: 'bucket', label: 'Bucket Name', labelAr: 'اسم الـ Bucket', type: 'text' }]
  },
  {
    id: 'node-gcs',
    key: 'gcs',
    name: 'Google Cloud Storage',
    nameAr: 'تخزين سحابي Google Cloud Storage',
    description: 'GCP blob object storage with CDN integration and lifecycle rules.',
    descriptionAr: 'رفع وإدارة البيانات الكبيرة على Google Cloud.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Folder',
    brandColor: '#4285F4',
    gradient: 'from-blue-600 to-cyan-600',
    configFields: [{ key: 'bucket', label: 'GCS Bucket', labelAr: 'اسم الـ Bucket', type: 'text' }]
  },
  {
    id: 'node-pinecone',
    key: 'pinecone',
    name: 'Pinecone Vector DB',
    nameAr: 'بيانات المتجهات Pinecone',
    description: 'High performance vector database for AI embeddings and RAG search.',
    descriptionAr: 'قاعدة بيانات المتجهات لنماذج الـ RAG والبحث الدلالي.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Layers',
    brandColor: '#000000',
    gradient: 'from-slate-900 to-indigo-950',
    requiredSecretKey: 'PINECONE_API_KEY',
    configFields: [{ key: 'index', label: 'Index Name', labelAr: 'اسم الفهرس', type: 'text' }]
  },
  {
    id: 'node-qdrant',
    key: 'qdrant',
    name: 'Qdrant Vector Database',
    nameAr: 'كودرانت Qdrant Vector',
    description: 'Vector similarity search engine for neural network memory.',
    descriptionAr: 'محرك بحث المتجهات لتطبيقات الذكاء الاصطناعي.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Search',
    brandColor: '#DC2626',
    gradient: 'from-red-600 to-rose-800',
    configFields: [{ key: 'collection', label: 'Collection Name', labelAr: 'اسم المجموعة', type: 'text' }]
  },
  {
    id: 'node-elasticsearch',
    key: 'elasticsearch',
    name: 'Elasticsearch Engine',
    nameAr: 'إيلاستيك سيرش Elasticsearch',
    description: 'Full-text search, analytics, and real-time log indexing engine.',
    descriptionAr: 'محرك البحث النصي الشامل وتحليل السجلات الفورية.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Search',
    brandColor: '#005571',
    gradient: 'from-cyan-700 to-blue-900',
    configFields: [{ key: 'index', label: 'Index', labelAr: 'الفهرس', type: 'text' }]
  },
  {
    id: 'node-dynamodb',
    key: 'dynamodb',
    name: 'Amazon DynamoDB',
    nameAr: 'دينامو دي بي AWS DynamoDB',
    description: 'Single-digit millisecond latency key-value serverless database.',
    descriptionAr: 'قاعدة بيانات NoSQL سريعة للغاية بدون خوادم من AWS.',
    category: 'Databases & Storage',
    nodeType: 'action',
    icon: 'Database',
    brandColor: '#4053D6',
    gradient: 'from-indigo-600 to-blue-800',
    configFields: [{ key: 'tableName', label: 'Table Name', labelAr: 'اسم الجدول', type: 'text' }]
  },

  // 7. Developer Tools & Logic (14 Nodes)
  {
    id: 'node-webhook',
    key: 'webhook',
    name: 'Incoming Custom Webhook',
    nameAr: 'مستقبل Webhook مخصص',
    description: 'Expose a unique HTTPS endpoint to trigger workflows from external systems.',
    descriptionAr: 'إنشاء رابط سحابي مع عنوان حقيقي لاستقبال البيانات فور حدوثها.',
    category: 'Developer Tools',
    nodeType: 'trigger',
    icon: 'Webhook',
    brandColor: '#6366F1',
    gradient: 'from-indigo-600 to-purple-600',
    configFields: [
      { key: 'method', label: 'HTTP Method', labelAr: 'نوع الطلب', type: 'select', defaultValue: 'POST', options: [{ label: 'POST', labelAr: 'POST', value: 'POST' }, { label: 'GET', labelAr: 'GET', value: 'GET' }] },
      { key: 'secretToken', label: 'Optional Secret Header', labelAr: 'مفتاح التحقق الخفي', type: 'secret' }
    ]
  },
  {
    id: 'node-http',
    key: 'http_request',
    name: 'HTTP Custom Request',
    nameAr: 'طلب HTTP خارجي مخصص',
    description: 'Call any third-party REST API with custom headers, query params, and body.',
    descriptionAr: 'الاتصال بأي REST API خارجي بأي ترويسات أو صيغ.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Globe',
    brandColor: '#0284C7',
    gradient: 'from-sky-600 to-blue-700',
    configFields: [
      { key: 'url', label: 'Endpoint URL', labelAr: 'رابط الـ Endpoint', type: 'text', placeholder: 'https://api.example.com/v1/data' },
      { key: 'method', label: 'Method', labelAr: 'طريقة الطلب', type: 'select', defaultValue: 'POST', options: [{ label: 'POST', labelAr: 'POST', value: 'POST' }, { label: 'GET', labelAr: 'GET', value: 'GET' }, { label: 'PUT', labelAr: 'PUT', value: 'PUT' }, { label: 'DELETE', labelAr: 'DELETE', value: 'DELETE' }] },
      { key: 'headers', label: 'Custom Headers (JSON)', labelAr: 'الترويسات (JSON)', type: 'textarea' },
      { key: 'body', label: 'Request Body (JSON)', labelAr: 'محتوى الطلب (JSON)', type: 'textarea' }
    ]
  },
  {
    id: 'node-code-js',
    key: 'code_js',
    name: 'JavaScript / TS Code Engine',
    nameAr: 'محرر كود JS / TS',
    description: 'Execute custom JavaScript functions to transform complex data objects.',
    descriptionAr: 'تنفيذ دالة جافاسكريبت مخصصة للتحكم بالبيانات والتنسيق.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Code',
    brandColor: '#F7DF1E',
    gradient: 'from-yellow-500 to-amber-600',
    configFields: [
      { key: 'code', label: 'JavaScript Code', labelAr: 'كود الجافاسكريبت', type: 'textarea', defaultValue: 'return { status: "ok", data: $input.map(i => i.title) };' }
    ]
  },
  {
    id: 'node-condition',
    key: 'condition',
    name: 'If / Else Condition Branch',
    nameAr: 'تفرع شرطي If / Else',
    description: 'Branch the workflow flow based on custom logic conditions and dynamic values.',
    descriptionAr: 'توزيع مسار العمل إلى فرعين بناءً على التحقق الشرطي.',
    category: 'Developer Tools',
    nodeType: 'condition',
    icon: 'GitFork',
    brandColor: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    configFields: [
      { key: 'field', label: 'Field Path', labelAr: 'مسار الحقل المالي', type: 'text', defaultValue: '$trigger.payload.amount' },
      { key: 'operator', label: 'Operator', labelAr: 'المعامل', type: 'select', defaultValue: 'greater_than', options: [{ label: 'Greater Than (>)', labelAr: 'أكبر من', value: 'greater_than' }, { label: 'Equals (==)', labelAr: 'يساوي', value: 'equals' }, { label: 'Contains', labelAr: 'يحتوي على', value: 'contains' }] },
      { key: 'value', label: 'Compare Value', labelAr: 'القيمة المقارنة', type: 'text', defaultValue: '100' }
    ]
  },
  {
    id: 'node-filter',
    key: 'filter',
    name: 'Data Array Filter',
    nameAr: 'تصفية البيانات Filter',
    description: 'Filter arrays of incoming items matching dynamic business rules.',
    descriptionAr: 'فلترة وتصفية مصفوفات البيانات المطابقة للشروط.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Filter',
    brandColor: '#10B981',
    gradient: 'from-emerald-600 to-teal-700',
    configFields: [{ key: 'condition', label: 'Filter Formula', labelAr: 'صيغة التصفية', type: 'text' }]
  },
  {
    id: 'node-loop',
    key: 'loop',
    name: 'Loop Iterator (For Each)',
    nameAr: 'حلقة تكرارية For Each Loop',
    description: 'Iterate over lists of records and run downstream steps for every single item.',
    descriptionAr: 'التكرار عبر قائمة العناصر وتطبيق الخطوات على كل عنصر.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Repeat',
    brandColor: '#8B5CF6',
    gradient: 'from-purple-600 to-indigo-700',
    configFields: [{ key: 'arrayField', label: 'Array Variable', labelAr: 'متغير القائمة', type: 'text' }]
  },
  {
    id: 'node-delay',
    key: 'delay',
    name: 'Delay & Pause Timer',
    nameAr: 'مؤقت الانتظار Delay Timer',
    description: 'Pause execution for specified minutes, hours, or until a specific date.',
    descriptionAr: 'تأخير تنفيذ باقي خطوات المسار لدقائق أو ساعات محددة.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Clock',
    brandColor: '#64748B',
    gradient: 'from-slate-600 to-slate-800',
    configFields: [{ key: 'durationSeconds', label: 'Pause Duration (Seconds)', labelAr: 'مدة الانتظار بالثواني', type: 'number', defaultValue: 60 }]
  },
  {
    id: 'node-json-parser',
    key: 'json_parser',
    name: 'JSON Parse & Transform',
    nameAr: 'مُعالج وقارئ JSON',
    description: 'Convert stringified raw payloads into accessible structured JSON objects.',
    descriptionAr: 'تحويل النصوص الخام إلى كائنات JSON قابلة للوصول بسهولة.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'FileCode',
    brandColor: '#0EA5E9',
    gradient: 'from-cyan-600 to-blue-700',
    configFields: [{ key: 'inputString', label: 'Raw String', labelAr: 'النص الخام', type: 'textarea' }]
  },
  {
    id: 'node-cron-schedule',
    key: 'cron_schedule',
    name: 'Cron Clock Scheduler',
    nameAr: 'مُجدول التوقيت Cron',
    description: 'Trigger workflow periodically on a precise cron interval schedule.',
    descriptionAr: 'بدء تشغيل المسار تلقائياً في مواعيد وجداول زمنية محددة.',
    category: 'Developer Tools',
    nodeType: 'trigger',
    icon: 'Calendar',
    brandColor: '#D97706',
    gradient: 'from-amber-600 to-orange-700',
    configFields: [{ key: 'cronExpression', label: 'Cron Expression', labelAr: 'تعبير Cron', type: 'text', defaultValue: '0 9 * * *' }]
  },
  {
    id: 'node-regex',
    key: 'regex_parser',
    name: 'Regex Text Extractor',
    nameAr: 'مستخرج النصوص Regex',
    description: 'Extract emails, phone numbers, domain names using Regular Expressions.',
    descriptionAr: 'استخراج الأرقام والإيميلات والروابط بواسطة التعبير النمطي.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Search',
    brandColor: '#EC4899',
    gradient: 'from-pink-600 to-rose-700',
    configFields: [{ key: 'pattern', label: 'Regex Pattern', labelAr: 'نمط Regex', type: 'text', defaultValue: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' }]
  },
  {
    id: 'node-hash-crypto',
    key: 'hash_crypto',
    name: 'HMAC & Crypto Security',
    nameAr: 'تشفير وحساب HMAC',
    description: 'Generate SHA256 hashes, verify JWT signatures, encrypt sensitive payload.',
    descriptionAr: 'حساب توقيع HMAC SHA256 وتشفير البيانات الحساسة.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'Lock',
    brandColor: '#334155',
    gradient: 'from-slate-700 to-slate-900',
    configFields: [{ key: 'algorithm', label: 'Algorithm', labelAr: 'خوارزمية التشفير', type: 'select', defaultValue: 'SHA256', options: [{ label: 'SHA256', labelAr: 'SHA256', value: 'SHA256' }, { label: 'MD5', labelAr: 'MD5', value: 'MD5' }] }]
  },
  {
    id: 'node-switch-case',
    key: 'switch_case',
    name: 'Multi-Branch Switch Case',
    nameAr: 'موزع الحالات Switch Case',
    description: 'Route execution into multiple outputs based on string value matches.',
    descriptionAr: 'توجيه التنفيذ إلى مخرجات متعددة حسب قيمة الحقل.',
    category: 'Developer Tools',
    nodeType: 'condition',
    icon: 'GitBranch',
    brandColor: '#8B5CF6',
    gradient: 'from-purple-600 to-indigo-700',
    configFields: [{ key: 'variable', label: 'Target Variable', labelAr: 'المتغير المستهدف', type: 'text' }]
  },
  {
    id: 'node-rss-feed',
    key: 'rss_feed',
    name: 'RSS / Atom Feed Reader',
    nameAr: 'قارئ خوادم الأخبار RSS Feed',
    description: 'Listen to news blogs and publication updates.',
    descriptionAr: 'استقبال المقالات والأخبار الجديدة من مدونات المجلات والمواقع.',
    category: 'Developer Tools',
    nodeType: 'trigger',
    icon: 'Rss',
    brandColor: '#F97316',
    gradient: 'from-orange-500 to-amber-600',
    configFields: [{ key: 'feedUrl', label: 'RSS Feed URL', labelAr: 'رابط الـ RSS Feed', type: 'text' }]
  },
  {
    id: 'node-csv-parser',
    key: 'csv_parser',
    name: 'CSV File Importer & Exporter',
    nameAr: 'معالج ملفات CSV',
    description: 'Parse thousands of CSV spreadsheet lines into structured data.',
    descriptionAr: 'تحليل وتفكيك آلاف أسطر ملفات CSV إلى كائنات بيانات.',
    category: 'Developer Tools',
    nodeType: 'action',
    icon: 'FileSpreadsheet',
    brandColor: '#16A34A',
    gradient: 'from-green-600 to-emerald-700',
    configFields: [{ key: 'fileUrl', label: 'CSV File URL', labelAr: 'رابط ملف الـ CSV', type: 'text' }]
  },

  // 8. Sales & CRM (12 Nodes)
  {
    id: 'node-hubspot',
    key: 'hubspot',
    name: 'HubSpot CRM Suite',
    nameAr: 'منصة هاب سبوت HubSpot',
    description: 'Create contacts, update deal pipeline stages, trigger inbound lead routines.',
    descriptionAr: 'إضافة جهات الاتصال وتحديث صفقات المبيعات في HubSpot.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Users',
    brandColor: '#FF7A59',
    gradient: 'from-orange-500 to-red-600',
    requiredSecretKey: 'HUBSPOT_API_KEY',
    configFields: [
      { key: 'email', label: 'Contact Email', labelAr: 'بريد جهة الاتصال', type: 'text' },
      { key: 'firstname', label: 'First Name', labelAr: 'الاسم الأول', type: 'text' },
      { key: 'lifecyclestage', label: 'Lifecycle Stage', labelAr: 'مرحلة العميل', type: 'text', defaultValue: 'lead' }
    ]
  },
  {
    id: 'node-salesforce',
    key: 'salesforce',
    name: 'Salesforce Enterprise CRM',
    nameAr: 'سيلز فورس Salesforce CRM',
    description: 'Create accounts, query lead objects, update custom opportunity records.',
    descriptionAr: 'إدارة حسابات الشركات وصفقات المبيعات في Salesforce.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Cloud',
    brandColor: '#00A1E0',
    gradient: 'from-blue-600 to-cyan-600',
    requiredSecretKey: 'SALESFORCE_TOKEN',
    configFields: [{ key: 'objectType', label: 'Object Name', labelAr: 'اسم الكائن (Lead / Opportunity)', type: 'text', defaultValue: 'Lead' }]
  },
  {
    id: 'node-pipedrive',
    key: 'pipedrive',
    name: 'Pipedrive Sales Pipeline',
    nameAr: 'بايب درايف Pipedrive',
    description: 'Move deal cards across sales stages, log call notes, create activities.',
    descriptionAr: 'متابعة مراحل الصفقات وتدوين الملاحظات والمكالمات.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'TrendingUp',
    brandColor: '#222222',
    gradient: 'from-slate-800 to-slate-950',
    requiredSecretKey: 'PIPEDRIVE_API_KEY',
    configFields: [{ key: 'title', label: 'Deal Title', labelAr: 'عنوان الصفقة', type: 'text' }]
  },
  {
    id: 'node-zoho',
    key: 'zoho',
    name: 'Zoho CRM & Books',
    nameAr: 'زوهو سي آر إم Zoho CRM',
    description: 'Sync leads, manage quotes, auto generate tax compliant invoices.',
    descriptionAr: 'مزامنة العملاء وإنشاء العروض والفواتير الضريبية.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Layers',
    brandColor: '#C02425',
    gradient: 'from-red-600 to-rose-800',
    configFields: [{ key: 'module', label: 'Zoho Module', labelAr: 'الوحدة (Leads / Contacts)', type: 'text', defaultValue: 'Leads' }]
  },
  {
    id: 'node-activecampaign',
    key: 'activecampaign',
    name: 'ActiveCampaign Marketing',
    nameAr: 'أكتيف كامبين ActiveCampaign',
    description: 'Trigger email sequences, add contact tags, update lead score values.',
    descriptionAr: 'تشغيل الحملات التلقائية وتحديث نقاط تقييم العميل.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Send',
    brandColor: '#356AE6',
    gradient: 'from-blue-600 to-indigo-700',
    configFields: [{ key: 'tags', label: 'Tags to Add', labelAr: 'الوسوم المضافة', type: 'text' }]
  },
  {
    id: 'node-mailchimp',
    key: 'mailchimp',
    name: 'Mailchimp Email Lists',
    nameAr: 'ميل شيمب Mailchimp',
    description: 'Add subscribers to audience lists, trigger drip campaigns.',
    descriptionAr: 'إضافة المشتركين للقوائم البريدية وتشغيل المتابعات.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Mail',
    brandColor: '#FFE01B',
    gradient: 'from-amber-400 to-yellow-500',
    configFields: [{ key: 'listId', label: 'Audience List ID', labelAr: 'معرف القائمة البريدية', type: 'text' }]
  },
  {
    id: 'node-convertkit',
    key: 'convertkit',
    name: 'ConvertKit (Kit) Creators',
    nameAr: 'كونفرت كيت ConvertKit',
    description: 'Manage creator newsletter subscribers, send automated broadcasts.',
    descriptionAr: 'إدارة مشتركي نشرات صنّاع المحتوى وتوزيع البريد.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Send',
    brandColor: '#FF708A',
    gradient: 'from-pink-500 to-rose-600',
    configFields: [{ key: 'formId', label: 'Form ID', labelAr: 'معرف النموذج', type: 'text' }]
  },
  {
    id: 'node-brevo',
    key: 'brevo',
    name: 'Brevo (Sendinblue)',
    nameAr: 'بريفو Brevo',
    description: 'Send transactional emails, SMS messages, and Manage contacts.',
    descriptionAr: 'إرسال الرسائل الإدارية القصيرة والبريد الإلكتروني.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Mail',
    brandColor: '#00B894',
    gradient: 'from-teal-500 to-emerald-700',
    configFields: [{ key: 'email', label: 'Contact Email', labelAr: 'بريد العميل', type: 'text' }]
  },
  {
    id: 'node-intercom-crm',
    key: 'intercom-crm',
    name: 'Intercom Customer OS',
    nameAr: 'إنتركوم Intercom CRM',
    description: 'Track user active sessions, update customer attributes and subscription plans.',
    descriptionAr: 'تتبع نشاط المستخدمين وتحديث خطط الاشتراك في إنتركوم.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Headphones',
    brandColor: '#1F8CEB',
    gradient: 'from-blue-500 to-cyan-600',
    configFields: [{ key: 'userId', label: 'User ID', labelAr: 'معرف المستخدم', type: 'text' }]
  },
  {
    id: 'node-salesloft',
    key: 'salesloft',
    name: 'Salesloft Cadence',
    nameAr: 'سيلز لوفت Salesloft',
    description: 'Automate outbound sales rep phone calls and cadences.',
    descriptionAr: 'أتمتة خطط التواصل لممثلي المبيعات المباشرة.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'PhoneCall',
    brandColor: '#00A86B',
    gradient: 'from-emerald-600 to-green-700',
    configFields: [{ key: 'cadenceId', label: 'Cadence ID', labelAr: 'معرف الخطة', type: 'text' }]
  },
  {
    id: 'node-keap',
    key: 'keap',
    name: 'Keap (Infusionsoft)',
    nameAr: 'كيب Keap CRM',
    description: 'Small business sales automation and customer tagging.',
    descriptionAr: 'أتمتة مبيعات المشاريع الصغيرة والمتابعة.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Zap',
    brandColor: '#4A8128',
    gradient: 'from-green-700 to-emerald-900',
    configFields: [{ key: 'contactId', label: 'Contact ID', labelAr: 'معرف جهة الاتصال', type: 'text' }]
  },
  {
    id: 'node-close-crm',
    key: 'close-crm',
    name: 'Close CRM',
    nameAr: 'كلوز Close CRM',
    description: 'Fast phone and email outbound CRM for high velocity teams.',
    descriptionAr: 'منصة إدارة المبيعات السريعة والمكالمات الهاتفية.',
    category: 'Sales & CRM',
    nodeType: 'action',
    icon: 'Phone',
    brandColor: '#12B886',
    gradient: 'from-teal-500 to-emerald-600',
    configFields: [{ key: 'leadId', label: 'Lead ID', labelAr: 'معرف العميل', type: 'text' }]
  }
];
