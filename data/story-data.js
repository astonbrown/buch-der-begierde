/**
 * story-data.js — Alle Geschichtsseiten als gerichteter Graph
 *
 * Jede Seite hat:
 *   - id:          eindeutiger Schlüssel
 *   - number:      fiktive Seitennummer im Buch
 *   - text:        Funktion(selectedFragments) → HTML-String
 *                  oder String
 *   - annotations: Array von { word, note }
 *   - branches:    Array von { pageId, conditions?, label? }
 *
 * Fragment-modifizierter Text:
 *   Die Funktion erhält ein Set<string> der gewählten Fragmente.
 *   So kann z.B. ein Substantiv je nach Wahl zu "Samtgewebe",
 *   "Eispanzer" oder "warmes Gewebe" werden.
 *
 * Branching-Graph:
 *
 *   Seite 47 ──→ Seite 48 ──→ Seite 52  (Branch A: samt/wärme)
 *        │              │
 *        │              └──→ Seite 54  (Branch B: kälte/schatten)
 *        │
 *        └──→ Seite 49 ──→ Seite 53     (Branch C: atem)
 *
 *                    ──→ Seite 60  (gemeinsames Ende, keine Bedingungen)
 */

/* Hilfsfunktion: prüft ob Fragment gewählt */
function _has(set, ...keys) {
    return keys.some(k => set.has(k));
}

/* Hilfsfunktion: <span class="highlight"> Wort </span> */
function _hl(word) {
    return `<span class="highlight" title="${word}">${word}</span>`;
}

/* Hilfsfunktion: für annotierte Wörter mit Notiz */
function _ann(word, note) {
    return `<span class="highlight" title="${note}">${word}</span>`;
}

