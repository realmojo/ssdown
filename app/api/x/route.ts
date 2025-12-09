import { NextRequest, NextResponse } from "next/server";
import { getQualityForBitrate } from "@/lib/utils";

// X/Twitter GraphQL API에서 트윗 상세 정보 가져오기
const getXDetailInfo = async (xId: string) => {
  // variables 객체 구성 (xId를 동적으로 사용)
  const variables = {
    tweetId: xId,
    withCommunity: false,
    includePromotedContent: false,
    withVoice: false,
  };

  const features = {
    creator_subscriptions_tweet_preview_api_enabled: true,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: false,
    responsive_web_jetfuel_frame: true,
    responsive_web_grok_share_attachment_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    responsive_web_grok_show_grok_translated_post: false,
    responsive_web_grok_analysis_button_from_backend: true,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
      true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    profile_label_improvements_pcf_label_in_post_enabled: true,
    responsive_web_profile_redirect_enabled: false,
    rweb_tipjar_consumption_enabled: true,
    verified_phone_label_enabled: false,
    responsive_web_grok_image_annotation_enabled: true,
    responsive_web_grok_imagine_annotation_enabled: true,
    responsive_web_grok_community_note_auto_translation_is_enabled: false,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_enhance_cards_enabled: false,
  };

  const fieldToggles = {
    withArticleRichContentState: true,
    withArticlePlainText: false,
    withGrokAnalyze: false,
    withDisallowedReplyControls: false,
  };

  // URL 생성
  const tweetUrl = `https://api.x.com/graphql/kLXoXTloWpv9d2FSXRg-Tg/TweetResultByRestId?variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}&features=${encodeURIComponent(
    JSON.stringify(features)
  )}&fieldToggles=${encodeURIComponent(JSON.stringify(fieldToggles))}`;

  try {
    // fetch를 사용하여 요청
    const response = await fetch(tweetUrl, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ko-KR,ko;q=0.9",
        authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "content-type": "application/json",
        cookie:
          'guest_id_marketing=v1%3A176501609944336140; guest_id_ads=v1%3A176501609944336140; guest_id=v1%3A176501609944336140; gt=1997248396512629159; __cuid=8b4633e67135458ba66cf5fc881ae272; personalization_id="v1_yrnyoKtOHxdaKHALG3M4Kw=="; __cf_bm=kv8FDj0z7AmVYHUi6wbh4O66MhTkeandIWMOHqUkENk-1765016113.92621-1.0.1.1-dj4bK_ETE.Or1Xcvzus1F_RhnM3Gd7BL8c6a4_ezSdiNC1vfs1qfG7.P8Ekda23ho1Ke6dZVIvQEabCPTzEb4WCa7kBbaDBX.t1A308PIEO3Iw8KsRqLkmCD2T0X',
        origin: "https://x.com",
        priority: "u=1, i",
        referer: "https://x.com/",
        "sec-ch-ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
        "x-client-transaction-id":
          "3m+GNEcGZvml2VCW4yqzN6G5rB7lTzT/hWXaViHmA34TesMz2auk1wdbf8l13daEfBxAOtrVXgkioGzNssLbnsOmOE3d3Q",
        "x-twitter-active-user": "yes",
        "x-twitter-client-language": "ko",
        "x-xp-forwarded-for":
          "aaaab146e444cb3c3495dd378bb11d117ee09b3da8d2816f7fe759fa50f022d3a052ab8c5d9e4616f05bf4df5e89f086362e9fa422c3a16bd3b706a106f0c1a9d1b452e60ddb1a83a56d12a87321b6b445b940b8847add2b5d25a1cf37a1ebae0f5bd736dbf5dccf97edc0042eb3859277179af0c26d2fb39bebea67ba7257dd6289fa695050f73f4c601353effb32aeec97162990fa5b7116375942328be5572c74c6b9685254617e83037ba7e93dd0cd4bb0260ec8d85eaba8717b007f4fda09c7704fb3b913bc0029edb5f6494c6af63be6af34a95d10a22b571de06825120296f3639040d32ea473e10085a728a35d40f26ebc0fb316bbf4e4cd84420d607a",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.data?.tweetResult?.result ?? null;
  } catch (error) {
    console.error("Error fetching tweet data:", error);
    throw error;
  }
};

// const getXId = (url: string) => {
//   // URL에서 tweet ID 추출
//   // url: https://x.com/KathleenWinche3/status/1996749284876615682
//   // url: https://x.com/KathleenWinche3/status/1996749284876615682?s=20
//   // url: https://x.com/jonggang8282/status/1996749284876615682/video/1
//   const s = url.split("?");
//   const f = s[0].split("/");
//   const xId = f[f.length - 1]; // 마지막 부분이 ID (예: 1996749284876615682)
//   return xId;
// };

/**
 * X/Twitter URL에서 tweet ID를 추출하는 함수
 * @param url X/Twitter tweet URL
 * @returns tweet ID 또는 null
 *
 * 지원하는 URL 형식:
 * - https://x.com/username/status/1996749284876615682
 * - https://x.com/username/status/1996749284876615682?s=20
 * - https://x.com/username/status/1996749284876615682/video/1
 * - https://twitter.com/username/status/1996749284876615682
 * - https://www.x.com/username/status/1996749284876615682
 * - https://www.twitter.com/username/status/1996749284876615682
 * - https://mobile.twitter.com/username/status/1996749284876615682
 */
const getXId = (url: string): string | null => {
  try {
    // 정규식으로 /status/ 다음의 숫자 ID 추출
    // 예: /status/1996749284876615682 또는 /status/1996749284876615682/video/1
    const statusMatch = url.match(/\/status\/(\d+)/);
    if (statusMatch && statusMatch[1]) {
      return statusMatch[1];
    }

    // 정규식이 실패한 경우 대체 방법: URL 파싱
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // pathname이 /username/status/ID 또는 /username/status/ID/video/1 형식인 경우
    const statusIndex = pathParts.indexOf("status");
    if (statusIndex !== -1 && statusIndex + 1 < pathParts.length) {
      const tweetId = pathParts[statusIndex + 1];
      // 숫자로만 구성된 ID인지 확인
      if (/^\d+$/.test(tweetId)) {
        return tweetId;
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting tweet ID:", error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const all = searchParams.get("all") === "true";

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    const xId = getXId(url);

    if (!xId) {
      return NextResponse.json(
        {
          error: "Invalid URL",
          message: "Could not extract tweet ID from URL",
        },
        { status: 400 }
      );
    }

    const xData = await getXDetailInfo(xId);

    if (!xData) {
      return NextResponse.json(
        { error: "no data", message: "Tweet not found" },
        { status: 200 }
      );
    }

    if (all) {
      return NextResponse.json(xData, { status: 200 });
    }

    // 사용자 정보 추출
    const user = xData.core?.user_results?.result;
    const userName = user?.core?.name || "";
    const userScreenName = user?.core?.screen_name || "";
    const userAvatar =
      user?.legacy?.profile_image_url_https || user?.avatar?.image_url || "";

    // 트윗 정보 추출
    const legacy = xData.legacy || {};
    const content = legacy.full_text || "";
    const createdAt = legacy.created_at || "";
    const favoriteCount = legacy.favorite_count || 0;
    const retweetCount = legacy.retweet_count || 0;
    const replyCount = legacy.reply_count || 0;
    const quoteCount = legacy.quote_count || 0;
    const viewCount = xData?.views?.count || 0;

    // 미디어 정보 추출
    let thumbnail = "";
    let videoItems: Array<{
      url: string;
      content_type: string;
      bitrate: number;
      quality: string;
    }> = [];

    if (
      legacy.extended_entities?.media &&
      legacy.extended_entities.media.length > 0
    ) {
      const media = legacy.extended_entities.media[0];
      thumbnail = media.media_url_https || "";

      // 비디오가 있는 경우 variants 추출
      if (media.type === "video" && media.video_info?.variants) {
        const variants = media.video_info.variants;

        // bitrate가 0 이상인 비디오만 필터링 (m3u8 제외하고 mp4만)
        const videoVariants = variants.filter(
          (item: any) => item.bitrate >= 0 && item.content_type === "video/mp4"
        );

        videoItems = videoVariants.map((item: any) => {
          return {
            url: item.url,
            content_type: item.content_type,
            bitrate: item.bitrate,
            quality: getQualityForBitrate(item.bitrate),
          };
        });
      }
    }

    // 추출한 데이터 반환
    const result = {
      type: "x",
      id: xData.rest_id || xId,
      user: {
        name: userName,
        screenName: userScreenName,
        avatar: userAvatar,
      },
      content,
      thumbnail,
      videoItems,
      stats: {
        favoriteCount,
        shareCount: retweetCount,
        replyCount,
        quoteCount,
        viewCount: Number(viewCount),
      },
      createdAt,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("Error in GET /api/x:", e);
    return NextResponse.json(
      { error: "no data", message: e?.message || "Unknown error" },
      { status: 200 }
    );
  }
}
