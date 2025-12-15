import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export async function getBilibiliFileSize(url) {
  try {
    // 1. HEAD 요청으로 Content-Length (파일 크기) 확인
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        Referer: "https://www.bilibili.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch headers: ${response.status} ${response.statusText}`
      );
    }

    const contentLength = response.headers.get("content-length");
    if (!contentLength) {
      throw new Error("Content-Length header missing");
    }

    const totalSize = parseInt(contentLength, 10);
    console.log(`🎥 Total File Size: ${totalSize} bytes`);

    return totalSize;
  } catch (error) {
    console.error("Error fetching Bilibili file info:", error);
    return null;
  }
}

export async function downloadBilibiliRange(url, start, end) {
  try {
    // 2. Range 헤더를 사용하여 특정 구간 다운로드
    const response = await fetch(url, {
      headers: {
        Referer: "https://www.bilibili.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Range: `bytes=${start}-${end}`,
      },
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`Failed to fetch range: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(
      `✅ Downloaded range ${start}-${end}: ${buffer.byteLength} bytes`
    );

    return buffer;
  } catch (error) {
    console.error("Error downloading range:", error);
    return null;
  }
}

// 사용 예시 (테스트용)
(async () => {
  const videoUrl =
    "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/22/41/32229754122/32229754122-1-100022.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&mid=0&deadline=1765809615&nbs=1&gen=playurlv3&trid=5a76e49cd78b4341a6704fac10a87f3u&oi=1948681957&os=akam&og=ali&uipk=5&platform=pc&upsig=a94012484f1e2a83686606312c31dc58&uparams=e,mid,deadline,nbs,gen,trid,oi,os,og,uipk,platform&hdnts=exp=1765809615~hmac=84c6be60300a1262a10f59292412c5cbba1262a7166ad2d782e82d93a02e4a33&bvc=vod&nettype=0&bw=263319&dl=0&f=u_0_0&agrr=0&buvid=50102993-0C53-C82E-BEFE-1B04128CFE4351337infoc&build=0&orderid=0,2"; // 여기에 URL 입력

  const audioUrl =
    "https://upos-sz-mirrorcosov.bilivideo.com/upgcxcode/22/41/32229754122/32229754122-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&mid=0&deadline=1765809615&nbs=1&uipk=5&trid=5a76e49cd78b4341a6704fac10a87f3u&og=hw&oi=1948681957&platform=pc&gen=playurlv3&os=cosovbv&upsig=2bf3e68443ce6b3f82758e0ae78ee5cf&uparams=e,mid,deadline,nbs,uipk,trid,og,oi,platform,gen,os&bvc=vod&nettype=0&bw=67565&agrr=0&buvid=50102993-0C53-C82E-BEFE-1B04128CFE4351337infoc&build=0&dl=0&f=u_0_0&orderid=0,2";
  // 1. 전체 크기 확인
  const totalSize = await getBilibiliFileSize(videoUrl);
  const audioTotalSize = await getBilibiliFileSize(audioUrl);

  console.log("totalSize: ", totalSize);
  console.log("audioTotalSize: ", audioTotalSize);
  if (totalSize && audioTotalSize) {
    // 2. 전체 파일 다운로드 (0부터 끝까지)
    // 또는 필요한 만큼 쪼개서 다운로드 가능
    const data = await downloadBilibiliRange(videoUrl, 0, totalSize - 1);
    const audioData = await downloadBilibiliRange(
      audioUrl,
      0,
      audioTotalSize - 1
    );
    const buffer = Buffer.from(data);
    const audioBuffer = Buffer.from(audioData);
    await fs.writeFileSync("bilibili_download_audio.mp4", audioBuffer);
    console.log("💾 Saved to bilibili_download_audio.mp4");
    await fs.writeFileSync("bilibili_download.mp4", buffer);
    console.log("💾 Saved to bilibili_download.mp4");

    ffmpeg()
      .input("bilibili_download.mp4")
      .input("bilibili_download_audio.mp4")
      .outputOptions("-c copy")
      .save("bilibili_download_combined.mp4")
      .on("end", () => {
        console.log("합치기 완료!");
        fs.unlinkSync("bilibili_download.mp4");
        fs.unlinkSync("bilibili_download_audio.mp4");
        console.log("💾 Saved to bilibili_download_combined.mp4");
      })
      .on("error", (err) => {
        console.error("에러 발생:", err);
        fs.unlinkSync("bilibili_download.mp4");
        fs.unlinkSync("bilibili_download_audio.mp4");
      });
  }
})();
