export async function fetchHealthWeb(source) {
  const res = await fetch(source.url);
  const html = await res.text();

  const text = html.replace(/<[^>]*>/g, '').slice(0, 2000);

  return {
    url: source.url,
    summary: text
  };
}
