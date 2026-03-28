import { supabase } from "@/integrations/supabase/client";

export type ResultData = {
  totalCO2: number;
  grade: string;
  items: { name: string; co2: number }[];
};

export type SwapItem = {
  original: string;
  swap: string;
  saveCO2: number;
};

export type HistoryItem = {
  id: string;
  date: string;
  co2: number;
  grade: string;
  items: number;
};

export const api = {
  uploadReceipt: async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("receipts")
      .upload(filePath, file);

    if (error) throw error;
    return { receiptPath: filePath };
  },

  analyzeReceipt: async (receiptPath: string): Promise<ResultData & { scanId: string; swaps: SwapItem[] }> => {
    const { data, error } = await supabase.functions.invoke("analyze-receipt", {
      body: { receiptUrl: receiptPath },
    });

    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data;
  },

  getSwaps: async (scanId: string): Promise<SwapItem[]> => {
    const { data, error } = await supabase
      .from("swap_suggestions")
      .select("*")
      .eq("scan_id", scanId);

    if (error) throw error;
    return (data || []).map((s) => ({
      original: s.original,
      swap: s.swap,
      saveCO2: s.save_co2,
    }));
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from("scans")
      .select("id, created_at, total_co2, grade, scan_items(id)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((scan) => ({
      id: scan.id,
      date: scan.created_at,
      co2: scan.total_co2,
      grade: scan.grade,
      items: Array.isArray(scan.scan_items) ? scan.scan_items.length : 0,
    }));
  },

  getScanResult: async (scanId: string): Promise<ResultData> => {
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .single();

    if (scanError) throw scanError;

    const { data: items, error: itemsError } = await supabase
      .from("scan_items")
      .select("*")
      .eq("scan_id", scanId);

    if (itemsError) throw itemsError;

    return {
      totalCO2: scan.total_co2,
      grade: scan.grade,
      items: (items || []).map((i) => ({ name: i.name, co2: i.co2 })),
    };
  },
};
