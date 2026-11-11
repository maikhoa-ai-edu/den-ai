// Cửa vào cơ sở dữ liệu cho các hàm trong api/.
// Trên Vercel: Supabase (db-supabase.js). Chạy thử trên máy cá nhân: bộ nhớ tạm (db-tam.js).

import { CHAY_THU } from './mac-dinh.js';
import * as supabase from './db-supabase.js';
import * as tam from './db-tam.js';

const db = CHAY_THU ? tam : supabase;

export const {
  docCauHinh, ghiCauHinh,
  demPromptGop, demGanDay, vuaCoTrung, themPrompt,
  dsPrompt, layPrompt, capNhatPrompt,
  dsPhanLoai, luuPhanLoai, dsKhoa, themKhoa,
  dsDoiKhop, luuDoiKhop,
  dsTinhHuong, luuTinhHuong, demTheoTinhHuong
} = db;
