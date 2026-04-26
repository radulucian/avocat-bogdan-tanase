# Open Graph image generation prompt

Use the following prompt with any image model (Midjourney, Imagen, FLUX, Ideogram, GPT image, etc.) to produce the social share card referenced by the site's `og:image` and `twitter:image` tags. Save the result as `og-image.png` (1200 x 630) in the project root and update the meta tags if you switch from the portrait file.

## Master prompt (copy-paste)

```
Editorial social card, 1200 x 630 pixels, exact aspect ratio 40:21, print-quality.
Subject: a refined portrait composition of a Romanian male attorney in his early 40s, wearing a charcoal suit with a discreet white shirt, calm and confident expression, soft natural side light, shallow depth of field. The portrait occupies the left third of the canvas, cropped from chest up, looking slightly toward the camera. Use the supplied photo as the visual reference for the face if provided.
Right two thirds: clean typographic lockup on a warm cream background. Set the name "Avocat Bogdan Constantin Tanase" as a refined serif title (Cormorant Garamond or Playfair Display, 600 weight, tight tracking), aligned left. Beneath, smaller sans-serif label "Avocat in Bacau . Baroul Bacau" in muted graphite. Below that, a thin horizontal deep-charcoal rule, followed by the URL "avocatbogdantanase.ro" in small uppercase letter-spaced sans-serif.
Color palette: background warm ivory #FAF6EF, primary text deep charcoal #14141A, muted text graphite #5C5C66, accent deep charcoal #1B1B22 (matches the dark monogram brand mark), subtle borders #E5E0D5.
Mood: minimal, sober, trustworthy, premium, editorial. Plenty of whitespace. No icons, no badges, no social media glyphs, no rosettes, no fake medals. No long dashes, no arrows, no decorative bullets, no smiley faces. No watermarks. No additional text beyond the items listed above. Avoid logo placement on the portrait. Avoid heavy gradients and AI texture artifacts.
Lighting on the portrait: soft north window light, warm temperature around 4500K, gentle vignette toward the corners. Skin retouching natural, no plastic feel, no oversharpening.
Composition: 8 percent safe margin on all sides, headline visually anchored at vertical center, name no larger than 64 pt visual size, do not crowd the edges.
Output: high resolution PNG, sRGB, no compression artifacts, exact 1200 x 630.
```

## Optional variants to try

- Replace "warm ivory" with "soft sand" (`#F1E9D8`) for a slightly deeper, more terracotta feel.
- Swap the cream background and dark charcoal accent for a fully inverted version (deep charcoal `#1B1B22` background with cream `#F0E9D8` typography) to mirror the brand monogram exactly.
- Add "subtle architectural lines suggesting a stone facade" only if the model supports staying within the cream palette without hijacking the composition.

## After generation

1. Save the file as `og-image.png` in the project root.
2. Update `index.html` meta tags:

```
<meta property="og:image" content="https://www.avocatbogdantanase.ro/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="https://www.avocatbogdantanase.ro/og-image.png">
```

3. Re-validate with the LinkedIn Post Inspector, the Twitter / X Card Validator, and the Facebook Sharing Debugger.
