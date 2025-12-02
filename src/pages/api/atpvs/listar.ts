// pages/api/atpvs/listar.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, where, orderBy, limit as fsLimit } from 'firebase/firestore';
import { db } from '@/logic/firebase/config/app';

const API_KEY = 'Nl8lhjWpE4efMw24Rd_FbHD6e1dBvi6bpc8DxBY3-P0';

type FirestoreDateLike = Date | string | { toDate?: () => Date };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');

  // Auth
  const key = req.headers['authorization'];
  if (key !== `Bearer ${API_KEY}`) {
    return res.status(401).json({ error: true, message: 'Não autorizado. Token inválido ou ausente.' });
  }

  // Só GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: true, message: 'Método não permitido. Use GET.' });
  }

  const { page = '1', limit = '10', status, dataInicio, dataFim } = req.query;

  const pageNum = Number.parseInt(String(page), 10) || 1;
  const pageLimit = Math.min(Math.max(Number.parseInt(String(limit), 10) || 10, 1), 200); // 1..200

  // Parse datas vindas como string
  const parseMaybeDate = (v: unknown): Date | null => {
    if (typeof v !== 'string' || !v.trim()) return null;
    const isSimple = /^\d{4}-\d{2}-\d{2}$/.test(v.trim());
    const normalized = isSimple ? `${v}T00:00:00` : v;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  };

  // Converte params -> Date
  let startDate = parseMaybeDate(dataInicio);
  const endDateRaw = parseMaybeDate(dataFim);

  // Se vier só YYYY-MM-DD em dataFim, empurra p/ 23:59:59.999 do mesmo dia
  let endDate =
    endDateRaw && typeof dataFim === 'string' && /^\d{4}-\d{2}-\d{2}(?!T)/.test(dataFim)
      ? new Date(endDateRaw.getTime() + (24 * 60 * 60 * 1000 - 1))
      : endDateRaw;

  // Normaliza período invertido
  let swapped = false;
  if (startDate && endDate && endDate < startDate) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
    swapped = true;
  }

  try {
    const ref = collection(db, 'OrdensDeServicoBludata');

    // PROBE: detecta o tipo do campo dataSolicitacao (string ISO vs Timestamp)
    let dataIsString = true; // default: string (pelo que você mostrou)
    try {
      const probeSnap = await getDocs(query(ref, orderBy('dataSolicitacao', 'desc'), fsLimit(1)));
      const probeVal: FirestoreDateLike | undefined = probeSnap.docs[0]?.get('dataSolicitacao');
      if (probeVal && typeof probeVal === 'object' && typeof (probeVal as any).toDate === 'function') {
        dataIsString = false; // Firestore Timestamp/Date
      } else if (typeof probeVal === 'string') {
        dataIsString = true; // string ISO
      }
    } catch {
      // Se falhar o probe, seguimos assumindo string
      dataIsString = true;
    }

    // Monta condições de forma compatível com o TIPO do campo
    const conditions: any[] = [];

    // status
    if (status !== undefined) {
      const statusNum = Number(status);
      if (!Number.isNaN(statusNum)) {
        conditions.push(where('status', '==', statusNum));
      }
    }

    // Período
    if (startDate || endDate) {
      if (dataIsString) {
        // Comparação como STRING ISO (ordem lexicográfica == cronológica)
        const startISO = startDate ? startDate.toISOString() : undefined;
        const endISO = endDate ? endDate.toISOString() : undefined;

        if (startISO && endISO) {
          conditions.push(where('dataSolicitacao', '>=', startISO));
          conditions.push(where('dataSolicitacao', '<=', endISO));
        } else if (startISO) {
          conditions.push(where('dataSolicitacao', '>=', startISO));
        } else if (endISO) {
          conditions.push(where('dataSolicitacao', '<=', endISO));
        }
      } else {
        // Comparação como Date/Timestamp
        if (startDate && endDate) {
          conditions.push(where('dataSolicitacao', '>=', startDate));
          conditions.push(where('dataSolicitacao', '<=', endDate));
        } else if (startDate) {
          conditions.push(where('dataSolicitacao', '>=', startDate));
        } else if (endDate) {
          conditions.push(where('dataSolicitacao', '<=', endDate));
        }
      }
    }

    // Query final (ordenando por dataSolicitacao desc)
    const q = query(ref, ...conditions, orderBy('dataSolicitacao', 'desc'));

    // Pega tudo e pagina via slice (para bases grandes, prefira cursor startAfter)
    const snap = await getDocs(q);
    const total = snap.size;

    const sliceStart = (pageNum - 1) * pageLimit;
    const sliceEnd = sliceStart + pageLimit;
    const pageDocs = snap.docs.slice(sliceStart, sliceEnd);

    const atpvs = pageDocs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return res.status(200).json({
      atpvs,
      page: pageNum,
      limit: pageLimit,
      total,
      totalPages: Math.ceil(total / pageLimit),
      appliedFilters: {
        status: status !== undefined ? Number(status) : undefined,
        dataInicio: startDate ? startDate.toISOString() : undefined,
        dataFim: endDate ? endDate.toISOString() : undefined,
        swapped,
        dataIsStringField: dataIsString,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar ATPVs:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro interno do servidor',
      details: error?.message || String(error),
    });
  }
}
