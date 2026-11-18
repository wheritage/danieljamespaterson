"""Illustrations des services : compositions éditoriales en aplat, même grammaire pour les sept.
Cadre 320 × 240 : ciel en dégradé (ciel pâle vers blanc), lignes de vent fines, horizon en filet, soleil ambre carré
(écho du logo). Sujet en aplats encre / bleu profond / ciel / blanc, filets d'un pixel, hachures pour les ombres.
illustration(key, uid) renvoie un <svg> autonome ; uid rend les id (dégradés, motifs) uniques dans la page."""

INK, DEEP, SKY, PALE, WHITE, AMBER = '#13283B', '#1F6E9C', '#7EC3E6', '#CFE8F6', '#FFFFFF', '#B8452C'


def frame(uid, body, sun=None):
    sun_el = f'<rect x="{sun[0]}" y="{sun[1]}" width="14" height="14" fill="{AMBER}"/>' if sun else ''
    return f'''<svg class="ill" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="sky-{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4E3F4"/><stop offset=".72" stop-color="#EEF6FB"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
<linearGradient id="deep-{uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{DEEP}"/><stop offset="1" stop-color="#17557A"/></linearGradient>
<pattern id="hatch-{uid}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="{INK}" stroke-width=".7" stroke-opacity=".28"/></pattern>
</defs>
<rect width="320" height="240" fill="url(#sky-{uid})"/>
<g stroke="{WHITE}" stroke-width="1.2" stroke-linecap="square" opacity=".9">
<line x1="24" y1="52" x2="96" y2="52"/><line x1="40" y1="60" x2="78" y2="60"/><line x1="196" y1="84" x2="290" y2="84"/><line x1="222" y1="92" x2="268" y2="92"/>
</g>
{sun_el}
<line x1="0" y1="200.5" x2="320" y2="200.5" stroke="{INK}" stroke-opacity=".35"/>
<rect x="0" y="201" width="320" height="39" fill="url(#hatch-{uid})" opacity=".55"/>
{body}
</svg>'''


def vie(u):
    # Un portique qui abrite trois piliers : la famille sous une protection
    return frame(u, f'''
<path d="M84 200 V138 A76 76 0 0 1 236 138 V200" fill="{WHITE}" stroke="{INK}" stroke-width="1.5"/>
<path d="M98 200 V140 A62 62 0 0 1 222 140 V200" fill="none" stroke="{INK}" stroke-opacity=".35"/>
<path d="M84 138 A76 76 0 0 1 236 138 L222 140 A62 62 0 0 0 98 140 Z" fill="url(#deep-{u})"/>
<rect x="118" y="146" width="22" height="54" fill="{SKY}"/>
<rect x="149" y="122" width="22" height="78" fill="{INK}"/>
<rect x="180" y="158" width="22" height="42" fill="{DEEP}"/>
<rect x="118" y="146" width="22" height="54" fill="url(#hatch-{u})" opacity=".5"/>
<line x1="70" y1="200" x2="250" y2="200" stroke="{INK}" stroke-width="2"/>
<rect x="155" y="104" width="10" height="10" fill="{AMBER}"/>''')


def invalidite(u):
    # Un écu qui garde le pouls : le revenu continue pendant l'arrêt
    return frame(u, f'''
<path d="M160 42 L216 62 V112 C216 150 193 176 160 192 C127 176 104 150 104 112 V62 Z" fill="url(#deep-{u})"/>
<path d="M160 42 L216 62 V112 C216 150 193 176 160 192 Z" fill="{INK}"/>
<path d="M160 56 L203 71 V112 C203 142 186 163 160 177 C134 163 117 142 117 112 V71 Z" fill="none" stroke="{WHITE}" stroke-opacity=".45"/>
<polyline points="28,122 112,122 126,122 136,96 150,150 164,84 176,122 292,122" fill="none" stroke="{AMBER}" stroke-width="2.2" stroke-linejoin="miter"/>
<rect x="288" y="118" width="8" height="8" fill="{AMBER}"/>
<rect x="104" y="200" width="112" height="6" fill="{INK}" opacity=".18"/>''')


