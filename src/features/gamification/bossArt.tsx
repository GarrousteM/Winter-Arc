// Gravures des boss (bestiaire validé par Max). Généré depuis les maquettes du canvas ; trait en glace,
// hachures en acier des fjords, seuls les yeux (et le cœur de Hrungnir, le soleil de Sköll) en or.

import type { ReactNode } from 'react';
import type { BossId } from './bosses';

/** Remplissages (motifs et halo) déclarés une fois par gravure, identifiants uniques. */
export type EngravingFills = {
  hatch: string;
  hatchDense: string;
  cross: string;
  hatchSoft: string;
  glow: string;
};

export const bossArt: Record<BossId, (p: EngravingFills) => ReactNode> = {
  draugr: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      {/* tertre funéraire */}
      <path
        d="M14 178 Q100 40 186 178"
        fill={p.hatchSoft}
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <path d="M40 178 Q100 84 160 178" stroke="var(--color-border)" strokeWidth="1" />
      <g stroke="var(--color-border)" strokeWidth="1.2">
        <path d="M30 150l4-6 4 6M162 150l4-6 4 6" />
      </g>
      {/* cape en lambeaux */}
      <path
        d="M48 178 L58 128 Q64 106 84 100 L116 100 Q136 106 142 128 L152 178 L144 170 L138 179 L130 168 L122 178 L114 170 L100 180 L86 170 L78 178 L70 168 L62 179 L56 170 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      {/* plis */}
      <path
        d="M70 120 L66 170M130 120 L134 170M84 108 L80 160M116 108 L120 160"
        stroke="var(--color-frost-deep)"
        strokeWidth="1.2"
      />
      {/* côtes visibles */}
      <g stroke="var(--color-text-muted)" strokeWidth="1.2">
        <path d="M88 116 Q100 120 112 116M88 123 Q100 127 112 123M89 130 Q100 134 111 130" />
      </g>
      {/* casque */}
      <path
        d="M78 98 Q76 60 100 54 Q124 60 122 98 Q112 92 100 92 Q88 92 78 98 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path d="M80 76 Q100 68 120 76" stroke="var(--color-frost)" strokeWidth="1.4" />
      <path d="M100 54 V70" stroke="var(--color-frost-deep)" strokeWidth="1.2" />
      <g fill="var(--color-frost-deep)" stroke="none">
        <circle cx="86" cy="73" r="1.3" />
        <circle cx="93" cy="71" r="1.3" />
        <circle cx="107" cy="71" r="1.3" />
        <circle cx="114" cy="73" r="1.3" />
      </g>
      {/* visage dans l'ombre */}
      <path
        d="M82 78 Q100 72 118 78 L116 96 Q100 108 84 96 Z"
        fill={p.cross}
        stroke="var(--color-frost-deep)"
        strokeWidth="1"
      />
      <path
        d="M98 74 H102 V96 L100 99 L98 96 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <circle cx="91" cy="85" r="5" fill={p.glow} stroke="none" />
      <circle cx="109" cy="85" r="5" fill={p.glow} stroke="none" />
      <path
        d="M88 85 L94 84 L92 87 Z M112 85 L106 84 L108 87 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      {/* épée plantée */}
      <path
        d="M97.5 140 H102.5 L102.5 182 L100 188 L97.5 182 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <path d="M100 142 V180" stroke="var(--color-frost-deep)" strokeWidth="1" />
      <path
        d="M84 138 Q100 134 116 138 L116 141 Q100 138 84 141 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      {/* mains osseuses sur le pommeau */}
      <path
        d="M90 128 Q92 120 100 120 Q108 120 110 128 L108 134 Q100 132 92 134 Z"
        fill="var(--color-surface)"
        stroke="var(--color-text-muted)"
        strokeWidth="1.4"
      />
      <g stroke="var(--color-text-muted)" strokeWidth="1">
        <path d="M94 124 V132M98 122 V132M102 122 V132M106 124 V132" />
      </g>
      <circle
        cx="100"
        cy="117"
        r="3.2"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.3"
      />
      {/* sol et neige */}
      <path d="M8 182 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="30" cy="40" r="1" />
        <circle cx="168" cy="56" r="1.2" />
        <circle cx="150" cy="24" r="0.9" />
        <circle cx="46" cy="96" r="0.9" />
        <circle cx="178" cy="110" r="1" />
        <circle cx="22" cy="128" r="1.1" />
      </g>
    </g>
  ),
  mara: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M150 28 A24 24 0 1 0 172 66 A18 18 0 1 1 150 28 Z"
        fill={p.hatchSoft}
        stroke="var(--color-border)"
        strokeWidth="1.4"
      />
      <path
        d="M100 38 Q70 42 66 78 Q62 108 52 128 Q44 146 28 158 Q48 158 56 150 Q54 166 42 178 Q62 170 72 156 Q74 172 68 186 Q84 172 88 160 Q96 176 100 188 Q104 176 112 160 Q116 172 132 186 Q126 172 128 156 Q138 170 158 178 Q146 166 144 150 Q152 158 172 158 Q156 146 148 128 Q138 108 134 78 Q130 42 100 38 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M82 72 Q78 104 82 134 M118 72 Q122 104 118 134 M92 100 Q90 130 94 156 M108 100 Q110 130 106 156"
        stroke="var(--color-text-muted)"
        strokeWidth="1"
      />
      <path
        d="M84 64 Q100 52 116 64 Q118 88 100 100 Q82 88 84 64 Z"
        fill={p.cross}
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <circle cx="93" cy="77" r="5" fill={p.glow} stroke="none" />
      <circle cx="107" cy="77" r="5" fill={p.glow} stroke="none" />
      <path
        d="M89 76 L96 77 L93 79 Z M111 76 L104 77 L107 79 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      <path
        d="M74 94 Q54 102 38 122 L44 126 Q58 112 78 104 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path
        d="M126 94 Q146 102 162 122 L156 126 Q142 112 122 104 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <g stroke="var(--color-text)" strokeWidth="1.2">
        <path d="M40 124 L28 132 M41 125 L32 138 M43 126 L39 141 M45 126 L47 140 M160 124 L172 132 M159 125 L168 138 M157 126 L161 141 M155 126 L153 140" />
      </g>
      <path
        d="M20 182 Q40 176 60 182 Q80 188 100 182 Q120 176 140 182 Q160 188 180 182"
        stroke="var(--color-frost-deep)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
      />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="30" cy="40" r="1" />
        <circle cx="56" cy="22" r="1.2" />
        <circle cx="186" cy="100" r="0.9" />
        <circle cx="16" cy="96" r="1" />
      </g>
    </g>
  ),
  'ice-troll': (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M0 132 L24 92 L40 108 L62 70 L76 88 M128 84 L146 56 L162 80 L176 66 L200 104"
        stroke="var(--color-border)"
        strokeWidth="1.4"
      />
      <path
        d="M56 120 Q36 140 32 176 L48 180 Q52 152 66 134 Z"
        fill={p.hatchDense}
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <path
        d="M30 176 Q28 186 40 186 Q52 186 50 178"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path
        d="M48 186 Q38 142 56 112 Q72 92 100 90 Q130 92 146 114 Q162 142 152 186 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M64 186 Q60 152 76 134 Q100 124 124 134 Q140 152 136 186 Z"
        fill={p.hatch}
        stroke="var(--color-frost-deep)"
        strokeWidth="1"
      />
      <path
        d="M58 112 L50 86 L62 104 L64 80 L72 102 Z M142 112 L150 86 L138 104 L136 80 L128 102 Z"
        fill={p.hatchDense}
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      <path
        d="M76 92 L56 78 L74 104 Z M124 92 L144 78 L126 104 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path
        d="M74 106 Q70 74 100 66 Q130 74 126 106 Q114 120 100 120 Q86 120 74 106 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path d="M80 80 L96 86 M120 80 L104 86" stroke="var(--color-text)" strokeWidth="1.8" />
      <circle cx="89" cy="89" r="5" fill={p.glow} stroke="none" />
      <circle cx="111" cy="89" r="5" fill={p.glow} stroke="none" />
      <path
        d="M85 88 L93 89 L89 91 Z M115 88 L107 89 L111 91 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      <path
        d="M96 86 Q90 100 96 106 Q104 110 107 102 Q109 92 104 86 Z"
        fill="var(--color-surface)"
        stroke="var(--color-text)"
        strokeWidth="1.3"
      />
      <path d="M84 110 Q100 116 116 110" stroke="var(--color-frost)" strokeWidth="1.3" />
      <path
        d="M88 111 L85 100 L92 110 Z M112 111 L115 100 L108 110 Z"
        fill="var(--color-text)"
        stroke="var(--color-text)"
        strokeWidth="1"
      />
      <path
        d="M88 118 L91 132 L94 119 M96 120 L100 140 L104 120 M106 119 L109 132 L112 118"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.2"
      />
      <path
        d="M144 120 Q162 136 166 158 L154 164 Q148 146 138 134 Z"
        fill={p.hatchDense}
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <path
        d="M154 186 L170 96 L182 78 L192 96 L176 186 Z"
        fill={p.hatch}
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <path
        d="M170 96 L182 106 L192 96 M182 106 L168 186"
        stroke="var(--color-text)"
        strokeWidth="1"
      />
      <path
        d="M152 156 Q162 148 176 154 L174 168 Q162 170 152 164 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="24" cy="36" r="1" />
        <circle cx="96" cy="30" r="1.2" />
        <circle cx="160" cy="26" r="0.9" />
      </g>
    </g>
  ),
  hrungnir: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      {/* montagnes */}
      <path
        d="M0 140 L28 96 L44 114 L70 72 L84 90"
        stroke="var(--color-border)"
        strokeWidth="1.4"
      />
      <path
        d="M120 88 L140 60 L156 82 L170 70 L200 116"
        stroke="var(--color-border)"
        strokeWidth="1.4"
      />
      <path
        d="M70 72 L64 86 M140 60 L134 74 M28 96 L24 106"
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      {/* bras gauche pendant */}
      <path
        d="M30 118 L18 146 L16 168 L24 180 L40 178 L44 162 L40 146 L48 132 Z"
        fill={p.hatchDense}
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <path
        d="M18 160 L30 164 L42 160 M24 180 L28 170"
        stroke="var(--color-frost)"
        strokeWidth="1"
      />
      {/* torse voûté */}
      <path
        d="M46 184 L48 140 L60 118 L84 104 L118 104 L142 118 L152 140 L154 184 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M48 140 L66 150 L60 184 M152 140 L136 152 L142 184 M66 150 L84 160 L100 152 L118 160 L136 152 M84 160 L82 184 M118 160 L120 184"
        stroke="var(--color-frost)"
        strokeWidth="1"
      />
      <path
        d="M48 140 L66 150 L60 184 L46 184 Z M152 140 L136 152 L142 184 L154 184 Z"
        fill={p.hatchDense}
        stroke="none"
      />
      <path
        d="M66 150 L84 160 L82 184 L60 184 Z M136 152 L118 160 L120 184 L142 184 Z"
        fill={p.hatch}
        stroke="none"
      />
      {/* épaules : rochers */}
      <path
        d="M24 124 L28 98 L46 82 L72 80 L84 92 L80 106 L60 120 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path d="M28 98 L50 100 L72 80 M50 100 L60 120" stroke="var(--color-frost)" strokeWidth="1" />
      <path d="M24 124 L28 98 L50 100 L60 120 Z" fill={p.hatch} stroke="none" />
      <path
        d="M176 122 L172 96 L156 82 L128 80 L118 92 L122 106 L142 120 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M172 96 L152 100 L128 80 M152 100 L142 120"
        stroke="var(--color-frost)"
        strokeWidth="1"
      />
      <path d="M176 122 L172 96 L152 100 L142 120 Z" fill={p.hatch} stroke="none" />
      {/* fissures */}
      <path
        d="M38 92 L44 96 L42 104 M162 90 L158 98 L163 104 M90 170 L94 176"
        stroke="var(--color-frost-deep)"
        strokeWidth="1"
      />
      {/* cœur de pierre */}
      <circle cx="100" cy="132" r="22" fill={p.glow} stroke="none" />
      <path
        d="M100 118 L112 125 L109 140 L91 140 L88 125 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
      />
      <path
        d="M100 118 L100 140 M88 125 L109 140"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <path
        d="M109 140 L115 150 L112 158 M91 140 L86 148 M112 125 L120 122"
        stroke="var(--color-accent)"
        strokeWidth="1"
        opacity="0.8"
      />
      {/* tête basse entre les épaules */}
      <path
        d="M82 104 L76 82 L82 62 L96 54 L110 56 L122 66 L124 84 L118 104 L106 110 L94 110 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M82 62 L92 70 L96 54 M110 56 L108 70 L122 66"
        stroke="var(--color-frost)"
        strokeWidth="1"
      />
      <path
        d="M82 62 L92 70 L96 54 Z M122 66 L108 70 L110 56 Z"
        fill={p.hatchDense}
        stroke="none"
      />
      {/* arcade lourde */}
      <path
        d="M78 76 L100 82 L122 76 L120 72 L100 76 L80 72 Z"
        fill="var(--color-surface)"
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <circle cx="90" cy="85" r="6" fill={p.glow} stroke="none" />
      <circle cx="110" cy="85" r="6" fill={p.glow} stroke="none" />
      <path
        d="M85 84 L95 85 L90 88 Z M115 84 L105 85 L110 88 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      {/* mâchoire */}
      <path
        d="M88 96 L94 94 L100 97 L106 94 L112 96 L110 104 L90 104 Z"
        fill={p.cross}
        stroke="var(--color-frost)"
        strokeWidth="1.2"
      />
      {/* bras droit et pierre à aiguiser */}
      <path
        d="M170 118 L182 140 L184 160 L174 168 L162 160 L160 142 L152 132 Z"
        fill={p.hatchDense}
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <path
        d="M176 186 L182 136 L186 104 L190 70 L196 62 L199 70 L197 104 L192 138 L186 186 Z"
        fill={p.hatch}
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <path d="M188 92 L194 94 M184 124 L190 126" stroke="var(--color-text)" strokeWidth="1" />
      <path
        d="M168 152 L178 146 L192 150 L192 164 L180 170 L168 166 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <path
        d="M174 150 V168 M180 148 V170 M186 149 V168"
        stroke="var(--color-frost)"
        strokeWidth="0.9"
      />
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="20" cy="40" r="1" />
        <circle cx="60" cy="26" r="1.2" />
        <circle cx="150" cy="30" r="0.9" />
        <circle cx="104" cy="22" r="1" />
      </g>
    </g>
  ),
  thrym: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M42 186 L42 72 L58 50 L74 66 L100 36 L126 66 L142 50 L158 72 L158 186"
        fill={p.hatchSoft}
        stroke="var(--color-border)"
        strokeWidth="1.6"
      />
      <path
        d="M34 186 Q36 142 62 128 L138 128 Q164 142 166 186 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M56 134 Q62 122 68 132 Q74 122 80 132 Q86 122 92 132 Q100 120 108 132 Q114 122 120 132 Q126 122 132 132 Q138 122 144 134 Q100 146 56 134 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      <path
        d="M80 108 Q78 82 100 78 Q122 82 120 108 Q112 118 100 118 Q88 118 80 108 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M78 84 L78 76 L82 60 L86 76 L93 48 L100 76 L107 48 L114 76 L118 60 L122 76 L122 84 Z"
        fill="var(--color-surface)"
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <path d="M78 76 H122" stroke="var(--color-text)" strokeWidth="1.2" />
      <path
        d="M100 78 L103 81 L100 84 L97 81 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      <path d="M84 90 L96 93 M116 90 L104 93" stroke="var(--color-text)" strokeWidth="1.6" />
      <circle cx="91" cy="96" r="5" fill={p.glow} stroke="none" />
      <circle cx="109" cy="96" r="5" fill={p.glow} stroke="none" />
      <path
        d="M87 95 L95 96 L91 98 Z M113 95 L105 96 L109 98 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      <path d="M100 94 V104" stroke="var(--color-frost)" strokeWidth="1.2" />
      <path
        d="M82 106 Q84 140 92 160 L96 178 L100 170 L104 178 L108 160 Q116 140 118 106 Q100 118 82 106 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <path
        d="M88 110 Q94 106 100 110 Q106 106 112 110"
        stroke="var(--color-text)"
        strokeWidth="1.4"
      />
      <g stroke="var(--color-frost)" strokeWidth="1">
        <path d="M93 124 L100 129 L107 124 M93 134 L100 139 L107 134 M94 144 L100 149 L106 144 M95 154 L100 159 L105 154" />
      </g>
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="20" cy="40" r="1" />
        <circle cx="180" cy="34" r="1.2" />
        <circle cx="24" cy="120" r="0.9" />
        <circle cx="182" cy="110" r="1" />
      </g>
    </g>
  ),
  garm: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M108 186 L108 82 Q108 40 150 40 Q192 40 192 82 L192 186"
        fill={p.hatchSoft}
        stroke="var(--color-border)"
        strokeWidth="1.6"
      />
      <path
        d="M122 186 L122 86 Q122 56 150 56 Q178 56 178 86 L178 186 Z"
        fill={p.cross}
        stroke="var(--color-frost-deep)"
        strokeWidth="1.2"
      />
      <g stroke="var(--color-border)" strokeWidth="1.2">
        <path d="M108 70 L122 76 M114 52 L126 62 M132 42 L138 58 M168 42 L162 58 M186 52 L174 62 M192 70 L178 76" />
      </g>
      <path
        d="M98 96 Q120 104 126 124"
        stroke="var(--color-text)"
        strokeWidth="2.2"
        strokeDasharray="4 2.5"
      />
      <path
        d="M34 74 L52 64 L62 56 L66 44 L70 26 L80 46 L88 58 Q102 72 106 96 Q112 118 128 136 Q142 154 136 176 L144 186 L96 186 L98 176 Q90 170 86 160 L84 186 L68 186 L72 176 L74 140 Q66 124 64 108 L58 96 L50 92 L38 86 L36 80 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M88 58 Q102 72 106 96 Q112 118 128 136 Q142 154 136 176 L120 176 Q104 150 98 120 Q92 92 80 70 Z"
        fill={p.hatch}
        stroke="none"
      />
      <path
        d="M120 148 Q100 150 98 176 M76 140 V180"
        stroke="var(--color-frost)"
        strokeWidth="1.2"
      />
      <path d="M66 44 L70 26 L80 46 Z" fill={p.hatchDense} stroke="none" />
      <path d="M36 80 L56 86" stroke="var(--color-frost)" strokeWidth="1.2" />
      <path
        d="M41 80 L42 85 L44 80 M47 82 L48 87 L50 82 M53 84 L54 88 L56 84"
        fill="var(--color-text)"
        stroke="var(--color-text)"
        strokeWidth="0.8"
      />
      <path d="M34 74 L38 72" stroke="var(--color-text)" strokeWidth="2.4" />
      <circle cx="62" cy="63" r="5" fill={p.glow} stroke="none" />
      <path
        d="M56 62 L66 61 L63 65 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      <path
        d="M68 104 L96 92 L100 100 L72 112 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.3"
      />
      <path
        d="M76 103 L74 96 L80 101 M84 99 L83 92 L88 98 M92 96 L92 89 L96 95"
        fill="var(--color-text)"
        stroke="var(--color-text)"
        strokeWidth="0.9"
      />
      <g stroke="var(--color-text-muted)" strokeWidth="1">
        <path d="M66 118 L72 120 M66 126 L73 127 M68 134 L74 134" />
      </g>
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
    </g>
  ),
  skoll: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="162" cy="46" r="34" fill={p.glow} stroke="none" />
      <circle
        cx="162"
        cy="46"
        r="20"
        fill="var(--color-surface)"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
      />
      <g stroke="var(--color-accent)" strokeWidth="1.4">
        <path d="M162 18 V12 M162 74 V80 M134 46 H128 M190 46 H196 M142 26 L138 22 M182 66 L186 70 M182 26 L186 22 M142 66 L138 70" />
      </g>
      <circle
        cx="162"
        cy="46"
        r="13"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />
      <g stroke="var(--color-border)" strokeWidth="1.4">
        <path d="M6 110 H30 M2 122 H22 M10 134 H28" />
      </g>
      <path
        d="M154 96 L140 86 L132 74 L130 60 L122 76 Q100 74 80 82 Q60 86 46 96 L22 88 L28 100 L44 106 L38 118 L18 130 L14 138 L22 140 L46 128 L62 114 Q80 116 96 112 L114 122 L140 132 L144 126 L122 110 L128 102 L138 100 L152 100 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M46 96 Q60 86 80 82 Q100 76 118 78 L112 92 Q90 92 72 100 Q58 108 44 106 Z"
        fill={p.hatch}
        stroke="none"
      />
      <path d="M132 74 L130 60 L126 76 Z" fill={p.hatchDense} stroke="none" />
      <path
        d="M122 80 L116 70 L112 82 L106 72 L102 84 L96 76 L94 86"
        stroke="var(--color-frost)"
        strokeWidth="1.1"
      />
      <path
        d="M60 112 L52 132 L40 146 L46 148 L60 134 L72 116 M100 112 L112 138 L126 152 L130 146 L116 132 L106 112"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <circle cx="136" cy="84" r="5" fill={p.glow} stroke="none" />
      <path
        d="M131 83 L141 84 L137 87 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      <path
        d="M152 100 L140 101 M143 97 L144 100 M147 97 L148 100"
        stroke="var(--color-text)"
        strokeWidth="1.1"
      />
      <path d="M154 96 L156 94" stroke="var(--color-text)" strokeWidth="2.4" />
      <path
        d="M8 172 Q60 164 100 170 Q150 176 192 166"
        stroke="var(--color-frost-deep)"
        strokeWidth="1.4"
      />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="24" cy="30" r="1" />
        <circle cx="70" cy="40" r="1.2" />
        <circle cx="100" cy="20" r="0.9" />
        <circle cx="60" cy="154" r="1" />
      </g>
    </g>
  ),
  hati: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M42 18 A26 26 0 1 0 68 60 A20 20 0 1 1 42 18 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.5"
      />
      <circle
        cx="44"
        cy="42"
        r="34"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      <g stroke="var(--color-frost-deep)" strokeWidth="1.2">
        <path d="M56 50 Q62 44 68 48 M50 42 Q60 32 70 38" />
      </g>
      <path
        d="M136 176 Q166 188 184 168 Q174 180 152 170 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path
        d="M58 54 L82 64 L92 60 L98 40 L108 66 Q124 84 130 108 Q146 136 142 170 L148 186 L80 186 L82 176 L82 140 Q80 120 72 106 L70 92 L62 80 L54 64 L66 64 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M108 66 Q124 84 130 108 Q146 136 142 170 L122 170 Q116 140 108 116 Q100 92 94 78 Z"
        fill={p.hatch}
        stroke="none"
      />
      <path d="M92 60 L98 40 L102 62 Z" fill={p.hatchDense} stroke="none" />
      <path d="M58 54 L56 53" stroke="var(--color-text)" strokeWidth="2.6" />
      <path
        d="M66 64 L62 66 M60 60 L62 63 M68 59 L70 62"
        stroke="var(--color-text)"
        strokeWidth="1"
      />
      <path d="M79 66 L88 63" stroke="var(--color-accent)" strokeWidth="2" />
      <path
        d="M76 98 L70 106 L78 110 L72 118 L80 122 L74 130"
        stroke="var(--color-frost)"
        strokeWidth="1.1"
      />
      <path
        d="M128 148 Q108 150 104 184 M94 140 V184"
        stroke="var(--color-frost)"
        strokeWidth="1.2"
      />
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="120" cy="24" r="1" />
        <circle cx="150" cy="46" r="1.2" />
        <circle cx="182" cy="20" r="0.9" />
        <circle cx="170" cy="90" r="1" />
        <circle cx="20" cy="110" r="1" />
      </g>
    </g>
  ),
  ymir: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M10 186 L16 112 L32 72 L56 48 L82 32 L118 30 L148 42 L172 68 L188 110 L192 186 Z"
        fill={p.hatchSoft}
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M32 72 L50 80 L56 48 M82 32 L86 50 L118 30 M148 42 L146 60 L172 68 M16 112 L36 118 L32 72 M188 110 L166 116 L172 68"
        stroke="var(--color-frost)"
        strokeWidth="1"
      />
      <path d="M16 112 L36 118 L32 72 Z M188 110 L166 116 L172 68 Z" fill={p.hatch} stroke="none" />
      <path
        d="M50 96 Q100 66 150 96 L146 104 Q100 80 54 104 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.5"
      />
      <ellipse
        cx="78"
        cy="108"
        rx="14"
        ry="9"
        fill={p.cross}
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <ellipse
        cx="122"
        cy="108"
        rx="14"
        ry="9"
        fill={p.cross}
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <circle cx="78" cy="108" r="7" fill={p.glow} stroke="none" />
      <circle cx="122" cy="108" r="7" fill={p.glow} stroke="none" />
      <circle cx="78" cy="108" r="2.6" fill="var(--color-accent)" stroke="none" />
      <circle cx="122" cy="108" r="2.6" fill="var(--color-accent)" stroke="none" />
      <path
        d="M100 98 L90 136 L110 136 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path d="M100 98 L100 136" stroke="var(--color-frost-deep)" strokeWidth="1" />
      <path
        d="M70 150 Q100 162 130 150 L126 156 Q100 166 74 156 Z"
        fill="var(--color-bg)"
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <path
        d="M52 160 L58 184 L64 162 L70 186 L76 164 L84 186 L90 166 L96 186 L104 186 L110 166 L116 186 L124 164 L130 186 L136 162 L142 184 L148 160"
        fill="var(--color-surface-raised)"
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      <path
        d="M40 140 L54 146 L48 156 M160 140 L146 146 L152 156 M118 40 L112 54 L120 62"
        stroke="var(--color-frost-deep)"
        strokeWidth="1.1"
      />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="16" cy="40" r="1" />
        <circle cx="186" cy="30" r="1.2" />
        <circle cx="40" cy="20" r="0.9" />
      </g>
    </g>
  ),
  nidhogg: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <g strokeWidth="7" stroke="var(--color-frost-deep)">
        <path d="M58 0 Q64 30 50 58 Q40 80 46 104 M100 0 Q96 30 104 62 M144 0 Q150 30 162 50 Q172 72 162 98 M50 58 Q30 64 18 86 M162 50 Q182 52 194 70" />
      </g>
      <g strokeWidth="4.4" stroke="var(--color-surface)">
        <path d="M58 0 Q64 30 50 58 Q40 80 46 104 M100 0 Q96 30 104 62 M144 0 Q150 30 162 50 Q172 72 162 98 M50 58 Q30 64 18 86 M162 50 Q182 52 194 70" />
      </g>
      <g stroke="var(--color-frost-deep)" strokeWidth="1">
        <path d="M46 104 L42 114 M46 104 L52 112 M162 98 L158 108 M162 98 L168 106 M18 86 L12 94 M194 70 L198 80" />
      </g>
      <path
        d="M120 140 L130 92 L140 110 L150 90 L154 116 L166 100 L162 140 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path
        d="M130 92 L134 140 M150 90 L146 140 M166 100 L154 140"
        stroke="var(--color-frost)"
        strokeWidth="0.9"
      />
      <path
        d="M176 186 Q194 150 150 140 Q100 130 80 150 Q60 172 40 152 Q24 132 50 118 Q76 108 92 96"
        stroke="var(--color-frost)"
        strokeWidth="15"
      />
      <path
        d="M176 186 Q194 150 150 140 Q100 130 80 150 Q60 172 40 152 Q24 132 50 118 Q76 108 92 96"
        stroke="var(--color-surface-raised)"
        strokeWidth="12"
      />
      <path
        d="M176 186 Q194 150 150 140 Q100 130 80 150 Q60 172 40 152 Q24 132 50 118 Q76 108 92 96"
        stroke="var(--color-frost-deep)"
        strokeWidth="12"
        strokeDasharray="1.6 5"
        strokeLinecap="butt"
      />
      <g transform="translate(92 98) scale(1.7) translate(-92 -98)">
        <path
          d="M84 104 L88 86 L102 72 L114 70 L108 78 L100 82 L114 84 L108 92 L98 96 Z"
          fill="var(--color-surface)"
          stroke="var(--color-frost)"
          strokeWidth="1.5"
        />
        <path
          d="M103 74 L104 78 M108 72 L108 76 M104 86 L104 83 M109 86 L109 83"
          stroke="var(--color-text)"
          strokeWidth="1"
        />
        <path d="M90 88 L78 72 M94 84 L88 66" stroke="var(--color-text)" strokeWidth="1.6" />
        <circle cx="94" cy="88" r="5" fill={p.glow} stroke="none" />
        <path
          d="M90 88 L98 86 L95 90 Z"
          fill="var(--color-accent)"
          stroke="var(--color-accent)"
          strokeWidth="0.8"
        />
      </g>
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
    </g>
  ),
  hel: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path
        d="M72 58 Q48 100 52 186 L80 186 Q74 120 80 80 Z M128 58 Q152 100 148 186 L120 186 Q126 120 120 80 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      <path
        d="M40 186 Q48 142 80 132 L120 132 Q152 142 160 186 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path d="M80 132 L100 160 L120 132" stroke="var(--color-frost)" strokeWidth="1.2" />
      <path
        d="M100 160 V186 M60 160 L66 186 M140 160 L134 186"
        stroke="var(--color-frost-deep)"
        strokeWidth="1"
      />
      <path
        d="M78 70 Q78 42 100 40 Q122 42 122 70 L120 104 Q112 122 100 124 Q88 122 80 104 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path d="M100 40 Q122 42 122 70 L120 104 Q112 122 100 124 Z" fill={p.cross} stroke="none" />
      <path
        d="M100 40 V124"
        stroke="var(--color-frost-deep)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <path
        d="M84 82 Q90 77 96 82 Q90 86 84 82 Z"
        fill="var(--color-surface)"
        stroke="var(--color-text)"
        strokeWidth="1.1"
      />
      <circle cx="90" cy="82" r="1.8" fill="var(--color-accent)" stroke="none" />
      <path d="M84 75 L95 76" stroke="var(--color-frost)" strokeWidth="1.2" />
      <circle
        cx="110"
        cy="82"
        r="7"
        fill="var(--color-bg)"
        stroke="var(--color-text)"
        strokeWidth="1.3"
      />
      <circle cx="110" cy="82" r="6" fill={p.glow} stroke="none" />
      <circle cx="110" cy="82" r="1.8" fill="var(--color-accent)" stroke="none" />
      <path
        d="M100 92 L96 100 L100 101 M104 94 L108 100 L102 100 Z"
        stroke="var(--color-frost)"
        strokeWidth="1.1"
        fill="var(--color-bg)"
      />
      <path d="M91 110 Q96 112 100 110" stroke="var(--color-frost)" strokeWidth="1.2" />
      <path
        d="M100 108 L118 106 M100 113 L116 111 M104 108 V113 M108 107 V112 M112 107 V112"
        stroke="var(--color-text)"
        strokeWidth="1"
      />
      <path
        d="M80 56 L83 46 L87 53 L92 40 L96 51 L100 36 L104 51 L109 42 L113 53 L117 47 L120 56 Q100 50 80 56 Z"
        fill="var(--color-surface)"
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      <path
        d="M66 60 Q100 30 134 60"
        stroke="var(--color-frost-deep)"
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <g fill="var(--color-frost)" stroke="none" opacity="0.7">
        <circle cx="30" cy="36" r="1" />
        <circle cx="170" cy="40" r="1.2" />
        <circle cx="24" cy="110" r="0.9" />
        <circle cx="178" cy="120" r="1" />
      </g>
    </g>
  ),
  jormungandr: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <circle
        cx="100"
        cy="98"
        r="48"
        fill="var(--color-surface)"
        stroke="var(--color-frost-deep)"
        strokeWidth="1.2"
      />
      <g stroke="var(--color-frost-deep)" strokeWidth="1.1">
        <path d="M58 84 Q66 80 74 84 Q82 88 90 84 Q98 80 106 84 Q114 88 122 84 Q130 80 142 84 M54 100 Q62 96 70 100 Q78 104 86 100 Q94 96 102 100 Q110 104 118 100 Q126 96 134 100 Q140 103 146 100 M58 116 Q66 112 74 116 Q82 120 90 116 Q98 112 106 116 Q114 120 122 116 Q130 112 142 116 M70 132 Q78 128 86 132 Q94 136 102 132 Q110 128 118 132 Q124 135 130 132" />
      </g>
      <path
        d="M84 62 L92 58 L104 60 L110 68 L102 72 L90 70 Z"
        fill={p.hatchSoft}
        stroke="var(--color-border)"
        strokeWidth="1"
      />
      <circle cx="100" cy="98" r="66" stroke="var(--color-frost)" strokeWidth="16" />
      <circle cx="100" cy="98" r="66" stroke="var(--color-surface-raised)" strokeWidth="13" />
      <circle
        cx="100"
        cy="98"
        r="66"
        stroke="var(--color-frost-deep)"
        strokeWidth="13"
        strokeDasharray="1.6 5"
        strokeLinecap="butt"
      />
      <path d="M66 36 Q74 32 82 32" stroke="var(--color-frost)" strokeWidth="5" />
      <g transform="translate(128 32) scale(1.45) translate(-128 -32)">
        <path
          d="M124 20 L106 22 L86 26 L98 31 L86 38 L106 40 L126 44 Q136 36 132 26 Z"
          fill="var(--color-surface)"
          stroke="var(--color-frost)"
          strokeWidth="1.5"
        />
        <path
          d="M96 26 L97 29 M101 25 L102 28 M96 38 L97 35 M101 39 L102 36"
          stroke="var(--color-text)"
          strokeWidth="1"
        />
        <path d="M112 24 L126 14 M118 26 L132 20" stroke="var(--color-text)" strokeWidth="1.5" />
        <circle cx="114" cy="30" r="5" fill={p.glow} stroke="none" />
        <path
          d="M110 30 L118 29 L115 32 Z"
          fill="var(--color-accent)"
          stroke="var(--color-accent)"
          strokeWidth="0.8"
        />
      </g>
      <path
        d="M8 186 Q24 180 40 186 Q56 192 72 186 M128 186 Q144 180 160 186 Q176 192 192 186"
        stroke="var(--color-frost-deep)"
        strokeWidth="1.3"
      />
    </g>
  ),
  fenrir: (p) => (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      {/* soleil noir / lune dévorée */}
      <circle cx="100" cy="92" r="76" stroke="var(--color-border)" strokeWidth="1.4" />
      <circle
        cx="100"
        cy="92"
        r="70"
        stroke="var(--color-border)"
        strokeWidth="0.8"
        strokeDasharray="2 4"
      />
      {/* collerette de fourrure */}
      <path
        d="M100 176 L76 160 L56 150 L60 142 L40 132 L50 124 L36 108 L52 104 L46 88 L60 86 L58 72 L84 66 L100 64 L116 66 L142 72 L140 86 L154 88 L148 104 L164 108 L150 124 L160 132 L140 142 L144 150 L124 160 Z"
        fill={p.hatch}
        stroke="var(--color-frost)"
        strokeWidth="1.4"
      />
      {/* oreilles */}
      <path
        d="M84 66 L62 26 L58 84 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M116 66 L138 26 L142 84 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      <path
        d="M78 64 L65 38 L64 78 Z M122 64 L135 38 L136 78 Z"
        fill={p.hatchDense}
        stroke="none"
      />
      {/* tête */}
      <path
        d="M84 66 Q100 58 116 66 L140 86 L146 106 L132 124 L120 150 L100 164 L80 150 L68 124 L54 106 L60 86 Z"
        fill="var(--color-surface)"
        stroke="var(--color-frost)"
        strokeWidth="1.6"
      />
      {/* ombres latérales */}
      <path
        d="M60 86 L54 106 L68 124 L80 108 L74 92 Z M140 86 L146 106 L132 124 L120 108 L126 92 Z"
        fill={p.cross}
        stroke="none"
      />
      {/* museau */}
      <path
        d="M90 100 L100 96 L110 100 L114 134 L100 146 L86 134 Z"
        fill="var(--color-surface-raised)"
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <path d="M100 96 V128" stroke="var(--color-frost-deep)" strokeWidth="1" />
      <path
        d="M93 128 L107 128 L100 136 Z"
        fill="var(--color-bg)"
        stroke="var(--color-text)"
        strokeWidth="1.2"
      />
      {/* gueule et crocs */}
      <path
        d="M86 140 Q100 158 114 140"
        fill="var(--color-bg)"
        stroke="var(--color-frost)"
        strokeWidth="1.3"
      />
      <path
        d="M90 143 L92.5 152 L95 146 M110 143 L107.5 152 L105 146"
        fill="var(--color-text)"
        stroke="var(--color-text)"
        strokeWidth="1"
      />
      {/* arcades et yeux */}
      <path d="M66 90 L92 98 M134 90 L108 98" stroke="var(--color-text)" strokeWidth="1.8" />
      <circle cx="82" cy="99" r="7" fill={p.glow} stroke="none" />
      <circle cx="118" cy="99" r="7" fill={p.glow} stroke="none" />
      <path
        d="M74 97 L90 101 L78 103 Z M126 97 L110 101 L122 103 Z"
        fill="var(--color-accent)"
        stroke="var(--color-accent)"
        strokeWidth="0.8"
      />
      {/* poils */}
      <g stroke="var(--color-text-muted)" strokeWidth="1">
        <path d="M64 112 L72 116 M62 118 L71 121 M136 112 L128 116 M138 118 L129 121 M94 72 L96 80 M100 70 V79 M106 72 L104 80" />
      </g>
      {/* chaîne brisée (Gleipnir) */}
      <g stroke="var(--color-text)" strokeWidth="1.4" fill="var(--color-surface-raised)">
        <rect x="38" y="164" width="14" height="8" rx="4" />
        <rect x="50" y="167" width="14" height="8" rx="4" transform="rotate(10 57 171)" />
        <rect x="63" y="171" width="14" height="8" rx="4" transform="rotate(14 70 175)" />
        <path d="M78 178 Q80 174 84 176" />
        <path d="M116 176 Q120 174 122 178" />
        <rect x="123" y="171" width="14" height="8" rx="4" transform="rotate(-14 130 175)" />
        <rect x="136" y="167" width="14" height="8" rx="4" transform="rotate(-10 143 171)" />
        <rect x="148" y="164" width="14" height="8" rx="4" />
      </g>
      <g stroke="var(--color-accent)" strokeWidth="1">
        <path d="M86 172 L90 168 M84 180 L89 182 M114 172 L110 168 M116 180 L111 182" />
      </g>
      <path d="M8 186 H192" stroke="var(--color-frost-deep)" strokeWidth="1.4" />
    </g>
  ),
};
