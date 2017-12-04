const rp = require('request-promise');
const randomUseragent = require('random-useragent');
const { proxyCrawlerList } = require('./Constants');

const svc = {
  checkLen: 0,
  async lift() {
    svc.intervalCheck();
    svc.intervalCrawler();

    return Promise.resolve();
  },
  async intervalCheck() {
    if (!mKoa.config.times.proxyCheckDelay) {
      logger.warn('not start proxy check');
      return null;
    }

    svc.check()
      .catch((e) => {
        logger.warn(e);
      });

    setInterval(() => {
      svc.check()
        .catch((e) => {
          logger.warn(e);
        });
    }, mKoa.config.times.proxyCheckDelay);

    return null;
  },
  async intervalCrawler() {
    svc.crawler()
      .catch((e) => {
        logger.warn(e);
      });

    setInterval(() => {
      svc.crawler()
        .catch((e) => {
          logger.warn(e);
        });
    }, mKoa.config.times.proxyCrawlerDelay);
  },
  async getHtml(requestConfig) {
    let requestOptions;
    if (_.isString(requestConfig)) {
      requestOptions = {
        url: requestConfig,
      };
    }
    else {
      requestOptions = requestConfig;
    }

    if (requestConfig.type === 'headlessChrome') {
      return rp(_.assign({}, mKoa.config.request.headlessChrome, requestConfig))
        .then((data) => {
          return data.data.html;
        });
    }

    let config = {
      url: mKoa.config.request.crawler.url,
      method: mKoa.config.request.crawler.method,
      json: mKoa.config.request.crawler.json,
      body: {
        requestOptions,
        config: {
          proxies: [null, null],
        },
      }
    };

    return rp(config)
      .then((data) => {
        return data.html;
      });
  },
  async crawler() {
    logger.info('start crawler list: ', proxyCrawlerList.length);
    return Promise.map(proxyCrawlerList, this.crawlerOne);
  },
  async crawlerOne(crawlerInfo) {
    return Promise
      .map(crawlerInfo.requestList, (requestConfig) => {
        return Promise
          .try(() => {
            return svc.getHtml(requestConfig);
          })
          .then((html) => {
            return rp({
              url: mKoa.config.request.parser.url,
              method: mKoa.config.request.parser.method,
              json: mKoa.config.request.parser.json,
              body: {
                html,
                sitemap: crawlerInfo.sitemap,
              }
            });
          })
          .then((data) => {
            logger.info(`crawler length: ${data.length}`, _.assign({}, data[0], data[1]), requestConfig);

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
                  return svc.updateProxy({ url: proxyUrl });
                }
                return null;
              });
          })
          .catch((e) => {
            logger.warn('requestConfig: ', requestConfig, 'e: ', e);
            return [];
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
          .try(() => {
            return svc.updateProxy(proxy);
          })
          .timeout(2 * mKoa.config.times.proxyCheckTimeout)
          .catch((e) => {
            logger.warn(e);
            return null;
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
        url: 'http://tip.soku.com/search_tip_1?query=proxy',
        method: 'GET',
        timeout: mKoa.config.times.proxyCheckTimeout,
        proxy: proxyUrl,
        followRedirect: false,
        headers: {
          'User-Agent': randomUseragent.getRandom()
        },
        json: true,
      })
      .then((body) => {
        return body && body.q === 'proxy';
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
    let currentDeleted;

    let currentConnected = await this.checkProxy(url);
    if (currentConnected) {
      await IpInfoService.add(url);
    }

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

    // 连续成功2次以上的
    if (currentConnected && connected && checkIndex >= 2) {
      checkIndex = 2;
    }

    // 连续失败30次以上的
    if (!currentConnected && checkIndex >= 30) {
      currentDeleted = true;
    }

    // 失败次数60次以上
    if (!currentConnected && failedTimes >= 60) {
      currentDeleted = true;
    }

    let nextCheckTime = new Date(new Date().getTime() + (checkIndex * 30 * 1000));

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
