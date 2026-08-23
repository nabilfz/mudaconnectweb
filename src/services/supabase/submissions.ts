import { supabase } from './client';
import { env } from './env';
import { Submission, SubmissionStatus } from '../../types';
import { DEMO_SUBMISSIONS } from './demoData';
import { logAuditAction } from './audit';

let localSubmissionsCache: Submission[] = DEMO_SUBMISSIONS.map((s) => ({
  ...s,
  program_title_snapshot: s.program_title || 'Program Unggulan',
}));

export async function getAllSubmissionsAdmin(): Promise<Submission[]> {
  if (!env.isSupabaseConfigured) {
    return localSubmissionsCache.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  try {
    const { data: subData, error: subError } = await supabase
      .from('interest_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('Error fetching interest submissions from Supabase:', subError);
      return [];
    }

    if (!subData || subData.length === 0) {
      return [];
    }

    // Fetch program IDs and titles to build a lookup map
    const programMap: Record<string, string> = {};
    try {
      const { data: progData } = await supabase
        .from('programs')
        .select('id, title');
      if (progData) {
        progData.forEach((p: any) => {
          if (p.id && p.title) {
            programMap[String(p.id)] = p.title;
          }
        });
      }
    } catch (progErr) {
      console.warn('Could not load programs for lookup:', progErr);
    }

    return subData.map((item: any) => {
      const programId = item.program_id ? String(item.program_id) : '';
      const mappedTitle = programId ? (programMap[programId] || 'Program tidak tersedia') : 'Program tidak tersedia';
      return {
        ...item,
        status: item.submission_status || item.status,
        decision_status: item.decision_status || 'pending',
        notification_status: item.notification_status || 'not_sent',
        decision_at: item.decision_at || null,
        decision_by: item.decision_by || null,
        notification_sent_at: item.notification_sent_at || null,
        notification_error: item.notification_error || null,
        program_title_snapshot: item.program_title_snapshot || mappedTitle || item.program_title || '-',
        domicile: item.domicile || item.domisili || '-',
      } as Submission;
    });
  } catch (err) {
    console.error('Error in getAllSubmissionsAdmin:', err);
    return [];
  }
}

export async function submitInterestDecisionAdmin(
  submissionId: string,
  decision: 'accepted' | 'rejected'
): Promise<{ success: boolean; message: string; data?: any }> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session || !session.access_token) {
    return {
      success: false,
      message: 'Sesi admin telah berakhir. Silakan login kembali.',
    };
  }

  if (!env.apiProxyEnabled) {
    return {
      success: false,
      message: 'Layanan keputusan peserta belum dikonfigurasi.',
    };
  }

  try {
    const response = await fetch('/api/interest-decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        submissionId,
        decision,
      }),
    });

    let resData: any = {};
    try {
      resData = await response.json();
    } catch (_) {
      // Ignore json parsing error
    }

    if (!response.ok || resData.success === false) {
      const statusMap: Record<number, string> = {
        400: 'Data keputusan tidak valid.',
        401: 'Sesi admin telah berakhir. Silakan login kembali.',
        403: 'Akun tidak memiliki izin untuk mengambil keputusan.',
        404: 'Data Form Minat tidak ditemukan.',
        409: 'Keputusan sedang diproses atau sudah pernah dibuat.',
        422: 'Data peserta atau program belum lengkap.',
        502: 'Email pemberitahuan gagal dikirim. Keputusan belum disimpan dan dapat dicoba kembali.',
      };

      const fallbackMsg = statusMap[response.status] || 'Layanan keputusan peserta sementara tidak dapat diakses.';
      const finalMsg =
        typeof resData?.message === 'string' && resData.message.trim().length > 0 && resData.message.length < 150
          ? resData.message
          : fallbackMsg;

      return {
        success: false,
        message: finalMsg,
      };
    }

    await logAuditAction({
      action: 'PROCESS_DECISION',
      entityType: 'interest_submissions',
      entityId: submissionId,
      summary: `Proses keputusan peserta: ${decision === 'accepted' ? 'Diterima' : 'Ditolak'}`,
    });

    return {
      success: true,
      message: resData.message || (decision === 'accepted' ? 'Peserta berhasil diterima.' : 'Peserta berhasil ditolak.'),
      data: resData,
    };
  } catch (err) {
    console.error('Error calling interest decision webhook:', err);
    return {
      success: false,
      message: 'Layanan keputusan peserta sementara tidak dapat diakses.',
    };
  }
}

export async function updateSubmissionStatusAdmin(
  id: string,
  status?: SubmissionStatus | null,
  admin_notes?: string
): Promise<Submission | null> {
  if (!env.isSupabaseConfigured) {
    localSubmissionsCache = localSubmissionsCache.map((sub) =>
      sub.id === id ? { ...sub, ...(status ? { status } : {}), admin_notes: admin_notes ?? sub.admin_notes } : sub
    );
    return localSubmissionsCache.find((s) => s.id === id) || null;
  }

  const updateFields: Record<string, any> = {};

  if (status) {
    const statusMap: Record<string, string> = {
      baru: 'new',
      ditinjau: 'reviewed',
      dihubungi: 'contacted',
      selesai: 'closed',
      ditolak: 'closed',
      diarsipkan: 'archived',
    };
    const nextStatus = statusMap[status] || status;
    updateFields.submission_status = nextStatus;
  }

  if (admin_notes !== undefined) {
    updateFields.admin_notes = admin_notes.trim();
  }
  updateFields.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('interest_submissions')
      .update(updateFields)
      .eq('id', id)
      .select('id, submission_status, updated_at, admin_notes')
      .maybeSingle();

    if (error) {
      console.error('[AdminStatusUpdate]', {
        resource: 'interest_submissions',
        recordId: id,
        attemptedStatus: updateFields.submission_status ?? null,
        errorCode: error?.code ?? null,
        errorMessage: error?.message ?? null,
      });
      return { _error: error } as any; // to signal error
    }

    if (!data) {
      console.error('Failed to update submission in Supabase: data is null');
      return null;
    }

    // Since we only selected some fields, we don't return the full updated sub from DB here,
    // we'll just return a shallow merge or rely on the caller to fetch/update local state.
    // However, the caller expects a Submission. We can return the fields we have.
    const updatedSub = {
      id: data.id,
      status: data.submission_status,
      admin_notes: data.admin_notes,
    } as any;

    await logAuditAction({
      action: 'UPDATE_STATUS',
      entityType: 'interest_submissions',
      entityId: id,
      summary: `Perbarui data pengajuan minat (Status: ${updateFields.submission_status ?? 'tetap'})`,
    });

    return updatedSub;
  } catch (err) {
    console.error('Error in updateSubmissionStatusAdmin:', err);
    return null;
  }
}

export function recordLocalSubmission(submission: Submission) {
  localSubmissionsCache.unshift(submission);
}
