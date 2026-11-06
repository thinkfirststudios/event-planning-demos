# Image credits — 05 The Late Room

All photographs are from Pexels under the Pexels licence. Photographer names were read from each
photo's Pexels page. Every crop was graded by `_build/lr_grade.py` so the set reads as one room on
one night: warm highlights, red-biased blacks, green and teal rotated out.

Subject class is the brief's: whole room / threshold / bar / detail / crew at work.

| Slot | Source | Photographer | Subject | Class | Ratio | Light source in frame | Used on |
|---|---|---|---|---|---|---|---|
| room | https://www.pexels.com/photo/empty-table-and-chairs-in-a-restaurant-in-dim-light-19343312/ | Christine Blanchet | Empty table and armchairs under a red pendant | whole room | 3:2 | Lit red pendant lamp | index (hero) |
| door | https://www.pexels.com/photo/open-door-in-a-dark-room-18968224/ | Benedek Kaufmann | Open door, lit staircase beyond | threshold | 4:5 | Lit stairwell through the doorway | index |
| lasthour | https://www.pexels.com/photo/wineglasses-and-candle-on-table-during-dinner-in-evening-18076302/ | Annaëlle Quionquion | Used glasses and plate, candle burned low | bar | 16:9 | Candle | index |
| basement | https://www.pexels.com/photo/dark-cafe-interior-with-lamps-and-ornaments-on-the-wall-9078030/ | Novirina | Round table in a low room | whole room | 3:2 | Table lamp | index, rooms |
| candles | https://www.pexels.com/photo/warm-candlelit-dinner-with-red-candles-35252666/ | Yelena | Red candles, round table, red curtain | detail | 4:5 | Candles | index |
| topfloor | https://www.pexels.com/photo/view-from-flat-window-of-night-cityscape-3223855/ | Alexander Igrevsky | Dark room, one window over a city at dusk | whole room | 16:9 | Window with lit city | index, rooms |
| crew | https://www.pexels.com/photo/crop-woman-lighting-candle-while-serving-table-4992761/ | Rachel Claire | Hand lighting a candle, no face | crew at work | 3:2 | Lit candle and match | index, services, about |
| service | https://www.pexels.com/photo/hallway-with-red-walls-11850799/ | Chris F | Red steel corridor | threshold | 4:5 | Round ceiling lamps | night, rooms |
| dinner | https://www.pexels.com/photo/table-setting-in-dark-interior-28059305/ | Jonathan Borba | Table laid for dinner, nobody seated | detail | 3:2 | Candles in tall glasses | night, rooms |
| backbar | https://www.pexels.com/photo/selective-focus-photography-of-wine-glass-hanging-on-black-wooden-rack-1080383/ | Zain Ali | Hanging glasses, bar lights behind | bar | 16:9 | Bar lights | night |
| backbar3 | same frame as backbar | Zain Ali | Hanging glasses, bar lights behind | bar | 3:2 | Bar lights | rooms |
| lamp | https://www.pexels.com/photo/illuminated-vintage-lamp-on-wall-14238329/ | alperen | Glass lamp on a rough wall | detail | 4:5 | Lamp | index, night |
| band | same frame as lamp | alperen | Glass lamp on a rough wall | detail | 21:9 | Lamp | enquire |
| longtable | https://www.pexels.com/photo/banquet-table-with-candles-and-plates-4992827/ | Rachel Claire | Long table with pillar candles | detail | 16:9 | Candles | rooms |
| redroom | https://www.pexels.com/photo/a-table-in-a-restaurant-18756798/ | Jagjeet Dhuna | Red-lit tables in a red room | whole room | 4:5 | Bright window at the far end, lit tabletops | rooms |
| lamps | https://www.pexels.com/photo/red-table-lamps-713661/ | Min An | Woven lamps, all lit | detail | 16:9 | Lamps | services |

## Retouching and vetting notes

- **lasthour:** the glasses carry etched bar names, legible at full size. Those patches, and a
  signature on the plate rim, are softened in `lr_grade.py` (SOFTEN). The bottle label is cropped out.
- **longtable:** capped at 1400px, so the handwritten menus are not readable. No brand on them.
- **backbar / backbar3:** olive cast in the source ceiling; rotated to amber.
- **service:** green-black steel frames and an olive band in the source; band cropped, frames neutralised.
- **topfloor:** teal sky in the source; rotated out. The skyline is real and is never named.
- **crew:** teal tint on the plates in the source; neutralised. A tattoo on the forearm is visible; no face.
- **candles:** cropped to remove a person at the right edge.
- Green census after grading (share of pixels with hue 70–170, saturation above .18): 0.00% on every slot.
