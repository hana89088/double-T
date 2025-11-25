# Marketing Insights — Developer Guide

## Data Flow
- Upload data in `Data Input` → preprocessing pipeline runs (clean, fill missing, normalize, clip outliers) → set `ready=true` and persist to store.
- `Analysis` uses `processedData` when `ready=true`. If `ready=false`, it shows a clear message instead of fake data.
- `Visualization` consumes `processedData` when schema phù hợp, fallback an toàn nếu không.

## Visualization Filters & Export
- Filters:
  - Category filter: chọn cột dạng chuỗi và danh mục cần hiển thị.
  - Range filter: chọn cột số và nhập `min/max` để lọc dữ liệu.
- Zoom: dùng Brush trên biểu đồ Bar/Line để phóng to đoạn dữ liệu.
- Export: nút `Export PNG` lưu ảnh biểu đồ.

## Reports & Exports
- Xuất báo cáo: CSV, Excel (xlsx), PDF tóm tắt, JSON.
- Lập lịch: lưu cấu hình (daily/weekly, time) vào localStorage; hiển thị “Next run”.

## Testing
- Chạy `pnpm test`.
- Bao gồm kiểm thử unit/integration cơ bản cho data processing, Supabase service, export PNG/CSV (jsdom).

## Deploy
- Push lên `master` → Vercel sẽ tự động redeploy.
- Env cần thiết: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, `VITE_GEMINI_MODEL_NAME` (khuyến nghị `gemini-2.5-flash`).
- Cấu hình các biến môi trường này trực tiếp trong phần `Project Settings` → `Environment Variables` của Vercel. File `vercel.json` không còn tham chiếu tới Vercel Secrets nên sẽ không lỗi nếu chưa tạo secret.
