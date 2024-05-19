const GET_URL =
  'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=829fdbc283c6fc0905cbfa9a50ce';

const POST_URL =
  'https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=829fdbc283c6fc0905cbfa9a50ce';

const fetchData = async () => {
  try {
    const response = await fetch(GET_URL);
    const data = await response.json();
    const events = data.events;
    events.sort((a, b) => a.timestamp - b.timestamp);
    console.log(events);
    createSessions(events);
  } catch (err) {
    console.log('Error in fetching API: ', err);
  }
};

const createSessions = (events) => {
  const map = new Map();

  events.forEach((event) => {
    const { visitorId, timestamp, url } = event;
    const obj = {
      duration: 0,
      pages: [url],
      startTime: timestamp,
    };
    if (!map.has(visitorId)) {
      map.set(visitorId, [obj]);
    } else {
      const userSessions = map.get(visitorId);
      const latestSession = userSessions[userSessions.length - 1];
      const duraion = latestSession.startTime + latestSession.duration;
      const timeElapsed = timestamp - duraion;

      if (timeElapsed <= 600000) {
        latestSession.duration = timestamp - latestSession.startTime;
        latestSession.pages.push(url);
      } else {
        userSessions.push(obj);
      }
    }
  });

  const resultData = {
    sessionsByUser: Object.fromEntries(map),
  };
  postRequest(resultData);
};

const postRequest = async (data) => {
  console.log(data);
  try {
    const response = await fetch(POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const json = await response.json();
      console.log('RESPONSE: ', json);
    } else {
      const json = await response.json();
      console.log('ERROR: ', json);
    }
  } catch (err) {
    console.log('Error posting request: ', err);
  }
};

fetchData();
