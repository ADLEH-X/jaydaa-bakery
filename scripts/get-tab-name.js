async function main() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/14hdG1ufdICUDmnkF5nIQRsaz2m1qyZV-e7eMYB6mva0/htmlview');
  const html = await res.text();
  const regex = /items\.push\({\s*name:\s*"([^"]+)",\s*pageUrl:[^}]+gid:\s*"([^"]+)"/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    console.log(`Tab: "${m[1]}", GID: ${m[2]}`);
  }
}

main().catch(console.error);
