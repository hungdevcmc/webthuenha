import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, HandCoins, Lock, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { siteConfig, telLink, zaloLink } from "@/config/site";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cam kết minh bạch",
  description:
    "Thông tin minh bạch về dự án: quan hệ với Ban tổ chức chương trình, tính chất tài chính, cách sử dụng dữ liệu cá nhân và kênh tiếp nhận phản hồi.",
  alternates: { canonical: "/cam-ket" },
};

const { compliance, contact, school } = siteConfig;

function Section({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: typeof ShieldCheck;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <section
      className={
        tone === "warning"
          ? "rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-5"
          : "rounded-2xl border border-stone-200 bg-white p-5"
      }
    >
      <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink">
        <span
          className={
            tone === "warning"
              ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
              : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"
          }
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink">{children}</div>
    </section>
  );
}

export default function CommitmentPage() {
  const tel = telLink(contact.phoneRaw);
  const zalo = zaloLink(contact.phoneRaw);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Cam kết minh bạch</h1>
          <p className="mt-2 text-muted">
            Trang này nói rõ website là gì, ai đứng sau, có thu tiền hay không và dữ liệu của bạn được dùng thế nào.
          </p>
        </header>

        <div className="space-y-4">
          <Section icon={AlertTriangle} title="1. Quan hệ với Ban tổ chức chương trình" tone="warning">
            <p className="font-semibold">{compliance.disclaimer}</p>
            <p className="text-muted">
              Website do một học viên tự xây dựng và tự vận hành để giúp các bạn cùng khóa tìm chỗ ở gần {school.name}.
              Mọi vấn đề phát sinh từ website thuộc trách nhiệm của người vận hành, không thuộc trách nhiệm của Ban tổ
              chức.
            </p>
          </Section>

          <Section icon={HandCoins} title="2. Minh bạch về tài chính">
            {compliance.nonProfit ? (
              <>
                <p className="font-semibold">Đây là dự án phi lợi nhuận 100%.</p>
                <ul className="list-disc space-y-1.5 pl-5 text-muted">
                  <li>Người vận hành không nhận hoa hồng hay chiết khấu từ chủ nhà cho bất kỳ hợp đồng nào.</li>
                  <li>Học viên dùng website hoàn toàn miễn phí, đăng tin miễn phí, không có gói trả phí nào.</li>
                  <li>Website không có chức năng thanh toán. Mọi khoản tiền bạn trả là trả thẳng cho chủ nhà.</li>
                  <li>Chi phí máy chủ hiện nằm trong gói miễn phí và do người vận hành tự chịu.</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  Dự án có phát sinh chi phí, và toàn bộ chi phí này do chủ nhà chi trả.
                </p>
                <p>{compliance.commissionNote}</p>
                <ul className="list-disc space-y-1.5 pl-5 text-muted">
                  <li>
                    <span className="font-semibold text-ink">Học viên dùng website hoàn toàn miễn phí</span>: xem tin
                    miễn phí, đăng tin miễn phí, xem phòng miễn phí, không có gói trả phí nào.
                  </li>
                  <li>Khoản chi phí này do phía chủ nhà thanh toán, không cộng thêm vào tiền thuê của bạn.</li>
                  <li>Website không có chức năng thanh toán. Tiền thuê và tiền cọc bạn trả thẳng cho chủ nhà.</li>
                  <li>
                    Chúng tôi công khai điều này để bạn nắm rõ và tự cân nhắc khi tham khảo thông tin trên website.
                  </li>
                </ul>
              </>
            )}
          </Section>

          <Section icon={Lock} title="3. Cam kết bảo mật dữ liệu">
            <p>Khi bạn đăng tin, website lưu tên, số điện thoại, Zalo và ảnh phòng bạn tải lên. Cam kết của chúng tôi:</p>
            <ul className="list-disc space-y-1.5 pl-5 text-muted">
              <li>
                Dữ liệu <span className="font-semibold text-ink">chỉ dùng duy nhất</span> cho mục đích tìm phòng và ghép
                phòng giữa các học viên.
              </li>
              <li>
                <span className="font-semibold text-ink">Tuyệt đối không</span> chia sẻ, bán hoặc trao đổi dữ liệu cho
                bất kỳ bên thứ ba nào, kể cả môi giới hay đơn vị quảng cáo.
              </li>
              <li>Website không dùng công cụ theo dõi hành vi, không đặt quảng cáo, không thu thập dữ liệu ngầm.</li>
              <li>
                Toàn bộ dữ liệu sẽ được đóng và xóa {compliance.dataRetention}.
              </li>
              <li>
                Bạn có thể yêu cầu gỡ tin hoặc xóa thông tin của mình bất cứ lúc nào bằng cách gọi hoặc nhắn Zalo tới số
                bên dưới. Chúng tôi xử lý trong vòng 24 giờ.
              </li>
            </ul>
            <p className="rounded-xl bg-stone-50 p-3 text-sm text-muted">
              Lưu ý: số điện thoại bạn nhập khi đăng tin sẽ hiển thị công khai trên tin đó, vì người muốn thuê cần gọi
              cho bạn. Nếu không muốn công khai, vui lòng không đăng tin.
            </p>
          </Section>

          <Section icon={MessageSquareWarning} title="4. Phản hồi và báo cáo vi phạm">
            <p>
              Nếu bạn gặp tình trạng ép giá, tranh chấp tiền cọc, thông tin sai sự thật hay bất kỳ hành vi nào khiến bạn
              thấy không an toàn, hãy báo ngay. Chúng tôi sẽ gỡ tin vi phạm trong vòng 24 giờ.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {tel ? (
                <a href={tel} className={buttonClasses("primary", "md")}>
                  Gọi {contact.phone}
                </a>
              ) : null}
              {zalo ? (
                <a href={zalo} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md")}>
                  Nhắn Zalo
                </a>
              ) : null}
            </div>
            <p className="text-sm text-muted">
              Tin đăng do người dùng tự nhập, chúng tôi không thẩm định được tính chính xác của từng tin. Vui lòng xem
              phòng tận nơi và đọc kỹ hợp đồng trước khi đặt cọc.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="5. Lời khuyên an toàn khi thuê phòng">
            <ul className="list-disc space-y-1.5 pl-5 text-muted">
              <li>Luôn xem phòng trực tiếp trước khi chuyển bất kỳ khoản tiền nào.</li>
              <li>Không chuyển cọc cho người lạ khi chưa gặp mặt và chưa xem giấy tờ nhà.</li>
              <li>Yêu cầu hợp đồng bằng văn bản, ghi rõ tiền cọc, tiền điện nước và điều kiện trả phòng.</li>
              <li>Giữ lại biên nhận hoặc sao kê mỗi lần đóng tiền.</li>
              <li>Nên rủ thêm một người bạn cùng đi xem phòng.</li>
            </ul>
          </Section>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Còn thắc mắc? Gọi {contact.phone} hoặc quay lại{" "}
          <Link href="/" className="font-semibold text-brand-700 underline">
            trang chủ
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
