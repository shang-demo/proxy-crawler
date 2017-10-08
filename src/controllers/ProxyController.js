const ctrl = {
  async query(ctx) {
    let conditions = {};

    if (ctx.query.search) {
      conditions.$or = [{
        title: {
          $regex: _.escapeRegExp(ctx.query.search),
          $options: 'gi',
        }
      }, {
        intro: {
          $regex: _.escapeRegExp(ctx.query.search),
          $options: 'gi',
        }
      }];
    }

    if (ctx.query.connected === undefined) {
      conditions.connected = true;
    }

    let addressQuery = _.pick(ctx.query, ['area', 'area_id', 'region', 'region_id', 'city', 'city_id', 'country', 'country_id', 'isp', 'isp_id']);

    if (!addressQuery.country && !addressQuery.country_id) {
      addressQuery.country = '中国';
    }
    _.assign(conditions, addressQuery);

    logger.info('conditions: ', conditions);
    await UtilService
      .conditionsQuerySend(Proxy, ctx, new Errors.UnknownError(), {
        conditions,
        options: {
          sort: {
            failedTimes: 1,
            checkIndex: 1,
            updatedAt: -1,
          },
        },
      });
  }
};

module.exports = ctrl;
