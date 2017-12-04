module.exports = {
  userAgents: [
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; .NET4.0E; .NET4.0C; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729)',
    'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36 QQBrowser/3.8.3858.400',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
  ],
  proxyCrawlerList: [
    {
      name: 'goubanjia',
      requestList: [
        {
          type: 'headlessChrome',
          body: { query: '{\n  html(url:"http://www.goubanjia.com/", delay:1000)\n}' },
        }
      ],
      sitemap: {
        startUrl: 'http://www.goubanjia.com/',
        selectors: [{
          parentSelectors: ['_root'],
          type: 'SelectorElement',
          multiple: true,
          id: 'item',
          selector: '#list > table > tbody > tr',
          delay: ''
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: false,
          id: 'ip_address',
          selector: 'td.ip',
          regex: '',
          delay: '',
          innerText: true,
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: false,
          id: 'type',
          selector: 'td:nth-of-type(3) a.href',
          regex: '',
          delay: ''
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: false,
          id: 'address',
          selector: 'td:nth-of-type(4)',
          regex: '',
          delay: ''
        }],
        _id: 'goubanjia'
      }
    },
    {
      name: 'kuaidaili',
      requestList: [
        {
          type: 'headlessChrome',
          body: { query: '{\n  html(url:"http://www.kuaidaili.com/free/inha/", delay:3000)\n}' },
        },
        {
          type: 'headlessChrome',
          body: { query: '{\n  html(url:"http://www.kuaidaili.com/free/intr/", delay:3000)\n}' },
        }
      ],
      sitemap: {
        startUrl: 'http://www.kuaidaili.com/free/',
        selectors: [{
          parentSelectors: ['_root'],
          type: 'SelectorElement',
          multiple: true,
          id: 'item',
          selector: 'table tbody tr',
          delay: ''
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: true,
          id: 'ip_address',
          selector: 'td:nth-of-type(1)',
          regex: '',
          delay: ''
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: false,
          id: 'port',
          selector: 'td:nth-of-type(2)',
          regex: '',
          delay: ''
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: false,
          id: 'type',
          selector: 'td:nth-of-type(4)',
          regex: '',
          delay: ''
        },
        {
          parentSelectors: ['item'],
          type: 'SelectorText',
          multiple: false,
          id: 'address',
          selector: 'td:nth-of-type(5)',
          regex: '',
          delay: ''
        }],
        _id: 'kuaidaili'
      },
    },
    {
      name: 'xicidaili',
      requestList: [
        {
          type: 'headlessChrome',
          body: { query: '{\n  html(url:"http://www.xicidaili.com/nn/", delay:1000)\n}' },
        },
        {
          type: 'headlessChrome',
          body: { query: '{\n  html(url:"http://www.xicidaili.com/nt/", delay:1000)\n}' },
        }
      ],
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
    }
  ],
};
