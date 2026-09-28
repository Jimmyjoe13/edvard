import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Dices,
  Menu,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import { gameAssets } from '../data/assets';
import { useGameStore } from '../store/gameStore';
import './EdvardHome.css';

const journeys = [
  {
    number: '01',
    category: 'POUR LES JOUEURS',
    title: 'Forgez votre légende.',
    description: 'Créez un personnage, équipez-le et gardez les règles utiles à portée de main.',
    action: 'Créer un personnage',
    href: '/creation-personnage',
    image: gameAssets.humanPortrait,
    icon: Shield,
    className: 'journey-card--player',
  },
  {
    number: '02',
    category: 'POUR LES MAÎTRES DE JEU',
    title: 'Préparez la prochaine expédition.',
    description: 'Trouvez un scénario, composez une rencontre et consultez le bestiaire.',
    action: 'Préparer une partie',
    href: '/scenarios.html',
    image: gameAssets.accueilTwo,
    icon: Swords,
    className: 'journey-card--gm',
  },
  {
    number: '03',
    category: 'L’UNIVERS D’EDVARD',
    title: 'Suivez la trace des Flux.',
    description: 'Parcourez les régions, les factions et les récits d’un monde transformé.',
    action: 'Explorer l’univers',
    href: '/univers-lore.html',
    image: gameAssets.accueilOne,
    icon: Compass,
    className: 'journey-card--world',
  },
];

export const EdvardHome: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const table = useGameStore((state) => state.table);
  const tableAction = table?.status === 'playing' ? 'Reprendre la partie' : table ? 'Continuer la table' : 'Créer une table';

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="edvard-home">
      <header className="edvard-header">
        <a className="edvard-brand" href="/" aria-label="Edvard, accueil">
          <img src={gameAssets.edvardLogo} alt="" />
          <span>EDVARD</span>
          <span className="edvard-brand__edition">JEU DE RÔLE · MAGI-TECH</span>
        </a>

        <button
          className="edvard-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="edvard-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          className={`edvard-nav${menuOpen ? ' edvard-nav--open' : ''}`}
          id="edvard-navigation"
          aria-label="Navigation principale"
        >
          <a href="/univers-lore.html" onClick={closeMenu}>Univers</a>
          <Link to="/guide-de-table" onClick={closeMenu}>Règles</Link>
          <a href="/bestiaire.html" onClick={closeMenu}>Bestiaire</a>
          <a href="/scenarios.html" onClick={closeMenu}>Scénarios</a>
          <Link className="edvard-nav__table" to="/table" onClick={closeMenu}>
            <Dices size={16} aria-hidden="true" />
            {tableAction}
          </Link>
        </nav>
      </header>

      <section className="edvard-hero" aria-labelledby="edvard-title">
        <img className="edvard-hero__art" src={gameAssets.accueilThree} alt="" />
        <div className="edvard-hero__veil" />
        <div className="edvard-hero__content">
          <p className="edvard-kicker"><span /> UN JEU DE RÔLE ORIGINAL · FANTASY MÂGI-TECH</p>
          <h1 id="edvard-title">
            Le monde a changé.
            <em>Votre histoire commence ici.</em>
          </h1>
          <p className="edvard-hero__intro">
            Les Flux ont remodelé les terres d’Edvard. Explorez leurs secrets,
            façonnez votre personnage et écrivez la suite autour de la table.
          </p>
          <div className="edvard-hero__actions">
            <a className="edvard-button edvard-button--bright" href="/univers-lore.html">
              Entrer dans l’univers <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <Link className="edvard-button edvard-button--quiet" to="/table">
              <Dices size={18} aria-hidden="true" /> {tableAction}
            </Link>
          </div>
          <div className="edvard-hero__note">
            <span className="edvard-hero__note-mark"><Sparkles size={17} aria-hidden="true" /></span>
            <span><b>MAGIE ANCIENNE</b><i>×</i><b>TECHNOLOGIE BRISÉE</b></span>
          </div>
        </div>
        <a className="edvard-scroll-cue" href="#parcours">
          <span>Choisissez votre voie</span>
          <ArrowDown size={16} aria-hidden="true" />
        </a>
        <div className="edvard-hero__index" aria-hidden="true">COORD. 48°N / 12°E <span>FLUX ACTIF</span></div>
      </section>

      <section className="edvard-journeys" id="parcours" aria-labelledby="journeys-title">
        <div className="edvard-section-heading">
          <div>
            <p className="edvard-kicker edvard-kicker--dark">VOTRE PROCHAINE ÉTAPE</p>
            <h2 id="journeys-title">Quelle est votre voie ?</h2>
          </div>
          <p>Tout ce qu’il faut pour jouer, mener une partie et explorer Edvard.</p>
        </div>

        <div className="edvard-journey-grid">
          {journeys.map(({ number, category, title, description, action, href, image, icon: Icon, className }) => {
            const card = (
              <>
                <img className="journey-card__image" src={image} alt="" loading="lazy" />
                <span className="journey-card__shade" />
                <span className="journey-card__topline">
                  <span>{number} / {category}</span>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="journey-card__copy">
                  <span className="journey-card__title">{title}</span>
                  <span className="journey-card__description">{description}</span>
                  <span className="journey-card__action">{action}<ArrowRight size={16} aria-hidden="true" /></span>
                </span>
              </>
            );

            // Les parcours internes passent par le routeur, les pages statiques restent des liens.
            return href.startsWith('/') && !href.includes('.html') ? (
              <Link className={`journey-card ${className}`} to={href} key={number}>{card}</Link>
            ) : (
              <a className={`journey-card ${className}`} href={href} key={number}>{card}</a>
            );
          })}
        </div>
      </section>

      <section className="edvard-table-callout" aria-labelledby="table-title">
        <div className="edvard-table-callout__copy">
          <p className="edvard-kicker"><span /> POUR VOTRE PROCHAINE SESSION</p>
          <h2 id="table-title">La carte est prête.<br /><em>À vous de jouer.</em></h2>
          <p>Préparez votre personnage et votre équipe, choisissez un scénario, puis retrouvez la carte tactique et les outils de jeu au même endroit.</p>
          <Link className="edvard-button edvard-button--bright" to="/table">
            {tableAction} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="edvard-table-callout__map" role="img" aria-label="Carte illustrée des terres d’Edvard">
          <img src={gameAssets.worldMap} alt="" loading="lazy" />
          <span className="edvard-map-pin edvard-map-pin--one">NEXOR</span>
          <span className="edvard-map-pin edvard-map-pin--two">AZARITH</span>
          <span className="edvard-map-caption"><ScrollText size={14} aria-hidden="true" /> CARTOGRAPHIE DES TERRES CONNUES</span>
        </div>
      </section>

      <footer className="edvard-footer">
        <a className="edvard-footer__brand" href="/">EDVARD <span>— UN MONDE À TRAVERSER</span></a>
        <div className="edvard-footer__links">
          <a href="/univers-lore.html">Univers</a>
          <Link to="/guide-de-table">Règles</Link>
          <Link to="/creation-personnage">Personnage</Link>
          <a href="/scenarios.html">Scénarios</a>
          <Link to="/table">Table virtuelle</Link>
        </div>
        <span className="edvard-footer__edition">UN JEU DE RÔLE MAGI-TECH</span>
      </footer>
    </main>
  );
};
