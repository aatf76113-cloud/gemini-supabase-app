import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { telemetry } from '../services/telemetryService';

interface Props {
  children?: ReactNode;
  language?: 'ar' | 'en';
}

interface State {
  hasError: boolean;
  error?: Error;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      showDetails: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error caught by ErrorBoundary:", error, errorInfo);
    telemetry.recordUnhandledException(error, 'ReactErrorBoundary');
  }

  private getFriendlyErrorMessage(errorMsg: string = '', isAr: boolean): string {
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes('permission-denied') || msg.includes('insufficient permissions')) {
      return isAr 
        ? 'عفواً، لا تملك الصلاحيات الكافية للوصول إلى هذه البيانات أو تنفيذ الإجراء.' 
        : 'Access Denied: You do not have required permissions for this action.';
    }
    if (msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate limit')) {
      return isAr 
        ? 'تم الوصول إلى الحد الأقصى المسموح به للطلبات مؤقتاً. يرجى المحاولة بعد دقيقة.' 
        : 'Quota / Rate Limit Exceeded. Please try again in a moment.';
    }
    if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('offline')) {
      return isAr 
        ? 'تعذر الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت وإعادة المحاولة.' 
        : 'Network connection error. Please check your internet connection.';
    }
    
    return isAr 
      ? 'حدث خطأ غير متوقع أثناء عرض الصفحة. تم تسجيل الخطأ لمنع توقف التطبيق.' 
      : 'An unexpected application runtime error occurred. Protected by Beta ErrorBoundary.';
  }

  public render() {
    const isAr = this.props.language === 'ar' || true; // Default to Arabic friendly UI

    if (this.state.hasError) {
      const friendlyMsg = this.getFriendlyErrorMessage(this.state.error?.message, isAr);

      return (
        <div className="min-h-[420px] flex items-center justify-center p-6 text-center bg-slate-50/80 rounded-3xl border border-slate-200/80 my-4 shadow-sm">
          <div className="max-w-lg w-full space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-md">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isAr ? 'حدث خطأ غير متوقع في الواجهة' : 'An Unexpected Error Occurred'}
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {friendlyMsg}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isAr ? 'إعادة تحميل الصفحة' : 'Reload Page'}</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.href = '/';
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>{isAr ? 'العودة للرئيسية' : 'Go Home'}</span>
              </button>
            </div>

            {/* Collapsible Technical Details */}
            {this.state.error?.message && (
              <div className="pt-3 border-t border-slate-100 text-left rtl:text-right">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center justify-between w-full p-2 bg-slate-50 rounded-xl"
                >
                  <span>{isAr ? 'عرض التفاصيل التقنية للخطأ' : 'Show Technical Error Details'}</span>
                  {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-xl text-[10px] font-mono overflow-x-auto whitespace-pre-wrap max-h-36">
                    {this.state.error.stack || this.state.error.message}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
