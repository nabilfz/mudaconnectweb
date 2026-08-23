import { supabase } from './client';
import { env } from './env';
import { ChatSession, ChatMessage } from '../../types';

let localChatSessionsCache: ChatSession[] = [
  {
    id: 'cs-1',
    session_id: 'demo-session-001',
    created_at: '2026-07-22T10:00:00Z',
    message_count: 6,
    used_fallback_count: 0,
  },
  {
    id: 'cs-2',
    session_id: 'demo-session-002',
    created_at: '2026-07-22T14:30:00Z',
    message_count: 4,
    used_fallback_count: 1,
  },
];

let localChatMessagesCache: ChatMessage[] = [];

export async function logChatMessage(
  sessionId: string,
  userMessage: string,
  botResponse: {
    answer: string;
    sources?: any[];
    usedFallback?: boolean;
    needsHumanSupport?: boolean;
  }
) {
  const now = new Date().toISOString();
  const userMsgObj: ChatMessage = {
    id: 'cm-' + Date.now() + '-u',
    session_id: sessionId,
    role: 'user',
    content: userMessage,
    created_at: now,
  };

  const botMsgObj: ChatMessage = {
    id: 'cm-' + Date.now() + '-b',
    session_id: sessionId,
    role: 'assistant',
    content: botResponse.answer,
    sources: botResponse.sources,
    used_fallback: botResponse.usedFallback,
    needs_human_support: botResponse.needsHumanSupport,
    created_at: now,
  };

  localChatMessagesCache.push(userMsgObj, botMsgObj);

  if (env.isSupabaseConfigured) {
    try {
      await supabase.from('chat_messages').insert([
        {
          session_id: sessionId,
          role: 'user',
          content: userMessage,
          created_at: now,
        },
        {
          session_id: sessionId,
          role: 'assistant',
          content: botResponse.answer,
          sources: botResponse.sources,
          used_fallback: botResponse.usedFallback,
          needs_human_support: botResponse.needsHumanSupport,
          created_at: now,
        },
      ]);
    } catch (e) {
      console.warn('Could not insert chat message into Supabase:', e);
    }
  }
}

