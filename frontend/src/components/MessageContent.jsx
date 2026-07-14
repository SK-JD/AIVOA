// Lightweight markdown for assistant replies: **bold**, bullet lists, and line breaks.
function inline(text, kp) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((p, i) =>
      /^\*\*[^*]+\*\*$/.test(p)
        ? <strong key={`${kp}-${i}`} className="font-semibold">{p.slice(2, -2)}</strong>
        : <span key={`${kp}-${i}`}>{p}</span>,
    )
}

export default function MessageContent({ text }) {
  const lines = (text || '').split('\n')
  const blocks = []
  let bullets = []
  const flush = (key) => {
    if (bullets.length) {
      blocks.push(<ul key={`ul-${key}`} className="my-1.5 list-disc space-y-0.5 pl-4">{bullets}</ul>)
      bullets = []
    }
  }
  lines.forEach((line, i) => {
    const t = line.trim()
    const m = t.match(/^([-•✓]|\d+\.)\s+(.*)/)
    if (m) {
      bullets.push(<li key={`li-${i}`}>{inline(m[2], i)}</li>)
    } else {
      flush(i)
      if (t) blocks.push(<p key={`p-${i}`} className="mb-1.5 last:mb-0">{inline(t, i)}</p>)
    }
  })
  flush('end')
  return <>{blocks}</>
}
