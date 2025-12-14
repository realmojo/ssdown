const axios = require("axios");

const run = async () => {
  try {
    console.log("Running...");
    const url =
      // "https://cdndirector.dailymotion.com/cdn/manifest/video/x9vnle4.m3u8?sec=AqtpiJXMtJyGkbDxPPXc5KsiajHySMZ1CQCGy-PxksYT6tWRjkSlbMHi8ITzEHDTQn54dffKnKxGEKxN_JaSMQ&dmTs=&dmV1st=";
      "https://cdndirector.dailymotion.com/cdn/manifest/video/x9vnuku.m3u8?sec=28y_2DFOnEbELWNCHjAtA87zA1o48k2WSZuBVGWZR2MLLV90WdcuHmnS3_5hrslknkYO0YOb-808QCC0T_grywrTCpNzfD6R6ONPAgBGaoDY74PS30Dzpj00Vs2YD29e&dmTs=511338&dmV1st=cce98e48-e422-4103-9110-a606cfc3bbe5";
    const headers = {
      // "User-Agent": "PostmanRuntime/7.49.1",
      // "User-Agent": "*/*",
      "User-Agent": "PostmanRuntime/7.49.1",
    };

    const response = await axios.get(url, { headers });
    console.log(response);
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error(
        `Failed to fetch video: ${error.response.status} ${error.response.statusText}`
      );
      console.error("Error data:", error.response.data);
    } else {
      console.error("Error in run:", error.message);
    }
  }
};

run();
