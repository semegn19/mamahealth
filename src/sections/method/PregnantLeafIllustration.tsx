import type { CSSProperties } from "react";

function drawStroke(
  draw: boolean,
  delay: number,
  dur = 1.3
): CSSProperties {
  return {
    strokeDasharray: 1,
    strokeDashoffset: draw ? 0 : 1,
    transition: `stroke-dashoffset ${dur}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
  };
}

function fillBloom(
  draw: boolean,
  delay: number,
  dur = 0.8,
  toOpacity = 0.95
): CSSProperties {
  return {
    opacity: draw ? toOpacity : 0,
    transition: `opacity ${dur}s ease ${delay}s`,
  };
}

const STEMS = [
  { d: "M152 147 C169 176 181 205 184 223", w: 2.0, delay: 0.1, dur: 1.3 },
  { d: "M210 154 C214 177 210 204 207 225", w: 2.2, delay: 0.2, dur: 1.3 },
  {
    d: "M271 258 C231 282 191 308 183 340 C171 384 206 426 201 473 C198 494 184 511 172 528",
    w: 2.6,
    delay: 0.3,
    dur: 1.6,
  },
  { d: "M165 240 C178 259 191 282 202 308", w: 2.0, delay: 0.4, dur: 1.2 },
  {
    d: "M273 297 C285 350 280 383 271 423 C262 464 277 521 254 603",
    w: 2.4,
    delay: 0.5,
    dur: 1.7,
  },
  { d: "M273 433 C292 409 316 399 340 377", w: 1.6, delay: 0.65, dur: 1.1 },
  { d: "M271 447 C283 438 309 435 329 417", w: 1.8, delay: 0.75, dur: 1.1 },
];

const CROWN = [
  "M135 7 C129 27 140 55 164 88 C143 71 126 38 130 12Z",
  "M125 68 C144 87 147 111 142 135 C126 121 117 94 125 68Z",
  "M81 120 C116 122 148 137 164 158 C137 143 108 132 82 126Z",
  "M86 147 C114 161 126 191 111 223 C111 192 96 173 86 147Z",
  "M149 145 C139 127 145 108 158 109 C175 110 185 135 190 162 C179 154 166 139 161 116 C149 113 145 125 153 146Z",
  "M164 118 C177 126 184 145 185 161 C174 152 168 138 164 118Z",
  "M184 91 C204 110 243 110 263 128 C294 153 280 192 258 222 C268 187 274 162 257 143 C238 122 203 121 184 91Z",
  "M214 137 C241 140 255 154 258 177 C237 166 224 154 214 137Z",
  "M208 117 C211 122 214 127 214 134 C209 132 207 126 208 117Z",
  "M210 154 C224 169 224 200 207 229 C201 204 196 182 210 154Z",
  "M119 158 C141 162 158 176 170 193 C145 191 129 179 119 158Z",
  "M124 231 C142 207 166 208 183 225 C163 232 146 226 124 231Z",
  "M112 242 C131 247 148 266 145 306 C138 280 124 266 112 242Z",
  "M165 240 C194 248 210 274 202 308 C181 297 166 272 165 240Z",
  "M149 256 C152 272 149 291 143 302 C147 281 147 267 149 256Z",
  "M150 306 C149 323 143 335 134 343 C138 328 144 319 150 306Z",
  "M241 204 C250 226 249 246 234 272 C229 248 235 226 241 204Z",
  "M255 223 C264 232 265 245 260 257 L247 267 C251 251 257 238 255 223Z",
  "M259 260 C284 252 306 276 320 294 C292 289 276 278 259 271Z",
];

const BODY_LEAVES = [
  "M161 308 C169 338 157 359 137 381 C111 410 84 435 94 488 L98 532 C86 506 82 470 87 445 C91 422 102 402 119 383 C142 357 154 335 161 308Z",
  "M149 394 C153 424 132 444 111 470 C111 436 127 421 149 394Z",
  "M169 433 C180 469 150 501 116 530 C104 500 134 478 153 458 C161 449 167 442 169 433Z",
  "M137 522 C151 527 156 545 155 561 C142 552 136 539 137 522Z",
  "M162 568 C170 548 191 529 214 532 C192 547 183 562 162 568Z",
  "M108 528 C116 536 119 546 121 554 C113 550 110 542 108 528Z",
  "M103 554 C101 565 104 575 109 578 C107 569 108 561 103 554Z",
  "M184 376 C185 349 209 337 238 328 C226 351 207 365 184 376Z",
  "M233 369 C259 382 269 414 261 449 C247 447 241 439 239 431 C235 442 229 453 224 458 C220 425 225 391 233 369Z",
  "M194 493 C215 482 235 473 256 476 C253 502 222 510 193 504Z",
  "M220 511 C250 518 258 541 262 568 C240 557 225 537 220 511Z",
  "M274 292 C301 313 308 354 288 398 C282 408 276 414 272 420 C258 391 249 366 259 333 C263 316 268 302 274 292Z",
  "M307 310 C324 309 334 323 329 338 L306 355 C309 338 308 323 307 310Z",
  "M330 330 C345 333 350 346 349 358 C335 362 324 364 313 364 C318 350 329 346 330 330Z",
  "M315 367 C333 363 348 363 350 370 C349 383 339 391 328 393 C322 384 316 378 315 367Z",
  "M313 376 C320 382 327 391 327 399 C321 405 312 408 301 407 C302 394 309 386 313 376Z",
  "M275 449 C292 431 322 428 340 400 C340 435 312 456 276 460Z",
  "M280 469 C287 466 291 473 286 479 C283 484 278 483 276 478 C275 474 276 471 280 469Z",
  /* The pregnant belly */
  "M356 350 C375 374 378 405 368 435 C357 468 325 492 299 505 C288 512 283 522 282 537 C276 519 281 506 294 496 C320 476 341 455 354 429 C366 404 366 379 356 350Z",
];

const FOLDS = [
  "M274 292 C290 324 286 366 272 420 C282 407 293 388 298 365 C303 337 291 307 274 292Z",
  "M165 240 C183 263 191 284 202 308 C211 278 193 248 165 240Z",
  "M119 158 C137 174 152 182 170 193 C142 186 128 177 119 158Z",
  "M169 433 C160 468 132 489 116 530 C150 501 180 469 169 433Z",
  "M184 376 C201 358 217 348 238 328 C224 355 206 366 184 376Z",
  "M194 493 C215 500 239 494 256 476 C252 504 218 510 193 504Z",
  "M356 350 C375 387 364 425 344 454 C327 477 307 492 294 504 C330 488 357 464 368 435 C378 405 375 374 356 350Z",
  "M210 154 C213 186 211 205 207 229 C224 201 224 169 210 154Z",
];

/**
 * Pregnant woman in leaves vector artwork — rendered for the "Nutrition & prenatal supplement tracking" step.
 * Uses luminous, warm champagne-and-gold gradients harmonized with the rest of the Mama Health illustrations,
 * featuring a delicate hand-drawn stroke animation:
 * 1. Stems trace on first as graceful growing vines.
 * 2. Leaf and silhouette outlines trace on with fluid pen-stroke drawing.
 * 3. Warm champagne-gold fills bloom inside the drawn outlines.
 * 4. Subtle, soft tonal folds fade in for light dimensional depth.
 */
export function PregnantLeafArt({ uid, draw }: { uid: string; draw: boolean }) {
  const lineGrad = `pl-line-${uid}`;
  const foldGrad = `pl-fold-${uid}`;

  return (
    <svg
      x="95"
      y="0"
      width="210"
      height="400"
      viewBox="70 0 320 610"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Unified signature gradient: warm cream → champagne → bronze (matching HeroArt and CareIllustration) */}
        <linearGradient id={lineGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6dfae" />
          <stop offset="50%" stopColor="#d9ab5e" />
          <stop offset="100%" stopColor="#a9782f" />
        </linearGradient>

        {/* Soft, gentle tonal shadow folds */}
        <linearGradient id={foldGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a9782f" />
          <stop offset="60%" stopColor="#d9ab5e" />
          <stop offset="100%" stopColor="#f6dfae" />
        </linearGradient>
      </defs>

      {/* ------------------------------------------------------------- */}
      {/* 1. Slender curved stems draw on first like climbing vines     */}
      {/* ------------------------------------------------------------- */}
      <g
        fill="none"
        stroke={`url(#${lineGrad})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {STEMS.map((s, i) => (
          <path
            key={`stem-${i}`}
            d={s.d}
            strokeWidth={s.w}
            pathLength={1}
            style={drawStroke(draw, s.delay, s.dur)}
          />
        ))}
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 2. Botanical crown leaf OUTLINES draw on                      */}
      {/* ------------------------------------------------------------- */}
      <g
        fill="none"
        stroke={`url(#${lineGrad})`}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {CROWN.map((d, i) => {
          const delay = 0.35 + (i % 8) * 0.08;
          return (
            <path
              key={`crown-line-${i}`}
              d={d}
              pathLength={1}
              style={drawStroke(draw, delay, 1.15)}
            />
          );
        })}
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 3. Crown leaf FILLS bloom in as outlines complete             */}
      {/* ------------------------------------------------------------- */}
      <g fill={`url(#${lineGrad})`} stroke="none">
        {CROWN.map((d, i) => {
          const delay = 0.35 + (i % 8) * 0.08;
          return (
            <path
              key={`crown-fill-${i}`}
              d={d}
              style={fillBloom(draw, delay + 0.65, 0.75, 0.9)}
            />
          );
        })}
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 4. Body leaves & pregnant belly OUTLINES draw on              */}
      {/* ------------------------------------------------------------- */}
      <g
        fill="none"
        stroke={`url(#${lineGrad})`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {BODY_LEAVES.map((d, i) => {
          const isBelly = i === BODY_LEAVES.length - 1;
          const delay = isBelly ? 0.75 : 0.5 + (i % 9) * 0.09;
          const dur = isBelly ? 1.7 : 1.25;
          return (
            <path
              key={`body-line-${i}`}
              d={d}
              pathLength={1}
              strokeWidth={isBelly ? 2.2 : 1.5}
              style={drawStroke(draw, delay, dur)}
            />
          );
        })}
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 5. Body leaves & belly warm gold FILLS bloom in               */}
      {/* ------------------------------------------------------------- */}
      <g fill={`url(#${lineGrad})`} stroke="none">
        {BODY_LEAVES.map((d, i) => {
          const isBelly = i === BODY_LEAVES.length - 1;
          const delay = isBelly ? 0.75 : 0.5 + (i % 9) * 0.09;
          return (
            <path
              key={`body-fill-${i}`}
              d={d}
              style={fillBloom(draw, delay + 0.75, 0.85, 0.9)}
            />
          );
        })}
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 6. Soft tonal shadow folds fade in last for gentle depth      */}
      {/* ------------------------------------------------------------- */}
      <g fill={`url(#${foldGrad})`} stroke="none">
        {FOLDS.map((d, i) => (
          <path
            key={`fold-${i}`}
            d={d}
            style={fillBloom(draw, 1.5 + (i % 4) * 0.12, 1.0, 0.6)}
          />
        ))}
      </g>
    </svg>
  );
}
