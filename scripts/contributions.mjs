const nextDay = date => new Date(Date.parse(`${date}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);

export function parseCalendar(html) {
  const counts = new Map();
  for (const [, attributes, content] of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attributes.match(/\bfor="([^"]+)"/)?.[1];
    const count = content.trim().match(/^(No|[\d,]+) contributions? on /);
    if (id && count) counts.set(id, count[1] === 'No' ? 0 : Number(count[1].replaceAll(',', '')));
  }
  const days = [];
  for (const [tag] of html.matchAll(/<td\b[^>]*data-date="[^" ]+"[^>]*>/g)) {
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (!counts.has(id)) throw new Error(`Missing contribution count for ${date}`);
    days.push({ date, contributionCount: counts.get(id) });
  }
  if (!days.length) throw new Error('GitHub calendar format changed or calendar unavailable');
  return days;
}

export function summarizeContributions(days, from, today) {
  const calendar = new Map();
  for (const day of days) {
    if (day.date < from || day.date > today) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.contributionCount) || day.contributionCount < 0) throw new Error('Invalid contribution day');
    if (calendar.has(day.date) && calendar.get(day.date) !== day.contributionCount) throw new Error('Conflicting contribution days');
    calendar.set(day.date, day.contributionCount);
  }
  let totalContributions = 0, longestStreak = 0, run = 0, currentStreak = 0;
  for (let date = from; date <= today; date = nextDay(date)) {
    if (!calendar.has(date)) throw new Error(`Incomplete contribution calendar: ${date}`);
    const count = calendar.get(date);
    totalContributions += count;
    // Today is still in progress: yesterday's run remains current until UTC midnight.
    if (date === today && count === 0) currentStreak = run;
    run = count > 0 ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
    if (date === today && count > 0) currentStreak = run;
  }
  return { totalContributions, currentStreak, longestStreak, contributionsFrom: from, contributionsThrough: today };
}

export async function fetchContributions(username, createdAt, now, token) {
  const today = now.toISOString().slice(0, 10);
  const firstYear = Number(createdAt.slice(0, 4));
  if (!Number.isInteger(firstYear) || firstYear < 2007 || firstYear > now.getUTCFullYear()) throw new Error('Invalid account creation date');
  const days = [];
  for (let year = firstYear; year <= now.getUTCFullYear(); year++) {
    const from = `${year}-01-01`;
    const to = year === now.getUTCFullYear() ? today : `${year}-12-31`;
    if (token) {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profile-highlights' },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          query: 'query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}',
          variables: { login: username, from: `${from}T00:00:00Z`, to: year === now.getUTCFullYear() ? now.toISOString() : `${to}T23:59:59Z` },
        }),
      });
      if (!response.ok) throw new Error(`GitHub GraphQL returned ${response.status}`);
      const body = await response.json();
      const weeks = body.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
      if (body.errors || !Array.isArray(weeks)) throw new Error('Contribution query failed; keeping existing assets');
      days.push(...weeks.flatMap(week => week.contributionDays));
    } else {
      // Local preview without credentials uses the public GitHub calendar, not a stats service.
      const response = await fetch(`https://github.com/users/${username}/contributions?from=${from}&to=${to}`, {
        headers: { 'Accept-Language': 'en-US', 'User-Agent': 'profile-highlights' }, signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`GitHub public calendar returned ${response.status}`);
      days.push(...parseCalendar(await response.text()));
    }
  }
  return summarizeContributions(days, `${firstYear}-01-01`, today);
}
