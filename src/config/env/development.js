module.exports = {
  log: {
    level: 'trace',
    requestBody: true,
    responseBody: true,
  },
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
  auth: {
    tokenExpiresIn: 7200,
    superSecret: process.env.SUPER_SECRET || 'SUPER_SECRET',
  },
  execCmdKey: process.env.EXEC_CMD_KEY || 'key',
  mailTransport: {
    host: 'smtp.sina.com',
    port: 465,
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'test4code@sina.com',
      pass: 'Test4code;',
    },
  },
  update: {
    ref: 'master',
  },
  port: process.env.PORT || 1337,
  bootstrap: [
    // 'WebhookService',
    'IpInfoService',
    'ProxyService',
  ],
  times: {
    // proxyCheckDelay: 10 * 1000,
    proxyCrawlerDelay: 15 * 60 * 1000,
    proxyCheckTimeout: 15 * 1000,
    // ipCheckDelay: 1000,
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
