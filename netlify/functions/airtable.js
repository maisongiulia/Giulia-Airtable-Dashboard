const BASE = 'appbmntO89PpFQtUQ';
const TABLE = 'tbl1fhIwqPsT0umy7';
const FIELDS = [
  'fld9qaIddn6bcXa5I','flds1uikfXq85kW2O','fldau2yVTSGDHstbj',
  'fldSgvOrQe6zglTZW','fldl3FfeAWFrBmKvw','fldcL0o1iuCEokHb6','fld7TunFB43CGftbr'
];

exports.handler = async () => {
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  if (!TOKEN) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'AIRTABLE_TOKEN environment variable not set' })
    };
  }

  try {
    let records = [];
    let offset = null;
    const fieldParams = FIELDS.map(f => `fields[]=${f}`).join('&');

    do {
      const url = `https://api.airtable.com/v0/${BASE}/${TABLE}?pageSize=100&${fieldParams}${offset ? `&offset=${offset}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Airtable returned ${res.status}: ${errText}`);
      }

      const data = await res.json();

      if (!data.records) {
        throw new Error('Airtable response missing records field: ' + JSON.stringify(data));
      }

      records = records.concat(data.records);
      offset = data.offset || null;

    } while (offset);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records, count: records.length })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