export async function getChatbotStats() {
  const fallbackStats = {
    totalSessions: localChatSessionsCache.length,
    totalMessages: localChatMessagesCache.length,
    userMessagesCount: localChatMessagesCache.filter((m) => m.role === 'user').length,
    assistantMessagesCount: localChatMessagesCache.filter((m) => m.role === 'assistant').length,
    avgResponseTimeMs: null,
    primaryModelSuccessCount: localChatMessagesCache.filter((m) => m.role === 'assistant' && m.used_fallback === false).length,
    fallbackUsedCount: localChatMessagesCache.filter((m) => m.role === 'assistant' && m.used_fallback === true).length,
    knowledgeNotFoundCount: localChatMessagesCache.filter((m) => m.role === 'assistant' && m.knowledge_found === false).length,
    unansweredCount: 0,
    errorsCount: 0,
  };

  if (!env.isSupabaseConfigured) {
    return fallbackStats;
  }

  try {
    const { count: sessionsCount, error: sErr } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    if (sErr) {
      console.error("[AdminDashboard] query result error", {
        resource: "chat_sessions",
        errorCode: sErr.code,
        errorMessage: sErr.message,
      });
    }

    const { data: userRows, error: userError } = await supabase
      .from("chat_messages")
      .select("id")
      .eq("role", "user");

    const { data: assistantRows, error: assistantError } = await supabase
      .from("chat_messages")
      .select("id")
      .eq("role", "assistant");

    const { data: knowledgeMissingRows, error: knowledgeMissingError } =
      await supabase
        .from("chat_messages")
        .select("id")
        .eq("role", "assistant")
        .eq("knowledge_found", false);

    const { data: fallbackRows, error: fallbackError } = await supabase
      .from("chat_messages")
      .select("id")
      .eq("role", "assistant")
      .eq("used_fallback", true);

    const { data: primaryRows, error: primaryError } = await supabase
      .from("chat_messages")
      .select("id")
      .eq("role", "assistant")
      .eq("used_fallback", false);

    const countQueryError =
      userError ||
      assistantError ||
      knowledgeMissingError ||
      fallbackError ||
      primaryError;
    if (countQueryError) throw countQueryError;

    // Calculate avg response_time_ms if available
    let avgResponseTimeMs: number | null = null;
    try {
      const { data: timingData, error: timingErr } = await supabase
        .from('chat_messages')
        .select('response_time_ms')
        .eq('role', 'assistant')
        .not('response_time_ms', 'is', null);

      if (!timingErr && timingData && timingData.length > 0) {
        const sum = timingData.reduce((acc, cur) => acc + (cur.response_time_ms || 0), 0);
        avgResponseTimeMs = Math.round(sum / timingData.length);
      }
    } catch (err) {
      avgResponseTimeMs = null;
    }

    const userCount = Array.isArray(userRows) ? userRows.length : 0;
    const assistantCount = Array.isArray(assistantRows) ? assistantRows.length : 0;
    const knowledgeMissingCount = Array.isArray(knowledgeMissingRows) ? knowledgeMissingRows.length : 0;
    const fallbackCount = Array.isArray(fallbackRows) ? fallbackRows.length : 0;
    const primaryCount = Array.isArray(primaryRows) ? primaryRows.length : 0;
    const safeTotal = userCount + assistantCount;

    return {
      totalSessions: sessionsCount || 0,
      totalMessages: safeTotal,
      userMessagesCount: userCount,
      assistantMessagesCount: assistantCount,
      avgResponseTimeMs,
      primaryModelSuccessCount: primaryCount,
      fallbackUsedCount: fallbackCount,
      knowledgeNotFoundCount: knowledgeMissingCount,
      unansweredCount: 0,
      errorsCount: 0,
    };
  } catch (e: any) {
    console.info("[AdminDashboard] query result", {
      resource: "chatbot_stats",
      rowCount: null,
      errorCode: e?.code || "catch_error",
      errorMessage: e?.message || String(e),
    });
    return fallbackStats;
  }
}

export async function getChatSessionsAdmin(limit: number = 50): Promise<ChatSession[]> {
  if (!env.isSupabaseConfigured) {
    return localChatSessionsCache;
  }

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.info("[AdminDashboard] query result", {
        resource: "chat_sessions_list",
        rowCount: null,
        errorCode: error.code,
        errorMessage: error.message,
      });
      return localChatSessionsCache;
    }

    console.info("[AdminDashboard] query result", {
      resource: "chat_sessions_list",
      rowCount: data?.length || 0,
      errorCode: null,
      errorMessage: null,
    });

    return (data || []) as ChatSession[];
  } catch (err: any) {
    console.info("[AdminDashboard] query result", {
      resource: "chat_sessions_list",
      rowCount: null,
      errorCode: err?.code || "catch_error",
      errorMessage: err?.message || String(err),
    });
    return localChatSessionsCache;
  }
}

export async function getChatSessionMessagesAdmin(sessionId: string): Promise<ChatMessage[]> {
  if (!env.isSupabaseConfigured) {
    return localChatMessagesCache.filter((m) => m.session_id === sessionId);
  }

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.info("[AdminDashboard] query result", {
        resource: "chat_session_messages",
        rowCount: null,
        errorCode: error.code,
        errorMessage: error.message,
      });
      return [];
    }

    console.info("[AdminDashboard] query result", {
      resource: "chat_session_messages",
      rowCount: data?.length || 0,
      errorCode: null,
      errorMessage: null,
    });

    return (data || []) as ChatMessage[];
  } catch (err: any) {
    console.info("[AdminDashboard] query result", {
      resource: "chat_session_messages",
      rowCount: null,
      errorCode: err?.code || "catch_error",
      errorMessage: err?.message || String(err),
    });
    return [];
  }
}
