module.exports = {
  connections: {
    defaultMongo: {
      hosts: [
        {
          host: '127.0.0.1',
        }
      ],
      database: 'noName',
    },
  },
  bootstrap: [
    // 'WebhookService',
    'IpInfoService',
    'ProxyService',
  ],
  times: {
    ipCheckDelay: 1000,
    proxyCheckDelay: 10 * 1000,
    proxyCrawlerDelay: 15 * 60 * 1000,
    proxyCheckTimeout: 15 * 1000,
    ipCheckTimeout: 5 * 1000,
    ipInfoSuccessTimeWindow: 48 * 60 * 60 * 1000,
    ipInfoFailedTimeWindow: 2 * 60 * 60 * 1000,
  },
  request: {
    parser: {
      // url: 'http://127.0.0.1:1339/api/v1/parser',
      url: 'http://site-parser-service.leanapp.cn/api/v1/parser',
      json: true,
      method: 'POST',
    },
    crawler: {
      url: 'http://site-crawler-service.xinshangshangxin.com/api/v1/crawler',
      // url: 'http://127.0.0.1:1338/api/v1/crawler',
      json: true,
      method: 'POST',
    },
    headlessChrome: {
      url: 'https://headless-chrome-puppeteer.now.sh',
      method: 'POST',
      json: true,
    },
  },
};
