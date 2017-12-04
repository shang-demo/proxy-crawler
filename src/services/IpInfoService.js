const rp = require('request-promise');
const randomUseragent = require('random-useragent');

const svc = {
  pendingList: [],
  checking: false,
  ipRegExp: /((?:(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(?:25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d))))/,
  async lift() {
    if (!mKoa.config.times.ipCheckDelay) {
      logger.warn('not start ip check service');
      return null;
    }
    setInterval(() => {
      if (svc.checking) {
        return;
      }

      svc.check();
    }, mKoa.config.times.ipCheckDelay);

    return null;
  },
  async add(proxyUrl) {
    let proxyInfo = await Proxy.findOne({ url: proxyUrl }).lean();

    if (proxyInfo &&
      proxyInfo.ipNextCheckTime &&
      new Date(proxyInfo.ipNextCheckTime).getTime() >= new Date().getTime()
    ) {
      logger.trace('ipNextCheck: ', proxyInfo);
      return null;
    }

    if (svc.pendingList.indexOf(proxyUrl) >= 0) {
      logger.trace('in pendingList', proxyUrl, svc.pendingList.length);
      return null;
    }

    svc.pendingList.push(proxyUrl);
    logger.info(`add proxyUrl, now pendingList length = ${svc.pendingList.length}`);
    return null;
  },
  async check() {
    logger.info(`doing check, pendingList length = ${svc.pendingList.length}`);
    let checkList = svc.pendingList.splice(0, 1);
    if (!checkList.length) {
      return null;
    }

    svc.checking = true;

    return Promise
      .map(checkList, svc.checkOne)
      .then(() => {
        svc.checking = false;
      })
      .catch(() => {
        svc.checking = false;
      });
  },
  async checkOne(proxyUrl) {
    if (!proxyUrl) {
      logger.warn('no proxyUrl');
      return null;
    }

    let matches = proxyUrl.match(svc.ipRegExp);
    if (!matches.length) {
      logger.warn('no ip detect for: ', proxyUrl);
      return null;
    }

    let ip = matches[0];
    if (!ip) {
      logger.warn('no ip found', proxyUrl, matches);
      return null;
    }

    logger.info(`start check proxyUrl=${proxyUrl}, ip=${ip}`);
    let ipData = await Promise
      .try(() => {
        return rp({
          url: `http://ip.taobao.com/service/getIpInfo.php?ip=${ip}`,
          headers: {
            'User-Agent': randomUseragent.getRandom(),
          },
          json: true,
          timeout: mKoa.config.times.ipCheckTimeout,
        });
      })
      .timeout(2 * mKoa.config.times.ipCheckTimeout)
      .catch((e) => {
        logger.warn(e && e.message);
        return { code: -1, msg: 'timeout' };
      });

    let ipInfo;
    if (!ipData || ipData.code !== 0) {
      logger.warn(`${proxyUrl} check error`, ipData, ip);
      ipInfo = {
        ipNextCheckTime: new Date().getTime() + mKoa.config.times.ipInfoFailedTimeWindow,
      };
    }
    else {
      ipInfo = ipData.data;
      ipInfo.ipNextCheckTime = new Date().getTime() + mKoa.config.times.ipInfoSuccessTimeWindow;
    }

    logger.info('ipInfo: ', ipInfo);

    return Proxy.update({
      url: proxyUrl,
    }, ipInfo);
  },
};

module.exports = svc;
