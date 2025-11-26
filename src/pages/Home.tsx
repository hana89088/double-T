import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Brain, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Marketing Insights</p>
              <p className="text-lg font-semibold text-slate-900">AI Analytics</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100 sm:w-auto">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <Button className="w-full bg-slate-900 px-4 text-white hover:bg-slate-800 sm:w-auto">Bắt đầu miễn phí</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-sm font-medium text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Nền tảng webtool tối ưu cho marketer 2024
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Đơn giản hóa quy trình phân tích marketing với một giao diện gọn, nhẹ và trực quan.
              </h1>
              <p className="text-lg text-slate-600 sm:text-xl">
                Chỉ tập trung vào những bước cần thiết: nhập dữ liệu, xem insight, dựng dashboard và xuất báo cáo. Không còn
                menu thừa hay thao tác dư thừa.
              </p>
            </div>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full bg-slate-900 px-6 text-white hover:bg-slate-800 sm:w-auto">Trải nghiệm ngay</Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-slate-200 px-6 text-slate-700 hover:bg-slate-100 sm:w-auto">
                  Tôi đã có tài khoản
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-none bg-white/80 shadow-xl ring-1 ring-slate-200">
            <CardHeader className="space-y-3 border-b border-slate-100 pb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                    <Brain className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Luồng thao tác mới</p>
                    <p className="text-lg font-semibold text-slate-900">Upload → Insight → Dashboard → Report</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 sm:w-auto"
                >
                  Xem chi tiết
                </Button>
              </div>
              <p className="text-sm text-slate-600">
                Mỗi bước chỉ hiển thị các trường bắt buộc, bỏ bớt các thanh công cụ rườm rà để người dùng tập trung vào kết quả.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-start sm:p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">Tự động hóa thao tác lặp</p>
                  <p className="text-sm text-slate-600">
                    Gợi ý cấu hình đồ thị, bộ lọc và định dạng báo cáo dựa trên lịch sử sử dụng, giảm thời gian thiết lập.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-start sm:p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">Trải nghiệm nhất quán</p>
                  <p className="text-sm text-slate-600">
                    Typography 16/24, màu nền trung tính, nhấn mạnh CTA chính, đảm bảo khả năng đọc và thao tác trên mọi thiết bị.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-start sm:p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">Sẵn sàng mở rộng</p>
                  <p className="text-sm text-slate-600">
                    Cấu trúc thẻ và component thống nhất giúp dễ thêm tính năng mà không phá vỡ bố cục hay tăng kích thước bundle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:px-8">
          <p className="text-sm text-slate-600">© 2024 Marketing Insights. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Chính sách bảo mật</span>
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
