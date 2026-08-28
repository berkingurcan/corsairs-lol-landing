import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fmt, game, priceLadder, site } from "@/lib/site";

const ladder = priceLadder(3);

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="hero">
          <div className="hero-map" aria-hidden="true" />
          <div className="hero-veil" aria-hidden="true" />

          <div className="shell hero-in">
            <p className="kicker">Live on Solana mainnet · Seeker and Android</p>
            <h1>
              Every country
              <br />
              has a price.
            </h1>
            <p className="lede">
              {game.countries} countries on one map. Claim one for{" "}
              <b className="price">{game.basePrice}&nbsp;SOL</b>, fly your banner over
              it, and get paid the moment another captain takes it.
            </p>
            <div className="cta">
              <a className="btn btn-solid" href={site.x} rel="noopener">
                Follow {site.xHandle}
              </a>
              <a className="btn btn-ghost" href="#how">
                How it works
              </a>
            </div>
            <p className="fineprint">
              <span className="dot" aria-hidden="true" />
              Real SOL, on mainnet. No token, no points, no airdrop — the only thing to
              buy is a country.
            </p>
          </div>

          <ul className="shell hero-stats" aria-label="At a glance">
            <li>
              <span className="stat-n">{game.countries}</span>
              <span className="stat-l">countries</span>
            </li>
            <li>
              <span className="stat-n price">{game.basePrice}</span>
              <span className="stat-l">SOL to open one</span>
            </li>
            <li>
              <span className="stat-n">+20%</span>
              <span className="stat-l">to take one</span>
            </li>
          </ul>
        </section>

        {/* ── How it works ───────────────────────────────────────── */}
        <section id="how" className="band">
          <div className="shell">
            <header className="sec-head">
              <p className="kicker">01 — How it works</p>
              <h2>Capture. Hold. Get paid when you lose it.</h2>
            </header>

            <ol className="steps">
              <li>
                <span className="step-n">01</span>
                <h3>Capture</h3>
                <p>
                  An unclaimed country opens at{" "}
                  <b className="price">{game.basePrice}&nbsp;SOL</b>. Two taps and one
                  signature in your wallet, and it is yours.
                </p>
              </li>
              <li>
                <span className="step-n">02</span>
                <h3>Raise your banner</h3>
                <p>
                  A name, a line, a link and a colour — written on chain in a second
                  transaction that moves no money. Rewrite it as often as you like.
                </p>
              </li>
              <li>
                <span className="step-n">03</span>
                <h3>Get taken, get paid</h3>
                <p>
                  Anyone can take your country for at least <b>+20%</b> of what you paid.
                  That same transaction sends your principal plus half the increase
                  straight to your wallet. Nothing to claim, nothing to unlock.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* ── The banner ─────────────────────────────────────────── */}
        <section id="banner" className="band">
          <div className="shell split">
            <div>
              <header className="sec-head">
                <p className="kicker">02 — The banner</p>
                <h2>A country is a slot. Your banner is what fills it.</h2>
                <p className="section-lede">
                  Not a bag and not a badge. A name, a line and a link, standing on a
                  world map until somebody pays more than you did.
                </p>
              </header>

              <ul className="uses">
                <li>
                  <h3>Your flag on the board</h3>
                  <p>
                    Every captain who opens the map sees who holds the country and what
                    they had to say about it.
                  </p>
                </li>
                <li>
                  <h3>A page to point at</h3>
                  <p>
                    Every country has its own page on this site, so a share out of the
                    app lands somewhere real instead of on a dead link.
                  </p>
                </li>
                <li>
                  <h3>Yours until it is not</h3>
                  <p>
                    The banner stands for as long as you hold the country, and changing
                    it costs a signature and network fees. Nothing else.
                  </p>
                </li>
              </ul>
            </div>

            <figure className="banner-card">
              <div className="bc-top">
                <span className="bc-flag" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6.6 3.4v17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7.9 4.9 20.4 8.1 16.9 10.2 20.4 12.3 7.9 15.5Z" fill="currentColor" />
                  </svg>
                </span>
                <span className="bc-country">Portugal</span>
                <span className="bc-tag">Held</span>
              </div>
              <div className="bc-body">
                <p className="bc-title">Lisbon Outpost</p>
                <p className="bc-tagline">
                  Coffee, code and a very small navy. Take it if you think you can hold
                  it.
                </p>
                <p className="bc-link">lisbon.example</p>
              </div>
              <div className="bc-foot">
                <div>
                  <span className="bc-lab">Captain</span>
                  <span className="bc-val">7xKq…4mNb</span>
                </div>
                <div>
                  <span className="bc-lab">Price to take</span>
                  <span className="bc-val price">0.0600 SOL</span>
                </div>
              </div>
              <figcaption>An example banner. Not a live territory.</figcaption>
            </figure>
          </div>
        </section>

        {/* ── Economics ──────────────────────────────────────────── */}
        <section id="economics" className="band">
          <div className="shell">
            <header className="sec-head">
              <p className="kicker">03 — Economics</p>
              <h2>Where the money goes.</h2>
              <p className="section-lede">
                A takeover costs at least <b>+20%</b> of the last price, and the increase
                splits <b>in half</b> — half to the captain who just lost the country,
                half to the Harbor Treasury. The displaced captain gets their principal
                back on top, in the same transaction.
              </p>
            </header>

            {/* Scrollable on phones, so it has to be reachable by keyboard. */}
            <div
              className="table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Price step at the minimum raise"
            >
              <table>
                <caption className="visually-hidden">
                  The price step at the minimum raise, in SOL
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Event</th>
                    <th scope="col">Buyer pays</th>
                    <th scope="col">To the captain</th>
                    <th scope="col">To the treasury</th>
                  </tr>
                </thead>
                <tbody>
                  {ladder.map((row) => (
                    <tr key={row.event}>
                      <th scope="row">{row.event}</th>
                      <td className="num price">{fmt(row.buyerPays)}</td>
                      <td className={row.previousOwner === null ? "num muted" : "num"}>
                        {row.previousOwner === null ? "—" : fmt(row.previousOwner)}
                      </td>
                      <td className="num">{fmt(row.treasury)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="table-note">
              At the minimum raise that is <b>+10%</b> on what the displaced captain paid,
              and <b>8.3%</b> of the sale to the treasury.
            </p>

            <div className="aside">
              <h3>The price is a floor.</h3>
              <p>
                You can bid above the asking price, up to {game.maxBidMultiple}× it, and
                the extra is not a tip. It goes to the captain you displace — and your bid
                becomes the country&rsquo;s new price, so the next buyer&rsquo;s floor is
                1.20× <em>yours</em>.
              </p>
            </div>

            <p className="caveat">
              A worked example at the minimum raise, not a promised return. The curve is a
              fixed 1.20×, so these proportions hold at any price — but nothing here is
              owed to you until another captain chooses to take your country, and they may
              never do it. A first capture has no previous owner, which is why the whole
              opening price goes to the treasury.
            </p>
          </div>
        </section>

        {/* ── Closer ─────────────────────────────────────────────── */}
        <section className="closer">
          <div className="shell closer-in">
            <h2>
              One map. {game.countries} countries.
              <br />
              Every one of them for sale.
            </h2>
            <div className="cta">
              <a className="btn btn-solid" href={site.x} rel="noopener">
                Follow {site.xHandle}
              </a>
              <a className="btn btn-ghost" href="#economics">
                Read the economics
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
