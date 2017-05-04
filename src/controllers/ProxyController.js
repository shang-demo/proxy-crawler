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
          select: 'url',
        },
      });
  }
};

module.exports = ctrl;