export const STORY_PAGES = [

    /* =============================================================
     * SEITE 47 — Einstieg
     * ============================================================= */
    {
        id: 'page_47',
        number: 47,
        text: (fragments) => {
            // Fragment-modifiziertes Substantiv
            let gewebe;
            if (_has(fragments, 'samt')) {
                gewebe = _ann('Samtgewebe', 'Ein weicher Vorhang aus Stille.');
            } else if (_has(fragments, 'kälte')) {
                gewebe = _ann('Eispanzer', 'Spröde Schicht über jeder Regung.');
            } else {
                gewebe = _ann('Gewebe', 'Etwas, das sich nicht greifen lässt.');
            }

            return `Die Nacht legte sich über die Stadt wie ein ${gewebe}, das jede Bewegung verschluckte. Ich stand am Fenster und beobachtete, wie das ${_hl('Licht')} der Laternen in der Feuchtigkeit der Straße zerlief — gelb und unsicher, wie eine Sprache, die ihr eigenes Versprechen nicht mehr glaubte.

In der Wohnung unter mir wurde eine Tür geschlossen. Leise, aber mit jener Endgültigkeit, die nur Trennungen kennen. Ich lauschte dem ${_hl('Atem')} des Hauses, seinem Knarzen, seinem Husten, seiner Art, die Stunden zu zählen.`;
        },
        annotations: [
            { word: 'Gewebe', note: 'Metapher für die Textur der Nacht — fragmentmodifiziert.' },
            { word: 'Atem', note: 'Das Haus als lebender Organismus.' }
        ],
        branches: [
            { pageId: 'page_48', conditions: [], label: '48' },
            { pageId: 'page_49', conditions: ['atem'], label: '49' }
        ]
    },

    /* =============================================================
     * SEITE 48 — Fortsetzung (erfordert keine Bedingungen)
     * ============================================================= */
    {
        id: 'page_48',
        number: 48,
        text: (fragments) => {
            let farbe;
            if (_has(fragments, 'wärme')) {
                farbe = _ann('bernsteinfarben', 'Wärme wie von altem Holz.');
            } else if (_has(fragments, 'kälte')) {
                farbe = _ann('stahlgrau', 'Die Farbe eines Himmels, der nichts mehr verspricht.');
            } else {
                farbe = _ann('farblos', 'Weder Trost noch Bedrohung.');
            }

            return `Am nächsten Morgen war die Luft ${farbe} und roch nach ${_hl('Staub')} und Tagen, die niemand erlebt hatte. Die Vorhänge hingen schief, als hätten sie über Nacht etwas vergessen.

Auf dem Tisch lag ein Briefumschlag, der mir nicht gehörte. Keine Adresse, nur ein Zeichen — ${_ann('ein kreuz', 'Markierung ohne klaren Absender — ein Motiv, das wiederkehrt.')}. Ich berührte ihn nicht. Manche Dinge warten darauf, dass man bereit ist, sie zu lesen.`;
        },
        annotations: [
            { word: 'farblos', note: 'Atmosphäre ohne Vektor — fragmentmodifiziert.' },
            { word: 'Kreuz', note: 'Wiederkehrendes Symbol — vielleicht Markierung oder Schutzzeichen.' }
        ],
        branches: [
            { pageId: 'page_52', conditions: ['samt', 'wärme'], label: '52' },
            { pageId: 'page_54', conditions: ['kälte', 'schatten'], label: '54' }
        ]
    },

    /* =============================================================
     * SEITE 49 — Alternativer Pfad (erfordert Fragment 'atem')
     * ============================================================= */
    {
        id: 'page_49',
        number: 49,
        text: (fragments) => {
            return `Ich folgte dem ${_hl('Atem')} des Hauses die Treppe hinab. Jede Stufe kannte mich, und ich kannte sie — ein Gespräch aus Holz und Gewicht, geführt in einer Sprache, die älter war als Worte.

Unten, im Flur, stand eine ${_ann('Silhouette', 'Gestalt ohne Gesicht — mehr Erinnerung als Anwesenheit.')}, die nicht zu mir gehörte und doch mich meinte. Sie drehte sich nicht um. Sie wartete nur, wie Lampen warten: ohne Ungeduld, ohne Erwartung, nur mit der Gewissheit, dass das ${_hl('Licht')} irgendwann ausgeht.`;
        },
        annotations: [
            { word: 'Silhouette', note: 'Verweis auf eine Wiederkehr — motif aus Seite 48.' }
        ],
        branches: [
            { pageId: 'page_53', conditions: [], label: '53' }
        ]
    },

    /* =============================================================
     * SEITE 52 — Branch A (Samt/Wärme): Das weiche Erwachen
     * ============================================================= */
    {
        id: 'page_52',
        number: 52,
        text: (fragments) => {
            return `Drei Tage vergingen, ohne dass ich den Umschlag öffnete. Stattdessen beobachtete ich, wie das ${_hl('Licht')} durch die Jalousien fiel und Muster auf den Boden zeichnete — ein ${_ann('geometrisches Gedicht', 'Ordnung als Gegenmittel zur Unbestimmtheit.')}, das sich mit der Sonne verschob.

Am vierten Tag wusste ich, dass die Wärme nicht vom Fenster kam. Sie kam von dem, was ich vermieden hatte: dem Lesen. Ich setzte mich, brach das Siegel, und die Worte kamen mir entgegen wie ${_hl('Atem')} — nicht meine, aber auch nicht fremd.`;
        },
        annotations: [
            { word: 'geometrisches Gedicht', note: 'Licht als Sprache der Ordnung.' }
        ],
        branches: [
            { pageId: 'page_60', conditions: [], label: '60' }
        ]
    },

    /* =============================================================
     * SEITE 54 — Branch B (Kälte/Schatten): Das dichte Schweigen
     * ============================================================= */
    {
        id: 'page_54',
        number: 54,
        text: (fragments) => {
            return `Drei Tage vergingen, und der Umschlag blieb unberührt. Die Kälte in der Wohnung gewann an Kontur, als würde sie zu einem ${_ann('zweiten Bewohner', 'Die Kälte als Akteur, nicht als Zustand.')}. Ich trank Tee, der nicht wärmte, und hörte Uhren, die ich nicht besaß.

Am vierten Tag bemerkte ich, dass der Schatten an der Wand nicht mehr derselbe war. Er war länger geworden — oder ich war kleiner. Ich öffnete den Umschlag nicht aus Mut, sondern weil die ${_hl('Stille')} es verlangte: ${_ann('eine Anweisung, kein Angebot.', 'Stille als Gebot, nicht als Abwesenheit.')}`;
        },
        annotations: [
            { word: 'zweiter Bewohner', note: 'Verdopplungsmotiv — Kälte als eigenständige Präsenz.' },
            { word: 'Anweisung, kein Angebot', note: 'Zwang der Atmosphäre über freie Wahl.' }
        ],
        branches: [
            { pageId: 'page_60', conditions: [], label: '60' }
        ]
    },

    /* =============================================================
     * SEITE 53 — Branch C (Atem): Die Treppe hinab
     * ============================================================= */
    {
        id: 'page_53',
        number: 53,
        text: (fragments) => {
            return `Die Silhouette löste sich nicht auf, als ich näher trat. Sie wurde ${_ann('klarer', 'Paradox: Nähe bringt Schärfe, nicht Auflösung.')}, als hätte sie nur darauf gewartet, gesehen zu werden. Ihr Gesicht war keines, und doch kannte ich es.

»Du kommst spät«, sagte sie, oder ich dachte es mir nur — der Raum zwischen uns war so dicht, dass Worte darin zerfielen. Ich antwortete mit dem einzigen, was ich hatte: meinem ${_hl('Atem')}. Er stand zwischen uns wie eine Wand aus warmer Luft, und für einen Moment war die Treppe nicht länger eine Treppe.`;
        },
        annotations: [
            { word: 'klarer', note: 'Nähe als Verschärfung statt Erkenntnis.' }
        ],
        branches: [
            { pageId: 'page_60', conditions: [], label: '60' }
        ]
    },

    /* =============================================================
     * SETE 60 — Gemeinsames Ende (keine Bedingungen)
     * ============================================================= */
    {
        id: 'page_60',
        number: 60,
        text: (fragments) => {
            let ending;
            if (_has(fragments, 'samt', 'wärme')) {
                ending = _ann('weich', 'Die Samt-Branche endet in Auflösung, nicht in Abbruch.');
            } else if (_has(fragments, 'kälte', 'schatten')) {
                ending = _ann('klar', 'Die Kälte-Branche endet in Schärfe und Notwendigkeit.');
            } else {
                ending = _ann('ungewiss', 'Der neutrale Pfad — offenes Ende.');
            }

            return `Später — ich weiß nicht, wie viel später — saß ich wieder oben, am Fenster, und die Stadt war noch immer da. Der Umschlag lag leer vor mir, sein Inhalt hatte sich aufgelöst, sobald ich ihn ausgesprochen hatte.

Was blieb, war ein ${ending} Gefühl, dass etwas vollendet worden war, ohne dass ich es hätte benennen können. Die Nacht war nicht zu Ende, aber ich war es — für heute.

<span class="dim">— Wende das Buch, wenn du bereit bist.</span>`;
        },
        annotations: [
            { word: 'weich/klar/ungewiss', note: 'Drei End-Varianten je nach gewähltem Pfad.' }
        ],
        branches: [] // Ende
    }

];
