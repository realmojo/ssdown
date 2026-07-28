"use client";

import {
  CheckCircle2,
  Info,
  Shield,
  BookOpen,
  Globe,
  FileVideo,
  Lock,
  Smartphone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  XIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  DailymotionIcon,
  NineGagIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HomeClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* 1. H1 Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-50/30 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 -z-10" />
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-sm font-semibold mb-2">
            무료 온라인 도구 플랫폼
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white pb-2 leading-tight">
            무료 온라인 도구 <br className="hidden md:block" />
            일상의 디지털 작업을 위한
          </h1>

          {/* 2. Main Introduction Paragraph */}
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="font-medium">
              SSDown은 이미지 편집부터 PDF 관리, 영상 변환까지 일상적인 디지털 작업을 빠르고 효율적으로 처리하도록 돕는 무료 온라인 도구 플랫폼입니다.
            </p>
            <p>
              모든 도구가 브라우저에서 바로 실행되므로 파일이 기기를 벗어나지 않습니다. 프로그램 설치도, 회원가입도 필요 없고 완전 무료입니다.
            </p>
            <p>
              이미지를 압축하든, PDF를 합치든, 영상 형식을 바꾸든, 데이터 형식을 변환하든, SSDown에는 그 일에 맞는 도구가 있습니다. 빠르고 안전하며 어떤 기기에서도 쓸 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Topics Covered (H2) */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-8 text-center sm:text-left">
            제공하는 도구
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                SSDown은 디지털 작업을 간단하게 만들어 주는 브라우저 기반 도구를 폭넓게 제공합니다. 아래 분야별로 계속 늘어나는 무료 도구를 살펴보세요.
              </p>
              <ul className="space-y-3">
                {[
                  "이미지 압축·변환·편집 도구",
                  "PDF 합치기·분할·회전·보호 도구",
                  "영상 및 오디오 형식 변환",
                  "파일 형식 변환 (JSON, CSV, XML, 엑셀)",
                  "소셜 미디어 콘텐츠 제작 도구",
                  "개발자·디자이너용 유틸리티",
                  "개인정보 우선 처리 — 모두 브라우저에서",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 flex items-center justify-center">
              <Info className="w-24 h-24 text-indigo-200 dark:text-indigo-900" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Who is this for? (H2) */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-y">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            이런 분께 유용합니다
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            SSDown은 일상적인 디지털 작업에 빠르고 무료이면서 믿을 수 있는 온라인 도구가 필요한 모든 분을 위해 만들어졌습니다.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                text: "이미지를 빠르게 편집해야 하는 분",
                desc: "무료 브라우저 기반 도구로 이미지를 압축하고 변환하고 크기를 바꾸고 자르고 다듬어 보세요.",
              },
              {
                text: "PDF 문서를 다루는 분",
                desc: "프로그램 설치 없이 PDF를 합치고 나누고 회전하고 보호하고 편집하세요.",
              },
              {
                text: "영상·오디오를 편집하는 분",
                desc: "브라우저에서 바로 영상 형식을 바꾸고 오디오를 추출하고 GIF를 만들고 클립을 잘라내세요.",
              },
              {
                text: "데이터 파일을 다루는 분",
                desc: "무료 변환 도구로 JSON, XML, CSV, 엑셀 형식을 서로 바꿔 보세요.",
              },
              {
                text: "소셜 미디어 콘텐츠 창작자",
                desc: "해시태그를 만들고 텍스트를 정리하고 소셜 플랫폼에 맞게 이미지 크기를 바꾸고 콘텐츠를 미리 보세요.",
              },
              {
                text: "개발자와 디자이너",
                desc: "파비콘을 만들고 색상 팔레트를 추출하고 QR 코드를 생성하고 화면비를 계산하세요.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6 flex flex-col gap-3 h-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {item.text}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Palette Spotlight */}
      <section className="py-10 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <a
            href="https://moodpalette.ssdown.app"
            target="_blank"
            rel="noopener"
            className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <span className="text-5xl shrink-0">🎨</span>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">추천 도구</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors">
                무드 팔레트 — AI 색상 팔레트 생성기
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                분위기, 키워드, 이미지에서 멋진 색상 팔레트를 만들어 보세요. 디자이너와 창작자에게 안성맞춤입니다.
              </p>
            </div>
            <span className="text-sm font-semibold text-violet-600 group-hover:underline shrink-0">
              무료로 사용해 보기 →
            </span>
          </a>
        </div>
      </section>

      {/* 5. How It Works (H2) - New Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            SSDown 이용 방법
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            자주 하는 디지털 작업을 손쉽게 처리할 수 있습니다. 몇 단계면 바로 시작할 수 있습니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "도구 선택",
                desc: "무료 온라인 도구 모음을 둘러보세요. 이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환 등 필요한 작업에 맞는 도구가 준비되어 있습니다.",
                icon: Globe,
              },
              {
                step: "02",
                title: "업로드 후 처리",
                desc: "파일을 올리거나 내용을 붙여넣으세요. 모든 처리가 브라우저에서 바로 이뤄져 개인정보 보호와 속도를 최대한 확보하며, 외부 서버로 데이터가 전송되지 않습니다.",
                icon: FileVideo,
              },
              {
                step: "03",
                title: "저장과 공유",
                desc: "결과를 즉시 받아 보세요. 처리된 파일을 기기에 저장하거나 바로 공유할 수 있습니다. 모든 도구는 무료이며 이용 횟수 제한이 없습니다.",
                icon: Smartphone,
              },
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <item.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-xs font-bold text-indigo-500 tracking-widest">
                  {item.step}단계
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Tool Introduction (The ONLY place for downloaders) (H2) */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/20 border-y">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              ⚠️ 교육용 참고 도구 (이용에 따른 책임은 본인에게 있습니다)
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              SSDown은 기본적으로 정보 제공을 목적으로 운영됩니다. 아울러 개인적인 콘텐츠 관리 용도로만 쓰도록 만들어진 보조 도구를 제공합니다. 각 도구는 해당 플랫폼의 콘텐츠 형식과 정책에 맞춰 설계되었습니다.
            </p>
            <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900 p-6 rounded-lg text-sm text-left max-w-2xl mx-auto space-y-3">
              <strong className="text-red-800 dark:text-red-200 block mb-3 text-base">
                ⚠️ 중요 고지:
              </strong>
              <p className="text-red-900/90 dark:text-red-200/90 font-medium">
                이 도구들은 영상 주소가 어떻게 동작하는지 보여 주기 위한 교육 목적으로만 제공됩니다. 이용자는 반드시 다음을 지켜야 합니다:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-red-900/80 dark:text-red-200/80">
                <li>
                  내려받기 전에 <strong>콘텐츠 창작자의 명시적인 동의</strong>를 받으세요
                </li>
                <li>
                  <strong>모든 플랫폼의 이용약관을 준수하세요</strong> (X,
                  틱톡, 인스타그램, 페이스북 등)
                </li>
                <li>
                  <strong>
                    모든 저작권과 지식재산권을 존중하세요
                  </strong>
                </li>
                <li>
                  <strong>해당 국가의 법령상 허용된 목적으로만 이용하세요</strong>
                </li>
              </ul>
              <p className="text-red-900/90 dark:text-red-200/90 font-semibold mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                SSDown은 플랫폼 정책이나 저작권법 위반을 결코 권장하거나 지지하지 않습니다.
                <span className="block mt-1">
                  이 도구를 잘못 사용하면 법적 책임이 따를 수 있습니다.
                </span>
              </p>
            </div>
          </div>

          {/* Tool Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <a href="/x" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <XIcon className="h-6 w-6" />
                <span className="font-semibold">X (트위터) 도구</span>
              </Button>
            </a>
            <a href="/tiktok" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 transition-all"
              >
                <TikTokIcon className="h-6 w-6" />
                <span className="font-semibold">틱톡 도구</span>
              </Button>
            </a>
            <a href="/instagram" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
              >
                <InstagramIcon className="h-6 w-6" />
                <span className="font-semibold">인스타그램 도구</span>
              </Button>
            </a>
            <a href="/facebook" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              >
                <FacebookIcon className="h-6 w-6" />
                <span className="font-semibold">페이스북 도구</span>
              </Button>
            </a>
            <a href="/dailymotion" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
              >
                <DailymotionIcon className="h-6 w-6" />
                <span className="font-semibold">데일리모션 도구</span>
              </Button>
            </a>
            <a href="/9gag" className="group">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <NineGagIcon className="h-6 w-6" />
                <span className="font-semibold">9GAG 도구</span>
              </Button>
            </a>
            <a
              href="https://upscale.ssdown.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group md:col-span-3"
            >
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950 transition-all"
              >
                <Sparkles className="h-6 w-6 text-violet-500" />
                <span className="font-semibold">이미지·영상 화질 개선</span>
              </Button>
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">(개인적 용도에 한함)</p>
          </div>
        </div>
      </section>

      {/* 7. Blog & Resources CTA (H2) - New Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            블로그에서 더 알아보기
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            저희 블로그에서는 도구를 더 잘 활용할 수 있도록 다양한 주제를 다룹니다. 단계별 튜토리얼부터 유용한 팁까지 필요한 정보를 제공합니다.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "이용 가이드",
                desc: "이미지 편집, PDF 관리, 영상 변환, 파일 형식 변환을 단계별로 안내합니다. 각 도구를 200% 활용하는 방법을 배워 보세요.",
                color: "text-blue-500",
                bg: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: Shield,
                title: "안전과 개인정보",
                desc: "온라인 개인정보 보호를 이해하고, 브라우저 기반 처리가 어떻게 데이터를 안전하게 지키는지 알아보며, 안전한 파일 취급 방법을 확인하세요.",
                color: "text-green-500",
                bg: "bg-green-100 dark:bg-green-900/30",
              },
              {
                icon: Lock,
                title: "활용 팁",
                desc: "최적화 기법과 용도별 권장 설정, 작업 흐름을 개선하는 팁을 확인해 보세요.",
                color: "text-purple-500",
                bg: "bg-purple-100 dark:bg-purple-900/30",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border-0 shadow-sm bg-gray-50 dark:bg-gray-900"
              >
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bg}`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="/blog">
              <Button variant="outline" size="lg" className="gap-2">
                블로그 보러 가기
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 8. Terms & Privacy Notice */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">약관 및 개인정보</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-4">
            <p>
              SSDown은 브라우저에서 파일을 직접 처리합니다. 저희 서버에 파일을 올리거나 저장하거나 공유하지 않습니다. 처리 과정 내내 데이터는 사용자의 기기에 머무릅니다.
            </p>
            <p>
              저희 도구는 개인적·상업적 용도 모두 무료로 제공됩니다. 다만 이용이 관련 법령을 준수하는지 확인할 책임은 이용자에게 있습니다.
            </p>
            <p>
              궁금한 점이나 의견이 있으신가요? 다음 주소로 연락 주세요:{" "}
              <a
                href="mailto:support@ssdown.app"
                className="text-indigo-600 hover:underline"
              >
                support@ssdown.app
              </a>{" "}
              빠르게 답변드리겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Operation Policy (H2 - Transparency) */}
      <section className="py-16 bg-white dark:bg-gray-950 border-t">
        <div className="container px-4 md:px-6 max-w-4xl space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            운영 투명성
          </h2>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              SSDown은 무엇보다 사용자 경험을 우선합니다. 지나치게 방해되는 광고는 피하려 노력합니다. 서비스 유지와 개선을 위해 일부 광고가 표시될 수 있지만, 이용에 방해가 되지 않고 내용과 관련 있는 광고만 유지하겠습니다.
            </p>
            <p>
              최상의 경험을 위해 저희 도구는 꾸준히 관리하고 업데이트합니다. SSDown은 개인정보를 존중하고 디지털 작업을 간단하게 만들어 주는 믿을 수 있는 고품질 도구를 제공하겠습니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