def epargne(u):
    # Colonnes qui montent, courbe composée, point d'arrivée ambre
    bars = ''
    cols = [(70, 168, PALE), (98, 156, SKY), (126, 140, SKY), (154, 122, DEEP), (182, 100, DEEP), (210, 74, INK)]
    for x, y, c in cols:
        bars += f'<rect x="{x}" y="{y}" width="20" height="{200 - y}" fill="{c}"/>'
    grid = ''.join(f'<line x1="56" y1="{y}" x2="262" y2="{y}" stroke="{INK}" stroke-opacity=".1"/>' for y in (80, 110, 140, 170))
    return frame(u, f'''{grid}
{bars}
<rect x="70" y="168" width="20" height="32" fill="url(#hatch-{u})"/>
<path d="M62 176 C110 168 150 140 184 108 S236 54 262 42" fill="none" stroke="{INK}" stroke-width="1.6"/>
<rect x="257" y="37" width="10" height="10" fill="{AMBER}"/>
<g fill="{WHITE}" stroke="{INK}" stroke-width="1.2"><ellipse cx="34" cy="194" rx="16" ry="5"/><ellipse cx="34" cy="186" rx="16" ry="5"/><ellipse cx="34" cy="178" rx="16" ry="5"/></g>''')


def entreprise(u):
    # Une ligne d'horizon d'affaires ; une tour principale, une fenêtre allumée
    def windows(x0, y0, cols, rows, w=6, h=8, gx=5, gy=7, fill=WHITE, op=.55):
        return ''.join(f'<rect x="{x0 + c * (w + gx)}" y="{y0 + r * (h + gy)}" width="{w}" height="{h}" fill="{fill}" fill-opacity="{op}"/>' for c in range(cols) for r in range(rows))
    return frame(u, f'''
<rect x="52" y="128" width="52" height="72" fill="{SKY}"/>{windows(60, 138, 4, 4)}
<rect x="210" y="112" width="58" height="88" fill="{DEEP}"/>{windows(219, 122, 4, 5)}
<rect x="112" y="72" width="42" height="128" fill="url(#deep-{u})"/>{windows(119, 82, 3, 7)}
<rect x="160" y="40" width="44" height="160" fill="{INK}"/>{windows(167, 52, 3, 9, op=.35)}
<rect x="178" y="97" width="6" height="8" fill="{AMBER}"/>
<rect x="176" y="24" width="2" height="16" fill="{INK}"/>
<rect x="104" y="160" width="8" height="40" fill="{INK}" opacity=".85"/>
<line x1="40" y1="200" x2="280" y2="200" stroke="{INK}" stroke-width="2"/>''')


def hypotheque(u):
    # Le contrat en arrière, la maison devant, un sceau ambre : la maison vous appartient
    lines = ''.join(f'<line x1="176" y1="{y}" x2="{248 if i % 3 else 228}" y2="{y}" stroke="{INK}" stroke-opacity=".3"/>' for i, y in enumerate(range(76, 150, 12)))
    return frame(u, f'''
<rect x="164" y="52" width="100" height="134" fill="{WHITE}" stroke="{INK}" stroke-width="1.2"/>
<rect x="164" y="52" width="100" height="14" fill="{PALE}"/>
{lines}
<line x1="176" y1="168" x2="226" y2="168" stroke="{INK}"/>
<path d="M180 164 C188 156 194 170 202 160 S214 166 220 160" fill="none" stroke="{DEEP}" stroke-width="1.2"/>
<rect x="234" y="156" width="18" height="18" fill="{AMBER}" transform="rotate(45 243 165)"/>
<path d="M60 128 L118 86 L176 128" fill="{INK}"/>
<rect x="72" y="126" width="92" height="74" fill="{WHITE}" stroke="{INK}" stroke-width="1.5"/>
<rect x="84" y="140" width="22" height="22" fill="{SKY}"/><line x1="95" y1="140" x2="95" y2="162" stroke="{WHITE}"/><line x1="84" y1="151" x2="106" y2="151" stroke="{WHITE}"/>
<rect x="128" y="150" width="22" height="50" fill="url(#deep-{u})"/>
<rect x="144" y="173" width="3" height="3" fill="{WHITE}"/>
<rect x="72" y="126" width="92" height="10" fill="url(#hatch-{u})"/>
<line x1="44" y1="200" x2="276" y2="200" stroke="{INK}" stroke-width="2"/>''')


