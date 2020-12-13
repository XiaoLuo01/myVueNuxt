// 引入外部的包
self.importScripts("spark-md5.min.js");

// 监听主线程传过来的消息
self.onmessage = e => {
  const { chunks } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();

  let progress = 0;
  let count = 0;

  // 加载每一个chunks
  const loadNext = index => {
    const reader = new FileReader();
    // 读取chunks里面的文件片
    reader.readAsArrayBuffer(chunks[index].file);
    reader.onload = e => {
      count++;
      spark.append(e.target.result);

      if (count == chunks.length) {
        // 全部计算完毕,通知主线程
        self.postMessage({
          progress: 100,
          hash: spark.end()
        });
      } else {
        progress += 100 / chunks.length;
        self.postMessage({
          progress
        });
        loadNext(count);
      }
    };
  };
  loadNext(0);
};
