const rp = require('request-promise');
const { userAgents } = require('./Constants');

const svc = {
  checkLen: 0,
  crawlerUrls: ['http://www.xicidaili.com/nn/', 'http://www.xicidaili.com/nt/'],
  sitemap: {
    startUrl: 'http://www.xicidaili.com/nn/',
    selectors: [
      {
        parentSelectors: ['_root'],
        type: 'SelectorElement',
        multiple: true,
        id: 'item',
        selector: 'tr',
        delay: ''
      },
      {
        parentSelectors: ['item'],
        type: 'SelectorText',
        multiple: false,
        id: 'ip_address',
        selector: 'td:nth-of-type(2)',
        regex: '\\d+\\.\\d+\\.\\d+\\.\\d+',
        delay: ''
      },
      {
        parentSelectors: ['item'],
        type: 'SelectorText',
        multiple: false,
        id: 'port',
        selector: 'td:nth-of-type(3)',
        regex: '',
        delay: ''
      },
      {
        parentSelectors: ['item'],
        type: 'SelectorText',
        multiple: false,
        id: 'address',
        selector: 'a',
        regex: '',
        delay: ''
      },
      {
        parentSelectors: ['item'],
        type: 'SelectorText',
        multiple: false,
        id: 'type',
        selector: 'td:nth-of-type(6)',
        regex: '',
        delay: ''
      }
    ],
    _id: 'xicidaili'
  },
  async lift() {
    svc.intervalCheck();
    svc.intervalCrawler();

    svc.check()
      .catch((e) => {
        logger.warn(e);
      });

    svc.crawler()
      .catch((e) => {
        logger.warn(e);
      });

    return Promise.resolve();
  },
  async intervalCheck() {
    setInterval(() => {
      svc.check()
        .catch((e) => {
          logger.warn(e);
        });
    }, mKoa.config.times.proxyCheckDelay);
  },
  async intervalCrawler() {
    setInterval(() => {
      svc.crawler()
        .catch((e) => {
          logger.warn(e);
        });
    }, mKoa.config.times.proxyCrawlerDelay);
  },
  async crawler() {
    return Promise
      .map(this.crawlerUrls, (url) => {
        return rp(
          {
            url: mKoa.config.request.crawler.url,
            method: mKoa.config.request.crawler.method,
            json: mKoa.config.request.crawler.json,
            body: {
              requestOptions: {
                url,
              },
              config: {
                proxies: [null, null],
              },
            }
          })
          .then((data) => {
            return rp({
              url: mKoa.config.request.parser.url,
              method: mKoa.config.request.parser.method,
              json: mKoa.config.request.parser.json,
              body: {
                html: data.html,
                sitemap: this.sitemap,
              }
            });
          })
          .then((data) => {
            logger.info(`crawler ${url} ${data.length}`);
            return _.chain(data)
              .filter((item) => {
                return item.ip_address && item.type;
              })
              .map((item) => {
                return `${item.type.toLocaleLowerCase()}://${item.ip_address}`;
              })
              .value();
          })
          .map((proxyUrl) => {
            return Proxy
              .findOne({ proxyUrl })
              .then((data) => {
                if (!data) {
                  return this.updateProxy({ url: proxyUrl });
                }
                return null;
              });
          });
      });
  },
  async check() {
    if (this.checkLen > 0) {
      logger.info('last interval, check url length: ', this.checkLen);
      return Promise.resolve();
    }

    this.checkLen = 'pending connect mongo';

    let now = new Date();
    return Promise
      .try(() => {
        return Proxy
          .find({
            $or: [{
              nextCheckTime: {
                $lte: now,
              },
            }, {
              nextCheckTime: null,
            }],
            deleted: {
              $ne: true,
            },
          })
          .lean();
      })
      .then((data) => {
        this.checkLen = data.length;
        logger.info('new check url length: ', this.checkLen);
        return data;
      })
      .map((proxy) => {
        this.checkLen = this.checkLen - 1;
        return Promise
          .race([
            this.updateProxy(proxy),
            Promise.delay(2 * mKoa.config.times.proxyCheckTimeout),
          ])
          .then((data) => {
            if (!data) {
              logger.warn('delay win in race', proxy);
            }
          });
      }, { concurrency: 100 })
      .then(() => {
        this.checkLen = 0;
      })
      .catch((e) => {
        logger.warn(e);
        this.checkLen = 0;
        return Promise.reject(e);
      });
  },
  async checkProxy(proxyUrl) {
    return rp(
      {
        url: 'http://www.youku.com/',
        method: 'HEAD',
        timeout: mKoa.config.times.proxyCheckTimeout,
        proxy: proxyUrl,
        followRedirect: false,
        headers: {
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
        },
        simple: false,
        resolveWithFullResponse: true,
      })
      .then((req) => {
        return !!req;
      })
      .catch(() => {
        return false;
      });
  },
  async updateProxy({ url, failedTimes = 0, checkIndex = 0, connected }) {
    /* eslint-disable no-param-reassign */

    if (!url) {
      return null;
    }

    let currentConnected;
    try {
      currentConnected = await this.checkProxy(url);
    }
    catch (e) {
      throw e;
    }

    let currentDeleted;

    checkIndex += 1;

    // 本次 失败, 上次成功
    if (!currentConnected && connected) {
      failedTimes += 1;
      logger.info('url: ', url, currentConnected);
    }

    // 状态变化
    if (currentConnected !== connected) {
      checkIndex = 1;
    }

    // 连续成功3次以上的
    if (currentConnected && connected && checkIndex > 3) {
      checkIndex = 3;
    }

    // 连续失败30次以上的
    if (!currentConnected && checkIndex >= 30) {
      currentDeleted = true;
    }

    // 失败次数60次以上
    if (!currentConnected && failedTimes >= 60) {
      currentDeleted = true;
    }

    let nextCheckTime = new Date(new Date().getTime() + (checkIndex * 60 * 1000));

    return Proxy
      .findOneAndUpdate({
        url,
      }, {
        $setOnInsert: {
          url,
        },

        $set: {
          connected: currentConnected,
          failedTimes,
          checkIndex,
          nextCheckTime,
          deleted: currentDeleted,
        },
      }, {
        setDefaultsOnInsert: true,
        upsert: true,
      });
  }
};

module.exports = svc;