def auto(u):
    # Berline en élévation, route en pointillés, lignes de vitesse
    return frame(u, f'''
<g stroke="{INK}" stroke-opacity=".35" stroke-width="1.2"><line x1="20" y1="120" x2="62" y2="120"/><line x1="30" y1="134" x2="58" y2="134"/><line x1="14" y1="148" x2="50" y2="148"/></g>
<path d="M66 170 V150 C66 142 72 138 80 137 L112 133 L140 106 C146 100 152 98 160 98 H214 C222 98 228 101 233 107 L254 133 L272 137 C280 139 284 144 284 152 V170 Z" fill="url(#deep-{u})"/>
<path d="M146 108 C150 104 154 103 160 103 H192 V133 H120 Z" fill="{PALE}"/>
<path d="M198 103 H213 C219 103 223 105 227 110 L245 133 H198 Z" fill="{PALE}"/>
<line x1="66" y1="152" x2="284" y2="152" stroke="{WHITE}" stroke-opacity=".35"/>
<rect x="266" y="142" width="14" height="6" fill="{AMBER}"/>
<rect x="68" y="144" width="10" height="5" fill="{WHITE}" fill-opacity=".7"/>
<g><circle cx="110" cy="172" r="19" fill="{INK}"/><circle cx="110" cy="172" r="8" fill="{PALE}"/><circle cx="240" cy="172" r="19" fill="{INK}"/><circle cx="240" cy="172" r="8" fill="{PALE}"/></g>
<g stroke="{INK}" stroke-width="3"><line x1="20" y1="200" x2="300" y2="200"/></g>
<g stroke="{WHITE}" stroke-width="2"><line x1="40" y1="212" x2="70" y2="212"/><line x1="110" y1="212" x2="140" y2="212"/><line x1="180" y1="212" x2="210" y2="212"/><line x1="250" y1="212" x2="280" y2="212"/></g>''')


def habitation(u):
    # Maison en façade, cheminée, fenêtres à carreaux, arbre stylisé
    def window(x, y, w=26, h=26):
        return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{SKY}"/>'
                f'<line x1="{x + w / 2}" y1="{y}" x2="{x + w / 2}" y2="{y + h}" stroke="{WHITE}"/>'
                f'<line x1="{x}" y1="{y + h / 2}" x2="{x + w}" y2="{y + h / 2}" stroke="{WHITE}"/>')
    return frame(u, f'''
<rect x="176" y="62" width="14" height="30" fill="{INK}"/>
<path d="M74 112 L144 58 L214 112 Z" fill="url(#deep-{u})"/>
<path d="M144 58 L214 112 H144 Z" fill="{INK}" opacity=".35"/>
<rect x="86" y="110" width="116" height="90" fill="{WHITE}" stroke="{INK}" stroke-width="1.5"/>
<rect x="86" y="110" width="116" height="8" fill="url(#hatch-{u})"/>
{window(100, 126)}{window(162, 126)}
<rect x="132" y="150" width="24" height="50" fill="{INK}"/><rect x="150" y="174" width="3" height="3" fill="{AMBER}"/>
<rect x="136" y="84" width="16" height="16" fill="{PALE}" stroke="{INK}"/>
<rect x="250" y="160" width="5" height="40" fill="{INK}"/>
<path d="M252 92 L278 166 H226 Z" fill="{DEEP}"/><path d="M252 92 L278 166 H252 Z" fill="{INK}" opacity=".4"/>
<g stroke="{INK}" stroke-opacity=".5"><line x1="30" y1="182" x2="74" y2="182"/><line x1="30" y1="192" x2="74" y2="192"/><line x1="36" y1="176" x2="36" y2="200"/><line x1="52" y1="176" x2="52" y2="200"/><line x1="68" y1="176" x2="68" y2="200"/></g>
<line x1="24" y1="200" x2="296" y2="200" stroke="{INK}" stroke-width="2"/>''')


DRAW = {'vie': vie, 'invalidite': invalidite, 'epargne': epargne, 'entreprise': entreprise,
        'hypotheque': hypotheque, 'auto': auto, 'habitation': habitation}


def illustration(key, uid=None):
    return DRAW[key](uid or key)
