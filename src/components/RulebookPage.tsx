import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Dices, Search, Shield, Sparkles } from 'lucide-react';
import { gameAssets } from '../data/assets';
import { RULE_DIFFICULTIES, RULE_ENTRIES, RuleCategory } from '../data/rulebook';
import { GAME_RULES, rollD10Pool } from '../data/rules';
import './RulebookPage.css';

const categories = ['Tout', 'Tests', 'Combat', 'Équipement', 'Progression'] as const;
type RuleFilter = typeof categories[number];
type RollMode = 'normal' | 'advantage' | 'disadvantage';

const rollModes: { id: RollMode; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'advantage', label: 'Avantage' },
  { id: 'disadvantage', label: 'Désavantage' },
];

const synergies = [
  { id: 'skill', label: 'Compétence connexe' },
  { id: 'gear', label: 'Équipement adapté' },
  { id: 'help', label: 'Aide extérieure' },
];

type CheckResult = {
  dice: { value: number; kept: boolean }[];
  diceTotal: number;
  bonusTotal: number;
  total: number;
  difficulty: number;
  outcome: string;
  succeeded: boolean;
};

const categoryLabel = (category: RuleCategory) => category;

export const RulebookPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RuleFilter>('Tout');
  const [attributeBonus, setAttributeBonus] = useState(10);
  const [skillBonus, setSkillBonus] = useState(0);
  const [difficulty, setDifficulty] = useState(15);
  const [mode, setMode] = useState<RollMode>('normal');
  const [selectedSynergies, setSelectedSynergies] = useState<string[]>([]);
  const [result, setResult] = useState<CheckResult | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Règles d’Edvard — guide de table';
    return () => { document.title = previousTitle; };
  }, []);

  const visibleRules = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    return RULE_ENTRIES.filter((entry) => {
      const matchesFilter = filter === 'Tout' || entry.category === filter;
      const searchableText = [entry.title, entry.summary, ...entry.details].join(' ').toLocaleLowerCase('fr');
      return matchesFilter && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [filter, query]);

  const toggleSynergy = (id: string) => {
    setSelectedSynergies((selected) => (
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    ));
  };

  const rollCheck = () => {
    const roll = rollD10Pool(mode);
    const diceTotal = roll.total;
    const bonusTotal = attributeBonus + skillBonus + selectedSynergies.length * GAME_RULES.resolution.synergyBonus;
    const total = diceTotal + bonusTotal;
    const succeeded = roll.criticalSuccess || (!roll.criticalFailure && total >= difficulty);
    const outcome = roll.criticalSuccess
      ? 'Succès critique'
      : roll.criticalFailure
        ? 'Échec critique'
        : succeeded
          ? 'Réussite'
          : 'Échec';

    setResult({
      dice: roll.rolled.map((value, index) => ({ value, kept: roll.keptIndices.includes(index) })),
      diceTotal,
      bonusTotal,
      total,
      difficulty,
      outcome,
      succeeded,
    });
  };

  return (
    <main className="rulebook-page">
      <header className="rulebook-header">
        <Link className="rulebook-brand" to="/" aria-label="Edvard, accueil">
          <img src={gameAssets.edvardLogo} alt="" />
          <span>EDVARD</span>
          <small>LE GUIDE DE TABLE</small>
        </Link>
        <nav className="rulebook-nav" aria-label="Navigation principale">
          <Link to="/">Accueil</Link>
          <a className="is-active" href="#reference">Règles</a>
          <a href="/creation-personnage.html">Personnage</a>
          <a href="/scenarios.html">Scénarios</a>
          <Link className="rulebook-nav__table" to="/table"><Dices size={16} /> À la table</Link>
        </nav>
      </header>

      <section className="rulebook-hero" aria-labelledby="rulebook-title">
        <div className="rulebook-hero__copy">
          <p className="rulebook-eyebrow"><span /> REPÈRES POUR LES JOUEURS ET LES MJ</p>
          <h1 id="rulebook-title">La règle, <em>au bon moment.</em></h1>
          <p>Retrouvez une mécanique, choisissez une difficulté et résolvez un test sans quitter la partie.</p>
          <a className="rulebook-text-link" href="#lancer-un-test">Lancer un test <ArrowRight size={16} /></a>
        </div>
        <div className="rulebook-hero__map" aria-hidden="true">
          <img src={gameAssets.worldMap} alt="" />
          <span className="rulebook-map-mark rulebook-map-mark--one">LES TERRES CONNUES</span>
          <span className="rulebook-map-mark rulebook-map-mark--two">FLUX ACTIF</span>
        </div>
      </section>

      <section className="rulebook-check-section" id="lancer-un-test" aria-labelledby="check-title">
        <div className="rulebook-section-intro">
          <p className="rulebook-eyebrow rulebook-eyebrow--dark"><Dices size={15} /> RÉSOLUTION RAPIDE</p>
          <h2 id="check-title">Lancez les dés.</h2>
          <p>{GAME_RULES.resolution.diceCount}d{GAME_RULES.resolution.dieSides} + caractéristique + compétence. La difficulté est fixée par le MJ.</p>
        </div>

        <div className="rule-check">
          <div className="rule-check__inputs">
            <div className="rule-check__field-row">
              <label className="rule-check__field">
                <span>Caractéristique</span>
                <input
                  type="number"
                  min="-10"
                  max="30"
                  value={attributeBonus}
                  onChange={(event) => setAttributeBonus(Number(event.currentTarget.value))}
                  aria-label="Bonus de caractéristique"
                />
              </label>
              <span className="rule-check__operator" aria-hidden="true">+</span>
              <label className="rule-check__field">
                <span>Compétence</span>
                <input
                  type="number"
                  min="-10"
                  max="30"
                  value={skillBonus}
                  onChange={(event) => setSkillBonus(Number(event.currentTarget.value))}
                  aria-label="Bonus de compétence"
                />
              </label>
            </div>

            <fieldset className="rule-check__mode">
              <legend>Conditions du test</legend>
              <div className="rule-check__segments">
                {rollModes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={mode === option.id}
                    className={mode === option.id ? 'is-selected' : ''}
                    onClick={() => setMode(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="rule-check__synergies">
              <legend>Bonus de synergie <span>+2 chacun</span></legend>
              <div className="rule-check__synergy-list">
                {synergies.map((synergy) => (
                  <label key={synergy.id}>
                    <input
                      type="checkbox"
                      checked={selectedSynergies.includes(synergy.id)}
                      onChange={() => toggleSynergy(synergy.id)}
                    />
                    <span>{synergy.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rule-check__difficulty">
              <label htmlFor="check-difficulty">Difficulté visée</label>
              <input
                id="check-difficulty"
                type="number"
                min="1"
                max="60"
                value={difficulty}
                onChange={(event) => setDifficulty(Number(event.currentTarget.value))}
              />
              <div className="rule-check__difficulty-presets" aria-label="Difficultés courantes">
                {RULE_DIFFICULTIES.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    aria-pressed={difficulty === preset.value}
                    className={difficulty === preset.value ? 'is-selected' : ''}
                    onClick={() => setDifficulty(preset.value)}
                  >
                    <span>{preset.label}</span><b>{preset.value}</b>
                  </button>
                ))}
              </div>
            </div>

            <button className="rule-check__roll" type="button" onClick={rollCheck}>
              Lancer le test <Dices size={19} />
            </button>
          </div>

          <div className={'rule-check__result' + (result ? ' has-result' : '')} aria-live="polite" aria-atomic="true">
            {result ? (
              <>
                <p className="rule-check__result-label">RÉSULTAT DU TEST</p>
                <div className="rule-check__dice">
                  {result.dice.map((die, index) => (
                    <span
                      key={index + '-' + die.value}
                      className={'rule-die' + (die.kept ? ' is-kept' : ' is-dropped')}
                      aria-label={'Dé ' + (index + 1) + ' : ' + die.value + (die.kept ? ', conservé' : ', écarté')}
                    >
                      {die.value}
                    </span>
                  ))}
                </div>
                <strong className="rule-check__total">{result.total}</strong>
                <p className="rule-check__equation">
                  {result.diceTotal} aux dés + {result.bonusTotal} de bonus · difficulté {result.difficulty}
                </p>
                <p className={'rule-check__outcome' + (result.succeeded ? ' is-success' : ' is-failure')}>{result.outcome}</p>
              </>
            ) : (
              <div className="rule-check__empty">
                <span className="rule-check__empty-dice"><Dices size={34} /></span>
                <strong>Votre prochain jet</strong>
                <p>Choisissez vos bonus et la difficulté, puis lancez les dés.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rulebook-footnote">
          <Sparkles size={17} />
          <p>Avec un avantage, gardez les deux dés les plus élevés. Avec un désavantage, gardez les deux plus faibles.</p>
        </div>
      </section>

      <section className="rulebook-reference" id="reference" aria-labelledby="reference-title">
        <div className="rulebook-reference__heading">
          <div>
            <p className="rulebook-eyebrow rulebook-eyebrow--dark"><BookOpen size={15} /> INDEX DE TABLE</p>
            <h2 id="reference-title">Retrouver une règle</h2>
          </div>
          <label className="rulebook-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Rechercher dans les règles</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Chercher un mot, un effet…"
            />
          </label>
        </div>

        <div className="rulebook-filters" role="group" aria-label="Filtrer les règles par thème">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filter === category}
              className={filter === category ? 'is-selected' : ''}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="rulebook-cards">
          {visibleRules.map((entry, index) => (
            <article className={'rule-card rule-card--' + entry.id} key={entry.id}>
              <div className="rule-card__topline">
                <span>{categoryLabel(entry.category)}</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3>{entry.title}</h3>
              <p className="rule-card__summary">{entry.summary}</p>
              <ul>
                {entry.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </article>
          ))}
          {visibleRules.length === 0 && (
            <div className="rulebook-empty">
              <Shield size={22} />
              <p>Aucune règle trouvée. Essayez un autre terme ou un autre thème.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="rulebook-footer">
        <Link to="/"><ArrowLeft size={16} /> Retour à Edvard</Link>
        <span>LES FLUX N’ATTENDENT PAS.</span>
        <Link to="/table">Ouvrir la table <ArrowRight size={16} /></Link>
      </footer>
    </main>
  );
};
