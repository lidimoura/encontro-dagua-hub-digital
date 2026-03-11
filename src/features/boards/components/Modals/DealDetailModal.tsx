import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '@/context/CRMContext';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ConfirmModal';
import { DealStatus, Activity } from '@/types';
import {
  analyzeLead,
  generateEmailDraft,
  generateObjectionResponse,
  processAudioNote,
  generateWAOutreach,
} from '@/services/geminiService';
import {
  BrainCircuit,
  Mail,
  Phone,
  Calendar,
  Check,
  X,
  Trash2,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Building2,
  User,
  FileText,
  Mic,
  StopCircle,
  Package,
  Sword,
  CheckCircle2,
  Bot,
  UserCheck,
  Folder,
  QrCode,
  Phone as PhoneIcon,
  Tag,
  Globe,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { StageProgressBar } from '../StageProgressBar';
import { ActivityRow } from '@/features/activities/components/ActivityRow';
import { supabase } from '@/lib/supabase/client';

// ── Types for briefing_json and qr_codes ──────────────────────
interface BriefingJson {
  name?: string;
  whatsapp?: string;
  services?: string[];
  source?: string;
  landed_via?: string;
  message?: string;
  capture_time?: string;
}

interface QrLink {
  id: string;
  title: string | null;
  slug: string;
  destination_url?: string | null;
  scan_count?: number | null;
  created_at: string;
}
import { useTranslation } from '@/hooks/useTranslation';

// Utility to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface DealDetailModalProps {
  dealId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({ dealId, isOpen, onClose }) => {
  const { t } = useTranslation();
  const {
    deals,
    contacts,
    moveDeal,
    updateDeal,
    deleteDeal,
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    products,
    addItemToDeal,
    removeItemFromDeal,
    customFieldDefinitions,
    activeBoard,
    boards,
    lifecycleStages,
    aiProvider,
    aiApiKey,
    aiModel,
    aiThinking,
    aiSearch,
    aiAnthropicCaching,
  } = useCRM();
  const { addToast } = useToast();

  const deal = deals.find(d => d.id === dealId);
  const contact = deal ? contacts.find(c => c.id === deal.contactId) : null;

  // Determine the correct board for this deal
  const dealBoard = deal ? boards.find(b => b.id === deal.boardId) || activeBoard : activeBoard;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editValue, setEditValue] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiResult, setAiResult] = useState<{ suggestion: string; score: number } | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'products' | 'info' | 'documents'>('timeline');
  // ── Conversion state ─────────────────────────────────────────
  const [isConverting, setIsConverting] = useState(false);

  // ── Documents tab state ───────────────────────────────────────
  const [qrLinks, setQrLinks] = useState<QrLink[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [objection, setObjection] = useState('');
  const [objectionResponses, setObjectionResponses] = useState<string[]>([]);
  const [isGeneratingObjections, setIsGeneratingObjections] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── WA Outreach AI state ──────────────────────────────────────
  const [waMessage, setWaMessage] = useState<string | null>(null);
  const [isGeneratingWA, setIsGeneratingWA] = useState(false);

  // Helper functions removed as they are now handled by ActivityRow component

  // Reset state when deal changes or modal opens
  useEffect(() => {
    if (isOpen && deal) {
      setEditTitle(deal.title);
      setEditValue(deal.value.toString());
      setAiResult(null);
      setEmailDraft(null);
      setObjectionResponses([]);
      setObjection('');
      setActiveTab('timeline');
      setIsEditingTitle(false);
      setIsEditingValue(false);
      setQrLinks([]);
      setDocsError(null);
    }
  }, [isOpen, dealId]);

  // ── Realtime sync: qr_codes ↟ Link d'Água → CRM (no F5 needed) ───
  useEffect(() => {
    if (activeTab !== 'documents') return;
    const ct = deal ? contacts.find(c => c.id === deal.contactId) : null;
    const lid = (ct as any)?.linkdagua_user_id as string | undefined;
    if (!lid) { setQrLinks([]); return; }

    // Initial load
    setIsLoadingDocs(true);
    setDocsError(null);
    supabase
      .from('qr_codes')
      .select('id, title, slug, destination_url, scan_count, created_at')
      .eq('user_id', lid)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setDocsError(error.message);
        else setQrLinks((data as QrLink[]) || []);
        setIsLoadingDocs(false);
      });

    // Realtime: react instantly to changes from Link d'Água
    const channel = supabase
      .channel(`qr_realtime_${lid}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'qr_codes',
        filter: `user_id=eq.${lid}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setQrLinks(prev => [payload.new as QrLink, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setQrLinks(prev =>
            prev.map(q => q.id === (payload.new as QrLink).id ? (payload.new as QrLink) : q)
          );
        } else if (payload.eventType === 'DELETE') {
          setQrLinks(prev => prev.filter(q => q.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTab, deal?.contactId, contacts]);

  if (!isOpen || !deal) return null;

  // ── briefing_json helper ──────────────────────────────────────
  const contactObj = contacts.find(c => c.id === deal.contactId);
  const briefingJson = (contactObj as any)?.briefing_json as BriefingJson | null | undefined;
  const linkdaguaId = (contactObj as any)?.linkdagua_user_id as string | undefined;

  // ── Converter para Cliente handler ────────────────────────────
  const handleConvertToClient = async () => {
    setIsConverting(true);
    try {
      // Try the new RPC first (requires migration 020)
      const { data, error } = await supabase.rpc('convert_lead_to_client', {
        p_lead_id: deal.contactId,
      });
      if (error) throw error;
      // Update deal status to reflect conversion
      updateDeal(deal.id, { status: 'CUSTOMER' });
      addToast('✅ Lead convertido para cliente com sucesso!', 'success');
    } catch (err: any) {
      // Fallback: just mark the deal as won
      updateDeal(deal.id, { status: DealStatus.CLOSED_WON });
      addToast('Cliente marcado como ganho (conversão simplificada)', 'info');
    } finally {
      setIsConverting(false);
    }
  };

  // ── WA Outreach handler ───────────────────────────────────────
  const handleGenerateWAMessage = async () => {
    setIsGeneratingWA(true);
    setWaMessage(null);
    try {
      const msg = await generateWAOutreach(
        deal,
        briefingJson ? {
          name: briefingJson.name,
          services: briefingJson.services,
          message: briefingJson.message,
          whatsapp: briefingJson.whatsapp,
        } : undefined,
        {
          provider: aiProvider,
          apiKey: aiApiKey,
          model: aiModel,
          thinking: aiThinking,
          search: aiSearch,
          anthropicCaching: aiAnthropicCaching,
        }
      );
      setWaMessage(msg);
    } catch (err) {
      setWaMessage('Erro ao gerar mensagem.');
    } finally {
      setIsGeneratingWA(false);
    }
  };

  const handleAnalyzeDeal = async () => {
    setIsAnalyzing(true);
    const result = await analyzeLead(deal, {
      provider: aiProvider,
      apiKey: aiApiKey,
      model: aiModel,
      thinking: aiThinking,
      search: aiSearch,
      anthropicCaching: aiAnthropicCaching,
    });
    setAiResult({ suggestion: result.suggestion, score: result.probabilityScore });
    setIsAnalyzing(false);
    updateDeal(deal.id, { aiSummary: result.suggestion, probability: result.probabilityScore });
  };

  const handleDraftEmail = async () => {
    setIsDrafting(true);
    const draft = await generateEmailDraft(deal, {
      provider: aiProvider,
      apiKey: aiApiKey,
      model: aiModel,
      thinking: aiThinking,
      search: aiSearch,
      anthropicCaching: aiAnthropicCaching,
    });
    setEmailDraft(draft);
    setIsDrafting(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessingAudio(true);
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm; codecs=opus' });
        const audioBase64 = await blobToBase64(audioBlob);

        try {
          const result = await processAudioNote(audioBase64, {
            provider: aiProvider,
            apiKey: aiApiKey,
            model: aiModel,
            thinking: aiThinking,
            search: aiSearch,
            anthropicCaching: aiAnthropicCaching,
          });

          addActivity({
            dealId: deal.id,
            dealTitle: deal.title,
            type: 'NOTE',
            title: 'Nota de Voz (Transcrição)',
            description: `"${result.transcription}"\n\nSentimento: ${result.sentiment} `,
            date: new Date().toISOString(),
            user: { name: 'Eu', avatar: 'https://i.pravatar.cc/150?u=me' },
            completed: true,
          });

          if (result.nextAction) {
            const validActivityTypes: Activity['type'][] = [
              'CALL',
              'MEETING',
              'EMAIL',
              'TASK',
              'NOTE',
              'STATUS_CHANGE',
            ];
            const activityType = validActivityTypes.includes(
              result.nextAction.type as Activity['type']
            )
              ? (result.nextAction.type as Activity['type'])
              : 'TASK';

            addActivity({
              dealId: deal.id,
              dealTitle: deal.title,
              type: activityType,
              title: result.nextAction.title,
              description: 'Extraído automaticamente da nota de voz',
              date: result.nextAction.date,
              user: { name: 'Eu', avatar: 'https://i.pravatar.cc/150?u=me' },
              completed: false,
            });
          }
        } catch (error) {
          console.error(error);
          alert('Erro ao processar áudio.');
        } finally {
          setIsProcessingAudio(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleObjection = async () => {
    if (!objection.trim()) return;
    setIsGeneratingObjections(true);
    const responses = await generateObjectionResponse(deal, objection, {
      provider: aiProvider,
      apiKey: aiApiKey,
      model: aiModel,
      thinking: aiThinking,
      search: aiSearch,
      anthropicCaching: aiAnthropicCaching,
    });
    setObjectionResponses(responses);
    setIsGeneratingObjections(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const noteActivity: Activity = {
      id: crypto.randomUUID(),
      dealId: deal.id,
      dealTitle: deal.title,
      type: 'NOTE',
      title: 'Nota Adicionada',
      description: newNote,
      date: new Date().toISOString(),
      user: { name: 'Eu', avatar: 'https://i.pravatar.cc/150?u=me' },
      completed: true,
    };

    addActivity(noteActivity);
    setNewNote('');
  };

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    addItemToDeal(deal.id, {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: productQuantity,
    });

    setSelectedProductId('');
    setProductQuantity(1);
  };

  const confirmDeleteDeal = () => {
    if (deleteId) {
      deleteDeal(deleteId);
      addToast('Negócio excluído com sucesso', 'success');
      setDeleteId(null);
      onClose();
    }
  };

  const saveTitle = () => {
    if (editTitle) {
      updateDeal(deal.id, { title: editTitle });
      setIsEditingTitle(false);
    }
  };

  const saveValue = () => {
    if (editValue) {
      updateDeal(deal.id, { value: Number(editValue) });
      setIsEditingValue(false);
    }
  };

  const updateCustomField = (key: string, value: string | number | boolean) => {
    const updatedFields = { ...deal.customFields, [key]: value };
    updateDeal(deal.id, { customFields: updatedFields });
  };

  const dealActivities = activities.filter(a => a.dealId === deal.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER (Stage Bar + Won/Lost) */}
        <div className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 p-6 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 mr-8">
              {isEditingTitle ? (
                <div className="flex gap-2 mb-1">
                  <input
                    autoFocus
                    type="text"
                    className="text-2xl font-bold text-slate-900 dark:text-white bg-white dark:bg-black/20 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-primary-500"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={e => e.key === 'Enter' && saveTitle()}
                  />
                  <button onClick={saveTitle} className="text-green-500 hover:text-green-400">
                    <Check size={24} />
                  </button>
                </div>
              ) : (
                <h2
                  onClick={() => {
                    setEditTitle(deal.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-2xl font-bold text-slate-900 dark:text-white font-display leading-tight cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2 group transition-colors"
                  title="Clique para editar"
                >
                  {deal.title}
                  <Pencil size={16} className="opacity-0 group-hover:opacity-50 text-slate-400" />
                </h2>
              )}

              {isEditingValue ? (
                <div className="flex gap-2 items-center">
                  <span className="text-lg font-mono font-bold text-slate-500">$</span>
                  <input
                    autoFocus
                    type="number"
                    className="text-lg font-mono font-bold text-primary-600 dark:text-primary-400 bg-white dark:bg-black/20 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-32 outline-none focus:ring-2 focus:ring-primary-500"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={saveValue}
                    onKeyDown={e => e.key === 'Enter' && saveValue()}
                  />
                  <button onClick={saveValue} className="text-green-500 hover:text-green-400">
                    <Check size={20} />
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => {
                    setEditValue(deal.value.toString());
                    setIsEditingValue(true);
                  }}
                  className="text-lg text-primary-600 dark:text-primary-400 font-mono font-bold cursor-pointer hover:underline decoration-dashed underline-offset-4"
                  title="Clique para editar valor"
                >
                  ${deal.value.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* Converter para Cliente button */}
              {deal.status !== 'CUSTOMER' && deal.status !== DealStatus.CLOSED_WON && (
                <button
                  onClick={handleConvertToClient}
                  disabled={isConverting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 transition-all"
                  title="Converter este lead em cliente via RPC"
                >
                  {isConverting ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  CONVERTER
                </button>
              )}
              {deal.status !== DealStatus.CLOSED_WON && (
                <button
                  onClick={() => {
                    moveDeal(deal.id, DealStatus.CLOSED_WON);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm shadow-sm flex items-center gap-2"
                >
                  <ThumbsUp size={16} /> GANHO
                </button>
              )}
              {deal.status !== DealStatus.CLOSED_LOST && (
                <button
                  onClick={() => {
                    moveDeal(deal.id, DealStatus.CLOSED_LOST);
                    onClose();
                  }}
                  className="px-4 py-2 bg-transparent border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2"
                >
                  <ThumbsDown size={16} /> PERDIDO
                </button>
              )}
              <button
                onClick={() => setDeleteId(deal.id)}
                className="ml-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Excluir Negócio"
              >
                <Trash2 size={24} />
              </button>
              <button
                onClick={onClose}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <StageProgressBar
            stages={dealBoard.stages}
            currentStatus={deal.status}
            onStageClick={stageId => moveDeal(deal.id, stageId)}
          />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar (Static Info + Custom Fields) */}
          <div className="w-1/3 border-r border-slate-200 dark:border-white/5 p-6 overflow-y-auto bg-white dark:bg-dark-card">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <Building2 size={14} /> Empresa (Conta)
                </h3>
                <p className="text-slate-900 dark:text-white font-medium">{deal.companyName}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <User size={14} /> Contato Principal
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                    {deal.contactName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-medium text-sm flex items-center gap-2">
                      {deal.contactName}
                      {contact?.stage &&
                        (() => {
                          const stage = lifecycleStages.find(s => s.id === contact.stage);
                          if (!stage) return null;
                          const colorClass = stage.color;
                          return (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1 text-white ${colorClass}`}
                            >
                              {stage.name}
                            </span>
                          );
                        })()}
                    </p>
                    <p className="text-slate-500 text-xs">{deal.contactEmail}</p>
                  </div>
                </div>
                {/* WhatsApp AI Outreach — visible whenever any phone/contact exists */}
                {(briefingJson?.whatsapp || contact?.phone || deal.contactEmail) && (
                  <div className="mt-3 space-y-2">
                    {!waMessage ? (
                      <button
                        onClick={handleGenerateWAMessage}
                        disabled={isGeneratingWA}
                        className="flex items-center gap-2 w-full justify-center px-3 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        {isGeneratingWA ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <PhoneIcon size={13} />
                        )}
                        {isGeneratingWA ? 'Gerando msg IA...' : '📲 WhatsApp + Msg IA'}
                      </button>
                    ) : (
                      <div className="space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                            <Bot size={10} /> Mensagem gerada pela IA
                          </span>
                          <button
                            onClick={() => setWaMessage(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                          >
                            refazer
                          </button>
                        </div>
                        <textarea
                          className="w-full text-xs text-slate-800 dark:text-slate-100 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 rounded-lg p-2 resize-none outline-none focus:ring-1 focus:ring-green-500 leading-relaxed min-h-[80px]"
                          value={waMessage}
                          onChange={e => setWaMessage(e.target.value)}
                        />
                        <a
                          href={`https://wa.me/${(briefingJson?.whatsapp || contact?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full justify-center px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                        >
                          <PhoneIcon size={13} /> Abrir no WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Detalhes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Prioridade</span>
                    <span className="text-slate-900 dark:text-white capitalize">
                      {deal.priority}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Criado em</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Probabilidade</span>
                    <span className="text-slate-900 dark:text-white">{deal.probability}%</span>
                  </div>
                </div>
              </div>

              {/* ── Briefing JSON Section ───────────────────────────── */}
              {briefingJson && (
                <div className="pt-4 border-t border-teal-100 dark:border-teal-900/30">
                  <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase mb-3 flex items-center gap-1.5">
                    <Tag size={12} /> Briefing do Lead
                  </h3>
                  <div className="space-y-2.5">
                    {briefingJson.whatsapp && (
                      <div className="flex items-start gap-2">
                        <PhoneIcon size={13} className="text-teal-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">WhatsApp</p>
                          <a
                            href={`https://wa.me/${briefingJson.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            {briefingJson.whatsapp}
                          </a>
                        </div>
                      </div>
                    )}
                    {briefingJson.services && briefingJson.services.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Package size={13} className="text-teal-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Serviços de Interesse</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {briefingJson.services.map((s, i) => (
                              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/40">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {briefingJson.source && (
                      <div className="flex items-start gap-2">
                        <Globe size={13} className="text-teal-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Origem</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${briefingJson.source === 'Amazô SDR'
                            ? 'bg-blue-900 text-blue-200'
                            : briefingJson.source === 'Hub LP'
                              ? 'bg-emerald-900/40 text-emerald-300'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}>
                            {briefingJson.source}
                          </span>
                        </div>
                      </div>
                    )}
                    {briefingJson.landed_via && (
                      <div className="flex items-start gap-2">
                        <ExternalLink size={13} className="text-teal-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Canal de Entrada</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">{briefingJson.landed_via}</p>
                        </div>
                      </div>
                    )}
                    {linkdaguaId && (
                      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-teal-100 dark:border-teal-900/20">
                        <QrCode size={12} className="text-purple-500" />
                        <p className="text-[10px] text-slate-400">
                          Link d'Água: <span className="font-mono text-purple-500">{linkdaguaId.slice(0, 8)}…</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DYNAMIC CUSTOM FIELDS INPUTS */}
              {customFieldDefinitions.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">
                    Campos Personalizados
                  </h3>
                  <div className="space-y-4">
                    {customFieldDefinitions.map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={String(deal.customFields?.[field.key] ?? '')}
                            onChange={e => updateCustomField(field.key, e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-2 py-1.5 text-sm dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                          >
                            <option value="">Selecione...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={String(deal.customFields?.[field.key] ?? '')}
                            onChange={e => updateCustomField(field.key, e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded px-2 py-1.5 text-sm dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content (Tabs & Timeline) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-dark-card">
            <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center px-6 shrink-0">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`text-sm font-bold h-14 border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-primary-500 text-primary-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`text-sm font-bold h-14 border-b-2 transition-colors ${activeTab === 'products' ? 'border-primary-500 text-primary-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`text-sm font-bold h-14 border-b-2 transition-colors ${activeTab === 'info' ? 'border-primary-500 text-primary-600 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                >
                  IA Insights
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`text-sm font-bold h-14 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'documents' ? 'border-purple-500 text-purple-600 dark:text-purple-300' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'}`}
                >
                  <Folder size={14} />
                  Documentos
                  {linkdaguaId && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      QR
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 dark:bg-black/10">
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {/* Pinned Briefing Auto-Note */}
                  {briefingJson?.message && (
                    <div className="flex gap-3 animate-in fade-in">
                      <div className="mt-1 w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0 shadow">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="flex-1 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700/40 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">Briefing Automático — Amazô SDR</span>
                          {briefingJson.capture_time && (
                            <span className="text-[10px] text-slate-400 ml-auto">
                              {new Date(briefingJson.capture_time).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{briefingJson.message}</p>
                        {briefingJson.landed_via && (
                          <p className="mt-2 text-[10px] text-slate-400 font-mono">via {briefingJson.landed_via}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-sm">
                    <textarea
                      className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none min-h-[80px]"
                      placeholder="Escreva uma nota..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                    ></textarea>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="flex gap-2 text-slate-400">
                        <button className="p-1 hover:text-primary-500 transition-colors">
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`p-1 transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-primary-500'}`}
                          title="Gravar Nota de Voz (Voice-to-Action)"
                        >
                          {isProcessingAudio ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : isRecording ? (
                            <StopCircle size={16} />
                          ) : (
                            <Mic size={16} />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        <Check size={14} /> Salvar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                    {dealActivities.length === 0 && (
                      <p className="text-sm text-slate-500 italic pl-4">
                        {t('noActivitiesRecorded')}
                      </p>
                    )}
                    {dealActivities.map(activity => (
                      <ActivityRow
                        key={activity.id}
                        activity={activity}
                        deal={deal}
                        onToggleComplete={id => {
                          const act = activities.find(a => a.id === id);
                          if (act) updateActivity(id, { completed: !act.completed });
                        }}
                        onEdit={() => { }} // Edit not implemented in modal yet
                        onDelete={id => deleteActivity(id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  {/* Briefing: Serviços de Interesse */}
                  {briefingJson?.services && briefingJson.services.length > 0 && (
                    <div className="p-4 rounded-xl border border-teal-200 dark:border-teal-700/40 bg-teal-50/60 dark:bg-teal-900/10">
                      <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Bot size={13} /> Interesse declarado pelo Lead
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {briefingJson.services.map((s, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-800/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-600/50"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400 italic">Estes serviços foram informados pelo lead no briefing. Adicione os produtos correspondentes abaixo.</p>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                      <Package size={16} /> Adicionar Produto/Serviço
                    </h3>
                    <div className="flex gap-3">
                      <select
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                      >
                        <option value="" className="text-slate-900">Selecione um item...</option>
                        {products.filter(p => {
                          // PRIMARY: exclude by type (works after migration 024)
                          const blockedTypes = ['tech_stack', 'infra', 'api_cost'];
                          if (blockedTypes.includes(p.type as string)) return false;
                          // SECONDARY: exclude by name (safety net before migration runs)
                          const n = (p.name || '').toLowerCase();
                          const blockedNames = [
                            'openai', 'anthropic', 'claude', 'gemini', 'gpt',
                            'vercel', 'supabase', 'firebase', 'n8n', 'zapier',
                            'make', 'deno', 'stripe', 'twilio', 'sendgrid',
                            'cloudflare', 'aws ', 'azure', 'gcp '
                          ];
                          if (blockedNames.some(blocked => n.includes(blocked))) return false;
                          return true;
                        }).map(p => (
                          <option key={p.id} value={p.id} className="text-slate-900">
                            {p.name} - ${p.price}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        className="w-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                        value={productQuantity}
                        onChange={e => setProductQuantity(parseInt(e.target.value))}
                      />
                      <button
                        onClick={handleAddProduct}
                        disabled={!selectedProductId}
                        className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3 w-20 text-center">Qtd</th>
                          <th className="px-4 py-3 w-32 text-right">Preço Unit.</th>
                          <th className="px-4 py-3 w-32 text-right">Total</th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {!deal.items || deal.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500 italic">
                              {t('noProductsAdded')}
                            </td>
                          </tr>
                        ) : (
                          deal.items.map(item => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                {item.name}
                              </td>
                              <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                ${item.price.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                ${(item.price * item.quantity).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => removeItemFromDeal(deal.id, item.id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className="bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-right font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wider"
                          >
                            Total do Pedido
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-primary-600 dark:text-primary-400 text-lg">
                            ${deal.value.toLocaleString()}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-dark-card p-6 rounded-xl border border-primary-100 dark:border-primary-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg text-primary-600 dark:text-primary-400">
                        <BrainCircuit size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">
                          Insights Gemini
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Inteligência Artificial aplicada ao negócio
                        </p>
                      </div>
                    </div>

                    {/* STRATEGY CONTEXT BAR */}
                    {dealBoard.agentPersona && (
                      <div className="mb-6 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                          <Bot size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                              Atuando como
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {dealBoard.agentPersona.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {dealBoard.agentPersona.role} • Foco: {dealBoard.goal?.kpi || 'Geral'}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 mb-5">
                      <button
                        onClick={handleAnalyzeDeal}
                        disabled={isAnalyzing}
                        className="flex-1 py-2.5 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-sm font-medium rounded-lg shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <BrainCircuit size={16} />
                        )}
                        Analisar Negócio
                      </button>
                      <button
                        onClick={handleDraftEmail}
                        disabled={isDrafting}
                        className="flex-1 py-2.5 bg-white dark:bg-white/5 text-slate-700 dark:text-white text-sm font-medium rounded-lg shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        {isDrafting ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Mail size={16} />
                        )}
                        Escrever Email
                      </button>
                    </div>
                    {aiResult && (
                      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 rounded-lg border border-primary-100 dark:border-primary-500/20 mb-4">
                        <div className="flex justify-between mb-2 border-b border-primary-100 dark:border-white/5 pb-2">
                          <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                            Sugestão
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 rounded">
                            {aiResult.score}% Chance
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                          {aiResult.suggestion}
                        </p>
                      </div>
                    )}
                    {emailDraft && (
                      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 rounded-lg border border-primary-100 dark:border-primary-500/20">
                        <h4 className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
                          Rascunho de Email
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                          "{emailDraft}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-xl border border-rose-100 dark:border-rose-500/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400">
                        <Sword size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">
                          Objection Killer
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          O cliente está difícil? A IA te ajuda a negociar.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        className="flex-1 bg-white dark:bg-white/5 border border-rose-200 dark:border-rose-500/20 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                        placeholder="Ex: 'Achamos o preço muito alto' ou 'Preciso falar com meu sócio'"
                        value={objection}
                        onChange={e => setObjection(e.target.value)}
                      />
                      <button
                        onClick={handleObjection}
                        disabled={isGeneratingObjections || !objection.trim()}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {isGeneratingObjections ? (
                          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          'Gerar Respostas'
                        )}
                      </button>
                    </div>

                    {objectionResponses.length > 0 && (
                      <div className="space-y-3">
                        {objectionResponses.map((resp, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-white/5 p-3 rounded-lg border border-rose-100 dark:border-rose-500/10 flex gap-3"
                          >
                            <div className="shrink-0 w-6 h-6 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xs">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-200">{resp}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── DOCUMENTS TAB ───────────────────────────────────── */}
              {
                activeTab === 'documents' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Link d'Água QR Projects Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                          <QrCode size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Projetos Link d'Água</h3>
                          <p className="text-xs text-slate-500">
                            {linkdaguaId
                              ? `QR Codes vinculados a ${linkdaguaId.slice(0, 8)}…`
                              : 'Nenhum linkdagua_user_id associado a este contato'}
                          </p>
                        </div>
                      </div>

                      {!linkdaguaId && (
                        <div className="text-center py-10 text-slate-400">
                          <Folder size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">Sem vínculo com Link d'Água</p>
                          <p className="text-xs mt-1">Adicione o <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">linkdagua_user_id</code> ao contato para ver os projetos QR aqui.</p>
                        </div>
                      )}

                      {linkdaguaId && isLoadingDocs && (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 size={28} className="animate-spin text-purple-500" />
                        </div>
                      )}

                      {linkdaguaId && docsError && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700/40 text-sm text-red-600 dark:text-red-400">
                          Erro ao carregar projetos: {docsError}
                        </div>
                      )}

                      {linkdaguaId && !isLoadingDocs && !docsError && qrLinks.length === 0 && (
                        <div className="text-center py-10 text-slate-400">
                          <QrCode size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium">Nenhum projeto QR encontrado</p>
                          <p className="text-xs mt-1">O cliente ainda não criou projetos no Link d'Água.</p>
                        </div>
                      )}

                      {linkdaguaId && !isLoadingDocs && qrLinks.length > 0 && (
                        <div className="space-y-2">
                          {qrLinks.map(qr => (
                            <div
                              key={qr.id}
                              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-purple-300 dark:hover:border-purple-500/40 transition-all group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                                <QrCode size={18} className="text-purple-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {qr.title || qr.slug}
                                </p>
                                <p className="text-xs text-slate-500 font-mono truncate">/{qr.slug}</p>
                              </div>
                              <div className="text-right shrink-0">
                                {qr.scan_count != null && (
                                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                    {qr.scan_count} scan{qr.scan_count !== 1 ? 's' : ''}
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400">
                                  {new Date(qr.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              {qr.destination_url && (
                                <a
                                  href={qr.destination_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-300 dark:text-slate-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Documents and Contracts Section (From Jury Agent) */}
                    <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                      <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">Documentos e Contratos</h3>
                          <p className="text-xs text-slate-500">Contratos gerados e notas importantes</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {dealActivities.filter(a => (a.type as string) === 'note' || (a.type as string) === 'NOTE').length === 0 ? (
                          <div className="text-center py-10 text-slate-500 italic border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                            Nenhum documento ou contrato salvo neste negócio.
                          </div>
                        ) : (
                          dealActivities
                            .filter(a => (a.type as string) === 'note' || (a.type as string) === 'NOTE')
                            .map(doc => (
                              <div key={doc.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 rounded-xl shadow-sm">
                                <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-white/5 pb-3">
                                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText size={16} className="text-primary-500" />
                                    {doc.title || 'Documento'}
                                  </h4>
                                  <span className="text-xs text-slate-400">
                                    {new Date(doc.date).toLocaleString('pt-BR')}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans bg-slate-50 dark:bg-black/20 p-4 rounded-lg border border-slate-100 dark:border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                  {doc.description}
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                  <button
                                    onClick={() => deleteActivity(doc.id)}
                                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 size={14} /> Excluir
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDeleteDeal}
        title="Excluir Negócio"
        message="Tem certeza que deseja excluir este negócio? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
};

