"use client";

import {
  Mail,
  Send,
  Clock,
  Shield,
  MessageSquare,
  FileWarning,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ContactClient = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="pt-wrap py-2">
        <div className="">
          <h1 className="mb-1.5 w-full border-b-2 border-[var(--pt-text)] pb-1.5 text-[17px] font-extrabold leading-tight tracking-tight">
            문의하기
          </h1>
          <p className="text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            궁금한 점이나 의견이 있거나 도움이 필요하신가요? 언제든 연락 주시면 최대한 빠르게 답변드리겠습니다.
          </p>
        </div>
      </section>

      {/* Email Contact Section */}
      <section className="py-3 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="md:col-span-3">
            <Card className="border shadow-lg max-w-2xl mx-auto text-center">
              <CardHeader>
                <CardTitle className="text-2xl">문의하기</CardTitle>
                <CardDescription className="text-lg mt-2">
                  지원, 저작권, 제휴 문의는 이메일로 직접 보내 주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-3 space-y-2">
                <div className="flex justify-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-8 rounded-full">
                    <Mail className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    공식 지원 이메일
                  </p>
                  <a
                    href="mailto:support@ssdown.app"
                    className="text-3xl font-bold hover:text-indigo-600 transition-colors block"
                  >
                    support@ssdown.app
                  </a>
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 h-auto"
                    asChild
                  >
                    <a href="mailto:support@ssdown.app">
                      <Send className="mr-2 h-5 w-5" />
                      이메일 보내기
                    </a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground pt-8">
                  모든 문의에 영업일 기준 24시간 안에 답변드리는 것을 목표로 합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Categories */}
      <section className="py-3 bg-gray-50 dark:bg-gray-900/20 border-y">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            무엇을 도와드릴까요?
          </h2>
          <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            가장 알맞은 답변을 빠르게 드릴 수 있도록 문의 유형을 나누어 처리하고 있습니다. 아래와 같은 내용으로 연락하실 수 있습니다.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              {
                icon: HelpCircle,
                title: "일반 문의",
                desc: "도구를 쓰다 문제가 생기셨나요? 오류나 예기치 못한 동작이 있다면 자세한 내용을 보내 주세요. 빠르게 해결을 도와드리겠습니다.",
                color: "text-blue-500",
                bg: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: FileWarning,
                title: "Copyright & DMCA",
                desc: "저작권이 있는 콘텐츠가 저희 서비스를 통해 부적절하게 이용되고 있다고 판단되시면, 관련 내용을 담아 연락 주시면 신속히 처리하겠습니다.",
                color: "text-red-500",
                bg: "bg-red-100 dark:bg-red-900/30",
              },
              {
                icon: Briefcase,
                title: "제휴 문의",
                desc: "제휴나 광고, SSDown과의 연동에 관심이 있으신가요? 저희 방향과 맞는 협업이라면 언제든 환영합니다.",
                color: "text-green-500",
                bg: "bg-green-100 dark:bg-green-900/30",
              },
              {
                icon: MessageSquare,
                title: "Feedback & Suggestions",
                desc: "여러분의 의견이 저희 서비스를 만듭니다. 원하시는 기능, 만족스러운 점, 개선이 필요한 부분을 알려 주세요.",
                color: "text-purple-500",
                bg: "bg-purple-100 dark:bg-purple-900/30",
              },
              {
                icon: Shield,
                title: "개인정보 문의",
                desc: "저희는 개인정보를 중요하게 다룹니다. 데이터와 쿠키, 제3자 서비스 처리 방식에 대해 궁금한 점이 있으시면 언제든 답변드리겠습니다.",
                color: "text-orange-500",
                bg: "bg-orange-100 dark:bg-orange-900/30",
              },
              {
                icon: Clock,
                title: "답변 소요 시간",
                desc: "보통 영업일 기준 24시간 안에 답변드립니다. 긴급한 저작권 사안은 법규 준수를 위해 우선 처리합니다.",
                color: "text-cyan-500",
                bg: "bg-cyan-100 dark:bg-cyan-900/30",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="border-0 shadow-sm bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bg} mb-4`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-3 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <h2 className="mb-1.5 border-b border-[var(--pt-line-strong)] pb-1 text-[14px] font-bold tracking-tight">
            자주 묻는 질문
          </h2>
          <p className="mb-2 text-[12px] leading-relaxed text-[var(--pt-text-sub)]">
            문의하시기 전에 여기서 답을 찾으실 수도 있습니다.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-left">
                답변은 얼마나 걸리나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                모든 이메일에 영업일 기준 24시간 안에 답변드리는 것을 목표로 합니다. 주말과 공휴일에는 조금 더 걸릴 수 있습니다. 긴급한 저작권 관련 사안은 우선 처리합니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-left">
                저작권 침해는 어떻게 신고하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                제목을 "DMCA / 저작권 신고"로 하여 support@ssdown.app으로 이메일을 보내 주세요. 문제가 되는 콘텐츠의 주소, 권리 보유를 증명할 자료, 연락처를 함께 적어 주시면 됩니다. 관련 법령에 따라 신속히 검토하고 조치하겠습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-left">
                SSDown은 무료인가요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                네, SSDown은 완전 무료입니다. 이용에 방해되지 않는 수준의 광고로 서비스를 유지하고 있습니다. 숨은 비용이나 구독료, 유료 등급이 없으며 모든 기능을 누구나 무료로 쓸 수 있습니다.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger className="text-left">
                SSDown은 제 개인정보를 저장하나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                아니요. SSDown은 로그인이나 회원가입이 필요 없습니다. 어떤 개인정보도 수집·저장·공유하지 않습니다. 사이트 기능과 통계 목적의 최소한의 쿠키만 사용합니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5">
              <AccordionTrigger className="text-left">
                새 기능이나 플랫폼 지원을 요청할 수 있나요?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                물론입니다! 사용자 여러분의 기능 요청과 제안을 언제나 환영합니다. 원하시는 기능을 설명해 이메일로 보내 주시면 이후 업데이트에 반영을 검토하겠습니다. 커뮤니티의 의견은 저희 개발 방향을 정하는 가장 중요한 기준 중 하나입니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* About SSDown Brief */}
      <section className="py-3 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-center">
            SSDown 소개
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-center space-y-4">
            <p>
              SSDown은 개인적인 용도의 영상 콘텐츠 관리 도구를 제공하는 무료 온라인 플랫폼입니다. X(트위터), 틱톡, 인스타그램, 페이스북, 데일리모션, 9GAG 등 주요 소셜 미디어의 영상 다운로드를 지원하며, 유튜브 썸네일과 메타데이터를 미리 볼 수 있는 도구도 제공합니다.
            </p>
            <p>
              저희의 목표는 저작권법과 플랫폼 이용약관을 존중하면서 이용자가 디지털 콘텐츠를 책임감 있게 관리하도록 돕는 것입니다. 저희 서버에는 어떤 미디어 파일도 보관하거나 배포하지 않습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
