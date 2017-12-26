import request from 'request-promise';

export async function query(query) {
  let stock = null;

  try {
    stock = await queryStockX(query);
  } catch (e) {
    console.log('Error querying StockX: ', e);
    return {
      success: false,
      message: 'Error pulling data!'
    };
  }

  return {
    success: true,
    data: stock.products,
  };
}

export async function fetchData(sku) {
  let stockx = null;
  let goat = null;

  try {
    const res = await queryStockX(sku);
    const hit = res.products[0];

    const url = hit.url;

    stockx = await fetchStockX(url);
  } catch(e) {
    console.log('Error querying stockx', e);
  }

  try {
    goat = await queryGoat(sku);
  } catch(e) {
    console.log('Error querying goat', e);
  }

  if(!stockx && !goat) {
    return {
      success: false,
      message: 'Unable to fetch live data',
    };
  }

  return {
    success: true,
    data: {
      stockx: stockx.product,
      goat: goat.products[0],
    },
  };
}

export async function fetchStockX(urlPath) {
  const url = `https://stockx.com/api/products/${urlPath}?includes=market,360`;

  const opts = {
    url,
    method: 'GET',
    json: true
  };

  try {
    const res = await request(opts);

    let result = res.Product;

    if (!result) {
      return {
        success: false,
        message: 'Product not found.'
      };
    }

    const id = result.id;

    opts.url = `https://stockx.com/api/products/${id}/activity?state=480`;

    const activityRes = await request(opts);

    if (activityRes) {
      result = {
        product: result,
        activity: activityRes,
      };
    }

    return {
      success: true,
      product: result,
    }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to contact the API for product data'
    };
  }
}

export async function queryGoat(query) {
  const url = 'https://2fwotdvm2o-dsn.algolia.net/1/indexes/ProductTemplateSearch/query';

  const opts = {
    url,
    method: 'POST',
    qs: {
      'x-algolia-agent': 'Algolia for Swift (4.8.1); iOS (11.2)',
      'x-algolia-application-id': '2FWOTDVM2O',
      'x-algolia-api-key': '7af2c6fc3991edee5a9f375062c19d21'
    },
    body: {
      params: `facetFilters=(status:active, status:active_edit)&hitsPerPage=5&numericFilters=[]&page=0&query=${query}`
    },
    json: true
  };

  try {
    const res = await request(opts);

    const results = res.hits;

    if (!results || results.length < 1) {
      return {
        success: false,
        message: 'No products found!'
      };
    }

    return {
      success: true,
      products: results
    }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to contact the API for product data'
    };
  }
}

// https://stockx.com/api/products/adidas-yeezy-boost-350-v2-semi-frozen-yellow?includes=market,360
export async function queryStockX(query) {
  const url = 'https://xw7sbct9v6-dsn.algolia.net/1/indexes/products/query';

  const opts = {
    url,
    method: 'POST',
    qs: {
      'x-algolia-agent': 'Algolia for vanilla JavaScript 3.22.1',
      'x-algolia-application-id': 'XW7SBCT9V6',
      'x-algolia-api-key': '6bfb5abee4dcd8cea8f0ca1ca085c2b3'
    },
    body: {
      params: `query=${query}&hitsPerPage=15&facets=*`
    },
    json: true
  };

  try {
    const res = await request(opts);

    const results = res.hits;

    if (!results || results.length < 1) {
      return {
        success: false,
        message: 'No products found!'
      };
    }

    return {
      success: true,
      products: results
    }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to contact the API for product data'
    };
  }
}
