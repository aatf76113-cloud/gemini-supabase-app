import React, { useEffect } from 'react';
import { NavTab, Language } from '../types';

interface SEOHeadProps {
  activeTab: NavTab;
  language: Language;
  workflowName?: string;
  agentName?: string;
}

const BASE_URL = "https://gemini-supabase-app-nine.vercel.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/icons/og-banner.png`;

export const SEOHead: React.FC<SEOHeadProps> = ({ activeTab, language, workflowName, agentName }) => {
  useEffect(() => {
    const isAr = language === 'ar';

    let title = isAr 
      ? 'Zain Automation | منصة وكلاء الذكاء الاصطناعي وأتمتة مسارات العمل'
      : 'Zain Automation | AI Automation Platform & Intelligent Workflow Builder';

    let description = isAr
      ? 'Build AI Agents, Workflow Automation, Gmail, WhatsApp, Telegram and Google Sheets integrations with Zain Automation.'
      : 'Build AI Agents, Workflow Automation, Gmail, WhatsApp, Telegram and Google Sheets integrations with Zain Automation.';

    let canonicalPath = `/${activeTab === 'dashboard' ? '' : activeTab.replace(/_/g, '-')}`;

    if (workflowName) {
      title = `${workflowName} | Zain Automation`;
      description = isAr
        ? `تعديل وتشغيل مسار الأتمتة ${workflowName} عبر منصة زين للأتمتة.`
        : `Configure and run ${workflowName} workflow on Zain Automation Platform.`;
    } else if (agentName) {
      title = isAr ? `وكيل الذكاء الاصطناعي: ${agentName} | Zain Automation` : `AI Agent: ${agentName} | Zain Automation`;
      description = isAr
        ? `إدارة وكيل الذكاء الاصطناعي ${agentName} والأوامر المستقلة عبر منصة زين.`
        : `Manage AI Agent ${agentName} and autonomous tasks on Zain Automation Platform.`;
    } else {
      switch (activeTab) {
        case 'dashboard':
          title = isAr ? 'لوحة التحكم الرئيسية | Zain Automation' : 'Main Dashboard | Zain Automation';
          description = isAr 
            ? 'نظرة عامة على مسارات العمل النشطة ووكلاء الذكاء الاصطناعي والإحصائيات الفورية.' 
            : 'Overview of active workflows, AI agents, and real-time automation analytics.';
          break;
        case 'workflows':
          title = isAr ? 'مسارات العمل والأتمتة | Zain Automation' : 'Workflows & Automation | Zain Automation';
          description = isAr 
            ? 'إنشاء وإدارة مسارات العمل الذكية والربط بين التطبيقات المختلفة.' 
            : 'Create, edit, and manage intelligent automated workflows and app integrations.';
          break;
        case 'ai_builder':
          title = isAr ? 'منشئ الذكاء الاصطناعي باللغة الطبيعية | Zain Automation' : 'AI Workflow Generator | Zain Automation';
          description = isAr 
            ? 'قم بتوليد مسارات عمل معقدة تلقائياً فقط عبر كتابة وصف نصي عادي.' 
            : 'Generate full automated workflows instantly using natural language AI prompts.';
          break;
        case 'ai_agents':
          title = isAr ? 'وكلاء الذكاء الاصطناعي المستقلين | Zain Automation' : 'Autonomous AI Agents | Zain Automation';
          description = isAr 
            ? 'إدارة وتشغيل وكلاء الذكاء الاصطناعي لتنفيذ المهام المعقدة وخدمة العملاء.' 
            : 'Deploy and orchestrate autonomous AI agents for complex business tasks.';
          break;
        case 'connections':
          title = isAr ? 'التكاملات والتطبيقات | Zain Automation' : 'Integrations & App Connections | Zain Automation';
          description = isAr 
            ? 'ربط واتساب، تليجرام، جيميل، جداول جوجل، وبوابات الدفع الإلكترونية.' 
            : 'Connect WhatsApp, Telegram, Gmail, Google Sheets, Slack, and payment gateways.';
          break;
        case 'marketplace':
          title = isAr ? 'سوق المكونات والقوالب | Zain Automation' : 'Node & Template Marketplace | Zain Automation';
          description = isAr 
            ? 'استكشف قوالب مسارات العمل الجاهزة ومكونات الأتمتة المتقدمة.' 
            : 'Explore pre-built automation templates and integrations marketplace.';
          break;
        case 'pricing':
          title = isAr ? 'الأسعار والباقات | Zain Automation' : 'Pricing & Plans | Zain Automation';
          description = isAr 
            ? 'اختر الباقة المناسبة لمؤسستك مع تجربة مجانية لكافة ميزات الأتمتة.' 
            : 'Flexible enterprise pricing plans with free tier for AI automation.';
          break;
        case 'status':
          title = isAr ? 'حالة النظام والخدمات | Zain Automation' : 'System Health & Status | Zain Automation';
          description = isAr 
            ? 'مراقبة فورية لمستوى أداء واستقرار محركات الأتمتة والخوادم.' 
            : 'Real-time uptime and status metrics of Zain Automation services.';
          break;
        case 'logs':
          title = isAr ? 'سجلات التنفيذ والتدقيق | Zain Automation' : 'Execution Logs & Audit | Zain Automation';
          description = isAr 
            ? 'متابعة تفاصيل وتشخيص عمليات تنفيذ الأتمتة وسجلات الأخطاء.' 
            : 'Inspect execution logs, debugging traces, and real-time workflow outputs.';
          break;
        case 'developers':
          title = isAr ? 'مركز المطورين والـ API | Zain Automation' : 'Developer Center & APIs | Zain Automation';
          description = isAr 
            ? 'وثائق المطورين ومفاتيح الـ API وواجهات الويب هوك الـ Webhooks.' 
            : 'Developer documentation, REST API references, and webhook integration specs.';
          break;
        case 'help_center':
          title = isAr ? 'مركز المساعدة والتعليمات | Zain Automation' : 'Help Center & Documentation | Zain Automation';
          description = isAr 
            ? 'دروس شروحات وإجابات الأسئلة الشائعة حول استخدام منصة زين للأتمتة.' 
            : 'Guides, tutorials, and FAQs for building automated workflows and AI agents.';
          break;
      }
    }

    const fullCanonicalUrl = `${BASE_URL}${canonicalPath}`;

    // Update Document Title
    document.title = title;

    // Helper to update or inject meta tags
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper to update or inject link tags
    const setLinkTag = (relVal: string, hrefVal: string) => {
      let element = document.querySelector(`link[rel="${relVal}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relVal);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefVal);
    };

    // Update Core SEO Metas
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullCanonicalUrl);
    setMetaTag('property', 'og:image', DEFAULT_OG_IMAGE);
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE);

    // Update Canonical URL
    setLinkTag('canonical', fullCanonicalUrl);

  }, [activeTab, language, workflowName, agentName]);

  return null;
};
