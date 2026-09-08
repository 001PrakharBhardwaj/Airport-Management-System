export default function PlaceholderPage({ title, description }) {
  return (
    <section className="intro" aria-labelledby="page-title">
      <p className="eyebrow">AEROVAULT</p>
      <h1 id="page-title">{title}</h1>
      <p className="page-summary">{description}</p>
      <p className="status-note">This area is ready for its upcoming interface.</p>
    </section>
  )
}
