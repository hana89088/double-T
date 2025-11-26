import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Brain, FileText, LayoutDashboard, Sparkles } from "lucide-react";

const features = [
  {
    title: "Nhập dữ liệu linh hoạt",
    description: "Kéo thả CSV, Excel hoặc dán nhanh văn bản. Hệ thống tự nhận dạng định dạng và làm sạch header, ngày tháng.",
    icon: FileText,
    accent: "bg-sky-100 text-sky-600",
  },
  {
    title: "Phân tích AI tức thì",
    description: "Mô hình gợi ý insight, phân nhóm và các chỉ số chính ngay sau khi tải lên, không cần thiết lập phức tạp.",
    icon: Brain,
    accent: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Dashboard gọn gàng",
    description: "Biểu đồ, bảng và trạng thái được gom theo mục tiêu marketing giúp bạn nắm bắt hiệu quả chiến dịch nhanh chóng.",
    icon: LayoutDashboard,
    accent: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Báo cáo nhẹ & đẹp",
    description: "Xuất báo cáo PDF/Link được tối ưu màu sắc, khoảng cách và typography theo chuẩn hiện đại.",
    icon: BarChart3,
    accent: "bg-amber-100 text-amber-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Marketing Insights</p>
              <p className="text-lg font-semibold text-slate-900">AI Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-slate-900 px-4 text-white hover:bg-slate-800">Bắt đầu miễn phí</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
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
            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button className="bg-slate-900 px-6 text-white hover:bg-slate-800">Trải nghiệm ngay</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-slate-200 px-6 text-slate-700 hover:bg-slate-100">
                  Tôi đã có tài khoản
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-none bg-white/70 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    UI tinh gọn
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  Bố cục dạng lưới, khoảng cách nhất quán 8/12/16px, ưu tiên nội dung chính, giảm yếu tố trang trí.
                </CardContent>
              </Card>
              <Card className="border-none bg-white/70 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    Tốc độ & responsive
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  Giảm lặp code, tải nhanh trên mobile, vẫn giữ đầy đủ CTA và điều hướng rõ ràng.
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-none bg-white/80 shadow-xl ring-1 ring-slate-200">
            <CardHeader className="space-y-3 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-500">Luồng thao tác mới</p>
                  <p className="text-lg font-semibold text-slate-900">Upload → Insight → Dashboard → Report</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Mỗi bước chỉ hiển thị các trường bắt buộc, bỏ bớt các thanh công cụ rườm rà để người dùng tập trung vào kết quả.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tự động hóa thao tác lặp</p>
                  <p className="text-sm text-slate-600">
                    Gợi ý cấu hình đồ thị, bộ lọc và định dạng báo cáo dựa trên lịch sử sử dụng, giảm thời gian thiết lập.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Trải nghiệm nhất quán</p>
                  <p className="text-sm text-slate-600">
                    Typography 16/24, màu nền trung tính, nhấn mạnh CTA chính, đảm bảo khả năng đọc và thao tác trên mọi thiết bị.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Sẵn sàng mở rộng</p>
                  <p className="text-sm text-slate-600">
                    Cấu trúc thẻ và component thống nhất giúp dễ thêm tính năng mà không phá vỡ bố cục hay tăng kích thước bundle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-14 space-y-8 lg:mt-16">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Tối ưu UI/UX</p>
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Giao diện gọn gàng, dễ đọc, dễ nhấn</h2>
              <p className="text-base text-slate-600">
                Tận dụng lưới 12 cột, khoảng cách rõ ràng, màu sắc hài hòa để người dùng tập trung vào dữ liệu và insight.
              </p>
            </div>
            <Link to="/register" className="text-sm font-semibold text-slate-700 underline decoration-2 underline-offset-4">
              Xem demo nhanh
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ title, description, icon: Icon, accent }) => (
              <Card key={title} className="border-none bg-white/80 shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-2">
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-slate-600">{description}</CardContent>
              </Card>
            ))}
          </div>
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
