const ctrl = {
  async query(ctx) {
    let conditions = {};

    if (ctx.query.search) {
      conditions.$or = [{
        url: {
          $regex: _.escapeRegExp(ctx.query.search),
          $options: 'gi',
        },
      }];
    }

    let query = _.pick(ctx.query, ['area', 'area_id', 'region', 'region_id', 'city', 'city_id', 'country', 'country_id', 'isp', 'isp_id', 'connected']);

    query = _.reduce(query, (result, item, key) => {
      result[key] = UtilService.parseJsonOrString(item);
      return result;
    }, {});

    if (!query.country && !query.country_id) {
      query.country = '中国';
    }
    if (!query.connected) {
      query.connected = true;
    }

    _.assign(conditions, query);

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
