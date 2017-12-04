const MONGODB_DATABASE = 'proxyCrawler';
const MONGODB_USERNAME = 'proxyCrawlerUser';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

module.exports = {
  log: {
    level: 'debug',
    requestBody: true,
    responseBody: false,
  },
  connections: {
    defaultMongo: {
      username: MONGODB_USERNAME,
      password: MONGODB_PASSWORD,
      hosts: [
        {
          host: '112.74.107.82',
          port: 13508,
        }
      ],
      database: MONGODB_DATABASE,
    },
  },
  port: process.env.LEANCLOUD_APP_PORT || 8080,
  graphql: {
    graphiql: true,
  },
  ip: undefined,
  bootstrap: [
    'ProxyService',
    'IpInfoService',
  ],
  times: {
    proxyCheckDelay: 10 * 1000,
    proxyCrawlerDelay: 15 * 60 * 1000,
    proxyCheckTimeout: 15 * 1000,
    ipCheckDelay: 1000,
    ipCheckTimeout: 5 * 1000,
    ipInfoSuccessTimeWindow: 48 * 60 * 60 * 1000,
    ipInfoFailedTimeWindow: 2 * 60 * 60 * 1000,
  },
  request: {
    parser: {
      url: 'http://site-parser-service.leanapp.cn/api/v1/parser',
      json: true,
      method: 'POST',
    },
    crawler: {
      url: 'http://site-crawler-service.xinshangshangxin.com/api/v1/crawler',
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
